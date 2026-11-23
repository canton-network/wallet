// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    isCip103ErrorCode,
    JsonRpcError,
    providerErrors,
    rpcErrors,
} from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type {
    INotificationService,
    NotificationListener,
} from '@canton-network/core-wallet-services'
import { browser, type Browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'
import { txApprovalPortId } from '@/shared/ports.ts'

import type { AuthContextChanges } from './auth-context.ts'
import type {
    FailureError,
    TxChangedExecutedEvent,
    TxChangedFailedEvent,
} from './controllers/dapp/rpc-gen/typings.ts'
import type { PagePresence } from './page-presence.ts'
import type { SessionCheck, SiteApprovalTab } from './site-approval.ts'
import type { WalletStore } from './store/index.ts'
import { DEFAULT_POPUP, openTabPopup, type TabIcons } from './tab-icon.ts'
import { isTrustedSender } from './trusted-service.ts'
import { type Vault, VaultLockedError } from './vault/index.ts'

/**
 * How long a transaction waits for the user, as long as the dapp-sdk waits
 * for a remote gateway's approval. Chrome may stop the service worker of a
 * `prepareExecuteAndWait` that runs that long, which drops its answer.
 */
export const TX_APPROVAL_TIMEOUT_MS = 5 * 60 * 1000

/** A prepared transaction, stored as `pending`, that the user must approve. */
export interface TxApprovalRequest {
    transactionId: string
    commandId: string
    /** The session whose notifier reports the transaction's changes. */
    sessionId: string
    /** The user who prepared it, whose store holds the transaction. */
    auth: AuthContext
    tab: SiteApprovalTab | undefined
}

export interface TxApprovals {
    /**
     * Points the toolbar icon of the request's tab at the approval page, and
     * resolves once the prompt is set up. `outcome` resolves with the
     * `executed` event, or rejects with the failure: 4001 when the user
     * rejects, the prompt times out, the tab closes or the page that asked
     * unloads, 4100 when the vault locks or the session ends, or the
     * transaction's own failure. Closing the page leaves it pending.
     *
     * Rejects, and deletes the transaction, when there is no live page to
     * prompt in or the session isn't current.
     */
    request(
        request: TxApprovalRequest
    ): Promise<{ outcome: Promise<TxChangedExecutedEvent> }>
}

export interface TxApprovalsOptions {
    vault: Pick<Vault, 'onLock' | 'onUnlock'>
    authContext: AuthContextChanges
    presence: Pick<PagePresence, 'onEnd'>
    tabIcons: TabIcons
    isCurrent: SessionCheck
    notificationService: INotificationService
    /** The wallet store, not yet scoped to a user. */
    getStore: () => Promise<WalletStore>
    timeoutMs?: number
}

interface PendingTx extends TxApprovalRequest {
    outcome: Promise<TxChangedExecutedEvent>
    settle: (result: TxChangedExecutedEvent | Error) => void
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

/** The error of a `failed` event, as the dapp-sdk builds it. */
function failure(error: FailureError | undefined): Error {
    if (!error) return rpcErrors.transactionRejected('The transaction failed')
    return isCip103ErrorCode(error.code)
        ? new JsonRpcError(error.code, error.message, error.data)
        : rpcErrors.transactionRejected(error.message)
}

const approvalPopup = (transactionId: string) =>
    `${DEFAULT_POPUP}#/approve-transaction?id=${encodeURIComponent(transactionId)}`

/**
 * Keeps the transactions that wait for the user's approval in memory. A
 * service worker restart drops them, along with the dApp requests that wait
 * for them. Must be created synchronously during background start-up, as it
 * adds port and tab listeners.
 *
 * The approval page signs and executes through the user API, so the outcome
 * comes from the session's `txChanged` events. Any other ending deletes the
 * transaction while it is still pending, so it can no longer be signed, and
 * reports it `failed`.
 */
export function createTxApprovals({
    vault,
    authContext,
    presence,
    tabIcons,
    isCurrent,
    notificationService,
    getStore,
    timeoutMs = TX_APPROVAL_TIMEOUT_MS,
}: TxApprovalsOptions): TxApprovals {
    const byId = new Map<string, PendingTx>()
    // The pending transactions of each tab, oldest first.
    const byTab = new Map<number, PendingTx[]>()
    // Ended while the vault was locked, to delete once it unlocks.
    const leftovers = new Set<TxApprovalRequest>()

    function showTab(tabId: number): Promise<void> {
        const prompts = byTab.get(tabId) ?? []
        const newest = prompts.at(-1)
        return tabIcons.set(
            tabId,
            'transaction',
            newest && {
                popup: approvalPopup(newest.transactionId),
                badge: String(prompts.length),
            }
        )
    }

    function untrack(pending: PendingTx): void {
        if (!pending.tab) return
        const { tabId } = pending.tab
        const prompts = byTab.get(tabId)
        if (!prompts) return
        const rest = prompts.filter((other) => other !== pending)
        if (rest.length) byTab.set(tabId, rest)
        else byTab.delete(tabId)
        void showTab(tabId)
    }

    /** Ends the prompt with `result`, unless it has ended. */
    function end(
        pending: PendingTx,
        result: TxChangedExecutedEvent | Error
    ): boolean {
        if (byId.get(pending.transactionId) !== pending) return false
        byId.delete(pending.transactionId)
        untrack(pending)
        pending.settle(result)
        for (const port of pending.ports) port.disconnect()
        pending.ports.clear()
        return true
    }

    /** Ends a prompt the user didn't answer, and discards its transaction. */
    function cancel(pending: PendingTx, error: CodedError): void {
        if (end(pending, error)) void discard(pending, error)
    }

    /**
     * Deletes the transaction if it is still pending, and reports it
     * `failed` with `error`, if any. One being signed or executed is left
     * to finish.
     */
    async function discard(
        request: TxApprovalRequest,
        error: CodedError | undefined
    ): Promise<void> {
        try {
            const store = (await getStore()).withAuthContext(request.auth)
            const transaction = await store.getTransaction(
                request.transactionId
            )
            if (transaction?.status !== 'pending') return
            await store.removeTransaction(request.transactionId)
        } catch (cause) {
            if (!(cause instanceof VaultLockedError)) {
                logger.error('Failed to delete transaction {id}: {cause}', {
                    id: request.transactionId,
                    cause,
                })
                return
            }
            // Nothing can sign it while locked.
            leftovers.add(request)
        }
        if (!error) return
        notificationService.getNotifier(request.sessionId).emit('txChanged', {
            status: 'failed',
            commandId: request.commandId,
            error: { code: error.code, message: error.message },
        } satisfies TxChangedFailedEvent)
    }

    vault.onLock(() => {
        for (const pending of byId.values()) {
            cancel(
                pending,
                providerErrors.unauthorized({ message: 'Wallet is locked' })
            )
        }
    })

    vault.onUnlock(() => {
        const requests = [...leftovers]
        leftovers.clear()
        for (const request of requests) void discard(request, undefined)
    })

    // Sign-out, another account or a new token.
    authContext.onChange((context) => {
        for (const pending of byId.values()) {
            if (pending.auth.accessToken !== context?.accessToken) {
                cancel(pending, sessionEnded())
            }
        }
    })

    browser.runtime.onConnect.addListener((port) => {
        const id = txApprovalPortId(port.name)
        if (id === undefined) return
        // A content script could otherwise cancel a prompt.
        if (port.sender === undefined || !isTrustedSender(port.sender)) {
            port.disconnect()
            return
        }
        const pending = byId.get(id)
        if (!pending) {
            port.disconnect()
            return
        }
        pending.ports.add(port)
        port.onDisconnect.addListener(() => pending.ports.delete(port))
    })

    browser.tabs.onRemoved.addListener((tabId) => {
        const prompts = byTab.get(tabId)
        if (!prompts) return
        byTab.delete(tabId)
        for (const pending of prompts) {
            cancel(
                pending,
                rejected('The tab that asked for the transaction was closed')
            )
        }
    })

    presence.onEnd((connection) => {
        for (const pending of byId.values()) {
            if (pending.tab?.connection === connection) {
                cancel(pending, pageGone())
            }
        }
    })

    /** Starts tracking `request`. Nothing awaits, so no ending is missed. */
    function track(request: TxApprovalRequest): PendingTx {
        const { transactionId, commandId, sessionId, tab } = request
        if (!tab?.connection?.live) {
            const error = pageGone()
            void discard(request, error)
            throw error
        }
        const notifier = notificationService.getNotifier(sessionId)
        // A dApp's `txChanged` listener can't tell two of them apart.
        for (const other of byId.values()) {
            if (
                other.sessionId === sessionId &&
                other.commandId === commandId
            ) {
                void discard(request, undefined)
                throw rpcErrors.invalidParams({
                    message: `A transaction with command ID ${commandId} is already waiting for approval`,
                })
            }
        }

        const listener: NotificationListener = (event) => {
            const changed = event as Partial<TxChangedFailedEvent> &
                Partial<TxChangedExecutedEvent> & { id?: string }
            if (changed.commandId !== commandId) return
            // `deleteTransaction`'s event has no `id`.
            if (changed.id !== undefined && changed.id !== transactionId) return
            if (changed.status === 'executed' && changed.payload) {
                end(pending, {
                    status: 'executed',
                    commandId,
                    payload: changed.payload,
                })
            } else if (changed.status === 'failed') {
                end(pending, failure(changed.error))
            }
        }

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
                cancel(pending, rejected('The transaction approval timed out')),
            timeoutMs
        )
        const pending: PendingTx = {
            ...request,
            outcome,
            settle: (result) => {
                clearTimeout(timer)
                notifier.removeListener('txChanged', listener)
                if (result instanceof Error) reject(result)
                else resolve(result)
            },
            ports: new Set(),
        }
        notifier.on('txChanged', listener)
        byId.set(transactionId, pending)
        byTab.set(tab.tabId, [...(byTab.get(tab.tabId) ?? []), pending])
        return pending
    }

    return {
        async request(request) {
            const pending = track(request)
            // The user may have signed out or switched accounts while the
            // transaction was prepared.
            if (!(await isCurrent(request.auth.accessToken))) {
                cancel(pending, sessionEnded())
            }
            // Ended in the meantime: rejects with its error.
            if (byId.get(request.transactionId) !== pending) {
                await pending.outcome
            }
            const { tabId, windowId } = pending.tab!
            void showTab(tabId).then(() => {
                if (byId.get(pending.transactionId) !== pending) return
                return openTabPopup(tabId, windowId)
            })
            return { outcome: pending.outcome }
        },
    }
}
