// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest'
import { createProvider } from './create-provider.js'
import type { Provider } from './test-provider.js'

describe('createProvider', () => {
    it('forwards requests unchanged and preserves their results and errors', async () => {
        const request: Provider['request'] = vi.fn()
        const provider = createProvider(request)
        const args = {
            method: 'signMessage' as const,
            params: { message: 'test' },
        }
        const expected = { signature: 'signed' }
        vi.mocked(request).mockResolvedValue(expected)
        expect(await provider.request(args)).toBe(expected)
        expect(request).toHaveBeenCalledExactlyOnceWith(args)
        const error = new Error('Wallet rejected')
        vi.mocked(request).mockRejectedValue(error)
        await expect(provider.request(args)).rejects.toBe(error)
    })

    it('manages independent subscriptions with stable emission and chainable methods', () => {
        const provider = createProvider(async () => {
            throw new Error('Unused')
        })
        const other = createProvider(async () => {
            throw new Error('Unused')
        })
        const second = vi.fn()
        const added = vi.fn()
        const first = vi.fn(() => {
            provider.removeListener('changed', second)
            provider.on('changed', added)
        })
        expect(provider.on('changed', first)).toBe(provider)
        provider.on('changed', first).on('changed', second)
        expect(other.emit('changed', 'value')).toBe(false)
        expect(provider.emit('changed', 'value', 'extra')).toBe(true)
        expect(first).toHaveBeenCalledExactlyOnceWith('value', 'extra')
        expect(second).toHaveBeenCalledExactlyOnceWith('value', 'extra')
        expect(added).not.toHaveBeenCalled()
        expect(provider.removeListener('changed', first)).toBe(provider)
        provider.removeListener('changed', added)
        expect(provider.emit('changed')).toBe(false)
    })
})
