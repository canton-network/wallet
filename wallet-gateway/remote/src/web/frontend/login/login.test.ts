// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { LoginConnectEvent } from '@canton-network/core-wallet-ui-components'
import {
    createMockUserClient,
    makeIdp,
    makeNetwork,
    mockRequest,
} from '../test-helpers.js'

const {
    mockCreateUserClient,
    handleErrorToast,
    mockRedirectToIntendedOrDefault,
    mockAddUserSession,
} = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    handleErrorToast: vi.fn(),
    mockRedirectToIntendedOrDefault: vi.fn(),
    mockAddUserSession: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../index.js', () => ({
    redirectToIntendedOrDefault: mockRedirectToIntendedOrDefault,
    addUserSession: mockAddUserSession,
}))
vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../state-manager.js', () => ({
    stateManager: {
        accessToken: {
            get: () => undefined,
            set: vi.fn(),
        },
        expirationDate: { set: vi.fn() },
        networkId: { set: vi.fn(), get: () => 'net-1' },
    },
}))
vi.mock('@canton-network/core-wallet-auth', () => ({
    AuthTokenProvider: vi.fn().mockImplementation(function AuthTokenProvider() {
        return {
            getAccessToken: vi.fn().mockResolvedValue(
                'eyJ0eXAiOiJKV1QiLCJraWQiOiI0ZjAxNTgwOTg0NzAwMWQ5NjVlZjgxYmNlNDUwNWRhYTE5NjYwNWQ0OGIwMDc5M2RiMjBkNzZlMjhiMTYwMThiODg1MDQyZWQ0YjZhNjUyNiIsImFsZyI6IlJTMjU2In0=.' +
                    btoa(
                        JSON.stringify({
                            exp: Math.floor(Date.now() / 1000) + 3600,
                        })
                    ) +
                    '.signature'
            ),
        }
    }),
    ClientCredentials: {},
}))
vi.mock('@canton-network/core-wallet-ui-components', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@canton-network/core-wallet-ui-components')
        >()
    return { ...actual, handleErrorToast }
})

import './login.js'
import { LoginUI } from './login.js'

const selfSignedNetwork = makeNetwork({
    id: 'net-1',
    auth: {
        method: 'client_credentials',
        audience: 'aud',
        scope: 'scope',
        clientId: 'client-id',
        clientSecret: 'secret',
    },
})
const selfSignedIdp = makeIdp({ id: 'idp-1', type: 'self_signed' })

describe('LoginUI', () => {
    let el: LoginUI
    const componentFixture = html`<user-ui-login></user-ui-login>`

    beforeEach(async () => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockRedirectToIntendedOrDefault.mockReset()
        mockAddUserSession.mockClear()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listNetworks') {
                return { networks: [selfSignedNetwork] }
            }
            if (method === 'listIdps') {
                return { idps: [selfSignedIdp] }
            }
            return undefined
        })
        el = await fixture<LoginUI>(componentFixture)
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
    })

    it('renders the login form with loaded networks and idps', async () => {
        await waitUntil(() => el.networks.length === 1)

        expect(el.shadowRoot?.querySelector('wg-login-form')).not.toBeNull()
        expect(el.idps).toHaveLength(1)
    })

    it('redirects after self-signed connect succeeds', async () => {
        await waitUntil(() => el.networks.length === 1)

        el.shadowRoot
            ?.querySelector('wg-login-form')
            ?.dispatchEvent(
                new LoginConnectEvent(
                    selfSignedNetwork,
                    selfSignedIdp,
                    'client-id'
                )
            )

        await waitUntil(
            () => mockRedirectToIntendedOrDefault.mock.calls.length > 0
        )

        expect(mockAddUserSession).toHaveBeenCalled()
        expect(mockRedirectToIntendedOrDefault).toHaveBeenCalled()
    })

    it('calls handleErrorToast when loading networks fails', async () => {
        mockRequest.mockRejectedValue(new Error('list failed'))
        el = await fixture<LoginUI>(componentFixture)

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
    })
})
