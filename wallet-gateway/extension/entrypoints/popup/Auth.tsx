// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'

const PKCE_CODE_VERIFIER_LENGTH = 64

const toBase64Url = (bytes: Uint8Array): string => {
    const binary = String.fromCharCode(...bytes)
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
}

const createPkcePair = async (): Promise<{
    verifier: string
    challenge: string
}> => {
    const verifierBytes = crypto.getRandomValues(
        new Uint8Array(PKCE_CODE_VERIFIER_LENGTH)
    )
    const verifier = toBase64Url(verifierBytes)

    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier)
    )

    return {
        verifier,
        challenge: toBase64Url(new Uint8Array(digest)),
    }
}

const selectedIdp = {
    id: 'idp-mock-oauth',
    type: 'oauth',
    issuer: 'http://127.0.0.1:8889',
    configUrl: 'http://127.0.0.1:8889/.well-known/openid-configuration',
}

const selectedNetwork = {
    id: 'canton:local-oauth',
    name: 'Local (OAuth IDP)',
    description: 'Mock OAuth IDP',
    synchronizerId:
        'wallet::1220e7b23ea52eb5c672fb0b1cdbc916922ffed3dd7676c223a605664315e2d43edd',
    identityProviderId: 'idp-mock-oauth',
    method: 'authorization_code',
    clientId: 'operator',
    scope: 'openid email daml_ledger_api offline_access',
    audience:
        'https://daml.com/jwt/aud/participant/participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
    ledgerApi: {
        baseUrl: 'http://127.0.0.1:5003',
    },
}

function Auth() {
    const [status, setStatus] = React.useState('Not logged in')

    return (
        <div>
            <p>{status}</p>
            <button
                onClick={async () => {
                    logger.info('yoooo')
                    const redirectUri = browser.identity.getRedirectURL()

                    const config = await fetch(
                        selectedIdp.configUrl || ''
                    ).then((res) => res.json())

                    const statePayload = {
                        configUrl: selectedIdp.configUrl,
                        clientId: selectedNetwork.clientId,
                        audience: selectedNetwork.audience,
                        stateId: crypto.randomUUID(),
                    }

                    const { verifier, challenge } = await createPkcePair()
                    sessionStorage.setItem(
                        `oauth-pkce-${statePayload.stateId}`,
                        verifier
                    )

                    const params = new URLSearchParams({
                        response_type: 'code',
                        client_id: selectedNetwork.clientId || '',
                        redirect_uri: redirectUri,
                        nonce: crypto.randomUUID(),
                        scope: selectedNetwork.scope || '',
                        audience: selectedNetwork.audience || '',
                        state: btoa(JSON.stringify(statePayload)),
                        code_challenge: challenge,
                        code_challenge_method: 'S256',
                    })

                    const authUrl = `${config.authorization_endpoint}?${params.toString()}`

                    logger.info('Launching web auth flow with URL: ' + authUrl)

                    browser.identity
                        .launchWebAuthFlow({
                            url: authUrl,
                            interactive: true,
                        })
                        .then(async (redirectURL) => {
                            logger.info('yooo' + redirectURL)
                            if (!redirectURL) {
                                setStatus('No redirect URL returned')
                                return
                            }

                            const url = new URL(redirectURL)
                            const code = url.searchParams.get('code')
                            const encodedState = url.searchParams.get('state')

                            if (!code && !encodedState) {
                                setStatus('Missing state and code')
                                return
                            }

                            if (code && encodedState) {
                                const state = JSON.parse(atob(encodedState))
                                const pkceVerifier = sessionStorage.getItem(
                                    `oauth-pkce-${state.stateId}`
                                )

                                if (!pkceVerifier) {
                                    setStatus(
                                        'Missing PKCE verifier for OAuth callback state'
                                    )
                                    return
                                }

                                sessionStorage.removeItem(
                                    `oauth-pkce-${state.stateId}`
                                )

                                const fetchConfig = await fetch(state.configUrl)
                                const config = await fetchConfig.json()
                                const tokenEndpoint = config.token_endpoint

                                const res = await fetch(tokenEndpoint, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type':
                                            'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        grant_type: 'authorization_code',
                                        code,
                                        redirect_uri: redirectUri,
                                        client_id: state.clientId,
                                        audience: state.audience,
                                        code_verifier: pkceVerifier,
                                    }),
                                })

                                const tokenResponse = await res.json()

                                if (tokenResponse.access_token) {
                                    const payload = JSON.parse(
                                        atob(
                                            tokenResponse.access_token.split(
                                                '.'
                                            )[1]
                                        )
                                    )
                                    setStatus(
                                        `Logged in! Access token expires at: ${new Date(
                                            payload.exp * 1000
                                        ).toISOString()}`
                                    )
                                }
                            }
                        })
                }}
            >
                Login
            </button>
        </div>
    )
}

export default Auth
