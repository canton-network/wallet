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
import { persistent, type StoreAccess } from './persistent-store'

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
    const access = {
        assertOpen: vi.fn(),
        write: vi.fn((change: () => Promise<unknown>) => change()),
    }
    // The cast is needed because vi.fn() loses write()'s type parameter.
    const store = persistent(inner, access as StoreAccess)
    return { memory, inner, access, store }
}

const closed = new Error('closed')
const throwClosed = () => {
    throw closed
}

describe('persistent wallet store', () => {
    it('runs each write through write() once', async () => {
        const { inner, access, store } = setup()
        const statuses: unknown[] = []
        access.write.mockImplementation(async (change) => {
            const result = await change()
            statuses.push((await inner.getTransaction('tx-1'))?.status)
            return result
        })

        await store.setTransaction(TRANSACTION)
        // This calls setTransactionStatus() internally, and that inner call
        // must not count as a second write.
        expect(await store.setTransactionSigned('tx-1', new Date())).toBe(true)

        expect(statuses).toEqual(['pending', 'signed'])
    })

    it('does not run a read through write()', async () => {
        const { access, store } = setup()

        await store.listNetworks()
        await store.transactionsCount()

        expect(access.write).not.toHaveBeenCalled()
    })

    it('checks the store is open before a read and after it resolves', async () => {
        const { inner, access, store } = setup()
        const listNetworks = vi.spyOn(inner, 'listNetworks')

        access.assertOpen.mockImplementationOnce(throwClosed)
        await expect(store.listNetworks()).rejects.toBe(closed)
        expect(listNetworks).not.toHaveBeenCalled()

        // This time the store closes while the read is pending.
        access.assertOpen
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(throwClosed)
        await expect(store.listNetworks()).rejects.toBe(closed)
        expect(listNetworks).toHaveBeenCalledOnce()
    })

    it('checks the store is open before withAuthContext()', () => {
        const { access, store } = setup()
        access.assertOpen.mockImplementation(throwClosed)

        expect(() => store.withAuthContext(CONTEXT)).toThrow(closed)
    })

    it('runs writes through a withAuthContext() copy', async () => {
        const { memory, access, store } = setup()

        const scoped = store.withAuthContext({
            userId: 'bob',
            accessToken: 'bob-token',
        })
        await scoped.setTransaction(TRANSACTION)

        expect(access.write).toHaveBeenCalledOnce()
        expect(memory.get('bob')?.transactions.has('tx-1')).toBe(true)
    })

    it('rejects the API-key methods without writing', async () => {
        const { memory, access, store } = setup()

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

        expect(access.write).not.toHaveBeenCalled()
        expect(memory.get(CONTEXT.userId)?.apiKeys.size ?? 0).toBe(0)
    })
})
