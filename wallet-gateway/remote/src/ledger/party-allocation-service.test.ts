// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    vi,
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    type Mocked,
} from 'vitest'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import type { Network } from '@canton-network/core-wallet-store'
import type {
    AccessTokenProvider,
    AuthContext,
} from '@canton-network/core-wallet-auth'
import { PartyAllocationService } from './party-allocation-service.js'

type MockLedgerClient = Mocked<
    Pick<
        LedgerClient,
        | 'getWithRetry'
        | 'postWithRetry'
        | 'waitForPartyAndGrantUserRights'
        | 'generateTopology'
        | 'allocateExternalParty'
    >
>

const {
    mockLedgerGet,
    mockLedgerPost,
    mockLedgerGrantUserRights,
    mockGenerateTopology,
    mockAllocateExternalParty,
} = vi.hoisted(() => {
    const client = {
        getWithRetry: vi.fn(),
        postWithRetry: vi.fn(),
        waitForPartyAndGrantUserRights: vi.fn(),
        generateTopology: vi.fn().mockResolvedValue({
            partyId: 'party2::mypublickey',
            publicKeyFingerprint: 'mypublickey',
            topologyTransactions: ['tx1'],
            multiHash: 'combinedHash',
        }),
        allocateExternalParty: vi
            .fn()
            .mockResolvedValue({ partyId: 'party2::mypublickey' }),
    } as MockLedgerClient
    return {
        mockLedgerGet: client.getWithRetry,
        mockLedgerPost: client.postWithRetry,
        mockLedgerGrantUserRights: client.waitForPartyAndGrantUserRights,
        mockGenerateTopology: client.generateTopology,
        mockAllocateExternalParty: client.allocateExternalParty,
    }
})

vi.mock('@canton-network/core-ledger-client', () => ({
    Signature: vi.fn(),
    SignatureFormat: vi.fn(),
    SigningAlgorithmSpec: vi.fn(),
    MultiTransactionSignatures: vi.fn(),
    SignedTopologyTransaction: vi.fn(),
    LedgerClient: vi.fn(function LedgerClientMock() {
        return {
            getWithRetry: mockLedgerGet,
            postWithRetry: mockLedgerPost,
            waitForPartyAndGrantUserRights: mockLedgerGrantUserRights,
            generateTopology: mockGenerateTopology,
            allocateExternalParty: mockAllocateExternalParty,
        }
    }),
}))

