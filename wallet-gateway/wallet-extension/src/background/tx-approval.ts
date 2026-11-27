// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { providerErrors, rpcErrors } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    type INotificationService,
    LOGOUT_EVENT,
} from '@canton-network/core-wallet-services'
import type { Transaction } from '@canton-network/core-wallet-store'
import { browser, type Browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'

import { EXTENSION_ORIGIN } from '@/shared/auth-protocol.ts'
import { logger } from '@/shared/logger.ts'
import { txApprovalPortId } from '@/shared/ports.ts'

import type { AuthContextChanges, AuthContextStore } from './auth-context.ts'
import type {
    TxChangedExecutedEvent,
    TxChangedFailedEvent,
    TxChangedPendingEvent,
} from './controllers/dapp/rpc-gen/typings.ts'
import type { TransactionSubmitter } from './controllers/user/transactions.ts'
import type { TxChangedSite } from './notifications.ts'
import type { PagePresence, RequestTab } from './page-presence.ts'
import type { SessionCheck } from './session-check.ts'
import type { ApprovedSiteStore } from './store/approved-sites.ts'
import type { ExtensionStore, WalletStore } from './store/index.ts'
import { DEFAULT_POPUP, openTabPopup, type TabIcons } from './tab-icon.ts'
import { actingParty, submitTransaction } from './transactions/submit.ts'
import { isTrustedSender } from './trusted-service.ts'
import { type Vault, VaultLockedError } from './vault/index.ts'

/**
 * How long a transaction waits for the user, counted from the dApp's
 * request. Chrome may stop a service worker whose event has run for 5
 * minutes, which would drop a `prepareExecuteAndWait` without an answer, so
 * this stays under that.
 */
export const TX_APPROVAL_TIMEOUT_MS = 4 * 60 * 1000

export interface TxApprovalRequest {
    transactionId: string
    commandId: string
    /** The session that asked, whose notifier reports the transaction. */
    sessionId: string
    /** The user who asked, whose store holds the transaction. */
    auth: AuthContext
    /** Who approved the site, see `sitePrincipal`. */
    principal: string
    origin: string
    tab: RequestTab | undefined
    /** When the dApp's request arrived, from which the timeout counts. */
    receivedAt: number
}

export interface TxApproval {
    /**
     * Resolves with the `executed` event, or rejects with the error the
     * prompt ended with: 4001 when the user rejects, it times out, the tab
     * closes or the page that asked unloads, 4100 when the vault locks, the
     * session ends or the site disconnects, -32003 when the ledger or signing rejects it or it
     * doesn't match its hash, and
     * -32603 when the outcome of an approved transaction is unknown.
     */
    outcome: Promise<TxChangedExecutedEvent>
    /**
     * Call once the transaction is stored as `pending`. Reports it pending
     * and prompts on the tab, or rejects with the error the prompt ended
     * with in the meantime.
     */
    prompt(): Promise<void>
    /** The transaction couldn't be prepared or stored. */
    abort(error: unknown): void
}

export type TxApprovalDetail = {
    id: string
    commandId: string
    origin: string
    /** The first acting party, which `prepareExecute` checked is the user's. */
    partyId: string | undefined
    preparedTransaction: string
    preparedTransactionHash: string
    createdAt?: string
}

// A type, not an interface, so it fits `requireUnlocked`'s index signature.
export type TxApprovalService = {
    /** Null once the transaction no longer waits for the user. */
    get(id: string): Promise<TxApprovalDetail | null>
    /**
     * Rejects, or signs and executes, a waiting transaction. Throws when it
     * no longer waits for the user, or approving it failed.
     */
    decide(id: string, approved: boolean): Promise<void>
}

export interface TxApprovals {
    /**
     * Starts the prompt for a dApp request, before the transaction is
     * prepared. Throws when the page that asked has gone, or a transaction
     * with the same session and command ID is still in progress.
     */
    begin(request: TxApprovalRequest): TxApproval
    /**
     * Whether a prompt is in progress for the transaction, answered or not.
     * Only its `service.decide` may then sign or delete it.
     */
    hasPrompt(transactionId: string): boolean
    /**
     * Ends the prompts of a site the principal no longer approves. Resolves
     * once their `failed` events are sent.
     */
    endSite(principal: string, origin: string): Promise<void>
    service: TxApprovalService
}

export interface TxApprovalsOptions {
    vault: Pick<Vault, 'ready' | 'status' | 'onLock' | 'onUnlock'>
    authContext: AuthContextChanges & Pick<AuthContextStore, 'load'>
    presence: Pick<PagePresence, 'onEnd'>
    tabIcons: TabIcons
    isCurrent: SessionCheck
    sites: Pick<ApprovedSiteStore, 'isApproved'>
    notificationService: INotificationService
    /** The wallet store, not yet scoped to a user. */
    getStore: () => Promise<WalletStore>
    submitter: Pick<TransactionSubmitter, 'sign' | 'execute'>
    timeoutMs?: number
}

interface Prompt extends TxApprovalRequest {
    /**
     * `preparing` until the transaction is stored, `waiting` for the user,
     * then `deciding` once the user answered, which no other ending can
     * interrupt.
     */
    state: 'preparing' | 'waiting' | 'deciding'
    outcome: Promise<TxChangedExecutedEvent>
    ended: boolean
    /** The clean-up of a cancellation, which later cancellations wait for. */
    cancelling?: Promise<void>
    resolve: (event: TxChangedExecutedEvent) => void
    reject: (error: unknown) => void
    stop: () => void
    /** The open approval pages, which close when their port disconnects. */
    ports: Set<Browser.runtime.Port>
}

/** The error a prompt ends with, also sent in its `failed` event. */
type CodedError = Error & { code: number }

const rejected = (message: string) =>
    providerErrors.userRejectedRequest({ message })

const pageGone = () =>
    rejected('The page that asked for the transaction was closed or reloaded')

const sessionEnded = () =>
    providerErrors.unauthorized({
        message: 'The session that asked for the transaction has ended',
    })

const siteDisconnected = () =>
    providerErrors.unauthorized({ message: 'The site disconnected' })

const notWaiting = () =>
    new Error('This transaction is no longer waiting for approval')

const approvalPopup = (transactionId: string) =>
    `${DEFAULT_POPUP}#/approve-transaction?id=${encodeURIComponent(transactionId)}`

const orphaned = () =>
    rejected('The transaction approval ended when the wallet restarted')

/**
 * The session that asked for a stored transaction, kept outside its payload,
 * which dApps and the user API see. Session storage outlives a worker
 * restart, so the clean-up after one can report the transaction failed to
 * that session. A prompt that ended while locked forgets it once reported,
 * so the clean-up at the next unlock doesn't report it again.
 */
const sessionKey = (transactionId: string) =>
    `session:txSession:${transactionId}` as const

async function recordSession(
    transactionId: string,
    sessionId: string
): Promise<void> {
    try {
        await storage.setItem(sessionKey(transactionId), sessionId)
    } catch (error) {
        logger.error('Failed to record the session of {id}: {error}', {
            id: transactionId,
            error,
        })
    }
}

async function recordedSession(
    transactionId: string
): Promise<string | undefined> {
    const sessionId = await storage.getItem<unknown>(sessionKey(transactionId))
    return typeof sessionId === 'string' ? sessionId : undefined
}

function forgetSession(transactionId: string): Promise<void> {
    return storage.removeItem(sessionKey(transactionId)).catch((error) => {
        logger.error('Failed to forget the session of {id}: {error}', {
            id: transactionId,
            error,
        })
    })
}

const siteOf = ({ transactionId, origin }: Prompt): TxChangedSite => ({
    id: transactionId,
    origin,
})

const messageOf = (error: unknown) =>
    error instanceof Error ? error.message : String(error)

/**
 * Keeps the transactions that wait for the user's approval in memory. A
 * service worker restart drops them, along with the dApp requests that wait
 * for them; their stored transactions are deleted at the next unlock. Must
 * be created synchronously during background start-up, as it adds port and
 * tab listeners.
 *
 * Only `service.decide` signs a transaction, and only while its prompt
 * waits for the user. Any other ending deletes it while it is still
 * pending and reports it `failed`.
 */
export function createTxApprovals({
    vault,
    authContext,
    presence,
    tabIcons,
    isCurrent,
    sites,
    notificationService,
    getStore,
    submitter,
    timeoutMs = TX_APPROVAL_TIMEOUT_MS,
}: TxApprovalsOptions): TxApprovals {
    // Every prompt by transaction ID, from `begin` until its cleanup has
    // reported. This reserves its session and command ID meanwhile.
    const prompts = new Map<string, Prompt>()
    // The waiting prompts of each tab, oldest first.
    const byTab = new Map<number, Prompt[]>()

    const storeOf = async (prompt: Prompt): Promise<ExtensionStore> =>
        (await getStore()).withAuthContext(prompt.auth)

    function showTab(tabId: number): Promise<void> {
        const shown = byTab.get(tabId) ?? []
        const newest = shown.at(-1)
        return tabIcons.set(
            tabId,
            'transaction',
            newest && {
                popup: approvalPopup(newest.transactionId),
                badge: String(shown.length),
            }
        )
    }

    function untrack(prompt: Prompt): void {
        if (!prompt.tab) return
        const { tabId } = prompt.tab
        const shown = byTab.get(tabId)
        if (!shown?.includes(prompt)) return
        const rest = shown.filter((other) => other !== prompt)
        if (rest.length) byTab.set(tabId, rest)
        else byTab.delete(tabId)
        void showTab(tabId)
    }

    /** Ends the reservation of a prompt whose clean-up has finished. */
    async function release(prompt: Prompt): Promise<void> {
        if (prompts.get(prompt.transactionId) !== prompt) return
        prompts.delete(prompt.transactionId)
        await forgetSession(prompt.transactionId)
    }

    function emitFailed(
        sessionId: string,
        commandId: string,
        site: TxChangedSite,
        error: CodedError
    ): void {
        notificationService.getNotifier(sessionId).emit('txChanged', {
            status: 'failed',
            commandId,
            error: { code: error.code, message: error.message },
            ...site,
        } satisfies TxChangedFailedEvent & TxChangedSite)
    }

    /**
     * Deletes the transaction if it is still pending, and reports it
     * `failed` with `error`, if any. While the vault is locked it is left
     * for the clean-up at the next unlock: nothing can sign it meanwhile.
     */
    async function discard(
        prompt: Prompt,
        error: CodedError | undefined
    ): Promise<void> {
        try {
            const store = await storeOf(prompt)
            await store.removePendingTransaction(prompt.transactionId)
        } catch (cause) {
            if (!(cause instanceof VaultLockedError)) {
                logger.error('Failed to delete transaction {id}: {cause}', {
                    id: prompt.transactionId,
                    cause,
                })
            }
        }
        if (error) {
            emitFailed(
                prompt.sessionId,
                prompt.commandId,
                siteOf(prompt),
                error
            )
        }
    }

    /**
     * Ends a prompt the user hasn't answered. One still being prepared is
     * cleaned up by `prompt` or `abort`.
     */
    async function cancel(prompt: Prompt, error: CodedError): Promise<void> {
        if (prompt.cancelling) return prompt.cancelling
        if (prompt.ended || prompt.state === 'deciding') return
        prompt.reject(error)
        if (prompt.state !== 'waiting') return
        untrack(prompt)
        for (const port of prompt.ports) port.disconnect()
        prompt.ports.clear()
        prompt.cancelling = discard(prompt, error).finally(() =>
            release(prompt)
        )
        return prompt.cancelling
    }

    async function cancelAll(
        error: () => CodedError,
        matches: (prompt: Prompt) => boolean = () => true
    ): Promise<void> {
        const ending = [...prompts.values()]
            .filter(matches)
            .map((prompt) => cancel(prompt, error()))
        await Promise.all(ending)
    }

    /**
     * Deletes the pending transactions no prompt is in progress for: their
     * prompt ended while the vault was locked, or with a worker that has
     * since stopped. Signed ones are left, and so are the extension's own
     * reviews, which have no prompt and expire in the token service.
     * Reports those of the current session failed, as its dApps may still
     * wait for them.
     */
    async function removeOrphans(): Promise<void> {
        try {
            const context = await authContext.load()
            if (!context) return
            const store = (await getStore()).withAuthContext(context)
            const session = await store.getSession(context.accessToken)
            const orphans = (await store.listAllPendingTransactions()).filter(
                ({ id, status, origin }) =>
                    status === 'pending' &&
                    origin !== EXTENSION_ORIGIN &&
                    !prompts.has(id)
            )
            // A later one may be signed while an earlier one is deleted.
            for (const transaction of orphans) {
                const { id, commandId, origin } = transaction
                if (prompts.has(id)) continue
                if (!(await store.removePendingTransaction(id))) continue
                const sessionId = await recordedSession(id)
                await forgetSession(id)
                if (session && sessionId === session.id) {
                    emitFailed(
                        session.id,
                        commandId,
                        { id, origin },
                        orphaned()
                    )
                }
            }
        } catch (error) {
            if (error instanceof VaultLockedError) return
            logger.error('Failed to delete orphaned transactions: {error}', {
                error,
            })
        }
    }

    vault.onUnlock(() => void removeOrphans())
    void vault.ready.then(() => {
        if (vault.status() === 'unlocked') return removeOrphans()
    })

    vault.onLock(
        () =>
            void cancelAll(() =>
                providerErrors.unauthorized({ message: 'Wallet is locked' })
            )
    )

    // Sign-out, another account or a new token.
    authContext.onChange(
        (context) =>
            void cancelAll(
                sessionEnded,
                (prompt) => prompt.auth.accessToken !== context?.accessToken
            )
    )

    browser.runtime.onConnect.addListener((port) => {
        const id = txApprovalPortId(port.name)
        if (id === undefined) return
        // A content script could otherwise cancel a prompt.
        if (port.sender === undefined || !isTrustedSender(port.sender)) {
            port.disconnect()
            return
        }
        const prompt = prompts.get(id)
        if (prompt?.state !== 'waiting' || prompt.ended) {
            port.disconnect()
            return
        }
        prompt.ports.add(port)
        port.onDisconnect.addListener(() => prompt.ports.delete(port))
    })

    browser.tabs.onRemoved.addListener((tabId) => {
        // Nothing left to restore on a closed tab.
        byTab.delete(tabId)
        void cancelAll(
            () => rejected('The tab that asked for the transaction was closed'),
            (prompt) => prompt.tab?.tabId === tabId
        )
    })

    presence.onEnd(
        (connection) =>
            void cancelAll(
                pageGone,
                (prompt) => prompt.tab?.connection === connection
            )
    )

    async function show(prompt: Prompt): Promise<void> {
        await recordSession(prompt.transactionId, prompt.sessionId)
        // The user may have signed out or switched accounts while the
        // transaction was prepared.
        const current = await isCurrent(
            prompt.auth.accessToken,
            prompt.sessionId
        ).catch(() => false)
        if (!current) void cancel(prompt, sessionEnded())
        if (prompt.ended) {
            // Not reported pending yet, so the dApp's request is the only
            // one to tell.
            await discard(prompt, undefined)
            await release(prompt)
            await prompt.outcome
            return
        }
        prompt.state = 'waiting'
        notificationService.getNotifier(prompt.sessionId).emit('txChanged', {
            status: 'pending',
            commandId: prompt.commandId,
            ...siteOf(prompt),
        } satisfies TxChangedPendingEvent & TxChangedSite)
        const { tabId, windowId } = prompt.tab!
        byTab.set(tabId, [...(byTab.get(tabId) ?? []), prompt])
        void showTab(tabId).then(() => {
            if (prompt.ended || prompt.state !== 'waiting') return
            return openTabPopup(tabId, windowId)
        })
    }

    /**
     * The error an approved transaction that didn't execute ends with. A
     * signed one may still reach the ledger, so its outcome is unknown.
     */
    async function failureOf(
        prompt: Prompt,
        cause: unknown
    ): Promise<CodedError> {
        let status: Transaction['status'] | undefined
        try {
            const store = await storeOf(prompt)
            status = (await store.getTransaction(prompt.transactionId))?.status
        } catch {
            // Unknown, as below.
        }
        const message = messageOf(cause)
        switch (status) {
            case 'pending': {
                const error = rpcErrors.transactionRejected({ message })
                await discard(prompt, error)
                return error
            }
            case 'failed':
                // The transaction service reported it failed.
                return rpcErrors.transactionRejected({ message })
            default:
                return rpcErrors.internal({
                    message: `The outcome of the transaction is unknown: ${message}`,
                })
        }
    }

    async function approve(
        prompt: Prompt
    ): Promise<TxChangedExecutedEvent | CodedError> {
        const { transactionId, auth, sessionId } = prompt
        try {
            const payload = await submitTransaction(submitter, {
                store: await storeOf(prompt),
                auth,
                sessionId,
                transactionId,
            })
            return { status: 'executed', commandId: prompt.commandId, payload }
        } catch (cause) {
            return failureOf(prompt, cause)
        }
    }

    function begin(request: TxApprovalRequest): TxApproval {
        const { transactionId, commandId, sessionId, tab, receivedAt } = request
        // A dApp's `txChanged` listener can't tell two of them apart.
        for (const other of prompts.values()) {
            if (
                other.sessionId === sessionId &&
                other.commandId === commandId
            ) {
                throw rpcErrors.invalidParams({
                    message: `A transaction with command ID ${commandId} is already in progress`,
                })
            }
        }
        if (!tab?.connection?.live) throw pageGone()

        let resolve!: (event: TxChangedExecutedEvent) => void
        let reject!: (error: unknown) => void
        const outcome = new Promise<TxChangedExecutedEvent>((res, rej) => {
            resolve = res
            reject = rej
        })
        // `prepareExecute` doesn't wait for it.
        outcome.catch(() => {})
        const timer = setTimeout(
            () =>
                void cancel(
                    prompt,
                    rejected('The transaction approval timed out')
                ),
            Math.max(0, receivedAt + timeoutMs - Date.now())
        )
        // A replaced session logs out with the same token.
        const notifier = notificationService.getNotifier(sessionId)
        const onLogout = () => void cancel(prompt, sessionEnded())
        notifier.on(LOGOUT_EVENT, onLogout)

        const prompt: Prompt = {
            ...request,
            state: 'preparing',
            outcome,
            ended: false,
            stop: () => {
                clearTimeout(timer)
                notifier.removeListener(LOGOUT_EVENT, onLogout)
            },
            resolve: (event) => {
                if (prompt.ended) return
                prompt.ended = true
                prompt.stop()
                resolve(event)
            },
            reject: (error) => {
                if (prompt.ended) return
                prompt.ended = true
                prompt.stop()
                reject(error)
            },
            ports: new Set(),
        }
        prompts.set(transactionId, prompt)

        return {
            outcome,
            prompt: () => show(prompt),
            abort(error) {
                prompt.reject(error)
                void release(prompt)
            },
        }
    }

    return {
        begin,
        hasPrompt: (transactionId) => prompts.has(transactionId),
        endSite: (principal, origin) =>
            cancelAll(
                siteDisconnected,
                (prompt) =>
                    prompt.principal === principal && prompt.origin === origin
            ),
        service: {
            async get(id) {
                const prompt = prompts.get(id)
                if (prompt?.state !== 'waiting' || prompt.ended) return null
                const store = await storeOf(prompt)
                const transaction = await store.getTransaction(id)
                if (transaction?.status !== 'pending') return null
                return {
                    id,
                    commandId: prompt.commandId,
                    origin: prompt.origin,
                    partyId: actingParty(transaction),
                    preparedTransaction: transaction.preparedTransaction,
                    preparedTransactionHash:
                        transaction.preparedTransactionHash,
                    ...(transaction.createdAt && {
                        createdAt: transaction.createdAt.toISOString(),
                    }),
                }
            },
            async decide(id, approved) {
                const prompt = prompts.get(id)
                if (prompt?.state !== 'waiting' || prompt.ended) {
                    throw notWaiting()
                }
                // Claimed: no timeout, lock or page ending can delete or
                // reject it from here on.
                prompt.state = 'deciding'
                prompt.stop()
                untrack(prompt)
                try {
                    const refusal = !(await isCurrent(
                        prompt.auth.accessToken,
                        prompt.sessionId
                    ).catch(() => false))
                        ? sessionEnded()
                        : !(await sites
                                .isApproved(prompt.principal, prompt.origin)
                                .catch(() => false))
                          ? siteDisconnected()
                          : undefined
                    if (refusal) {
                        await discard(prompt, refusal)
                        prompt.reject(refusal)
                        throw refusal
                    }
                    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- only accept an explicit true across the RPC boundary
                    if (approved !== true) {
                        const error = rejected('Rejected by the user')
                        await discard(prompt, error)
                        prompt.reject(error)
                        return
                    }
                    const result = await approve(prompt)
                    if (result instanceof Error) {
                        prompt.reject(result)
                        throw result
                    }
                    prompt.resolve(result)
                } finally {
                    await release(prompt)
                }
            },
        },
    }
}
