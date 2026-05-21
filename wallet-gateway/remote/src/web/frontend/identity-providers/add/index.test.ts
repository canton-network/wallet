// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { IdpFormSaveEvent } from '@canton-network/core-wallet-ui-components'
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
import { UserUiAddIdp } from './index.js'

describe('UserUiAddIdp', () => {
    beforeEach(() => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockIdpsPageFlow([])
    })

    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders the add identity provider form', async () => {
        const el = await fixture<UserUiAddIdp>(
            html`<user-ui-add-idp></user-ui-add-idp>`
        )

        expect(el.shadowRoot?.querySelector('h1')?.textContent).toBe(
            'Add a new identity provider'
        )
        expect(el.shadowRoot?.querySelector('idp-form')).not.toBeNull()
    })

    it('calls addIdp when the form is saved', async () => {
        const el = await fixture<UserUiAddIdp>(
            html`<user-ui-add-idp></user-ui-add-idp>`
        )

        const idp = makeIdp({ id: 'new-idp' })
        el.shadowRoot
            ?.querySelector('idp-form')
            ?.dispatchEvent(new IdpFormSaveEvent(idp))

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
})
