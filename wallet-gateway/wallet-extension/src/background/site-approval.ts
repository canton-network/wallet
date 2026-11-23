// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { providerErrors } from '@canton-network/core-rpc-errors'
import { jwtExpired } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import { browser, type Browser } from 'wxt/browser'

import { siteApprovalPortId } from '@/shared/ports.ts'

import type { AuthContextChanges, AuthContextStore } from './auth-context.ts'
import { openWalletUi } from './open-ui.ts'
import type { ApprovedSiteStore } from './store/approved-sites.ts'
import { isTrustedSender } from './trusted-service.ts'
import { type Vault, VaultLockedError } from './vault/index.ts'

/**
 * How long `connect` waits for the user. Chrome stops a service worker whose
 * event has run for 5 minutes, which would drop the dApp's request without
 * an answer, so this stays well under that.
 */
export const SITE_APPROVAL_TIMEOUT_MS = 2 * 60 * 1000

// A type, not an interface, so it fits `requireUnlocked`'s index signature.
export type SiteApprovalService = {
    /** Null once the request has been settled. */
    get(id: string): Promise<{ origin: string } | null>
    decide(id: string, approved: boolean): Promise<void>
}

export interface SiteApprovalRequest {
    /** See `sitePrincipal`. */
    principal: string
    origin: string
    /** The token of the session that asked. */
    accessToken: string
}

export interface SiteApprovals {
    /**
     * Opens the approval page for the origin and resolves once the user has
     * approved it. Rejects with error 4001 when the user rejects, closes the
     * page (its port disconnects) or doesn't answer in time, and with 4100
     * when the session isn't current (expired, signed out, another account)
     * or the vault locks.
     * Calls for a principal and origin that is already pending share its
     * answer.
     */
    request(request: SiteApprovalRequest): Promise<void>
    service: SiteApprovalService
}

/**
 * Whether `accessToken` is the signed-in user's, unexpired and has a session.
 * The same rule as the auth service's `getStatus`: an expired token counts as
 * signed out.
 */
export type SessionCheck = (accessToken: string) => Promise<boolean>

export function currentSessionCheck(
    getStore: () => Promise<Pick<Store, 'getSession'>>,
    authContext: Pick<AuthContextStore, 'load'>
): SessionCheck {
    return async (accessToken) => {
        try {
            const context = await authContext.load()
            if (context?.accessToken !== accessToken) return false
            if (jwtExpired(accessToken)) return false
            const store = await getStore()
            return (await store.getSession(accessToken)) !== undefined
        } catch (error) {
            if (error instanceof VaultLockedError) return false
            throw error
        }
    }
}

interface PendingApproval extends SiteApprovalRequest {
    id: string
    key: string
    promise: Promise<void>
    settle: (error?: Error) => void
    /** The approval pages that hold a port open for this request. */
    ports: Set<Browser.runtime.Port>
    /** Set when the session changed while the user's approval was being saved. */
    stale?: boolean
}

export interface SiteApprovalsOptions {
    vault: Pick<Vault, 'onLock'>
    authContext: AuthContextChanges
    isCurrent: SessionCheck
    sites: ApprovedSiteStore
    open?: (path: string) => Promise<void>
    timeoutMs?: number
}

const rejected = (message: string) =>
    providerErrors.userRejectedRequest({ message })

export const sessionEnded = () =>
    providerErrors.unauthorized({
        message: 'The session that asked for the site approval has ended',
    })

const openInToolbarPopup = (path: string) =>
    openWalletUi(path, { toolbarPopup: true })

/**
 * Keeps the pending site approvals in memory. A service worker restart drops
 * them, along with the dApp requests that wait for them. Must be created
 * synchronously during background start-up, as it adds a port listener.
 *
 * The approval page holds a port open for its request. The background can't
 * close the toolbar popup by window ID, so it disconnects the port and the
 * page closes itself; the popup window fallback works the same way.
 */
