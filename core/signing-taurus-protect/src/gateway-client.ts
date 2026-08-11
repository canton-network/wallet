// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Thin client for the gateway's CIP-103 JSON-RPC API. The gateway signs and submits,
 * so this never handles a raw signature. Status resolves via the getTransactionStatus
 * RPC, cached until complete.
 */

export type GatewayTxStatus = 'pending' | 'signed' | 'executed' | 'failed'

/** A Canton party as surfaced by the gateway's listAccounts. */
export interface GatewayAccount {
    partyId: string
    status: string // "allocated" | "initializing"
    prefix: string
    publicKey: string
    namespace: string
    networkId: string
    signingProviderId: string
}

/** The gateway's prepareExecute reply, verbatim. */
export interface GatewayPrepareExecuteResult {
    userUrl: string
    requestId: string
}

/**
 * The gateway's reply plus the commandId actually sent — the client defaults
 * a missing one, and status lookups and retries need it.
 */
export interface PrepareExecuteOutcome extends GatewayPrepareExecuteResult {
    commandId: string
}

/** Reply to `connect`; a refusal arrives here rather than as a JSON-RPC error. */
export interface GatewayConnectResult {
    isConnected: boolean
    reason?: string
}

/**
 * The gateway's prepareExecute surface, and nothing more. `disclosedContracts`,
 * `readAs` and `packageIdSelectionPreference` are deliberately absent: inert at
 * the gateway and already baked into `preparedTransaction`.
 */
export interface PrepareExecuteParams {
    commands: unknown
    actAs?: string[]
    commandId?: string
    preparedTransaction?: string
}

export interface GatewayTxStatusInfo {
    status: GatewayTxStatus
    updateId?: string
    contractId?: string
}

export interface TaurusProtectGatewayConfig {
    baseUrl: string
    token: string
}

export interface GatewayClientOptions {
    /** Cap on commands tracked in the status/requestId caches; oldest evicted past this (default 10000). */
    maxTrackedCommands?: number
    /**
     * Per-RPC timeout in ms (default 35000), kept above the gateway's own 30s
     * handler timeout so its JSON-RPC timeout reply wins over a bare abort.
     */
    timeoutMs?: number
}

/** Carries the JSON-RPC error code so callers can branch (e.g. 4900 → reconnect). */
export class GatewayError extends Error {
    constructor(
        public readonly code: number,
        message: string,
        public readonly data?: unknown
    ) {
        super(message)
        this.name = 'GatewayError'
    }
}

// EIP-1193 range codes the gateway returns on session loss.
const ERR_DISCONNECTED = 4900
const ERR_UNAUTHORIZED = 4100
// An edge proxy signals session loss as HTTP, not JSON-RPC.
const SESSION_LOST_HTTP = new Set([401, 403])

// Client-side failures, kept clear of the gateway's -32000..-32005 range.
const ERR_TRANSPORT = -32090
const ERR_INVALID_RESPONSE = -32091
const ERR_REQUEST_TOO_LARGE = -32092

// Past the gateway's 1 MiB body cap the JSON is silently truncated and the
// reply is a bare -32700; fail here while the reason is still known.
const MAX_REQUEST_BYTES = 1 << 20

/** Final only when nothing is left to fetch: updateId can lag `executed`. */
const isComplete = (info: GatewayTxStatusInfo): boolean =>
    info.status === 'failed' || (info.status === 'executed' && !!info.updateId)

const isSessionLost = (err: unknown): boolean =>
    err instanceof GatewayError &&
    (err.code === ERR_DISCONNECTED ||
        err.code === ERR_UNAUTHORIZED ||
        SESSION_LOST_HTTP.has(err.code))

// The routing fields the gateway reads off a command; `contractId` and `choice` are
// exercise-only. Everything else is dropped by routingOnlyCommands.
const ROUTING_KEYS = ['templateId', 'contractId', 'choice'] as const
// Argument trees, blanked rather than dropped: the gateway requires the key to classify the
// command, and `{}` converts to an empty record without error.
const BLANK_ARG_KEYS = ['createArguments', 'choiceArgument'] as const

// The gateway's templateId grammar demands a leading '#'; a bare package-id
// passes once prefixed, already-prefixed ids are left alone.
const hashPrefixed = (templateId: unknown): unknown =>
    typeof templateId === 'string' && !templateId.startsWith('#')
        ? `#${templateId}`
        : templateId

