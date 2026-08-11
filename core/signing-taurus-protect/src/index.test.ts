// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isRpcError, SigningProvider } from '@canton-network/core-signing-lib'
import type { GatewayAccount } from './gateway-client.js'

const clientMock = vi.hoisted(() => ({
    listAccounts: vi.fn(),
    prepareExecute: vi.fn(),
    getStatus: vi.fn(),
    getTransactionStatus: vi.fn(),
    rememberRequestId: vi.fn(),
}))

vi.mock('./gateway-client.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./gateway-client.js')>()
    return {
        ...actual,
        GatewayClient: vi.fn(function () {
            return clientMock
        }),
    }
})

// Imported after vi.mock (hoisted) so the driver picks up the mocked client.
const { default: TaurusProtectSigningDriver } = await import('./index.js')

const account: GatewayAccount = {
    partyId: 'alice::ns1',
    status: 'allocated',
    prefix: 'alice',
    publicKey: 'pub-alice',
    namespace: 'ns1',
    networkId: 'canton:test',
    signingProviderId: 'taurus-protect',
}

let driver: InstanceType<typeof TaurusProtectSigningDriver>
let ctl: ReturnType<
    InstanceType<typeof TaurusProtectSigningDriver>['controller']
>

beforeEach(() => {
    vi.clearAllMocks()
    driver = new TaurusProtectSigningDriver({
        baseUrl: 'http://gw',
        token: 'tok',
    })
    ctl = driver.controller(undefined)
})