export function createSiteApprovals({
    vault,
    authContext,
    isCurrent,
    sites,
    open = openInToolbarPopup,
    timeoutMs = SITE_APPROVAL_TIMEOUT_MS,
}: SiteApprovalsOptions): SiteApprovals {
    const byKey = new Map<string, PendingApproval>()
    const byId = new Map<string, PendingApproval>()
    // Answered with an approval that is still being saved.
    const saving = new Set<PendingApproval>()

    function closePages(pending: PendingApproval): void {
        for (const port of pending.ports) port.disconnect()
        pending.ports.clear()
    }

    function claim(pending: PendingApproval): boolean {
        if (byId.get(pending.id) !== pending) return false
        byId.delete(pending.id)
        byKey.delete(pending.key)
        return true
    }

    /** Settles a prompt the user didn't answer, and closes its page. */
    function finish(pending: PendingApproval, error: Error): void {
        if (!claim(pending)) return
        pending.settle(error)
        closePages(pending)
    }

    vault.onLock(() => {
        for (const pending of byId.values()) {
            finish(
                pending,
                providerErrors.unauthorized({ message: 'Wallet is locked' })
            )
        }
    })

    // Sign-out, another account or a new token: the prompts asked about a
    // session that is gone.
    authContext.onChange((context) => {
        for (const pending of byId.values()) {
            if (pending.accessToken !== context?.accessToken) {
                finish(pending, sessionEnded())
            }
        }
        for (const pending of saving) {
            if (pending.accessToken !== context?.accessToken) {
                pending.stale = true
            }
        }
    })

    browser.runtime.onConnect.addListener((port) => {
        const id = siteApprovalPortId(port.name)
        if (id === undefined) return
        // A content script could otherwise cancel a prompt.
        if (port.sender === undefined || !isTrustedSender(port.sender)) {
            port.disconnect()
            return
        }
        const pending = byId.get(id)
        if (!pending) {
            // Settled or cancelled while the page was opening.
            port.disconnect()
            return
        }
        pending.ports.add(port)
        // After an answer the request is no longer in `byId`, so `finish`
        // leaves an approval that is being saved alone.
        port.onDisconnect.addListener(() => {
            pending.ports.delete(port)
            finish(pending, rejected('The user closed the approval page'))
        })
    })

    async function undo(pending: PendingApproval): Promise<void> {
        try {
            await sites.revoke(pending.principal, pending.origin)
        } catch (error) {
            // A lock doesn't change who is signed in, so the grant still
            // belongs to the user who gave it.
            if (!(error instanceof VaultLockedError)) throw error
        }
    }

    function start(request: SiteApprovalRequest, key: string) {
        let resolve!: () => void
        let reject!: (error: Error) => void
        const promise = new Promise<void>((res, rej) => {
            resolve = res
            reject = rej
        })
        const timer = setTimeout(
            () => finish(pending, rejected('The site approval timed out')),
            timeoutMs
        )
        const pending: PendingApproval = {
            ...request,
            id: crypto.randomUUID(),
            key,
            promise,
            settle: (error) => {
                clearTimeout(timer)
                if (error) reject(error)
                else resolve()
            },
            ports: new Set(),
        }
        byKey.set(key, pending)
        byId.set(pending.id, pending)

        open(`/approve-site?id=${encodeURIComponent(pending.id)}`).catch(
            (error: unknown) =>
                finish(
                    pending,
                    error instanceof Error ? error : new Error(String(error))
                )
        )
        return pending
    }

    return {
        async request(request) {
            if (!(await isCurrent(request.accessToken))) {
                throw providerErrors.unauthorized({
                    message: 'User is not connected',
                })
            }
            const key = JSON.stringify([request.principal, request.origin])
            const pending = byKey.get(key)
            if (pending && pending.accessToken !== request.accessToken) {
                finish(pending, sessionEnded())
            }
            return (byKey.get(key) ?? start(request, key)).promise
        },
        service: {
            async get(id) {
                const pending = byId.get(id)
                return pending ? { origin: pending.origin } : null
            },
            async decide(id, approved) {
                const pending = byId.get(id)
                if (!pending || !claim(pending)) {
                    throw new Error('This request is no longer pending')
                }
                if (approved !== true) {
                    pending.settle(rejected('The user rejected the site'))
                    return
                }
                saving.add(pending)
                try {
                    // The user may have signed out or switched accounts
                    // while the page was open.
                    if (
                        !(await isCurrent(pending.accessToken)) ||
                        pending.stale
                    ) {
                        throw sessionEnded()
                    }
                    await sites.approve(pending.principal, pending.origin)
                    // An auth change can land between the check and the
                    // write, as they are separate vault operations. Checking
                    // again after the write catches it, and the grant is
                    // undone.
                    if (
                        pending.stale ||
                        !(await isCurrent(pending.accessToken))
                    ) {
                        await undo(pending)
                        throw sessionEnded()
                    }
                } catch (error) {
                    pending.settle(error as Error)
                    throw error
                } finally {
                    saving.delete(pending)
                }
                pending.settle()
            },
        },
    }
}
