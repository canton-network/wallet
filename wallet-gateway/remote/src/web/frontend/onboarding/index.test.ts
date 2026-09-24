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

const { mockCreateUserClient, handleErrorToast, showToast } = vi.hoisted(
    () => ({
        mockCreateUserClient: vi.fn(),
        handleErrorToast: vi.fn(),
        showToast: vi.fn(),
    })
)

vi.mock('../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../utils.js', () => ({ showToast }))
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
        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
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
            .mockResolvedValueOnce({ wallet: initializedWallet })
            .mockResolvedValueOnce({
                wallet: { ...initializedWallet, isAuthParty: true },
            })

        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
        )
        element.shadowRoot
            ?.querySelector('wg-wallet-create-form')
            ?.dispatchEvent(
                new WalletCreateEvent('auth-party', 'wallet-kernel', false)
            )

        await waitUntil(() => mockRequest.mock.calls.length === 2)

        expect(mockRequest).toHaveBeenNthCalledWith(1, {
            method: 'initializeSelfIssuedOnboarding',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyHint: 'auth-party',
                signingProviderId: 'wallet-kernel',
            },
        })
        expect(mockRequest).toHaveBeenNthCalledWith(2, {
            method: 'finalizeSelfIssuedOnboarding',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyId: 'alice::namespace',
            },
        })
        await waitUntil(
            () => element.shadowRoot?.querySelector('[role="status"]') !== null
        )
    })

    it('lets the user finalize a pending external signing request', async () => {
        const pendingWallet = makeWallet({
            partyId: 'alice::namespace',
            status: 'initialized',
        })
        mockRequest
            .mockResolvedValueOnce({ wallet: pendingWallet })
            .mockResolvedValueOnce({
                wallet: {
                    ...pendingWallet,
                    status: 'allocated',
                    isAuthParty: true,
                },
            })

        const element = await fixture<UserUiSelfIssuedOnboarding>(
            html`<user-ui-self-issued-onboarding></user-ui-self-issued-onboarding>`
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

        await waitUntil(() => mockRequest.mock.calls.length === 2)
        expect(mockRequest).toHaveBeenLastCalledWith({
            method: 'finalizeSelfIssuedOnboarding',
            params: {
                username: 'alice',
                networkId: 'network-1',
                partyId: 'alice::namespace',
            },
        })
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
