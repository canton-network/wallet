// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { createUserClient, attemptRemoveSession } from './rpc-client'
import { setLocationHref } from './navigation.js'

import '@canton-network/core-wallet-ui-components'
import { stateManager } from './state-manager'
import { WalletEvent } from '@canton-network/core-types'
import {
    DEFAULT_PAGE_REDIRECT,
    NOT_FOUND_PAGE_REDIRECT,
    LOGIN_PAGE_REDIRECT,
    TOKEN_EXPIRED_SKEW_MS,
} from './constants'
import {
    AllowedRoute,
    getCurrentRoute,
    isAllowedRoute,
    toRelHref,
    toRelPath,
} from '@canton-network/core-wallet-ui-components'
import './listeners'
import { detectCurrentOrigin } from './listeners'
import { fetchDappApiUrl, showToast } from './utils'

const globalPageResetStyle = document.createElement('style')
globalPageResetStyle.textContent = `
    html,
    body {
        margin: 0;
        padding: 0;
        min-height: 100%;
    }
`
document.head.appendChild(globalPageResetStyle)

export const redirectToIntendedOrDefault = async (): Promise<void> => {
    const currentOrigin = await detectCurrentOrigin()
    const intendedPage = stateManager.intendedPage.get(currentOrigin)
    stateManager.intendedPage.clear(currentOrigin)
    const route = intendedPage || DEFAULT_PAGE_REDIRECT
    setLocationHref(toRelHref(route))
}

@customElement('user-app')
export class UserApp extends LitElement {
    @state() accessor currentOrigin: string | null = null
    @state() accessor dappApiUrl: string = ''

    async connectedCallback(): Promise<void> {
        super.connectedCallback()
        this.currentOrigin = await detectCurrentOrigin()
        this.dappApiUrl = await fetchDappApiUrl()
    }

    private async handleLogout() {
        clearTokenExpirationTimeout()

        const currentOrigin = await detectCurrentOrigin()
        const accessToken = await stateManager.accessToken.get(currentOrigin)

        if (!accessToken) {
            setLocationHref(toRelHref(LOGIN_PAGE_REDIRECT))
            return
        }

        try {
            const userClient = await createUserClient(accessToken)
            await userClient.request({ method: 'removeSession' })
        } catch (error) {
            // If removeSession fails (for example token is invalid),
            // clear the local state anyway
            console.debug('Failed to remove session during logout: ', error)
        }

        await stateManager.clearAuthState(currentOrigin)

        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
                { type: WalletEvent.SPLICE_WALLET_LOGOUT },
                '*'
            )
            // close the gateway UI automatically if we are within a popup
            window.close()
        } else {
            // if the gateway UI is running in the main window, redirect to login
            setLocationHref(toRelHref(LOGIN_PAGE_REDIRECT))
        }
    }

    private async handleCopyDappApiUrl(): Promise<void> {
        try {
            const dappApiUrl = await fetchDappApiUrl()
            await navigator.clipboard.writeText(dappApiUrl)
            showToast('Copied', 'Dapp API URL copied to clipboard.', 'success')
        } catch (error) {
            console.debug('Failed to copy dApp API URL: ', error)
            showToast(
                'Copy failed',
                'Could not copy the Dapp API URL.',
                'error'
            )
        }
    }

    protected render() {
        const networkId = stateManager.networkId.get(this.currentOrigin || '')
        const networkName = networkId || 'No network connected'
        const networkConnected = Boolean(networkId)

        return html`
            <app-layout
                iconSrc=${toRelPath('/icon.png')}
                .networkName=${networkName}
                .networkConnected=${networkConnected}
                .dappApiUrl=${this.dappApiUrl}
                @logout=${this.handleLogout}
                @copy-dapp-api-url=${this.handleCopyDappApiUrl}
            >
                <user-ui-auth-redirect></user-ui-auth-redirect>
                <slot></slot>
            </app-layout>
        `
    }
}

@customElement('user-ui')
export class UserUI extends LitElement {
    connectedCallback(): void {
        super.connectedCallback()

        const currentRoute = getCurrentRoute(window.location.pathname) || '/'
        // Only redirect to 404 if route is not allowed
        // If route is allowed, let UserUIAuthRedirect handle any redirects
        if (!isAllowedRoute(currentRoute)) {
            setLocationHref(toRelHref(NOT_FOUND_PAGE_REDIRECT))
        }
    }
}

let tokenExpirationTimeoutId: ReturnType<typeof setTimeout> | null = null

const clearTokenExpirationTimeout = (): void => {
    if (tokenExpirationTimeoutId !== null) {
        clearTimeout(tokenExpirationTimeoutId)
        tokenExpirationTimeoutId = null
    }
}

const getSessionId = async (token: string): Promise<string | undefined> => {
    const userClient = await createUserClient(token)
    const sessions = await userClient
        .request({ method: 'listSessions' })
        .catch(() => {
            return null
        })
    return sessions?.sessions?.[0]?.id ?? undefined
}

export const shareConnection = (token: string, sessionId: string) => {
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
            {
                type: WalletEvent.SPLICE_WALLET_IDP_AUTH_SUCCESS,
                token,
                sessionId,
            },
            '*'
        )
    }
}

@customElement('user-ui-auth-redirect')
export class UserUIAuthRedirect extends LitElement {
    connectedCallback(): void {
        super.connectedCallback()
        this.handleAuthRedirect()
    }

