// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import {
    IdpAddEvent,
    IdpCardDeleteEvent,
    NetworkCardDeleteEvent,
    NetworkEditSaveEvent,
} from '@canton-network/core-wallet-ui-components'
import {
    createMockUserClient,
    makeIdp,
    makeStoreNetwork,
    mockRequest,
    mockSettingsPageFlow,
} from '../test-helpers.js'

const { mockCreateUserClient, handleErrorToast } = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    handleErrorToast: vi.fn(),
}))

vi.mock('../index.js', () => ({}))
vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../state-manager.js', () => ({
    stateManager: {
        accessToken: { get: () => 'test-token' },
    },
}))
vi.mock('@canton-network/core-wallet-ui-components', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@canton-network/core-wallet-ui-components')
        >()
    return { ...actual, handleErrorToast }
})

import './index.js'
import { UserUiSettings } from './index.js'

async function ready(el: UserUiSettings) {
    await waitUntil(() => el.client !== null && el.gatewayVersion !== undefined)
    return el
}

describe('UserUiSettings', () => {
    let el: UserUiSettings
    const componentFixture = html`<user-ui-settings></user-ui-settings>`

    beforeEach(async () => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockSettingsPageFlow({ isAdmin: true, gatewayVersion: '2.0.0' })
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true)
        )
        el = await fixture<UserUiSettings>(componentFixture)
        await ready(el)
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
    })

    it('renders gateway version, user info, and admin sections', async () => {
        expect(el.shadowRoot?.textContent).toContain('v2.0.0')
        expect(el.shadowRoot?.textContent).toContain('user-1')
        expect(el.shadowRoot?.textContent).toContain('Admin')
        expect(el.shadowRoot?.querySelector('wg-sessions')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('wg-networks')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('wg-idps')).not.toBeNull()
    })

    it('shows unknown_version when the version endpoint returns no version', async () => {
        mockSettingsPageFlow({ gatewayVersion: '' })
        el = await fixture<UserUiSettings>(componentFixture)
        await ready(el)
        expect(el.shadowRoot?.textContent).toContain('unknown_version')
    })

    it('shows a placeholder user id when getUser fails', async () => {
        mockSettingsPageFlow()
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'getUser') {
                throw new Error('unauthorized')
            }
            if (method === 'listNetworks') {
                return { networks: [] }
            }
            if (method === 'listSessions') {
                return { sessions: [] }
            }
            if (method === 'listIdps') {
                return { idps: [] }
            }
            return undefined
        })
        el = await fixture<UserUiSettings>(componentFixture)
        await ready(el)

        expect(el.isAdmin).toBe(false)
        expect(el.shadowRoot?.textContent).toContain('—')
        expect(el.shadowRoot?.textContent).toContain('User')
    })

    it('shows settings in read-only mode for non-admin users', async () => {
        mockSettingsPageFlow({ isAdmin: false })
        el = await fixture<UserUiSettings>(componentFixture)
        await ready(el)
        const networks = el.shadowRoot?.querySelector('wg-networks') as
            | (HTMLElement & { readonly: boolean })
            | null
        const idps = el.shadowRoot?.querySelector('wg-idps') as
            | (HTMLElement & { readonly: boolean })
            | null
        expect(networks?.readonly).toBe(true)
        expect(idps?.readonly).toBe(true)
    })

    it('shows settings in write mode for admin users', async () => {
        const networks = el.shadowRoot?.querySelector('wg-networks') as
            | (HTMLElement & { readonly: boolean })
            | null
        const idps = el.shadowRoot?.querySelector('wg-idps') as
            | (HTMLElement & { readonly: boolean })
            | null
        expect(networks?.readonly).toBe(false)
        expect(idps?.readonly).toBe(false)
    })

    it('adds a network when wg-networks emits network-edit-save', async () => {
        const network = makeStoreNetwork({
            id: 'net-new',
            synchronizerId: 'sync-1',
            adminAuth: {
                method: 'client_credentials',
                audience: 'admin-aud',
                scope: 'admin-scope',
                clientId: 'admin-client',
                clientSecret: 'admin-secret',
            },
        })

        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(new NetworkEditSaveEvent(network))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'addNetwork')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'addNetwork',
                params: expect.objectContaining({
                    network: expect.objectContaining({
                        id: 'net-new',
                        synchronizerId: 'sync-1',
                        ledgerApi: 'http://localhost:6865',
                        adminAuth: expect.objectContaining({
                            clientId: 'admin-client',
                        }),
                    }),
                }),
            })
        )
    })

    it('adds a network when auth fields are partially omitted', async () => {
        const network = makeStoreNetwork({
            auth: { method: 'client_credentials' } as ReturnType<
                typeof makeStoreNetwork
            >['auth'],
        })

        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(new NetworkEditSaveEvent(network))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'addNetwork')
        )

        const addCall = mockRequest.mock.calls.find(
            (c) => c[0]?.method === 'addNetwork'
        )
        expect(addCall?.[0].params.network.auth).toEqual({
            method: 'client_credentials',
            audience: '',
            scope: '',
            clientId: '',
            issuer: '',
            clientSecret: '',
        })
    })

    it('adds a network without adminAuth using default credentials', async () => {
        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(new NetworkEditSaveEvent(makeStoreNetwork()))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'addNetwork')
        )

        const addCall = mockRequest.mock.calls.find(
            (c) => c[0]?.method === 'addNetwork'
        )
        expect(addCall?.[0].params.network.adminAuth).toEqual({
            method: 'client_credentials',
            audience: '',
            scope: '',
            clientId: '',
            clientSecret: '',
        })
    })

    it('calls handleErrorToast when adding a network fails', async () => {
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'addNetwork') {
                throw new Error('add failed')
            }
            if (method === 'listNetworks') {
                return { networks: [] }
            }
            if (method === 'listSessions') {
                return { sessions: [] }
            }
            if (method === 'listIdps') {
                return { idps: [] }
            }
            if (method === 'getUser') {
                return { userId: 'user-1', isAdmin: true }
            }
            return undefined
        })

        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(new NetworkEditSaveEvent(makeStoreNetwork()))

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
    })

    it('removes a network when delete is confirmed', async () => {
        const network = makeStoreNetwork({ id: 'net-del', name: 'Remove Me' })
        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(new NetworkCardDeleteEvent(network))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'removeNetwork')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'removeNetwork',
                params: { networkName: 'net-del' },
            })
        )
    })

    it('does not remove a network when delete is cancelled', async () => {
        vi.stubGlobal(
            'confirm',
            vi.fn(() => false)
        )
        el = await fixture<UserUiSettings>(componentFixture)
        await ready(el)

        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(
                new NetworkCardDeleteEvent(
                    makeStoreNetwork({ id: 'net-del', name: 'Keep Me' })
                )
            )

        await new Promise((r) => setTimeout(r, 50))

        expect(mockRequest).not.toHaveBeenCalledWith(
            expect.objectContaining({ method: 'removeNetwork' })
        )
    })

    it('calls handleErrorToast when removing a network fails', async () => {
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'removeNetwork') {
                throw new Error('remove failed')
            }
            if (method === 'listNetworks') {
                return { networks: [] }
            }
            if (method === 'listSessions') {
                return { sessions: [] }
            }
            if (method === 'listIdps') {
                return { idps: [] }
            }
            if (method === 'getUser') {
                return { userId: 'user-1', isAdmin: true }
            }
            return undefined
        })

        el.shadowRoot
            ?.querySelector('wg-networks')
            ?.dispatchEvent(
                new NetworkCardDeleteEvent(makeStoreNetwork({ id: 'net-del' }))
            )

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
    })

    it('adds an identity provider when wg-idps emits idp-add', async () => {
        const idp = makeIdp({ id: 'idp-new' })
        el.shadowRoot
            ?.querySelector('wg-idps')
            ?.dispatchEvent(new IdpAddEvent(idp))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'addIdp')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'addIdp',
                params: { idp },
            })
        )
    })

    it('removes an identity provider when wg-idps emits delete', async () => {
        const idp = makeIdp({ id: 'idp-del' })
        el.shadowRoot
            ?.querySelector('wg-idps')
            ?.dispatchEvent(new IdpCardDeleteEvent(idp))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'removeIdp')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'removeIdp',
                params: { identityProviderId: 'idp-del' },
            })
        )
    })

    it('calls handleErrorToast when adding an identity provider fails', async () => {
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'addIdp') {
                throw new Error('add idp failed')
            }
            if (method === 'listNetworks') {
                return { networks: [] }
            }
            if (method === 'listSessions') {
                return { sessions: [] }
            }
            if (method === 'listIdps') {
                return { idps: [] }
            }
            if (method === 'getUser') {
                return { userId: 'user-1', isAdmin: true }
            }
            return undefined
        })

        el.shadowRoot
            ?.querySelector('wg-idps')
            ?.dispatchEvent(new IdpAddEvent(makeIdp()))

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
    })

    it('calls handleErrorToast when removing an identity provider fails', async () => {
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'removeIdp') {
                throw new Error('remove idp failed')
            }
            if (method === 'listNetworks') {
                return { networks: [] }
            }
            if (method === 'listSessions') {
                return { sessions: [] }
            }
            if (method === 'listIdps') {
                return { idps: [] }
            }
            if (method === 'getUser') {
                return { userId: 'user-1', isAdmin: true }
            }
            return undefined
        })

        el.shadowRoot
            ?.querySelector('wg-idps')
            ?.dispatchEvent(new IdpCardDeleteEvent(makeIdp({ id: 'idp-del' })))

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
    })
})
