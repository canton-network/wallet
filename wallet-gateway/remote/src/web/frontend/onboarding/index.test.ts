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
} from '../test-helpers.js'

const {
    mockCreateUserClient,
    handleErrorToast,
    showToast,
    addUserSession,
    redirectToIntendedOrDefault,
    accessTokenSet,
} = vi.hoisted(() => ({
    mockCreateUserClient: vi.fn(),
    handleErrorToast: vi.fn(),
    showToast: vi.fn(),
    addUserSession: vi.fn(),
    redirectToIntendedOrDefault: vi.fn(),
    accessTokenSet: vi.fn(),
}))

vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../utils.js', () => ({ showToast }))
vi.mock('../index.js', () => ({
    addUserSession,
    redirectToIntendedOrDefault,
}))
vi.mock('../state-manager.js', () => ({
    stateManager: {
        accessToken: { set: accessTokenSet },
        expirationDate: { set: vi.fn() },
    },
}))
vi.mock('../listeners.js', () => ({
    detectCurrentOrigin: vi.fn().mockResolvedValue('https://app.example'),
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
import type { UserUiSelfIssuedOnboarding } from './index.js'

const accessToken = `header.${btoa(JSON.stringify({ exp: 2_000_000_000 }))}.sig`

describe('UserUiSelfIssuedOnboarding', () => {
    beforeEach(() => {
        history.replaceState({}, '', '?username=alice&networkId=network-1')
        mockRequest.mockReset()
        mockCreateUserClient.mockReset()
        handleErrorToast.mockReset()
        showToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
    })

    afterEach(() => {
        document.body.innerHTML = ''
        history.replaceState({}, '', '/')
        vi.clearAllMocks()
    })

    it('renders the create-party form without the primary-wallet option', async () => {
        mockRequest.mockResolvedValue({
            userExists: false,
            wallets: [],
        })
        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
        )

        await waitUntil(
            () =>
                element.shadowRoot?.querySelector('wg-wallet-create-form') !==
                null
        )
        const form = element.shadowRoot?.querySelector('wg-wallet-create-form')
        expect(form).not.toBeNull()
        expect(form?.shadowRoot?.querySelector('#primary')).toBeNull()
    })

    it('initializes and immediately finalizes an allocated party', async () => {
        const initializedWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'allocated',
        })
        mockRequest
            .mockResolvedValueOnce({ userExists: false, wallets: [] })
            .mockResolvedValueOnce({ wallet: initializedWallet })
            .mockResolvedValueOnce({
                wallet: { ...initializedWallet, isAuthParty: true },
                accessToken,
            })

        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
        )
        await waitUntil(
            () =>
                element.shadowRoot?.querySelector('wg-wallet-create-form') !==
                null
        )
        element.shadowRoot
            ?.querySelector('wg-wallet-create-form')
            ?.dispatchEvent(
                new WalletCreateEvent('auth-party', 'wallet-kernel', false)
            )

        await waitUntil(() => mockRequest.mock.calls.length === 3)

        expect(mockRequest).toHaveBeenNthCalledWith(1, {
            method: 'getSelfIssuedOnboarding',
            params: {
                username: 'alice',
                networkId: 'network-1',
            },
        })
        expect(mockRequest).toHaveBeenNthCalledWith(2, {
            method: 'createSelfIssuedWallet',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyHint: 'auth-party',
                signingProviderId: 'wallet-kernel',
            },
        })
        expect(mockRequest).toHaveBeenNthCalledWith(3, {
            method: 'connectSelfIssuedSession',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyId: 'alice::namespace',
            },
        })
        await waitUntil(
            () => redirectToIntendedOrDefault.mock.calls.length === 1
        )
        expect(accessTokenSet).toHaveBeenCalledWith(
            accessToken,
            'https://app.example'
        )
        expect(addUserSession).toHaveBeenCalledWith(accessToken, 'network-1')
    })

    it('lets the user finalize a pending external signing request', async () => {
        const pendingWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'initialized',
        })
        mockRequest
            .mockResolvedValueOnce({ userExists: false, wallets: [] })
            .mockResolvedValueOnce({ wallet: pendingWallet })
            .mockResolvedValueOnce({
                wallet: {
                    ...pendingWallet,
                    status: 'allocated',
                },
            })
            .mockResolvedValueOnce({
                wallet: {
                    ...pendingWallet,
                    status: 'allocated',
                    isAuthParty: true,
                },
                accessToken,
            })

        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
        )
        await waitUntil(
            () =>
                element.shadowRoot?.querySelector('wg-wallet-create-form') !==
                null
        )
        element.shadowRoot
            ?.querySelector('wg-wallet-create-form')
            ?.dispatchEvent(new WalletCreateEvent('auth-party', 'dfns', false))

        await waitUntil(
            () =>
                element.shadowRoot?.querySelector<HTMLButtonElement>(
                    '.status-actions button'
                ) !== null
        )
        element.shadowRoot
            ?.querySelector<HTMLButtonElement>('.status-actions button')
            ?.click()

        await waitUntil(() => mockRequest.mock.calls.length === 4)
        expect(mockRequest).toHaveBeenNthCalledWith(3, {
            method: 'allocateSelfIssuedWallet',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyId: 'alice::namespace',
            },
        })
        expect(mockRequest).toHaveBeenNthCalledWith(4, {
            method: 'connectSelfIssuedSession',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyId: 'alice::namespace',
            },
        })
    })

    it('rejects existing users until wallet selection is implemented', async () => {
        mockRequest.mockResolvedValue({
            userExists: true,
            wallets: [makeWallet()],
        })

        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
        )

        await waitUntil(
            () => element.shadowRoot?.querySelector('[role="alert"]') !== null
        )
        expect(
            element.shadowRoot?.querySelector('[role="alert"]')?.textContent
        ).toContain(
            'Selecting an existing self-issued user is not implemented yet.'
        )
        expect(
            element.shadowRoot?.querySelector('wg-wallet-create-form')
        ).toBeNull()
    })

    it('shows a configuration error when URL parameters are missing', async () => {
        history.replaceState({}, '', '/onboarding/')

        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
        )

        expect(
            element.shadowRoot?.querySelector('[role="alert"]')
        ).not.toBeNull()
        expect(
            element.shadowRoot?.querySelector('wg-wallet-create-form')
        ).toBeNull()
    })
})
