// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    buildEndSessionUrl,
    fetchOidcDiscovery,
} from '@canton-network/core-wallet-auth'
import { toRelHref } from '@canton-network/core-wallet-ui-components'
import { LOGIN_PAGE_REDIRECT } from './constants'
import { stateManager } from './state-manager'

const CLOSE_AFTER_IDP_LOGOUT_KEY = 'closeAfterIdpLogout'

/**
 * RP-initiated logout URL of the OAuth IDP the user logged in with, if the IDP
 * supports it. The IDP redirects back to the login page afterwards. Best
 * effort: any failure only skips the IDP logout.
 */
export async function idpEndSessionUrl(
    origin: string
): Promise<string | undefined> {
    try {
        const session = await stateManager.oauthIdpSession.get(origin)
        if (!session) return undefined

        const { end_session_endpoint } = await fetchOidcDiscovery(
            session.configUrl
        )
        if (!end_session_endpoint) return undefined

        return buildEndSessionUrl(end_session_endpoint, {
            clientId: session.clientId,
            idTokenHint: session.idToken,
            postLogoutRedirectUri: new URL(
                toRelHref(LOGIN_PAGE_REDIRECT),
                window.location.origin
            ).toString(),
        })
    } catch (error) {
        console.debug('Skipping IDP logout: ', error)
        return undefined
    }
}

/**
 * A popup closes on logout. When it first has to visit the IDP to log out
 * there, remember to close it once the IDP redirects back to the login page.
 */
export function closeAfterIdpLogout(): void {
    sessionStorage.setItem(CLOSE_AFTER_IDP_LOGOUT_KEY, 'true')
}

/** @returns true if the window is being closed after an IDP logout */
export function closeIfReturningFromIdpLogout(): boolean {
    if (!sessionStorage.getItem(CLOSE_AFTER_IDP_LOGOUT_KEY)) return false
    sessionStorage.removeItem(CLOSE_AFTER_IDP_LOGOUT_KEY)
    if (!window.opener || window.opener.closed) return false
    window.close()
    return true
}
