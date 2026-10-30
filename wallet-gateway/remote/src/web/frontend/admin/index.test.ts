// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import type { GetServerStatusResult } from '@canton-network/core-wallet-user-rpc-client'
import { createMockUserClient, mockRequest } from '../__tests__/test-helpers.js'

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
import type { UserUiAdmin } from './index.js'

const serverStatus: GetServerStatusResult = {
    version: '1.2.3',
    notices: [
        {
            id: 'deprecated-config:server.tls',
            severity: 'warning',
            message: 'Config field server.tls is deprecated.',
            firstSeenAt: '2026-01-01T00:00:00.000Z',
            lastSeenAt: '2026-01-01T00:00:00.000Z',
        },
    ],
    config: { server: { tls: false } },
}

function mockResponses(isAdmin: boolean) {
    mockRequest.mockImplementation(async ({ method }: { method: string }) => {
        if (method === 'getUser') return { userId: 'user', isAdmin }
        if (method === 'getServerStatus') return serverStatus
        throw new Error(`Unexpected method ${method}`)
    })
}

describe('UserUiAdmin', () => {
    const componentFixture = html`<user-ui-admin></user-ui-admin>`

    beforeEach(() => {
        mockCreateUserClient.mockReset()
        mockRequest.mockReset()
        handleErrorToast.mockReset()
        mockCreateUserClient.mockResolvedValue(createMockUserClient())
    })

    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders notices and the config for the admin user', async () => {
        mockResponses(true)

        const el = await fixture<UserUiAdmin>(componentFixture)
        await waitUntil(() => el.status !== undefined, 'status loaded')

        const alerts = el.shadowRoot!.querySelectorAll('.alert')
        expect(alerts.length).toBe(1)
        expect(alerts[0].classList.contains('alert-warning')).toBe(true)
        expect(alerts[0].textContent).toContain(
            'Config field server.tls is deprecated.'
        )
        expect(el.shadowRoot!.querySelector('pre')?.textContent).toContain(
            '"tls": false'
        )
    })

    it('does not request the server status for other users', async () => {
        mockResponses(false)

        const el = await fixture<UserUiAdmin>(componentFixture)
        await waitUntil(() => el.isAdmin === false, 'user loaded')

        expect(mockRequest).not.toHaveBeenCalledWith({
            method: 'getServerStatus',
        })
        expect(el.shadowRoot!.textContent).toContain(
            'Only the admin user can view this page.'
        )
    })

    it('shows an error toast when loading fails', async () => {
        mockRequest.mockRejectedValue(new Error('boom'))

        await fixture<UserUiAdmin>(componentFixture)
        await waitUntil(
            () => handleErrorToast.mock.calls.length > 0,
            'error handled'
        )
    })
})
