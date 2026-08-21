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
import { WALLET_STATUS_CODE } from '../index'
import { Key } from '@canton-network/core-signing-lib'

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
            if (method === 'listSigningProviderKeys') {
                return {
                    keys: [
                        { id: 'key-1', name: 'Vault A', publicKey: 'pk1' },
                        { id: 'key-2', name: 'Vault B', publicKey: 'pk2' },
                    ],
                }
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
        expect(el.shadowRoot?.querySelector('h1')?.textContent).toBe(
            'Create a new party'
        )
        expect(
            el.shadowRoot?.querySelector('wg-wallet-create-form')
        ).not.toBeNull()
    })

    it('navigates back to parties list when Back is clicked', async () => {
        const backBtn = el.shadowRoot?.querySelector(
            '.page-header button'
        ) as HTMLButtonElement
        backBtn.click()

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/parties')
        )
    })

    it('redirects to parties with allocated status after successful create', async () => {
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
                `createPartyStatus=${WALLET_STATUS_CODE.WALLET_ALLOCATED}`
            )
        )
        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/parties/')
        )
    })

    it('redirects with initialized status when wallet is not yet allocated', async () => {
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
            expect.stringContaining(WALLET_STATUS_CODE.WALLET_INITIALIZED)
        )
    })

    it('calls handleErrorToast and clears loading when createWallet fails', async () => {
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

        const form = el.shadowRoot?.querySelector('wg-wallet-create-form')
        form!.dispatchEvent(
            new WalletCreateEvent('fail-party', 'participant', false)
        )

        await waitUntil(() => handleErrorToast.mock.calls.length > 0)

        expect(handleErrorToast).toHaveBeenCalled()
    })

    it('redirects with removed status when wallet creation is rejected', async () => {
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
                `createPartyStatus=${WALLET_STATUS_CODE.WALLET_REMOVED}`
            )
        )
    })

    it('loads keys when a vault enabled signing provider is selected and sorts alphabetically', async () => {
        let resolveKeys!: (value: { keys: Array<Key> }) => void
        const keysDeferred = new Promise<{ keys: Array<Key> }>((resolve) => {
            resolveKeys = resolve
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
            if (method === 'listSigningProviderKeys') {
                return keysDeferred
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

        resolveKeys({
            keys: [
                { id: 'key-2', name: 'Vault B', publicKey: 'pk2' },
                { id: 'key-1', name: 'Vault A', publicKey: 'pk1' },
            ],
        })

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'listSigningProviderKeys',
            params: { signingProviderId: 'fireblocks' },
        })
    })

    it('shows a toast when no vault accounts are returned', async () => {
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
            if (method === 'listSigningProviderKeys') {
                return { keys: [] }
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
            'No key accounts found',
            'No key accounts are available for the selected signing provider.',
            'info'
        )
    })
})