function routingOnlyCommand(command: unknown): unknown {
    if (typeof command !== 'object' || command === null) return command
    const out: Record<string, unknown> = {}
    // One entry, keyed by kind: {CreateCommand: {…}} | {ExerciseCommand: {…}}.
    for (const [kind, payload] of Object.entries(command)) {
        if (typeof payload !== 'object' || payload === null) {
            out[kind] = payload
            continue
        }
        const body = payload as Record<string, unknown>
        const trimmed: Record<string, unknown> = {}
        for (const key of ROUTING_KEYS) {
            if (key in body) {
                trimmed[key] =
                    key === 'templateId' ? hashPrefixed(body[key]) : body[key]
            }
        }
        for (const key of BLANK_ARG_KEYS) {
            if (key in body) trimmed[key] = {}
        }
        out[kind] = trimmed
    }
    return out
}

/**
 * Reduce each command to the routing fields the gateway reads on the encoded
 * path: it validates the full argument tree only to discard it for the PTX,
 * and real token-standard arguments fail that validation. Only safe alongside
 * a non-empty preparedTransaction — structured-path arguments ARE the
 * submission — and prepareExecute enforces that. A non-array passes through
 * untouched so the gateway's own error still surfaces.
 */
export function routingOnlyCommands(commands: unknown): unknown {
    return Array.isArray(commands) ? commands.map(routingOnlyCommand) : commands
}

export class GatewayClient {
    private readonly baseUrl: string
    private readonly token: string
    private readonly maxTrackedCommands: number
    private readonly timeoutMs: number

    private connected = false
    private nextId = 1

    // commandId → latest status (monotonic: a complete state never regresses).
    private readonly statusByCommand = new Map<string, GatewayTxStatusInfo>()
    // commandId → requestId from prepareExecute (RPC fallback).
    private readonly requestIdByCommand = new Map<string, string>()

    constructor(
        config: TaurusProtectGatewayConfig,
        opts: GatewayClientOptions = {}
    ) {
        this.baseUrl = config.baseUrl.endsWith('/')
            ? config.baseUrl.slice(0, -1)
            : config.baseUrl
        this.token = config.token
        this.maxTrackedCommands = opts.maxTrackedCommands ?? 10_000
        this.timeoutMs = opts.timeoutMs ?? 35_000
    }

    // --- JSON-RPC ---

