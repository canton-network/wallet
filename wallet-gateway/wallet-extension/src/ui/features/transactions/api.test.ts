// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'
import { txApprovalPortName } from '@/shared/ports.ts'

import {
    actingParty,
    approveTransaction,
    holdTransactionApproval,
    rejectTransaction,
    releaseTransactionApproval,
} from './api.ts'

/** A user client that answers each method from `results`. */
function fakeClient(results: Record<string, unknown>) {
    const request = vi.fn(async ({ method }: { method: string }) => {
        if (!(method in results)) throw new Error(`Unexpected ${method}`)
        return results[method]
    })
    return { request } as unknown as Parameters<
        typeof approveTransaction
    >[0] & {
        request: typeof request
    }
}

const methods = (client: ReturnType<typeof fakeClient>) =>
    client.request.mock.calls.map(([call]) => call)

describe('approveTransaction', () => {
    it('signs, then executes for the party', async () => {
        const client = fakeClient({
            getTransaction: { status: 'pending' },
            sign: { status: 'signed' },
            execute: { updateId: 'update-1' },
        })

        await expect(approveTransaction(client, 'tx-1', 'alice')).resolves.toBe(
            'executed'
        )

        expect(methods(client)).toEqual([
            { method: 'getTransaction', params: { transactionId: 'tx-1' } },
            {
                method: 'sign',
                params: { transactionId: 'tx-1', partyId: 'alice' },
            },
            {
                method: 'execute',
                params: { transactionId: 'tx-1', partyId: 'alice' },
            },
        ])
    })

    it('executes a signed transaction again without signing', async () => {
        const client = fakeClient({
            getTransaction: { status: 'signed' },
            execute: {},
        })

        await approveTransaction(client, 'tx-1', 'alice')

        expect(methods(client).map(({ method }) => method)).toEqual([
            'getTransaction',
            'execute',
        ])
    })

    it('does not execute before the signature is there', async () => {
        const client = fakeClient({
            getTransaction: { status: 'pending' },
            sign: { status: 'pending' },
        })

        await expect(approveTransaction(client, 'tx-1', 'alice')).resolves.toBe(
            'pending'
        )

        expect(methods(client).map(({ method }) => method)).toEqual([
            'getTransaction',
            'sign',
        ])
    })
})

describe('rejectTransaction', () => {
    it('deletes the transaction', async () => {
        const client = fakeClient({ deleteTransaction: null })

        await rejectTransaction(client, 'tx-1')

        expect(methods(client)).toEqual([
            { method: 'deleteTransaction', params: { transactionId: 'tx-1' } },
        ])
    })
})

describe('actingParty', () => {
    it.each([
        [JSON.stringify({ actAs: ['alice', 'bob'] }), 'alice'],
        [JSON.stringify({ commands: [] }), undefined],
        ['', undefined],
    ])('reads the first acting party of %j', (payload, party) => {
        expect(actingParty(payload)).toBe(party)
    })
})

describe('holdTransactionApproval', () => {
    let ports: FakePort[]
    const close = vi.fn()

    beforeEach(() => {
        ports = []
        vi.stubGlobal('window', { close })
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
        close.mockClear()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('moves to the new transaction when the id changes', () => {
        holdTransactionApproval('a')
        holdTransactionApproval('a')
        holdTransactionApproval('b')

        expect(ports.map((port) => port.name)).toEqual([
            txApprovalPortName('a'),
            txApprovalPortName('b'),
        ])
        expect(ports[0]!.disconnect).toHaveBeenCalled()
        expect(ports[1]!.disconnect).not.toHaveBeenCalled()
    })

    it('closes the page when the background ends the prompt', () => {
        holdTransactionApproval('a')

        ports[0]!.remoteDisconnect()

        expect(close).toHaveBeenCalled()
    })
})
