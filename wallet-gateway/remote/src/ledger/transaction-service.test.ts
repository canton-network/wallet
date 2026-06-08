// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import type { Logger } from 'pino'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import type {
    Network,
    Store,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'
import {
    SigningProvider,
    type SigningDriverInterface,
} from '@canton-network/core-signing-lib'
import type { Notifier } from '../notification/NotificationService.js'
import { TransactionService } from './transaction-service.js'

const userId = 'user-1'

const wallet: Wallet = {
    primary: true,
    partyId: 'party::namespace',
    status: 'allocated',
    hint: 'party',
    signingProviderId: SigningProvider.WALLET_KERNEL,
    publicKey: 'wallet-public-key',
    namespace: 'namespace',
    networkId: 'network1',
    rights: [],
}

const pendingTransaction: Transaction = {
    id: 'tx-1',
    commandId: 'cmd-1',
    status: 'pending',
    preparedTransaction: 'prepared-tx',
    preparedTransactionHash: 'tx-hash',
    origin: 'https://dapp.example',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
}

const signParams = {
    transactionId: pendingTransaction.id,
    partyId: wallet.partyId,
}

const executeParams = {
    transactionId: pendingTransaction.id,
    partyId: wallet.partyId,
    signature: 'signature',
    signedBy: wallet.namespace,
}

const network: Network = {
    id: 'network1',
    name: 'testnet',
    synchronizerId: 'sync::fingerprint',
    description: 'Test',
    identityProviderId: 'idp1',
    ledgerApi: { baseUrl: 'http://ledger.test' },
    auth: {
        method: 'authorization_code',
        clientId: 'cid',
        scope: 'scope',
        audience: 'aud',
    },
}

function createDriver(options: {
    signTransaction?: ReturnType<typeof vi.fn>
    getTransaction?: ReturnType<typeof vi.fn>
}): SigningDriverInterface {
    return {
        controller: vi.fn().mockReturnValue({
            signTransaction:
                options.signTransaction ??
                vi.fn().mockResolvedValue({ signature: 'driver-signature' }),
            getTransaction:
                options.getTransaction ?? vi.fn().mockResolvedValue({}),
        }),
    } as unknown as SigningDriverInterface
}

