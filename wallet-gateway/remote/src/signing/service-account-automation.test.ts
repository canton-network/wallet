// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import { ServiceAccountAutomation } from './service-account-automation.js'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type {
    Network,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'

const transactionServiceMocks = vi.hoisted(() => ({
    sign: vi.fn(),
    execute: vi.fn(),
}))

vi.mock('../ledger/transaction-service.js', () => ({
    TransactionService: vi.fn(function TransactionServiceMock() {
        return transactionServiceMocks
    }),
}))

const network: Network = {
    id: 'net-1',
    name: 'net',
    description: '',
    synchronizerId: 'sync::fp',
    identityProviderId: 'idp1',
    ledgerApi: { baseUrl: 'http://ledger' },
    auth: {
        method: 'client_credentials',
        clientId: 'svc',
        clientSecret: 'secret',
        audience: 'aud',
        scope: 'scope',
    },
}

const wallet: Wallet = {
    primary: true,
    partyId: 'party::ns',
    status: 'allocated',
    hint: 'party',
    publicKey: 'pk',
    namespace: 'ns',
    networkId: 'net-1',
    signingProviderId: SigningProvider.PARTICIPANT,
    rights: [],
}

const transaction: Transaction = {
    id: 'tx-1',
    commandId: 'cmd-1',
    status: 'pending',
    preparedTransaction: 'blob',
    preparedTransactionHash: 'hash',
    origin: null,
}

const authContext = {
    userId: 'user-1',
    accessToken: 'token',
}

describe('ServiceAccountAutomation', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('detects client credentials networks', () => {
        const automation = new ServiceAccountAutomation(
            {},
            {},
            pino({ level: 'silent' }, sink())
        )
        expect(automation.isAutomationRequest(network, 'any-token')).toBe(true)
    })

    it('signs and executes transactions straight-through', async () => {
        transactionServiceMocks.sign.mockResolvedValue({
            status: 'signed',
            signature: 'sig',
            signedBy: 'ns',
            partyId: wallet.partyId,
        })
        transactionServiceMocks.execute.mockResolvedValue({
            commandId: 'cmd-1',
        })

        const automation = new ServiceAccountAutomation(
            {},
            {},
            pino({ level: 'silent' }, sink()),
            authContext
        )

        const store = {
            getWallets: vi.fn().mockResolvedValue([wallet]),
            getTransaction: vi.fn().mockResolvedValue(transaction),
        }
        const notifier = { emit: vi.fn() }

        await automation.signAndExecutePreparedTransaction(
            store as never,
            network,
            wallet,
            transaction,
            notifier as never
        )

        expect(transactionServiceMocks.sign).toHaveBeenCalledWith(
            authContext,
            wallet,
            expect.objectContaining({ transactionId: transaction.id })
        )
        expect(transactionServiceMocks.execute).toHaveBeenCalledWith(
            authContext,
            wallet,
            transaction,
            expect.objectContaining({
                signature: 'sig',
                signedBy: 'ns',
            }),
            expect.anything(),
            network
        )
    })

    it('returns without executing when external signing is still pending', async () => {
        transactionServiceMocks.sign.mockResolvedValue({
            status: 'pending',
            externalTxId: 'ext-1',
            partyId: wallet.partyId,
        })

        const automation = new ServiceAccountAutomation(
            {},
            {},
            pino({ level: 'silent' }, sink()),
            authContext
        )

        await automation.signAndExecutePreparedTransaction(
            {} as never,
            network,
            wallet,
            transaction,
            { emit: vi.fn() } as never
        )

        expect(transactionServiceMocks.execute).not.toHaveBeenCalled()
    })
})
