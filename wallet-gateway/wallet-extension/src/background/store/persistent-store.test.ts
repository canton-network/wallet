// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import type { Transaction } from '@canton-network/core-wallet-store'
import {
    type Memory,
    StoreInternal,
} from '@canton-network/core-wallet-store-inmemory'
import { describe, expect, it, vi } from 'vitest'
import { logger } from '@/shared/logger'
import { defaultConfig } from './default-config'
import { persistent } from './persistent-store'

const CONTEXT = { userId: 'alice', accessToken: 'alice-token' }

const TRANSACTION: Transaction = {
    id: 'tx-1',
    status: 'pending',
    commandId: 'command-1',
    preparedTransaction: 'prepared',
    preparedTransactionHash: 'hash',
    origin: null,
}

function setup() {
    const memory: Memory = new Map()
    const inner = new StoreInternal(defaultConfig(), logger, CONTEXT, memory)
    const persist = vi.fn(async () => {})
    return { memory, inner, persist, store: persistent(inner, persist) }
}

describe('persistent wallet store', () => {
    it('persists each write once, after it resolves', async () => {
        const { inner, persist, store } = setup()
        const persistedStatuses: unknown[] = []
        persist.mockImplementation(async () => {
            persistedStatuses.push((await inner.getTransaction('tx-1'))?.status)
        })

        await store.setTransaction(TRANSACTION)
        // This calls setTransactionStatus() internally, and that inner call
        // must not count as a second write.
        expect(await store.setTransactionSigned('tx-1', new Date())).toBe(true)

        expect(persistedStatuses).toEqual(['pending', 'signed'])
    })

    it('does not persist a read', async () => {
        const { persist, store } = setup()

        await store.listNetworks()
        await store.transactionsCount()

        expect(persist).not.toHaveBeenCalled()
    })

    it('persists writes through a withAuthContext() copy', async () => {
        const { memory, persist, store } = setup()

        const scoped = store.withAuthContext({
            userId: 'bob',
            accessToken: 'bob-token',
        })
        await scoped.setTransaction(TRANSACTION)

        expect(persist).toHaveBeenCalledTimes(1)
        expect(memory.get('bob')?.transactions.has('tx-1')).toBe(true)
    })

    it('rejects the API-key methods without persisting', async () => {
        const { memory, persist, store } = setup()

        await expect(
            store.addApiKey({
                id: 'key-1',
                name: 'key',
                digest: 'digest',
                createdAt: new Date(),
                userId: CONTEXT.userId,
                email: null,
                networkId: 'canton:local-oauth',
            })
        ).rejects.toMatchObject({ code: errorCodes.rpc.methodNotSupported })
        await expect(store.listApiKeys()).rejects.toMatchObject({
            code: errorCodes.rpc.methodNotSupported,
        })

        expect(persist).not.toHaveBeenCalled()
        expect(memory.get(CONTEXT.userId)?.apiKeys.size ?? 0).toBe(0)
    })

    it('does not persist a write that throws', async () => {
        const { persist, store } = setup()

        await expect(
            store.setTransactionStatus('missing', 'signed')
        ).rejects.toThrow('Transaction not found')

        expect(persist).not.toHaveBeenCalled()
    })
})
