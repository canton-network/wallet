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

describe('UserUiAddParty', () => {
    let el: UserUiAddParty
    const componentFixture = html`<user-ui-add-party></user-ui-add-party>`

    beforeEach(async () => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        showToast.mockReset()
        setLocationHref.mockReset()
        mockNetworkIdGet.mockReset()
        mockNetworkIdGet.mockReturnValue('network1')
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return {
                    sessions: [
                        {
                            id: 'sess-1',
                            network: { id: 'network1', name: 'Test' },
                        },
                    ],
                }
            }
            if (method === 'listSigningProviderVaults') {
                return { vaults: ['Vault A', 'Vault B'] }
            }
            return undefined
        })
        el = await fixture<UserUiAddParty>(componentFixture)
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
        vi.clearAllMocks()
    })

    it('renders create party header and form', async () => {
        await waitUntil(() => el.networkIds.length === 1)

        expect(el.shadowRoot?.querySelector('h1')?.textContent).toBe(
            'Create a new party'
        )
        expect(
            el.shadowRoot?.querySelector('wg-wallet-create-form')
        ).not.toBeNull()
        expect(el.networkIds).toEqual(['network1'])
    })

    it('navigates back to parties list when Back is clicked', async () => {
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
        await waitUntil(() => el.networkIds.length === 1)

        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return {
                    sessions: [
                        { id: 's', network: { id: 'network1', name: 'n' } },
                    ],
                }
            }
            if (method === 'createWallet') {
                return { wallet: makeWallet({ status: 'allocated' }) }
            }
            return undefined
        })

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
        await waitUntil(() => el.networkIds.length === 1)

        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'createWallet') {
                return { wallet: makeWallet({ status: 'initialized' }) }
            }
            if (method === 'listSessions') {
                return {
                    sessions: [
                        { id: 's', network: { id: 'network1', name: 'n' } },
                    ],
                }
            }
            return undefined
        })

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
        await waitUntil(() => el.networkIds.length === 1)

        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return {
                    sessions: [
                        { id: 's', network: { id: 'network1', name: 'n' } },
                    ],
                }
            }
            if (method === 'createWallet') {
                throw new Error('create failed')
            }
            return undefined
        })

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
        await waitUntil(() => el.networkIds.length === 1)

        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return {
                    sessions: [
                        { id: 's', network: { id: 'network1', name: 'n' } },
                    ],
                }
            }
            if (method === 'createWallet') {
                return { wallet: makeWallet({ status: 'removed' }) }
            }
            return undefined
        })

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
        await waitUntil(() => el.networkIds.length === 1)

        let resolveVaults!: (value: { vaults: string[] }) => void
        const vaultsDeferred = new Promise<{ vaults: string[] }>((resolve) => {
            resolveVaults = resolve
        })
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return {
                    sessions: [
                        {
                            id: 'sess-1',
                            network: { id: 'network1', name: 'Test' },
                        },
                    ],
                }
            }
            if (method === 'listSigningProviderVaults') {
                return vaultsDeferred
            }
            return undefined
        })

        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        const providerSelect =
            form?.shadowRoot?.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )
        providerSelect!.value = 'fireblocks'
        providerSelect!.dispatchEvent(new Event('change', { bubbles: true }))

        await waitUntil(() => el.vaultsLoading)
        expect(
            form?.shadowRoot
                ?.querySelector<HTMLSelectElement>('#vault-name')
                ?.querySelector('option')
                ?.textContent?.trim()
        ).toBe('Loading vaults...')

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
        await waitUntil(() => el.networkIds.length === 1)

        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return {
                    sessions: [
                        {
                            id: 'sess-1',
                            network: { id: 'network1', name: 'Test' },
                        },
                    ],
                }
            }
            if (method === 'listSigningProviderVaults') {
                return { vaults: [] }
            }
            return undefined
        })

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
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                throw new Error('sessions unavailable')
            }
            return undefined
        })

        el = await fixture<UserUiAddParty>(componentFixture)

        await waitUntil(() => el.networkIds.length === 1)

        expect(el.networkIds).toEqual(['network1'])
    })

    it('leaves networkIds empty when there is no session and no stored network', async () => {
        mockNetworkIdGet.mockReturnValue(undefined)
        mockRequest.mockImplementation(async ({ method }) => {
            if (method === 'listSessions') {
                return { sessions: [] }
            }
            return undefined
        })

        el = await fixture<UserUiAddParty>(componentFixture)

        await waitUntil(() => el.networkIds.length === 0)

        expect(el.networkIds).toEqual([])
    })
})
