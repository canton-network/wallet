// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest'
import { RequestArgs } from '@canton-network/core-types'
import { AbstractProvider } from './index'

type TestRpcTypes = {
    ping: {
        params: { message: string }
        result: string
    }
}

class TestProvider extends AbstractProvider<TestRpcTypes> {
    async request<M extends keyof TestRpcTypes>(
        args: RequestArgs<TestRpcTypes, M>
    ): Promise<TestRpcTypes[M]['result']> {
        if (args.method === 'ping') {
            return `pong:${args.params.message}` as TestRpcTypes[M]['result']
        }

        throw new Error('Unsupported method')
    }
}

describe('AbstractProvider', () => {
    it('registers and emits event listeners', () => {
        const provider = new TestProvider()
        const listener = vi.fn()

        provider.on('connected', listener)
        const emitted = provider.emit('connected', 'ok')

        expect(emitted).toBe(true)
        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith('ok')
    })

    it('returns false when emitting an event without listeners', () => {
        const provider = new TestProvider()

        expect(provider.emit('missing-event')).toBe(false)
    })

    it('removes a specific listener', () => {
        const provider = new TestProvider()
        const listenerA = vi.fn()
        const listenerB = vi.fn()

        provider.on('status', listenerA)
        provider.on('status', listenerB)
        provider.removeListener('status', listenerA)

        provider.emit('status', 'ready')

        expect(listenerA).not.toHaveBeenCalled()
        expect(listenerB).toHaveBeenCalledTimes(1)
        expect(listenerB).toHaveBeenCalledWith('ready')
    })

    it('supports request implementation in concrete subclass', async () => {
        const provider = new TestProvider()

        const result = await provider.request({
            method: 'ping',
            params: { message: 'hello' },
        })

        expect(result).toBe('pong:hello')
    })
})
