// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import {
    NetworkDeleteEvent,
    NetworkEditCancelEvent,
    NetworkEditSaveEvent,
} from '@canton-network/core-wallet-ui-components'
import {
    createMockUserClient,
    makeNetwork,
    makeStoreNetwork,
    mockNetworksPageFlow,
    mockRequest,
} from '../../test-helpers.js'

const { mockCreateUserClient, handleErrorToast, setLocationHref } = vi.hoisted(
    () => ({
        mockCreateUserClient: vi.fn(),
        handleErrorToast: vi.fn(),
        setLocationHref: vi.fn(),
    })
)

vi.mock('../../index.js', () => ({}))
vi.mock('../../navigation.js', () => ({ setLocationHref }))
vi.mock('../../rpc-client.js', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../../state-manager.js', () => ({
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
import { UserUiReviewNetwork } from './index.js'

const network = makeNetwork({ id: 'net-review', name: 'Review Net' })

describe('UserUiReviewNetwork', () => {
    let el: UserUiReviewNetwork
    const componentFixture = html`<user-ui-review-network></user-ui-review-network>`

    beforeEach(async () => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockNetworksPageFlow([network])
        history.replaceState({}, '', '?id=net-review')
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true)
        )
        el = await fixture<UserUiReviewNetwork>(componentFixture)
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
    })

    it('loads and renders the review form for the network in the URL', async () => {
        await waitUntil(() => el.network?.id === 'net-review')

        expect(el.shadowRoot?.querySelector('h1')?.textContent).toBe(
            'Review network'
        )
        expect(el.shadowRoot?.querySelector('network-form')).not.toBeNull()
    })

    it('calls addNetwork when the form is saved', async () => {
        await waitUntil(() => el.network !== null)

        el.shadowRoot
            ?.querySelector('network-form')
            ?.dispatchEvent(
                new NetworkEditSaveEvent(
                    makeStoreNetwork({ id: 'net-review', name: 'Review Net' })
                )
            )

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'addNetwork')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({ method: 'addNetwork' })
        )
    })

    it('navigates back when the URL has no network id', async () => {
        history.replaceState({}, '', '?')
        el = await fixture<UserUiReviewNetwork>(componentFixture)

        await waitUntil(() => setLocationHref.mock.calls.length > 0)

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/networks')
        )
        expect(el.network).toBeNull()
        expect(el.shadowRoot?.querySelector('network-form')).toBeNull()
        expect(handleErrorToast).not.toHaveBeenCalled()
    })

    it('navigates back when the form emits network-edit-cancel', async () => {
        await waitUntil(() => el.network !== null)

        setLocationHref.mockClear()
        el.shadowRoot
            ?.querySelector('network-form')
            ?.dispatchEvent(new NetworkEditCancelEvent())

        expect(setLocationHref).toHaveBeenCalledWith(
            expect.stringContaining('/networks')
        )
    })

    it('calls removeNetwork when delete is confirmed', async () => {
        await waitUntil(() => el.network !== null)

        el.shadowRoot
            ?.querySelector('network-form')
            ?.dispatchEvent(
                new NetworkDeleteEvent(
                    makeStoreNetwork({ id: 'net-review', name: 'Review Net' })
                )
            )

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'removeNetwork')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'removeNetwork',
                params: { networkName: 'net-review' },
            })
        )
    })
})
