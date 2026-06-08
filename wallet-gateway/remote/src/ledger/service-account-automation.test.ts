// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest'
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
    signWithParticipant: vi.fn(),
    signWithWalletKernel: vi.fn(),
    executeWithParticipant: vi.fn(),
    executeWithExternal: vi.fn(),
}))

vi.mock('./transaction-service.js', () => ({
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

describe('ServiceAccountAutomation', () => {
    it('detects client credentials networks', () => {
        const automation = new ServiceAccountAutomation(
            {},
            {},
            pino({ level: 'silent' }, sink()),
            async () => ({
                id: 'idp1',
                type: 'oauth',
                issuer: 'iss',
                configUrl: 'http://auth',
            })
        )
        expect(automation.isAutomationRequest(network, 'any-token')).toBe(true)
    })

    it('signs and executes participant transactions straight-through', async () => {
        transactionServiceMocks.signWithParticipant.mockReturnValue({
            status: 'signed',
            signature: 'none',
            signedBy: 'ns',
            partyId: wallet.partyId,
        })
        transactionServiceMocks.executeWithParticipant.mockResolvedValue({
            commandId: 'cmd-1',
        })

        const automation = new ServiceAccountAutomation(
            {},
            {},
            pino({ level: 'silent' }, sink()),
            async () => ({
                id: 'idp1',
                type: 'oauth',
                issuer: 'iss',
                configUrl: 'http://auth',
            })
        )

        const store = {
            getWallets: vi.fn().mockResolvedValue([wallet]),
            getTransaction: vi.fn().mockResolvedValue(transaction),
        }
        const notifier = { emit: vi.fn() }

        await automation.signAndExecutePreparedTransaction(
            store as never,
            wallet,
            transaction,
            notifier as never
        )

        expect(transactionServiceMocks.signWithParticipant).toHaveBeenCalled()
        expect(
            transactionServiceMocks.executeWithParticipant
        ).toHaveBeenCalled()
    })
})