    private async handleAuthRedirect(): Promise<void> {
        const currentRoute = getCurrentRoute(window.location.pathname)
        const isLoginPage = currentRoute === LOGIN_PAGE_REDIRECT
        const currentOrigin = await detectCurrentOrigin()
        const accessToken = await stateManager.accessToken.get(currentOrigin)

        if (!accessToken) {
            this.handleUnauthenticated(isLoginPage, currentOrigin)
            return
        }

        if (this.isTokenExpired(currentOrigin)) {
            this.handleExpiredToken(isLoginPage)
            return
        }

        if (isLoginPage) {
            await this.handleAuthenticatedOnLoginPage(accessToken)
            return
        }

        await this.handleAuthenticatedOnLoggedInPage(accessToken)
    }

    private getIntendedPageFromCurrentPath(): AllowedRoute | undefined {
        const currentPath = getCurrentRoute(window.location.pathname)
        if (
            currentPath &&
            currentPath !== '/' &&
            currentPath !== LOGIN_PAGE_REDIRECT &&
            currentPath !== '/callback'
        ) {
            return currentPath
        }
        return undefined
    }

    private async clearAuthStateAndPreserveIntendedPage(): Promise<void> {
        const intendedPage = this.getIntendedPageFromCurrentPath()
        const currentOrigin = await detectCurrentOrigin()

        await stateManager.clearAuthState(currentOrigin)
        if (intendedPage) {
            stateManager.intendedPage.set(intendedPage, currentOrigin)
        }
    }

    private handleUnauthenticated(
        isLoginPage: boolean,
        currentOrigin: string
    ): void {
        if (!isLoginPage) {
            const intendedPage = this.getIntendedPageFromCurrentPath()
            if (intendedPage) {
                stateManager.intendedPage.set(intendedPage, currentOrigin)
            }
            setLocationHref(toRelHref(LOGIN_PAGE_REDIRECT))
        }
    }

    private async handleExpiredToken(isLoginPage: boolean): Promise<void> {
        clearTokenExpirationTimeout()

        const currentOrigin = await detectCurrentOrigin()
        const accessToken = await stateManager.accessToken.get(currentOrigin)
        if (accessToken) {
            // Attempt to remove session even if token is expired
            await attemptRemoveSession(accessToken)
        }

        if (!isLoginPage) {
            await this.clearAuthStateAndPreserveIntendedPage()
            setLocationHref(toRelHref(LOGIN_PAGE_REDIRECT))
        } else {
            await stateManager.clearAuthState(currentOrigin)
        }
    }

    private async handleAuthenticatedOnLoginPage(
        accessToken: string
    ): Promise<void> {
        const sessionId = await getSessionId(accessToken)
        const currentOrigin = await detectCurrentOrigin()
        if (sessionId) {
            this.setTokenExpirationTimeout(currentOrigin)
            await redirectToIntendedOrDefault()
            shareConnection(accessToken, sessionId)
        } else {
            await attemptRemoveSession(accessToken)
            await stateManager.clearAuthState(currentOrigin)
        }
    }

    private async handleAuthenticatedOnLoggedInPage(
        accessToken: string
    ): Promise<void> {
        const currentOrigin = await detectCurrentOrigin()
        const networkId = stateManager.networkId.get(currentOrigin)
        if (!networkId) {
            throw new Error('missing networkId in state manager')
        }

        const sessionId = await getSessionId(accessToken)
        if (!sessionId) {
            await attemptRemoveSession(accessToken)
            await this.clearAuthStateAndPreserveIntendedPage()
            setLocationHref(toRelHref(LOGIN_PAGE_REDIRECT))
            return
        }

        // Token is valid - set up expiration timeout
        this.setTokenExpirationTimeout(currentOrigin)
        shareConnection(accessToken, sessionId)

        // Redirect to default page if on root path
        if ((getCurrentRoute(window.location.pathname) || '/') === '/') {
            await redirectToIntendedOrDefault()
        }
    }

    private setTokenExpirationTimeout(origin: string): void {
        clearTokenExpirationTimeout()

        const expirationDate = new Date(
            stateManager.expirationDate.get(origin) || ''
        )
        const now = new Date()
        const timeUntilExpiration =
            expirationDate.getTime() - now.getTime() - TOKEN_EXPIRED_SKEW_MS

        if (timeUntilExpiration > 0) {
            tokenExpirationTimeoutId = setTimeout(async () => {
                const isLoginPage =
                    getCurrentRoute(window.location.pathname) ===
                    LOGIN_PAGE_REDIRECT
                await this.handleExpiredToken(isLoginPage)
                tokenExpirationTimeoutId = null
            }, timeUntilExpiration)
        }
    }

    private isTokenExpired(origin: string): boolean {
        const expirationDate = new Date(
            stateManager.expirationDate.get(origin) || 0
        )
        return Number(expirationDate) - TOKEN_EXPIRED_SKEW_MS <= Date.now()
    }
}

export const addUserSession = async (token: string, networkId: string) => {
    const authenticatedUserClient = await createUserClient(token)

    const currentOrigin = await detectCurrentOrigin()

    if (!currentOrigin) {
        throw new Error('Missing dApp origin. Cannot add user session.')
    }

    const session = await authenticatedUserClient.request({
        method: 'addSession',
        params: {
            origin: currentOrigin,
            networkId,
        },
    })

    stateManager.sessionId.set(session.id, currentOrigin)
    shareConnection(token, session.id)
}
