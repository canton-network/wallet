// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    IdpFormSaveEvent,
    type WgPageHeader,
} from '@canton-network/core-wallet-ui-components'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    createMockUserClient,
    makeIdp,
    mockIdpsPageFlow,
    mockRequest,
} from '../../__tests__/test-helpers.ts'

const {
    showToastAfterNavigation,
    mockCreateUserClient,
    handleErrorToast,
    setLocationHref,
} = vi.hoisted(() => ({
    showToastAfterNavigation: vi.fn(),
    mockCreateUserClient: vi.fn(),
    handleErrorToast: vi.fn(),
    setLocationHref: vi.fn(),
}))

vi.mock('../../index.ts', () => ({}))
vi.mock('../../navigation.ts', () => ({ setLocationHref }))
vi.mock('../../utils.ts', () => ({ showToastAfterNavigation }))
vi.mock('../../rpc-client.ts', () => ({
    createUserClient: mockCreateUserClient,
}))
vi.mock('../../state-manager.ts', () => ({
    stateManager: {
        accessToken: { get: () => 'test-token' },
        currentOrigin: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    },
}))
vi.mock('@canton-network/core-wallet-ui-components', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@canton-network/core-wallet-ui-components')
        >()
    return { ...actual, handleErrorToast }
})

import './index.ts'
import type { UserUiAddIdp } from './index.ts'

describe('UserUiAddIdp', () => {
    let el: UserUiAddIdp
    const componentFixture = html`<user-ui-add-idp></user-ui-add-idp>`

    beforeEach(async () => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockIdpsPageFlow([])
        el = await fixture<UserUiAddIdp>(componentFixture)
    })

    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
    })

    it('renders the add identity provider form', () => {
        expect(
            el.shadowRoot?.querySelector<WgPageHeader>('wg-page-header')
                ?.heading
        ).toBe('Add identity provider')
        expect(el.shadowRoot?.querySelector('idp-form')).not.toBeNull()
    })

    it('calls addIdp when the form is saved', async () => {
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