function createStore(
    transaction: Transaction | undefined = pendingTransaction
): Store & {
    getTransaction: ReturnType<typeof vi.fn>
    setTransactionSigned: ReturnType<typeof vi.fn>
    setTransactionStatus: ReturnType<typeof vi.fn>
} {
    return {
        getTransaction: vi.fn().mockResolvedValue(transaction),
        setTransactionSigned: vi.fn().mockResolvedValue(undefined),
        setTransactionStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as Store & {
        getTransaction: ReturnType<typeof vi.fn>
        setTransactionSigned: ReturnType<typeof vi.fn>
        setTransactionStatus: ReturnType<typeof vi.fn>
    }
}

function createService(
    store: Store,
    drivers: Partial<Record<SigningProvider, SigningDriverInterface>>,
    notifier: Notifier,
    logger: Logger
) {
    return new TransactionService(store, logger, drivers, notifier)
}

describe('TransactionService', () => {
    let logger: Logger
    let notifier: Notifier
    let emit: ReturnType<typeof vi.fn>

    beforeEach(() => {
        logger = pino({ level: 'silent' }, sink())
        emit = vi.fn()
        notifier = { emit } as unknown as Notifier
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('signWithParticipant', () => {
        it('returns a signed result without calling external drivers', () => {
            const store = createStore()
            const service = createService(store, {}, notifier, logger)

            const result = service.signWithParticipant(wallet)

            expect(result).toEqual({
                status: 'signed',
                signature: 'none',
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
            })
            expect(store.getTransaction).not.toHaveBeenCalled()
        })
    })

    describe('signWithWalletKernel', () => {
        it('signs the transaction and persists the signed state', async () => {
            const signTransaction = vi
                .fn()
                .mockResolvedValue({ signature: 'kernel-signature' })
            const store = createStore()
            const service = createService(
                store,
                {
                    [SigningProvider.WALLET_KERNEL]: createDriver({
                        signTransaction,
                    }),
                },
                notifier,
                logger
            )

            const result = await service.signWithWalletKernel(
                userId,
                wallet,
                signParams
            )

            expect(signTransaction).toHaveBeenCalledWith({
                tx: pendingTransaction.preparedTransaction,
                txHash: pendingTransaction.preparedTransactionHash,
                keyIdentifier: { publicKey: wallet.publicKey },
            })
            expect(store.setTransactionSigned).toHaveBeenCalledWith(
                pendingTransaction.id,
                expect.any(Date)
            )
            expect(emit).toHaveBeenCalledWith(
                'txChanged',
                expect.objectContaining({
                    id: pendingTransaction.id,
                    status: 'signed',
                })
            )
            expect(result).toEqual({
                status: 'signed',
                signature: 'kernel-signature',
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
            })
        })

        it('throws when the wallet-kernel driver is missing', async () => {
            const service = createService(createStore(), {}, notifier, logger)

            await expect(
                service.signWithWalletKernel(userId, wallet, signParams)
            ).rejects.toThrow('Wallet Gateway signing driver not available')
        })

        it('throws when the transaction does not exist', async () => {
            const store = createStore()
            store.getTransaction.mockResolvedValue(undefined)
            const service = createService(
                store,
                {
                    [SigningProvider.WALLET_KERNEL]: createDriver({}),
                },
                notifier,
                logger
            )

            await expect(
                service.signWithWalletKernel(userId, wallet, signParams)
            ).rejects.toThrow('Transaction not found with id: tx-1')
        })

        it('throws when the driver returns an RPC error', async () => {
            const signTransaction = vi.fn().mockResolvedValue({
                error: 'access_denied',
                error_description: 'Signing rejected',
            })
            const service = createService(
                createStore(),
                {
                    [SigningProvider.WALLET_KERNEL]: createDriver({
                        signTransaction,
                    }),
                },
                notifier,
                logger
            )

            await expect(
                service.signWithWalletKernel(userId, wallet, signParams)
            ).rejects.toThrow('Error from signing driver: Signing rejected')
        })
    })

    describe('signWithBlockdaemon', () => {
        it('starts signing when there is no external transaction id yet', async () => {
            const signTransaction = vi.fn().mockResolvedValue({
                status: 'pending',
                txId: 'external-tx-1',
            })
            const store = createStore()
            const service = createService(
                store,
                {
                    [SigningProvider.BLOCKDAEMON]: createDriver({
                        signTransaction,
                    }),
                },
                notifier,
                logger
            )

            const result = await service.signWithBlockdaemon(
                userId,
                wallet,
                signParams
            )

            expect(signTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    tx: pendingTransaction.preparedTransaction,
                    internalTxId: expect.any(String),
                })
            )
            expect(store.setTransactionStatus).toHaveBeenCalledWith(
                pendingTransaction.id,
                'pending',
                { externalTxId: 'external-tx-1' }
            )
            expect(result).toEqual({
                status: 'pending',
                externalTxId: 'external-tx-1',
                partyId: wallet.partyId,
            })
        })

        it('polls the driver when an external transaction id already exists', async () => {
            const getTransaction = vi.fn().mockResolvedValue({
                status: 'signed',
                txId: 'external-tx-1',
                signature: 'bd-signature',
            })
            const store = createStore({
                ...pendingTransaction,
                externalTxId: 'external-tx-1',
            })
            const service = createService(
                store,
                {
                    [SigningProvider.BLOCKDAEMON]: createDriver({
                        getTransaction,
                    }),
                },
                notifier,
                logger
            )

            const result = await service.signWithBlockdaemon(
                userId,
                wallet,
                signParams
            )

            expect(getTransaction).toHaveBeenCalledWith({
                userId,
                txId: 'external-tx-1',
            })
            expect(store.setTransactionSigned).toHaveBeenCalledWith(
                pendingTransaction.id,
                expect.any(Date),
                'external-tx-1'
            )
            expect(result).toMatchObject({
                status: 'signed',
                signature: 'bd-signature',
                externalTxId: 'external-tx-1',
            })
        })
    })

    describe('signWithFireblocks', () => {
        it('returns a base64 signature when signing completes', async () => {
            const hexSignature = Buffer.from('fireblocks-signature').toString(
                'hex'
            )
            const signTransaction = vi.fn().mockResolvedValue({
                status: 'signed',
                txId: 'fb-tx-1',
                signature: hexSignature,
            })
            const store = createStore()
            const service = createService(
                store,
                {
                    [SigningProvider.FIREBLOCKS]: createDriver({
                        signTransaction,
                    }),
                },
                notifier,
                logger
            )

            const result = await service.signWithFireblocks(
                userId,
                wallet,
                signParams
            )

            expect(signTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    txHash: Buffer.from(
                        pendingTransaction.preparedTransactionHash,
                        'base64'
                    ).toString('hex'),
                })
            )
            expect(result).toMatchObject({
                status: 'signed',
                signature: Buffer.from(hexSignature, 'hex').toString('base64'),
                externalTxId: 'fb-tx-1',
            })
        })
    })

    describe('signWithDfns', () => {
        it('persists the update id as the signature when signing completes', async () => {
            const signTransaction = vi.fn().mockResolvedValue({
                status: 'signed',
                txId: 'dfns-tx-1',
                signature: 'update-id-123',
            })
            const store = createStore()
            const service = createService(
                store,
                {
                    [SigningProvider.DFNS]: createDriver({
                        signTransaction,
                    }),
                },
                notifier,
                logger
            )

            const result = await service.signWithDfns(
                userId,
                wallet,
                signParams
            )

            expect(result).toEqual({
                status: 'signed',
                signature: 'update-id-123',
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: 'dfns-tx-1',
            })
        })
    })

    describe('executeWithDfns', () => {
        it('marks the transaction executed using the external tx id', async () => {
            const signedTransaction: Transaction = {
                ...pendingTransaction,
                status: 'signed',
                externalTxId: 'dfns-update-id',
            }
            const store = createStore(signedTransaction)
            const service = createService(store, {}, notifier, logger)

            const result = await service.executeWithDfns(signedTransaction)

            expect(store.setTransactionStatus).toHaveBeenCalledWith(
                signedTransaction.id,
                'executed',
                { externalTxId: 'dfns-update-id' }
            )
            expect(emit).toHaveBeenCalledWith(
                'txChanged',
                expect.objectContaining({ status: 'executed' })
            )
            expect(result).toEqual({ updateId: 'dfns-update-id' })
        })

        it('throws when the transaction has no external tx id', async () => {
            const service = createService(createStore(), {}, notifier, logger)

            await expect(
                service.executeWithDfns(pendingTransaction)
            ).rejects.toThrow(
                'Cannot execute Dfns transaction without externalTxId from Dfns'
            )
        })
    })

    describe('executeWithParticipant', () => {
        it('submits the prepared transaction to the ledger', async () => {
            const store = createStore({
                ...pendingTransaction,
                payload: {
                    commandId: pendingTransaction.commandId,
                    commands: [],
                },
            })
            const postWithRetry = vi
                .fn()
                .mockResolvedValue({ updateId: 'ledger-update-1' })
            const ledgerClient = {
                postWithRetry,
                getSynchronizerId: vi.fn(),
            } as unknown as LedgerClient
            const service = createService(store, {}, notifier, logger)

            const result = await service.executeWithParticipant(
                userId,
                executeParams,
                {
                    ...pendingTransaction,
                    payload: {
                        commandId: pendingTransaction.commandId,
                        commands: [],
                    },
                },
                ledgerClient,
                network
            )

            expect(postWithRetry).toHaveBeenCalledWith(
                '/v2/commands/submit-and-wait',
                expect.objectContaining({
                    commandId: pendingTransaction.commandId,
                    userId,
                    synchronizerId: network.synchronizerId,
                })
            )
            expect(store.setTransactionStatus).toHaveBeenCalledWith(
                pendingTransaction.id,
                'executed',
                { payload: { updateId: 'ledger-update-1' } }
            )
            expect(result).toEqual({ updateId: 'ledger-update-1' })
        })
    })

    describe('executeWithExternal', () => {
        it('executes the prepared transaction with the provided signature', async () => {
            const store = createStore({
                ...pendingTransaction,
                status: 'signed',
            })
            const postWithRetry = vi
                .fn()
                .mockResolvedValue({ updateId: 'external-update-1' })
            const ledgerClient = {
                postWithRetry,
            } as unknown as LedgerClient
            const service = createService(store, {}, notifier, logger)

            const result = await service.executeWithExternal(
                userId,
                executeParams,
                {
                    ...pendingTransaction,
                    status: 'signed',
                },
                ledgerClient
            )

            expect(postWithRetry).toHaveBeenCalledWith(
                '/v2/interactive-submission/executeAndWait',
                expect.objectContaining({
                    userId,
                    preparedTransaction: pendingTransaction.preparedTransaction,
                    submissionId: pendingTransaction.commandId,
                    partySignatures: expect.objectContaining({
                        signatures: [
                            expect.objectContaining({
                                party: wallet.partyId,
                            }),
                        ],
                    }),
                })
            )
            expect(store.setTransactionStatus).toHaveBeenCalledWith(
                pendingTransaction.id,
                'executed',
                { payload: { updateId: 'external-update-1' } }
            )
            expect(result).toEqual({ updateId: 'external-update-1' })
        })
    })
})
