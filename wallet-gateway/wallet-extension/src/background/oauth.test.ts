// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { AuthErrorName } from '@/shared/auth-protocol'
import { signInWithAuthorizationCode } from './oauth'

const params = {
    configUrl: 'https://idp.example/.well-known/openid-configuration',
    clientId: 'operator',
    scope: 'openid daml_ledger_api',
    audience: 'https://daml.com/aud',
}
const redirectUri = 'https://ext-id.chromiumapp.org/'

describe('signInWithAuthorizationCode', () => {
    let fetchMock: ReturnType<typeof vi.fn>
    let launchWebAuthFlow: ReturnType<typeof vi.fn>

    /** Answers like an IdP that approves the request. */
    function approve(overrides: Record<string, string> = {}) {
        launchWebAuthFlow.mockImplementation(async ({ url }) => {
            const state = new URL(url).searchParams.get('state')!
            const callback = new URL(redirectUri)
            callback.search = new URLSearchParams({
                code: 'auth-code',
                state,
                ...overrides,
            }).toString()
            return callback.toString()
        })
    }

    beforeEach(() => {
        fetchMock = vi.fn(async (url: string) =>
            url === params.configUrl
                ? Response.json({
                      authorization_endpoint: 'https://idp.example/authorize',
                      token_endpoint: 'https://idp.example/token',
                  })
                : Response.json({ access_token: 'the-token' })
        )
        vi.stubGlobal('fetch', fetchMock)
        launchWebAuthFlow = vi.fn()
        fakeBrowser.identity.launchWebAuthFlow =
            launchWebAuthFlow as typeof fakeBrowser.identity.launchWebAuthFlow
        fakeBrowser.identity.getRedirectURL = () => redirectUri
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        fakeBrowser.reset()
    })

    it('exchanges the code with the PKCE verifier', async () => {
        approve()
        await expect(signInWithAuthorizationCode(params)).resolves.toBe(
            'the-token'
        )

        const authorize = new URL(launchWebAuthFlow.mock.calls[0]![0].url)
        expect(authorize.origin + authorize.pathname).toBe(
            'https://idp.example/authorize'
        )
        expect(Object.fromEntries(authorize.searchParams)).toMatchObject({
            response_type: 'code',
            client_id: params.clientId,
            redirect_uri: redirectUri,
            scope: params.scope,
            audience: params.audience,
            code_challenge_method: 'S256',
        })

        const [tokenUrl, init] = fetchMock.mock.calls[1]!
        expect(tokenUrl).toBe('https://idp.example/token')
        const body = new URLSearchParams(init.body)
        expect(Object.fromEntries(body)).toMatchObject({
            grant_type: 'authorization_code',
            code: 'auth-code',
            redirect_uri: redirectUri,
            client_id: params.clientId,
        })

        // The challenge sent to /authorize is the SHA-256 of the verifier.
        const digest = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(body.get('code_verifier')!)
        )
        const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
        expect(authorize.searchParams.get('code_challenge')).toBe(challenge)
    })

    it.each<{ case: string; overrides: Record<string, string> }>([
        { case: 'a mismatched state', overrides: { state: 'forged' } },
        { case: 'an IdP error', overrides: { error: 'access_denied' } },
    ])('fails on $case without asking for a token', async ({ overrides }) => {
        approve(overrides)
        await expect(signInWithAuthorizationCode(params)).rejects.toMatchObject(
            { name: AuthErrorName.SignInFailed }
        )
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fails when the user closes the sign-in window', async () => {
        launchWebAuthFlow.mockRejectedValue(
            new Error('The user did not approve access.')
        )
        await expect(signInWithAuthorizationCode(params)).rejects.toMatchObject(
            { name: AuthErrorName.SignInFailed }
        )
    })

    it('fails when the token request fails', async () => {
        approve()
        fetchMock.mockImplementation(async (url: string) =>
            url === params.configUrl
                ? Response.json({
                      authorization_endpoint: 'https://idp.example/authorize',
                      token_endpoint: 'https://idp.example/token',
                  })
                : new Response(null, { status: 400 })
        )
        await expect(signInWithAuthorizationCode(params)).rejects.toThrow(
            'OAuth token request failed: 400'
        )
    })
})
