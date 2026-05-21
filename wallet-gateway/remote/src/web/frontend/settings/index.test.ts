// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import {
    createMockUserClient,
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

describe('UserUiSettings', () => {
    beforeEach(() => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
        mockSettingsPageFlow({ isAdmin: true, gatewayVersion: '2.0.0' })
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
    })

    it('renders gateway version, user info, and admin sections', async () => {
        const el = await fixture<UserUiSettings>(
            html`<user-ui-settings></user-ui-settings>`
        )

        await waitUntil(() => el.gatewayVersion?.includes('2.0.0'))

        expect(el.shadowRoot?.textContent).toContain('v2.0.0')
        expect(el.shadowRoot?.textContent).toContain('user-1')
        expect(el.shadowRoot?.textContent).toContain('Admin')
        expect(el.shadowRoot?.querySelector('wg-sessions')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('wg-networks')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('wg-idps')).not.toBeNull()
    })

    it('shows user role badge and settings in read-only mode for non-admin users', async () => {
        mockSettingsPageFlow({ isAdmin: false })
        const el = await fixture<UserUiSettings>(
            html`<user-ui-settings></user-ui-settings>`
        )

        await waitUntil(() => el.client !== null)

        expect(el.shadowRoot?.textContent).toContain('User')

        const networks = el.shadowRoot?.querySelector('wg-networks') as
            | (HTMLElement & { readonly: boolean })
            | null
        const idps = el.shadowRoot?.querySelector('wg-idps') as
            | (HTMLElement & { readonly: boolean })
            | null
        expect(networks?.readonly).toBe(true)
        expect(idps?.readonly).toBe(true)
    })

    it('shows admin role badge and settings in write mode for admin users', async () => {
        mockSettingsPageFlow({ isAdmin: true })
        const el = await fixture<UserUiSettings>(
            html`<user-ui-settings></user-ui-settings>`
        )

        await waitUntil(() => el.client !== null)

        expect(el.shadowRoot?.textContent).toContain('Admin')

        const networks = el.shadowRoot?.querySelector('wg-networks') as
            | (HTMLElement & { readonly: boolean })
            | null
        const idps = el.shadowRoot?.querySelector('wg-idps') as
            | (HTMLElement & { readonly: boolean })
            | null
        expect(networks?.readonly).toBe(false)
        expect(idps?.readonly).toBe(false)
    })
})