describe('PartyAllocationService', () => {
    const network: Network & { synchronizerId: string } = {
        name: 'test',
        id: 'network-id',
        synchronizerId: 'sync-id',
        description: 'desc',
        identityProviderId: 'idp',
        ledgerApi: {
            baseUrl: 'http://ledger',
        },
        auth: {
            method: 'authorization_code',
            audience: 'aud',
            scope: 'scope',
            clientId: 'cid',
        },
        adminAuth: {
            method: 'client_credentials',
            audience: 'aud',
            scope: 'scope',
            clientId: 'cid',
            clientSecret: 'secret',
        },
    }

    let service: PartyAllocationService

    beforeEach(() => {
        const mockAccessTokenProvider: AccessTokenProvider = {
            getAccessToken: vi
                .fn<() => Promise<string>>()
                .mockResolvedValue('admin.jwt'),
            getAuthContext: vi
                .fn<() => Promise<AuthContext>>()
                .mockResolvedValue({
                    userId: 'admin',
                    accessToken: 'admin.jwt',
                }),
        }

        service = new PartyAllocationService({
            synchronizerId: network.synchronizerId,
            accessTokenProvider: mockAccessTokenProvider,
            httpLedgerUrl: network.ledgerApi.baseUrl,
        })

        vi.spyOn(service, 'createFingerprintFromKey').mockReturnValue(
            'mypublickey'
        )
    })

    afterEach(() => vi.restoreAllMocks())

    it('allocates an internal party without granting user rights', async () => {
        mockLedgerGet.mockResolvedValueOnce({
            participantId: 'participant1::participantid',
        })
        mockLedgerPost.mockResolvedValueOnce({
            partyDetails: { party: 'party1::participantid' },
        })
        await expect(service.allocateParty('party1')).resolves.toStrictEqual({
            hint: 'party1',
            partyId: 'party1::participantid',
            namespace: 'participantid',
        })
        expect(mockLedgerPost).toHaveBeenCalledWith('/v2/parties', {
            partyIdHint: 'party1',
            identityProviderId: '',
            synchronizerId: 'sync-id',
        })
        expect(mockLedgerGrantUserRights).not.toHaveBeenCalled()
    })

    it('allocates an external party without granting user rights', async () => {
        const publicKey = 'mypublickey'
        const signingCallback = vi.fn().mockResolvedValue('mysignedhash')

        await expect(
            service.allocateParty('party2', publicKey, signingCallback)
        ).resolves.toStrictEqual({
            hint: 'party2',
            partyId: `party2::${publicKey}`,
            namespace: publicKey,
        })
        expect(signingCallback).toHaveBeenCalledWith('combinedHash')
        expect(mockAllocateExternalParty).toHaveBeenCalledWith(
            'sync-id',
            [{ transaction: 'tx1' }],
            [
                {
                    format: 'SIGNATURE_FORMAT_CONCAT',
                    signature: 'mysignedhash',
                    signedBy: 'mypublickey',
                    signingAlgorithmSpec: 'SIGNING_ALGORITHM_SPEC_ED25519',
                },
            ]
        )
        expect(mockLedgerGrantUserRights).not.toHaveBeenCalled()
    })

    it('allocates a party and grants user rights', async () => {
        mockLedgerGet.mockResolvedValueOnce({
            participantId: 'participant1::participantid',
        })
        mockLedgerPost.mockResolvedValueOnce({
            partyDetails: { party: 'party1::participantid' },
        })

        await expect(
            service.allocatePartyAndGrantRights('user1', 'party1')
        ).resolves.toStrictEqual({
            hint: 'party1',
            partyId: 'party1::participantid',
            namespace: 'participantid',
        })
        expect(mockLedgerGrantUserRights).toHaveBeenCalledWith(
            'user1',
            'party1::participantid'
        )
    })

    it('allocates an external party and grants user rights', async () => {
        const signingCallback = vi.fn().mockResolvedValue('mysignedhash')

        await expect(
            service.allocatePartyAndGrantRights(
                'user1',
                'party2',
                'mypublickey',
                signingCallback
            )
        ).resolves.toStrictEqual({
            hint: 'party2',
            partyId: 'party2::mypublickey',
            namespace: 'mypublickey',
        })
        expect(signingCallback).toHaveBeenCalledWith('combinedHash')
        expect(mockLedgerGrantUserRights).toHaveBeenCalledWith(
            'user1',
            'party2::mypublickey'
        )
    })

    it('propagates a user-rights grant failure after allocating the party', async () => {
        mockLedgerGet.mockResolvedValueOnce({
            participantId: 'participant1::participantid',
        })
        mockLedgerPost.mockResolvedValueOnce({
            partyDetails: { party: 'party1::participantid' },
        })
        mockLedgerGrantUserRights.mockRejectedValueOnce(
            new Error('grant failed')
        )

        await expect(
            service.allocatePartyAndGrantRights('user1', 'party1')
        ).rejects.toThrow('grant failed')
        expect(mockLedgerPost).toHaveBeenCalledOnce()
    })

    it('grants user rights without allocating a party', async () => {
        await service.grantUserRights('user1', 'party1::participantid')

        expect(mockLedgerGrantUserRights).toHaveBeenCalledWith(
            'user1',
            'party1::participantid'
        )
        expect(mockLedgerPost).not.toHaveBeenCalledWith(
            '/v2/parties',
            expect.anything()
        )
        expect(mockAllocateExternalParty).not.toHaveBeenCalled()
    })

    it('allocates with an existing wallet without granting user rights', async () => {
        await expect(
            service.allocatePartyWithExistingWallet(
                'mypublickey',
                ['transaction'],
                'signature'
            )
        ).resolves.toBe('party2::mypublickey')

        expect(mockAllocateExternalParty).toHaveBeenCalledWith(
            'sync-id',
            [{ transaction: 'transaction' }],
            [
                {
                    format: 'SIGNATURE_FORMAT_CONCAT',
                    signature: 'signature',
                    signedBy: 'mypublickey',
                    signingAlgorithmSpec: 'SIGNING_ALGORITHM_SPEC_ED25519',
                },
            ]
        )
        expect(mockLedgerGrantUserRights).not.toHaveBeenCalled()
    })

    it('allocates with an existing wallet and grants user rights', async () => {
        await expect(
            service.allocatePartyWithExistingWalletAndGrantRights(
                'mypublickey',
                ['transaction'],
                'signature',
                'user1'
            )
        ).resolves.toBe('party2::mypublickey')

        expect(mockLedgerGrantUserRights).toHaveBeenCalledWith(
            'user1',
            'party2::mypublickey'
        )
    })
})
