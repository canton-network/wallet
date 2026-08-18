// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { WalletCreateEvent } from '@canton-network/core-wallet-ui-components'
import {
    createMockUserClient,
    makeWallet,
    mockRequest,
} from '../../test-helpers.js'

const {
    mockCreateUserClient,
    handleErrorToast,
    showToast,
    setLocationHref,
    mockNetworkIdGet,
} = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    handleErrorToast: vi.fn(),
    showToast: vi.fn(),
    setLocationHref: vi.fn(),
    mockNetworkIdGet: vi.fn<() => string | undefined>(() => 'network1'),
}))

vi.mock('../../index.js', () => ({}))
vi.mock('../../navigation.js', () => ({ setLocationHref }))
vi.mock('../../utils.js', () => ({ showToast }))
vi.mock('../../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../../state-manager.js', () => ({
    stateManager: {
        accessToken: { get: () => 'test-token' },
        networkId: { get: mockNetworkIdGet },
        currentOrigin: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    },
}))
vi.mock('@canton-network/core-wallet-ui-components', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@canton-network/core-wallet-ui-components')
        >()
    return {
        ...actual,
        handleErrorToast,
    }
})

import './index.js'
import { UserUiAddParty } from './index.js'
import { WALLET_CREATION_STATUS_CODE } from '../index'

type MockRequestHandler = (request: {
    method: string
    params?: unknown
}) => unknown | Promise<unknown>

