// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'

import {
    holdTransactionApproval,
    releaseTransactionApproval,
    transactionQuery,
} from './api.ts'

const get = vi.fn()
vi.mock('@/ui/lib/tx-approval-client.ts', () => ({
    getTxApprovalClient: () => ({ get, decide: vi.fn() }),
}))

describe('transactionQuery', () => {
    const load = (id: string) =>
        new QueryClient({
            defaultOptions: { queries: { retry: false } },
        }).query(transactionQuery(id))

    it('shows a transaction that no longer waits as settled', async () => {
        get.mockResolvedValue(null)

        await expect(load('tx-1')).resolves.toBeNull()
    })

    it('lets other read errors through, rather than call it settled', async () => {
        get.mockRejectedValue(new Error('The vault is locked'))

        await expect(load('tx-1')).rejects.toThrow('The vault is locked')
    })
})

describe('holdTransactionApproval', () => {
    let ports: FakePort[]
    const close = vi.fn()

    beforeEach(() => {
        ports = []
        vi.stubGlobal('window', { close })
        // The fake browser doesn't implement runtime.connect.
        vi.spyOn(fakeBrowser.runtime, 'connect').mockImplementation(((info: {
            name: string
        }) => {
            const port = fakePort(undefined, info.name)
            ports.push(port)
            return asPort(port)
        }) as typeof fakeBrowser.runtime.connect)
    })

    afterEach(() => {
        releaseTransactionApproval()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('closes the page when the background ends the prompt', () => {
        holdTransactionApproval('tx-1')

        ports[0]!.remoteDisconnect()

        expect(close).toHaveBeenCalled()
    })
})
