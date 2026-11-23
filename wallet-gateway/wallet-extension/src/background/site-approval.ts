// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { providerErrors } from '@canton-network/core-rpc-errors'
import { jwtExpired } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import { browser, type Browser } from 'wxt/browser'

import { logger } from '@/shared/logger.ts'
import { siteApprovalPortId } from '@/shared/ports.ts'

import type { AuthContextChanges, AuthContextStore } from './auth-context.ts'
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

/** The browser tab of the page that sent a dApp request. */
export interface SiteApprovalTab {
    tabId: number
    windowId: number
}

export interface SiteApprovalRequest {
    /** See `sitePrincipal`. */
    principal: string
    origin: string
    /** The token of the session that asked. */
    accessToken: string
    /** Where the prompt is shown. Without one, it waits for the timeout. */
    tab?: SiteApprovalTab
}

export interface SiteApprovals {
    /**
     * Points the toolbar icon of the request's tab at the approval page, and
     * resolves once the user has approved the origin. Rejects with error 4001
     * when the user rejects, closes the tab, the tab loads another page or
     * the user doesn't answer in time, and
     * with 4100 when the session isn't current (expired, signed out, another
     * account) or the vault locks. Closing the page leaves the request
     * pending.
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
    /** The open approval pages, which close when their port disconnects. */
    ports: Set<Browser.runtime.Port>
    /** Set when the session changed while the user's approval was being saved. */
    stale?: boolean
}

export interface SiteApprovalsOptions {
    vault: Pick<Vault, 'onLock'>
    authContext: AuthContextChanges
    isCurrent: SessionCheck
    sites: ApprovedSiteStore
    timeoutMs?: number
}

const rejected = (message: string) =>
    providerErrors.userRejectedRequest({ message })

export const sessionEnded = () =>
    providerErrors.unauthorized({
        message: 'The session that asked for the site approval has ended',
    })

const DEFAULT_POPUP = 'popup.html'

const approvalPopup = (id: string) =>
    `${DEFAULT_POPUP}#/approve-site?id=${encodeURIComponent(id)}`

// The tab may have closed in the meantime.
const ignore = () => {}

/**
 * Points the tab's toolbar icon at its newest pending prompt, with a badge
 * counting them, or back at the wallet when there is none. Other tabs keep
 * the default popup.
 */
async function showPrompts(tabId: number, ids: string[]): Promise<void> {
    const newest = ids.at(-1)
    await Promise.all([
        browser.action
            .setPopup({
                tabId,
                popup:
                    newest === undefined
                        ? DEFAULT_POPUP
                        : approvalPopup(newest),
            })
            .catch(ignore),
        browser.action
            .setBadgeText({ tabId, text: ids.length ? String(ids.length) : '' })
            .catch(ignore),
        ids.length
            ? browser.action
                  .setBadgeBackgroundColor({ tabId, color: '#d32f2f' })
                  .catch(ignore)
            : undefined,
    ])
}

/**
 * Keeps the pending site approvals in memory. A service worker restart drops
 * them, along with the dApp requests that wait for them. Must be created
 * synchronously during background start-up, as it adds port and tab
 * listeners.
 *
 * A prompt lives on the toolbar icon of the dApp's tab until it settles. The
 * toolbar popup closes on any click outside it, so closing the page doesn't
 * reject; the user can click the icon again. An open page holds a port, which
 * the background disconnects to close the page when it cancels the request.
 */
export function createSiteApprovals({
    vault,
    authContext,
    isCurrent,
    sites,
    timeoutMs = SITE_APPROVAL_TIMEOUT_MS,
}: SiteApprovalsOptions): SiteApprovals {
    const byKey = new Map<string, PendingApproval>()
    const byId = new Map<string, PendingApproval>()
    // The pending prompts of each tab, oldest first.
    const byTab = new Map<number, PendingApproval[]>()
    // Answered with an approval that is still being saved.
    const saving = new Set<PendingApproval>()

    function closePages(pending: PendingApproval): void {
        for (const port of pending.ports) port.disconnect()
        pending.ports.clear()
    }

    function showTab(tabId: number): Promise<void> {
        return showPrompts(
            tabId,
            (byTab.get(tabId) ?? []).map((pending) => pending.id)
        )
    }

    function untrack(pending: PendingApproval): void {
        if (!pending.tab) return
        const { tabId } = pending.tab
        const prompts = byTab.get(tabId)
        if (!prompts) return
        const rest = prompts.filter((other) => other !== pending)
        if (rest.length) byTab.set(tabId, rest)
        else byTab.delete(tabId)
        void showTab(tabId)
    }

    function claim(pending: PendingApproval): boolean {
        if (byId.get(pending.id) !== pending) return false
        byId.delete(pending.id)
        byKey.delete(pending.key)
        untrack(pending)
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
        port.onDisconnect.addListener(() => pending.ports.delete(port))
    })

    /** Rejects the tab's prompts without redrawing the tab for each one. */
    function endTab(tabId: number, message: string): boolean {
        const prompts = byTab.get(tabId)
        if (!prompts) return false
        byTab.delete(tabId)
        for (const pending of prompts) finish(pending, rejected(message))
        return true
    }

    // Nothing left to restore on a closed tab.
    browser.tabs.onRemoved.addListener((tabId) => {
        endTab(tabId, 'The tab that asked for the site was closed')
    })

    // Chrome resets a tab's popup and badge when it loads a new document, and
    // the page that asked is gone, so its prompts end. Without this, the next
    // page's `connect` would join the hidden prompt and its older timer.
    browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === 'loading') {
            // Chrome resets the popup itself once the new document commits;
            // this covers a load that never commits.
            if (endTab(tabId, 'The page that asked for the site changed')) {
                void showTab(tabId)
            }
            return
        }
        if (byTab.has(tabId)) void showTab(tabId)
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
        if (request.tab) {
            prompt(request.tab, pending)
        } else {
            logger.warn(
                'A site approval for {origin} has no tab to prompt in, so it waits for the timeout',
                { origin: request.origin }
            )
        }
        return pending
    }

    function prompt(
        { tabId, windowId }: SiteApprovalTab,
        pending: PendingApproval
    ) {
        byTab.set(tabId, [...(byTab.get(tabId) ?? []), pending])
        void showTab(tabId).then(() => {
            // Settled in the meantime: the popup is the wallet again.
            if (byId.get(pending.id) !== pending) return
            // Without a focused normal window this fails, and the user opens
            // the prompt from the icon.
            return browser.action.openPopup({ windowId }).catch(ignore)
        })
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