describe('TaurusProtectSigningDriver', () => {
    it('reports the taurus-protect provider', () => {
        expect(driver.signingProvider).toBe(SigningProvider.TAURUS_PROTECT)
    })

    it('getKeys maps allocated parties and skips non-allocated ones', async () => {
        const initializing: GatewayAccount = {
            ...account,
            partyId: 'bob::ns2',
            prefix: 'bob',
            publicKey: 'pub-bob',
            status: 'initializing',
        }
        clientMock.listAccounts.mockResolvedValue([account, initializing])
        const res = await ctl.getKeys()
        expect(res).toEqual({
            keys: [{ id: 'alice::ns1', name: 'alice', publicKey: 'pub-alice' }],
        })
    })

    // The gateway can return an account without a publicKey; Wallet.publicKey
    // is required, so an empty one would persist a keyless wallet.
    it('getKeys skips an allocated party the gateway returned without a publicKey', async () => {
        clientMock.listAccounts.mockResolvedValue([
            account,
            {
                ...account,
                partyId: 'carol::ns3',
                prefix: 'carol',
                publicKey: '',
            },
        ])
        expect(await ctl.getKeys()).toEqual({
            keys: [{ id: 'alice::ns1', name: 'alice', publicKey: 'pub-alice' }],
        })
    })

    it('getKeys surfaces fetch errors', async () => {
        clientMock.listAccounts.mockRejectedValue(new Error('boom'))
        expect(isRpcError(await ctl.getKeys())).toBe(true)
    })

    it('signMessage is not allowed (gated to wallet-kernel, like the other external drivers)', async () => {
        const res = await ctl.signMessage({ message: 'hi' })
        expect(isRpcError(res)).toBe(true)
        expect((res as { error: string }).error).toBe('not_allowed')
    })

    it('signTransaction forwards the command to prepareExecute and returns pending', async () => {
        clientMock.prepareExecute.mockResolvedValue({
            userUrl: 'u',
            requestId: '42',
            commandId: 'cmd1',
        })
        const tx = JSON.stringify({
            commands: [{ CreateCommand: {} }],
            actAs: ['alice::ns1'],
            commandId: 'cmd1',
        })
        const res = await ctl.signTransaction({
            tx,
            txHash: '',
            keyIdentifier: { id: 'alice::ns1' },
        })
        expect(res).toEqual({
            txId: 'cmd1',
            status: 'pending',
            metadata: {
                gatewayStatus: 'pending',
                requestId: '42',
                commandId: 'cmd1',
            },
        })
        expect(clientMock.prepareExecute).toHaveBeenCalledWith({
            commands: [{ CreateCommand: {} }],
            actAs: ['alice::ns1'],
            commandId: 'cmd1',
        })
    })

    // The client defaults a missing commandId, and getStatus is keyed off that value — so the
    // txId has to be the id the client actually used, not the requestId.
    it('signTransaction reports the commandId the client resolved', async () => {
        clientMock.prepareExecute.mockResolvedValue({
            userUrl: 'u',
            requestId: '42',
            commandId: 'generated-uuid',
        })
        const res = await ctl.signTransaction({
            tx: JSON.stringify({ commands: [{ CreateCommand: {} }] }),
            txHash: '',
            keyIdentifier: { id: 'alice::ns1' },
        })
        expect(res).toMatchObject({ txId: 'generated-uuid' })
    })

    it('signTransaction rejects a non-JSON tx without calling the gateway', async () => {
        const res = await ctl.signTransaction({
            tx: 'not-json',
            txHash: '',
            keyIdentifier: { id: 'x' },
        })
        expect(isRpcError(res)).toBe(true)
        expect(clientMock.prepareExecute).not.toHaveBeenCalled()
    })

    // JSON.parse succeeds on these; a parse-only guard leaves a TypeError on
    // the property read, outside the try/catch.
    it.each(['null', '"a string"', '42'])(
        'signTransaction rejects tx %s that parses but is not an object',
        async (tx) => {
            const res = await ctl.signTransaction({
                tx,
                txHash: '',
                keyIdentifier: { id: 'x' },
            })
            expect(isRpcError(res)).toBe(true)
            expect(clientMock.prepareExecute).not.toHaveBeenCalled()
        }
    )

    // disclosedContracts, readAs and packageIdSelectionPreference are inert at
    // the gateway and already inside the PTX, so they stay off the wire.
    it('signTransaction sends only the fields the gateway consumes', async () => {
        clientMock.prepareExecute.mockResolvedValue({
            userUrl: 'u',
            requestId: '42',
            commandId: 'cmd1',
        })
        const tx = JSON.stringify({
            commands: [{ ExerciseCommand: {} }],
            actAs: ['alice::ns1'],
            readAs: ['registry::ns'],
            disclosedContracts: [{ contractId: 'c1' }],
            packageIdSelectionPreference: ['pkg1'],
            commandId: 'cmd1',
            preparedTransaction: 'CgVoZWxsbw==',
        })
        await ctl.signTransaction({
            tx,
            txHash: '',
            keyIdentifier: { id: 'alice::ns1' },
        })
        expect(clientMock.prepareExecute).toHaveBeenCalledWith({
            commands: [{ ExerciseCommand: {} }],
            actAs: ['alice::ns1'],
            commandId: 'cmd1',
            preparedTransaction: 'CgVoZWxsbw==',
        })
    })

    it('signTransaction surfaces gateway errors', async () => {
        clientMock.prepareExecute.mockRejectedValue(new Error('rule reject'))
        const tx = JSON.stringify({ commands: [{}], commandId: 'c' })
        expect(
            isRpcError(
                await ctl.signTransaction({
                    tx,
                    txHash: '',
                    keyIdentifier: { id: 'x' },
                })
            )
        ).toBe(true)
    })

    it('getTransaction maps gateway status and re-seeds the requestId', async () => {
        clientMock.getStatus.mockResolvedValue({
            status: 'executed',
            updateId: 'u1',
            contractId: '00ab',
        })
        const res = await ctl.getTransaction({ txId: 'cmd1', requestId: '42' })
        expect(clientMock.rememberRequestId).toHaveBeenCalledWith('cmd1', '42')
        expect(res).toEqual({
            txId: 'cmd1',
            status: 'signed',
            metadata: {
                gatewayStatus: 'executed',
                updateId: 'u1',
                contractId: '00ab',
            },
        })
    })

    it('getTransaction returns not_found when status is unavailable', async () => {
        clientMock.getStatus.mockResolvedValue(undefined)
        expect(isRpcError(await ctl.getTransaction({ txId: 'cmd1' }))).toBe(
            true
        )
    })

    it('getTransactions resolves each txId', async () => {
        clientMock.getStatus
            .mockResolvedValueOnce({ status: 'pending' })
            .mockResolvedValueOnce({ status: 'failed' })
        const res = await ctl.getTransactions({ txIds: ['a', 'b'] })
        expect(res).toEqual({
            transactions: [
                {
                    txId: 'a',
                    status: 'pending',
                    metadata: { gatewayStatus: 'pending' },
                },
                {
                    txId: 'b',
                    status: 'failed',
                    metadata: { gatewayStatus: 'failed' },
                },
            ],
        })
    })

    it('getTransactions requires txIds', async () => {
        expect(isRpcError(await ctl.getTransactions({}))).toBe(true)
    })

    it('createKey is not allowed (import-only)', async () => {
        const res = await ctl.createKey({ name: 'x' })
        expect(isRpcError(res)).toBe(true)
        expect((res as { error: string }).error).toBe('not_allowed')
    })

    it('getConfiguration masks the token', async () => {
        expect(await ctl.getConfiguration()).toEqual({
            baseUrl: 'http://gw',
            token: '***HIDDEN***',
        })
    })

    it('setConfiguration validates input and accepts a valid change', async () => {
        expect(
            isRpcError(await ctl.setConfiguration({ baseUrl: 'http://y' }))
        ).toBe(true)
        expect(
            await ctl.setConfiguration({ baseUrl: 'http://y', token: 'newtok' })
        ).toEqual({ baseUrl: 'http://y', token: '***HIDDEN***' })
    })

    it('subscribeTransactions is a no-op', async () => {
        expect(await ctl.subscribeTransactions({ txIds: ['a'] })).toEqual({})
    })
})
