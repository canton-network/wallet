// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    fetchOidcDiscovery,
    oidcTokenResponseSchema,
    parseIdpResponse,
} from '@canton-network/core-wallet-auth'
import { browser } from 'wxt/browser'
import { AuthErrorName } from '@/shared/auth-protocol'

export class SignInFailedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = AuthErrorName.SignInFailed
    }
}

export interface AuthorizationCodeParams {
    /** The IdP's OIDC discovery document URL. */
    configUrl: string
    clientId: string
    scope: string
    audience: string
}

const PKCE_VERIFIER_BYTES = 64

function toBase64Url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

async function createPkcePair() {
    const verifier = toBase64Url(
        crypto.getRandomValues(new Uint8Array(PKCE_VERIFIER_BYTES))
    )
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier)
    )
    return { verifier, challenge: toBase64Url(new Uint8Array(digest)) }
}

/**
 * Runs the OAuth authorization code flow with PKCE in a browser-managed
 * sign-in window and resolves to the access token.
 *
 * The verifier and `state` stay in this call's memory, so nothing outlives
 * it. The redirect URI is `browser.identity.getRedirectURL()`
 * (`https://<id>.chromiumapp.org/` in Chrome), which the IdP must allow for
 * the client.
 */
export async function signInWithAuthorizationCode({
    configUrl,
    clientId,
    scope,
    audience,
}: AuthorizationCodeParams): Promise<string> {
    const config = await fetchOidcDiscovery(configUrl)
    if (!config.authorization_endpoint || !config.token_endpoint) {
        throw new Error(
            'OIDC discovery document has no authorization_endpoint or token_endpoint'
        )
    }

    const redirectUri = browser.identity.getRedirectURL()
    const state = crypto.randomUUID()
    const { verifier, challenge } = await createPkcePair()

    const authorizeUrl = new URL(config.authorization_endpoint)
    authorizeUrl.search = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        audience,
        state,
        nonce: crypto.randomUUID(),
        code_challenge: challenge,
        code_challenge_method: 'S256',
    }).toString()

    let callbackUrl: string | undefined
    try {
        callbackUrl = await browser.identity.launchWebAuthFlow({
            url: authorizeUrl.toString(),
            interactive: true,
        })
    } catch (error) {
        // Closing the window lands here too.
        throw new SignInFailedError('Sign-in was cancelled or failed.', {
            cause: error,
        })
    }
    if (!callbackUrl) {
        throw new SignInFailedError('Sign-in returned no callback URL.')
    }

    const callback = new URL(callbackUrl).searchParams
    const idpError = callback.get('error')
    if (idpError) {
        throw new SignInFailedError(
            `The identity provider refused the sign-in: ${idpError}`
        )
    }
    if (callback.get('state') !== state) {
        throw new SignInFailedError('Sign-in callback state does not match.')
    }
    const code = callback.get('code')
    if (!code) {
        throw new SignInFailedError('Sign-in callback has no code.')
    }

    const response = await fetch(config.token_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            audience,
            code_verifier: verifier,
        }),
    })
    if (!response.ok) {
        throw new Error(`OAuth token request failed: ${response.status}`)
    }
    const { access_token } = parseIdpResponse(
        oidcTokenResponseSchema,
        await response.json(),
        'OAuth token response'
    )
    return access_token
}
