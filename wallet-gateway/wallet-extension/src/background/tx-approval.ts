// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { providerErrors, rpcErrors } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import {
    type INotificationService,
    LOGOUT_EVENT,
} from '@canton-network/core-wallet-services'
import type { Store, Transaction } from '@canton-network/core-wallet-store'
import { browser, type Browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'
import { txApprovalPortId } from '@/shared/ports.ts'

import type { AuthContextChanges, AuthContextStore } from './auth-context.ts'
import type {
    TxChangedExecutedEvent,
    TxChangedExecutedPayload,
    TxChangedFailedEvent,
    TxChangedPendingEvent,
} from './controllers/dapp/rpc-gen/typings.ts'
import type { TransactionSubmitter } from './controllers/user/transactions.ts'
import type { PagePresence } from './page-presence.ts'
import type { SessionCheck, SiteApprovalTab } from './site-approval.ts'
import type { WalletStore } from './store/index.ts'
import { DEFAULT_POPUP, openTabPopup, type TabIcons } from './tab-icon.ts'
import { isTrustedSender } from './trusted-service.ts'
import { type Vault, VaultLockedError } from './vault/index.ts'

/**
 * How long a transaction waits for the user, counted from the dApp's
 * request. Chrome may stop a service worker whose event has run for 5
 * minutes, which would drop a `prepareExecuteAndWait` without an answer, so
 * this stays under that.
 */
export const TX_APPROVAL_TIMEOUT_MS = 4 * 60 * 1000

/** A dApp request for a transaction the user must approve. */
export interface TxApprovalRequest {
    transactionId: string
    commandId: string
    /** The session that asked, whose notifier reports the transaction. */
    sessionId: string
    /** The user who asked, whose store holds the transaction. */
    auth: AuthContext
    /** The requesting page's origin. */
    origin: string
    tab: SiteApprovalTab | undefined
}

export interface TxApproval {
    /**
     * Resolves with the `executed` event, or rejects with the error the
     * prompt ended with: 4001 when the user rejects, it times out, the tab
     * closes or the page that asked unloads, 4100 when the vault locks or
     * the session ends, -32003 when the ledger or signing rejects it, and
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
    abort(error: Error): void
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
    service: TxApprovalService
}

export interface TxApprovalsOptions {
    vault: Pick<Vault, 'ready' | 'status' | 'onLock' | 'onUnlock'>
    authContext: AuthContextChanges & Pick<AuthContextStore, 'load'>
    presence: Pick<PagePresence, 'onEnd'>
    tabIcons: TabIcons
    isCurrent: SessionCheck
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
    /** Set once `outcome` has settled. */
    ended: boolean
    settle: (result: TxChangedExecutedEvent | Error) => void
    /** Stops the timer and the session's logout listener. */
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

const notWaiting = () =>
    new Error('This transaction is no longer waiting for approval')

const approvalPopup = (transactionId: string) =>
    `${DEFAULT_POPUP}#/approve-transaction?id=${encodeURIComponent(transactionId)}`

function actingParty(transaction: Transaction): string | undefined {
    const actAs = (transaction.payload as { actAs?: unknown } | undefined)
        ?.actAs
    return Array.isArray(actAs) && typeof actAs[0] === 'string'
        ? actAs[0]
        : undefined
}

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

    const storeOf = async (prompt: Prompt): Promise<Store> =>
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

    function release(prompt: Prompt): void {
        if (prompts.get(prompt.transactionId) === prompt) {
            prompts.delete(prompt.transactionId)
        }
    }

    function emitFailed(prompt: Prompt, error: CodedError): void {
        notificationService.getNotifier(prompt.sessionId).emit('txChanged', {
            status: 'failed',
            commandId: prompt.commandId,
            error: { code: error.code, message: error.message },
        } satisfies TxChangedFailedEvent)
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
            const transaction = await store.getTransaction(prompt.transactionId)
            if (transaction?.status === 'pending') {
                await store.removeTransaction(prompt.transactionId)
            }
        } catch (cause) {
            if (!(cause instanceof VaultLockedError)) {
                logger.error('Failed to delete transaction {id}: {cause}', {
                    id: prompt.transactionId,
                    cause,
                })
            }
        }
        if (error) emitFailed(prompt, error)
    }

    /**
     * Ends a prompt the user hasn't answered. One still being prepared is
     * cleaned up by `prompt` or `abort`.
     */
    function cancel(prompt: Prompt, error: CodedError): void {
        if (prompt.ended || prompt.state === 'deciding') return
        prompt.settle(error)
        if (prompt.state !== 'waiting') return
        untrack(prompt)
        for (const port of prompt.ports) port.disconnect()
        prompt.ports.clear()
        void discard(prompt, error).finally(() => release(prompt))
    }

    function cancelAll(
        error: () => CodedError,
        matches: (prompt: Prompt) => boolean = () => true
    ): void {
        for (const prompt of prompts.values()) {
            if (matches(prompt)) cancel(prompt, error())
        }
    }

    /**
     * Deletes the pending transactions no prompt is in progress for: their
     * prompt ended while the vault was locked, or with a worker that has
     * since stopped. Signed ones are left.
     */
    async function removeOrphans(): Promise<void> {
        try {
            const context = await authContext.load()
            if (!context) return
            const store = (await getStore()).withAuthContext(context)
            for (const transaction of await store.listAllPendingTransactions()) {
                if (
                    transaction.status === 'pending' &&
                    !prompts.has(transaction.id)
                ) {
                    await store.removeTransaction(transaction.id)
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

    vault.onLock(() =>
        cancelAll(() =>
            providerErrors.unauthorized({ message: 'Wallet is locked' })
        )
    )

    // Sign-out, another account or a new token.
    authContext.onChange((context) =>
        cancelAll(
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
        cancelAll(
            () => rejected('The tab that asked for the transaction was closed'),
            (prompt) => prompt.tab?.tabId === tabId
        )
    })

    presence.onEnd((connection) =>
        cancelAll(pageGone, (prompt) => prompt.tab?.connection === connection)
    )

    async function show(prompt: Prompt): Promise<void> {
        // The user may have signed out or switched accounts while the
        // transaction was prepared.
        const current = await isCurrent(
            prompt.auth.accessToken,
            prompt.sessionId
        ).catch(() => false)
        if (!current) cancel(prompt, sessionEnded())
        if (prompt.ended) {
            // Not reported pending yet, so the dApp's request is the only
            // one to tell.
            await discard(prompt, undefined)
            release(prompt)
            await prompt.outcome
            return
        }
        prompt.state = 'waiting'
        notificationService.getNotifier(prompt.sessionId).emit('txChanged', {
            status: 'pending',
            commandId: prompt.commandId,
        } satisfies TxChangedPendingEvent)
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
            const store = await storeOf(prompt)
            const transaction = await store.getTransaction(transactionId)
            const partyId = transaction && actingParty(transaction)
            if (!partyId) throw new Error('The transaction has no acting party')
            const params = { transactionId, partyId }
            const signed = await submitter.sign(store, auth, sessionId, params)
            if (signed.status !== 'signed') {
                throw new Error(`Signing returned status ${signed.status}`)
            }
            // The transaction service returns the payload of its `executed`
            // event, under a looser type.
            const payload = (await submitter.execute(
                store,
                auth,
                sessionId,
                params
            )) as TxChangedExecutedPayload
            return { status: 'executed', commandId: prompt.commandId, payload }
        } catch (cause) {
            return failureOf(prompt, cause)
        }
    }

    function begin(request: TxApprovalRequest): TxApproval {
        const { transactionId, commandId, sessionId, tab } = request
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
        let reject!: (error: Error) => void
        const outcome = new Promise<TxChangedExecutedEvent>((res, rej) => {
            resolve = res
            reject = rej
        })
        // `prepareExecute` doesn't wait for it.
        outcome.catch(() => {})
        const timer = setTimeout(
            () =>
                cancel(prompt, rejected('The transaction approval timed out')),
            timeoutMs
        )
        // A replaced session logs out with the same token.
        const notifier = notificationService.getNotifier(sessionId)
        const onLogout = () => cancel(prompt, sessionEnded())
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
            settle: (result) => {
                if (prompt.ended) return
                prompt.ended = true
                prompt.stop()
                if (result instanceof Error) reject(result)
                else resolve(result)
            },
            ports: new Set(),
        }
        prompts.set(transactionId, prompt)

        return {
            outcome,
            prompt: () => show(prompt),
            abort(error) {
                prompt.settle(error)
                release(prompt)
            },
        }
    }

    return {
        begin,
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
                    let result: TxChangedExecutedEvent | CodedError
                    if (
                        !(await isCurrent(
                            prompt.auth.accessToken,
                            prompt.sessionId
                        ).catch(() => false))
                    ) {
                        result = sessionEnded()
                        await discard(prompt, result)
                    } else if (approved !== true) {
                        result = rejected('Rejected by the user')
                        await discard(prompt, result)
                    } else {
                        result = await approve(prompt)
                    }
                    prompt.settle(result)
                    if (result instanceof Error && approved === true) {
                        throw result
                    }
                } finally {
                    release(prompt)
                }
            },
        },
    }
}
