// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import {
    IdpFormDeleteEvent,
    IdpFormSaveEvent,
} from '@canton-network/core-wallet-ui-components'
import {
    createMockUserClient,
    makeIdp,
    mockIdpsPageFlow,
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
import { UserUiReviewIdp } from './index.js'

const idp = makeIdp({ id: 'idp-review' })

describe('UserUiReviewIdp', () => {
    beforeEach(() => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockIdpsPageFlow([idp])
        history.replaceState({}, '', '?id=idp-review')
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true)
        )
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
    })

    it('loads and renders the review form for the idp in the URL', async () => {
        const el = await fixture<UserUiReviewIdp>(
            html`<user-ui-review-idp></user-ui-review-idp>`
        )

        await waitUntil(() => el.idp?.id === 'idp-review')

        expect(el.shadowRoot?.querySelector('h1')?.textContent).toBe(
            'Review Identity Provider'
        )
        expect(el.shadowRoot?.querySelector('idp-form')).not.toBeNull()
    })

    it('calls addIdp when the form is saved', async () => {
        const el = await fixture<UserUiReviewIdp>(
            html`<user-ui-review-idp></user-ui-review-idp>`
        )
        await waitUntil(() => el.idp !== null)

        el.shadowRoot
            ?.querySelector('idp-form')
            ?.dispatchEvent(new IdpFormSaveEvent(idp))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'addIdp')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({ method: 'addIdp' })
        )
    })

    it('calls removeIdp when delete is confirmed', async () => {
        const el = await fixture<UserUiReviewIdp>(
            html`<user-ui-review-idp></user-ui-review-idp>`
        )
        await waitUntil(() => el.idp !== null)

        el.shadowRoot
            ?.querySelector('idp-form')
            ?.dispatchEvent(new IdpFormDeleteEvent(idp))

        await waitUntil(() =>
            mockRequest.mock.calls.some((c) => c[0]?.method === 'removeIdp')
        )

        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'removeIdp',
                params: { identityProviderId: 'idp-review' },
            })
        )
    })
})