    private async rpc<T>(method: string, params: unknown): Promise<T> {
        const payload = JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: this.nextId++,
        })
        const bytes = new TextEncoder().encode(payload).byteLength
        if (bytes > MAX_REQUEST_BYTES) {
            throw new GatewayError(
                ERR_REQUEST_TOO_LARGE,
                `gateway ${method}: request body is ${bytes} bytes, over the gateway's ${MAX_REQUEST_BYTES}-byte limit`
            )
        }
        let response: Response
        try {
            response = await fetch(`${this.baseUrl}/jsonrpc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: payload,
                // A hung call stalls the shared SigningWorker for every provider.
                signal: AbortSignal.timeout(this.timeoutMs),
            })
        } catch (err) {
            const timedOut = (err as Error).name === 'TimeoutError'
            throw new GatewayError(
                ERR_TRANSPORT,
                timedOut
                    ? `gateway ${method} failed: no response within ${this.timeoutMs}ms`
                    : `gateway ${method} failed: ${(err as Error).message}`
            )
        }
        if (!response.ok) {
            const text = await response.text().catch(() => '')
            throw new GatewayError(
                response.status,
                `gateway ${method} failed: HTTP ${response.status} ${text || response.statusText}`
            )
        }
        // A 2xx HTML/empty body would escape as SyntaxError and skip reconnect.
        let body: {
            result?: T
            error?: { code: number; message: string; data?: unknown }
        }
        try {
            body = await response.json()
        } catch {
            throw new GatewayError(
                ERR_INVALID_RESPONSE,
                `gateway ${method}: response was not valid JSON`
            )
        }
        if (body.error) {
            throw new GatewayError(
                body.error.code,
                `gateway ${method}: ${body.error.message}`,
                body.error.data
            )
        }
        return body.result as T
    }

    private async ensureConnected(): Promise<void> {
        if (this.connected) return
        // A refusal arrives as a successful result with isConnected:false.
        const result = await this.rpc<GatewayConnectResult>('connect', {})
        if (!result?.isConnected) {
            throw new GatewayError(
                ERR_UNAUTHORIZED,
                `gateway connect refused: ${result?.reason || 'isConnected was false'}`
            )
        }
        this.connected = true
    }

    /** Session-bound call: lazily connects, and reconnects once when the session is lost. */
    private async callAuthed<T>(method: string, params: unknown): Promise<T> {
        await this.ensureConnected()
        try {
            return await this.rpc<T>(method, params)
        } catch (err) {
            if (isSessionLost(err)) {
                // Cleared first so a failed retry still reconnects next call.
                this.connected = false
                await this.ensureConnected()
                return this.rpc<T>(method, params)
            }
            throw err
        }
    }

    async connect(): Promise<void> {
        await this.ensureConnected()
    }

    async listAccounts(): Promise<GatewayAccount[]> {
        return this.callAuthed<GatewayAccount[]>('listAccounts', {})
    }

    async prepareExecute(
        params: PrepareExecuteParams
    ): Promise<PrepareExecuteOutcome> {
        // Always send one: commandId is the end-to-end idempotency key. Left
        // unset the gateway mints a fresh uuid per attempt and a retry would
        // submit twice.
        const commandId = params.commandId ?? crypto.randomUUID()
        const encoded =
            typeof params.preparedTransaction === 'string' &&
            params.preparedTransaction.length > 0
        const request: PrepareExecuteParams = {
            ...params,
            commandId,
            // Only on the encoded path — see routingOnlyCommands.
            ...(encoded
                ? { commands: routingOnlyCommands(params.commands) }
                : {}),
        }

        let result: GatewayPrepareExecuteResult
        try {
            result = await this.callAuthed<GatewayPrepareExecuteResult>(
                'prepareExecute',
                request
            )
        } catch (err) {
            // The command may already be live (the gateway submits before it
            // registers its poller); re-submitting the same commandId is the
            // recovery path.
            if (err instanceof GatewayError) {
                throw new GatewayError(
                    err.code,
                    `${err.message} — commandId ${commandId} may already be submitted; retrying with the same commandId is safe and will return the original request`,
                    err.data
                )
            }
            throw err
        }
        // getTransactionStatus parses this with ParseUint; non-numeric is unpollable.
        if (!/^\d+$/.test(result?.requestId ?? '')) {
            throw new GatewayError(
                ERR_INVALID_RESPONSE,
                'gateway prepareExecute returned no numeric requestId'
            )
        }
        this.requestIdByCommand.set(commandId, result.requestId)
        this.capMap(this.requestIdByCommand)
        return { ...result, commandId }
    }

    async getTransactionStatus(
        requestId: string
    ): Promise<GatewayTxStatusInfo> {
        return this.callAuthed<GatewayTxStatusInfo>('getTransactionStatus', {
            requestId,
        })
    }

    // --- status resolution (RPC + cache) ---

    /** Re-seed commandId→requestId so getStatus's RPC fallback works on a cold cache. */
    rememberRequestId(commandId: string, requestId: string): void {
        this.requestIdByCommand.set(commandId, requestId)
        this.capMap(this.requestIdByCommand)
    }

    /** Cached complete state, else poll getTransactionStatus; undefined when nothing cached and no known requestId. */
    async getStatus(
        commandId: string
    ): Promise<GatewayTxStatusInfo | undefined> {
        const cached = this.statusByCommand.get(commandId)
        if (cached && isComplete(cached)) {
            return cached
        }
        const requestId = this.requestIdByCommand.get(commandId)
        if (!requestId) return cached
        const info = await this.getTransactionStatus(requestId)
        this.cacheStatus(commandId, info)
        return info
    }

    /** Monotonic cache write — a complete state is final; `executed` without ids is not. */
    private cacheStatus(commandId: string, info: GatewayTxStatusInfo): void {
        const prev = this.statusByCommand.get(commandId)
        if (prev && isComplete(prev)) return
        this.statusByCommand.set(commandId, info)
        this.capMap(this.statusByCommand)
    }

    // Evict oldest (insertion-order) entries past the cap; evicted commands are recoverable via the requestId RPC fallback.
    private capMap<V>(map: Map<string, V>): void {
        while (map.size > this.maxTrackedCommands) {
            const oldest = map.keys().next().value
            if (oldest === undefined) break
            map.delete(oldest)
        }
    }
}