describe('UserUiAddParty', () => {
    let requestHandlers: Record<string, MockRequestHandler>
    const componentFixture = html`<user-ui-add-party></user-ui-add-party>`

    const renderElement = () => fixture<UserUiAddParty>(componentFixture)

    const getSigningProviderSelect = (el: UserUiAddParty) =>
        el.shadowRoot
            ?.querySelector('wg-wallet-create-form')
            ?.shadowRoot?.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )

    beforeEach(() => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        showToast.mockReset()
        setLocationHref.mockReset()
        mockNetworkIdGet.mockReset()
        mockNetworkIdGet.mockReturnValue('network1')
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        requestHandlers = {
            listSigningProviders: async () => ({
                signingProviders: ['participant', 'wallet-kernel'],
            }),
            listSessions: async () => ({
                sessions: [
                    {
                        id: 'sess-1',
                        network: { id: 'network1', name: 'Test' },
                    },
                ],
            }),
            listSigningProviderVaults: async () => ({
                vaults: ['Vault A', 'Vault B'],
            }),
        }
        mockRequest.mockImplementation(async (request) => {
            const handler = requestHandlers[request.method]
            if (!handler) {
                throw new Error(
                    `Unexpected User API request: ${request.method}`
                )
            }
            return handler(request)
        })
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
        vi.clearAllMocks()
    })

    it('renders create party header and form', async () => {
        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)

        expect(el.shadowRoot?.querySelector('h1')?.textContent).toBe(
            'Create a new party'
        )
        expect(
            el.shadowRoot?.querySelector('wg-wallet-create-form')
        ).not.toBeNull()
        expect(el.networkIds).toEqual(['network1'])
    })

    it('loads signing providers and passes the loading state to the form', async () => {
        let resolveSigningProviders!: (value: {
            signingProviders: string[]
        }) => void
        const signingProvidersDeferred = new Promise<{
            signingProviders: string[]
        }>((resolve) => {
            resolveSigningProviders = resolve
        })
        requestHandlers.listSigningProviders = () => signingProvidersDeferred
        requestHandlers.listSessions = async () => ({ sessions: [] })

        const el = await renderElement()

        await waitUntil(() => el.signingProvidersLoading)
        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        const providerSelect =
            form?.shadowRoot?.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )
        expect(providerSelect?.disabled).toBe(true)
        expect(
            providerSelect?.querySelector('option')?.textContent?.trim()
        ).toBe('Loading signing providers...')

        resolveSigningProviders({
            signingProviders: ['participant', 'fireblocks'],
        })

        await waitUntil(
            () =>
                !el.signingProvidersLoading &&
                Array.from(getSigningProviderSelect(el)?.options ?? []).some(
                    (option) => option.value === 'fireblocks'
                )
        )
        expect(el.signingProvidersLoading).toBe(false)
        expect(el.signingProviders).toEqual(['participant', 'fireblocks'])
        expect(mockRequest).toHaveBeenCalledWith({
            method: 'listSigningProviders',
        })
        expect(
            Array.from(getSigningProviderSelect(el)?.options ?? []).map(
                (option) => option.value
            )
        ).toEqual(['', 'participant', 'fireblocks'])
        await waitUntil(() => el.networkIds.length === 1)
    })

    it('navigates back to parties list when Back is clicked', async () => {
        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)

        const backBtn = el.shadowRoot?.querySelector(
            '.page-header button'
        ) as HTMLButtonElement
        backBtn.click()

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/parties')
        )
    })

    it('redirects to parties with allocated status after successful create', async () => {
        requestHandlers.createWallet = async () => ({
            wallet: makeWallet({ status: 'allocated' }),
        })

        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)

        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        form!.dispatchEvent(
            new WalletCreateEvent('my-party', 'participant', true)
        )

        await waitUntil(() => setLocationHref.mock.calls.length > 0)

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining(
                `createPartyStatus=${WALLET_CREATION_STATUS_CODE.WALLET_ALLOCATED}`
            )
        )
        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/parties/')
        )
    })

    it('redirects with initialized status when wallet is not yet allocated', async () => {
        requestHandlers.createWallet = async () => ({
            wallet: makeWallet({ status: 'initialized' }),
        })

        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)

        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        form!.dispatchEvent(
            new WalletCreateEvent('pending-party', 'participant', false)
        )

        await waitUntil(() => setLocationHref.mock.calls.length > 0)

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining(
                WALLET_CREATION_STATUS_CODE.WALLET_INITIALIZED
            )
        )
    })

    it('calls handleErrorToast and clears loading when createWallet fails', async () => {
        requestHandlers.createWallet = async () => {
            throw new Error('create failed')
        }

        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)

        el.submitting = true
        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        form!.dispatchEvent(
            new WalletCreateEvent('fail-party', 'participant', false)
        )

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
        expect(el.submitting).toBe(false)
    })

    it('redirects with removed status when wallet creation is rejected', async () => {
        requestHandlers.createWallet = async () => ({
            wallet: makeWallet({ status: 'removed' }),
        })

        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)

        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        form!.dispatchEvent(
            new WalletCreateEvent('removed-party', 'participant', false)
        )

        await waitUntil(() => setLocationHref.mock.calls.length > 0)

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining(
                `createPartyStatus=${WALLET_CREATION_STATUS_CODE.WALLET_REMOVED}`
            )
        )
    })

    it('loads vaults when a vault enabled signing provider is selected and sorts alphabetically', async () => {
        let resolveVaults!: (value: { vaults: string[] }) => void
        const vaultsDeferred = new Promise<{ vaults: string[] }>((resolve) => {
            resolveVaults = resolve
        })
        requestHandlers.listSigningProviders = async () => ({
            signingProviders: ['participant', 'wallet-kernel', 'fireblocks'],
        })
        requestHandlers.listSigningProviderVaults = () => vaultsDeferred

        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)
        await waitUntil(() =>
            Array.from(getSigningProviderSelect(el)?.options ?? []).some(
                (option) => option.value === 'fireblocks'
            )
        )
        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        const providerSelect =
            form?.shadowRoot?.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )
        providerSelect!.value = 'fireblocks'
        providerSelect!.dispatchEvent(new Event('change', { bubbles: true }))

        await waitUntil(
            () =>
                form?.shadowRoot
                    ?.querySelector<HTMLSelectElement>('#vault-name')
                    ?.querySelector('option')
                    ?.textContent?.trim() === 'Loading vaults...'
        )

        resolveVaults({ vaults: ['Vault B', 'Vault A'] })

        await waitUntil(() => el.vaults.length === 2)

        expect(el.vaultsLoading).toBe(false)
        expect(mockRequest).toHaveBeenCalledWith({
            method: 'listSigningProviderVaults',
            params: { signingProviderId: 'fireblocks' },
        })
        expect(el.vaults).toEqual(['Vault A', 'Vault B'])
    })

    it('shows a toast when no vault accounts are returned', async () => {
        requestHandlers.listSigningProviders = async () => ({
            signingProviders: ['participant', 'wallet-kernel', 'fireblocks'],
        })
        requestHandlers.listSigningProviderVaults = async () => ({ vaults: [] })

        const el = await renderElement()
        await waitUntil(() => el.networkIds.length === 1)
        await waitUntil(() =>
            Array.from(getSigningProviderSelect(el)?.options ?? []).some(
                (option) => option.value === 'fireblocks'
            )
        )
        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        const providerSelect =
            form?.shadowRoot?.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )
        providerSelect!.value = 'fireblocks'
        providerSelect!.dispatchEvent(new Event('change', { bubbles: true }))

        await waitUntil(() => showToast.mock.calls.length > 0)

        expect(showToast).toHaveBeenCalledWith(
            'No vault accounts found',
            'No vault accounts are available for the selected signing provider.',
            'info'
        )
        expect(el.vaults).toEqual([])
    })

    it('uses networkId from state when listSessions fails', async () => {
        requestHandlers.listSessions = async () => {
            throw new Error('sessions unavailable')
        }

        const el = await renderElement()

        await waitUntil(() => el.networkIds.length === 1)

        expect(el.networkIds).toEqual(['network1'])
    })

    it('leaves networkIds empty when there is no session and no stored network', async () => {
        mockNetworkIdGet.mockReturnValue(undefined)
        requestHandlers.listSessions = async () => ({ sessions: [] })

        const el = await renderElement()

        await waitUntil(() => mockNetworkIdGet.mock.calls.length > 0)

        expect(el.networkIds).toEqual([])
    })
})
