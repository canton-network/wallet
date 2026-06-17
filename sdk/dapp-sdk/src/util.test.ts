// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { popup } from '@canton-network/core-wallet-ui-components'
import * as storage from './storage'
import { clearAllLocalState, composeSIWXMessage } from './util'

vi.mock('./storage', () => ({
    removeKernelSession: vi.fn(),
    removeKernelDiscovery: vi.fn(),
}))

vi.mock('@canton-network/core-wallet-ui-components', () => ({
    popup: {
        close: vi.fn(),
    },
}))

describe('util', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('clearAllLocalState', () => {
        it('clears kernel session and discovery', () => {
            clearAllLocalState()

            expect(storage.removeKernelSession).toHaveBeenCalledOnce()
            expect(storage.removeKernelDiscovery).toHaveBeenCalledOnce()
            expect(popup.close).not.toHaveBeenCalled()
        })

        it('closes the popup when requested', () => {
            clearAllLocalState({ closePopup: true })

            expect(popup.close).toHaveBeenCalledOnce()
        })
    })

    describe('composeSIWXMessage', () => {
        it('builds a minimal SIWX message', () => {
            const message = composeSIWXMessage({
                domain: 'example.com',
                uri: 'https://example.com/login',
                version: '1',
                nonce: 'nonce-1',
                chainId: '42',
                accountAddress: 'party::abc',
            })

            expect(message).toBe(
                [
                    'example.com wants you to sign in with your Canton account:',
                    'party::abc',
                    '',
                    'URI: https://example.com/login',
                    'Version: 1',
                    'Chain ID: 42',
                    'Nonce: nonce-1',
                ].join('\n')
            )
        })

        it('includes optional SIWX fields when provided', () => {
            const message = composeSIWXMessage({
                domain: 'example.com',
                uri: 'uri:1234567890',
                version: '1',
                nonce: 'nonce-1',
                chainId: '42',
                accountAddress: 'party::abc',
                statement: 'Sign in to the app',
                issuedAt: '2026-01-01T00:00:00Z',
                expirationTime: '2026-01-02T00:00:00Z',
                notBefore: '2025-12-31T00:00:00Z',
                requestId: 'req-1',
                resources: ['resource-1'],
            })

            expect(message).toContain('\nSign in to the app\n')
            expect(message).toContain('Issued At: 2026-01-01T00:00:00Z')
            expect(message).toContain('Expiration Time: 2026-01-02T00:00:00Z')
            expect(message).toContain('Not Before: 2025-12-31T00:00:00Z')
            expect(message).toContain('Request ID: req-1')
            expect(message).toContain('Resources:\n- resource-1')
        })
    })
})
