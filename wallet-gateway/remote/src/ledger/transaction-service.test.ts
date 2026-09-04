// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { sink } from 'pino-test'
import type { Logger } from 'pino'
import type { LedgerClient } from '@canton-network/core-ledger-client'
import type { AuthContext } from '@canton-network/core-wallet-auth'
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

const authContext: AuthContext = {
    userId: 'user-1',
    accessToken: 'access-token-1',
}

const authContextWithEmail: AuthContext = {
    ...authContext,
    email: 'user@example.com',
}

const wallet: Wallet = {
    primary: true,
    partyId: 'party::namespace',
    status: 'allocated',
    hint: 'party',
    signingProviderId: SigningProvider.WALLET_KERNEL,
    publicKey: 'wallet-public-key',
    namespace: 'namespace',
    userId: 'user-1',
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

const awaitingTransaction: Transaction = {
    ...pendingTransaction,
    status: 'awaiting-signature',
    externalTxId: 'external-tx-1',
}

const signedWithExternal: Transaction = {
    ...pendingTransaction,
    status: 'signed',
    externalTxId: 'external-tx-1',
    signedAt: new Date('2026-01-01T00:00:00.000Z'),
}

const signedTransaction: Transaction = {
    ...pendingTransaction,
    status: 'signed',
    signedAt: new Date('2026-01-01T00:01:00.000Z'),
}

const executedTransaction: Transaction = {
    ...pendingTransaction,
    status: 'executed',
}

const signParams = {
    transactionId: pendingTransaction.id,
    partyId: wallet.partyId,
}

const executeParams = {
    transactionId: pendingTransaction.id,
    partyId: wallet.partyId,
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

function walletWithProvider(signingProviderId: SigningProvider): Wallet {
    return { ...wallet, signingProviderId }
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
    transaction: Transaction | undefined = pendingTransaction,
    ...subsequent: Array<Transaction | undefined>
): Store & {
    getTransaction: ReturnType<typeof vi.fn>
    setTransactionSigned: ReturnType<typeof vi.fn>
    setTransactionStatus: ReturnType<typeof vi.fn>
} {
    const getTransaction = vi.fn().mockResolvedValue(transaction)
    for (const tx of subsequent) {
        getTransaction.mockResolvedValueOnce(tx)
    }
    if (subsequent.length > 0) {
        getTransaction.mockReset()
        getTransaction.mockResolvedValue(subsequent[subsequent.length - 1])
        getTransaction.mockResolvedValueOnce(transaction)
        for (const tx of subsequent) {
            getTransaction.mockResolvedValueOnce(tx)
        }
    }
    return {
        getTransaction,
        setTransactionSigned: vi.fn().mockResolvedValue(true),
        setTransactionStatus: vi.fn().mockResolvedValue(true),
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
    return new TransactionService(
        store,
        logger,
        drivers,
        notifier,
        'HASHING_SCHEME_VERSION_V3'
    )
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

    describe('sign', () => {
        describe('participant', () => {
            it('returns a signed result and persists signed status', async () => {
                const store = createStore()
                const service = createService(
                    store,
                    {
                        [SigningProvider.PARTICIPANT]: createDriver({}),
                    },
                    notifier,
                    logger
                )
                const participantWallet = walletWithProvider(
                    SigningProvider.PARTICIPANT
                )

                const result = await service.sign(
                    authContext,
                    participantWallet,
                    signParams
                )

                expect(result).toEqual({
                    status: 'signed',
                    signature: 'none',
                    signedBy: wallet.namespace,
                    partyId: wallet.partyId,
                })
                expect(store.getTransaction).toHaveBeenCalledWith(
                    pendingTransaction.id
                )
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
            })
        })

        describe('wallet-kernel', () => {
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

                const result = await service.sign(
                    authContext,
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
                const service = createService(
                    createStore(),
                    {},
                    notifier,
                    logger
                )

                await expect(
                    service.sign(authContext, wallet, signParams)
                ).rejects.toThrow('No driver found for wallet-kernel')
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
                    service.sign(authContext, wallet, signParams)
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
                    service.sign(authContext, wallet, signParams)
                ).rejects.toThrow('Error from signing driver: Signing rejected')
            })
        })

        describe('blockdaemon', () => {
            const blockdaemonWallet = walletWithProvider(
                SigningProvider.BLOCKDAEMON
            )

            it('throws when email is missing from auth context', async () => {
                const service = createService(
                    createStore(),
                    {
                        [SigningProvider.BLOCKDAEMON]: createDriver({}),
                    },
                    notifier,
                    logger
                )

                await expect(
                    service.sign(authContext, blockdaemonWallet, signParams)
                ).rejects.toThrow(
                    'Email is required for Blockdaemon wallet allocation'
                )
            })

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

                const result = await service.sign(
                    authContextWithEmail,
                    blockdaemonWallet,
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
                    'awaiting-signature',
                    { externalTxId: 'external-tx-1' }
                )
                expect(result).toEqual({
                    status: 'pending',
                    externalTxId: 'external-tx-1',
                    partyId: wallet.partyId,
                })
            })

            it('polls the provider and persists signed status', async () => {
                const getTransaction = vi.fn().mockResolvedValue({
                    status: 'signed',
                    txId: 'external-tx-1',
                    signature: 'bd-signature',
                })
                const store = createStore(awaitingTransaction)
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

                const result = await service.refreshTransaction(
                    authContextWithEmail,
                    blockdaemonWallet,
                    pendingTransaction.id
                )

                //TODO: check if it works with userId and not email for bd
                expect(getTransaction).toHaveBeenCalledWith({
                    userId: authContextWithEmail.userId,
                    txId: 'external-tx-1',
                })

                expect(store.setTransactionSigned).toHaveBeenCalledWith(
                    pendingTransaction.id,
                    expect.any(Date),
                    'external-tx-1',
                    { expectedStatus: 'awaiting-signature' }
                )
                expect(result).toMatchObject({
                    status: 'signed',
                    externalTxId: 'external-tx-1',
                })
            })
        })

        describe('fireblocks', () => {
            it('returns a base64 signature when signing completes', async () => {
                const hexSignature = Buffer.from(
                    'fireblocks-signature'
                ).toString('hex')
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

                const result = await service.sign(
                    authContext,
                    walletWithProvider(SigningProvider.FIREBLOCKS),
                    signParams
                )

                expect(signTransaction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: authContext.userId,
                        txHash: Buffer.from(
                            pendingTransaction.preparedTransactionHash,
                            'base64'
                        ).toString('hex'),
                    })
                )
                expect(result).toMatchObject({
                    status: 'signed',
                    signature: Buffer.from(hexSignature, 'hex').toString(
                        'base64'
                    ),
                    externalTxId: 'fb-tx-1',
                })
            })
        })

        describe('dfns', () => {
            it('returns the driver signature when signing completes', async () => {
                const signTransaction = vi.fn().mockResolvedValue({
                    status: 'signed',
                    txId: 'dfns-tx-1',
                    signature: 'dfns-signature',
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

                const result = await service.sign(
                    authContext,
                    walletWithProvider(SigningProvider.DFNS),
                    signParams
                )

                expect(result).toEqual({
                    status: 'signed',
                    signature: 'dfns-signature',
                    signedBy: wallet.namespace,
                    partyId: wallet.partyId,
                    externalTxId: 'dfns-tx-1',
                })
            })
        })

        describe('securosys', () => {
            it('starts signing and persists the TSB request id when signing is pending', async () => {
                const signTransaction = vi.fn().mockResolvedValue({
                    status: 'pending',
                    txId: 'tsb-request-1',
                })
                const store = createStore()
                const service = createService(
                    store,
                    {
                        [SigningProvider.SECUROSYS]: createDriver({
                            signTransaction,
                        }),
                    },
                    notifier,
                    logger
                )

                const result = await service.sign(
                    authContext,
                    walletWithProvider(SigningProvider.SECUROSYS),
                    signParams
                )

                expect(signTransaction).toHaveBeenCalledWith({
                    tx: pendingTransaction.preparedTransaction,
                    txHash: pendingTransaction.preparedTransactionHash,
                    keyIdentifier: {
                        id: wallet.publicKey,
                        publicKey: wallet.publicKey,
                    },
                })
                expect(store.setTransactionStatus).toHaveBeenCalledWith(
                    pendingTransaction.id,
                    'awaiting-signature',
                    { externalTxId: 'tsb-request-1' }
                )
                expect(result).toEqual({
                    status: 'pending',
                    externalTxId: 'tsb-request-1',
                    partyId: wallet.partyId,
                })
            })
        })

        describe('bitgo', () => {
            it('returns the driver signature when signing completes', async () => {
                const signTransaction = vi.fn().mockResolvedValue({
                    status: 'signed',
                    txId: 'bitgo-tx-1',
                    signature: 'bitgo-signature',
                })
                const store = createStore()
                const service = createService(
                    store,
                    {
                        [SigningProvider.BITGO]: createDriver({
                            signTransaction,
                        }),
                    },
                    notifier,
                    logger
                )

                const result = await service.sign(
                    authContext,
                    walletWithProvider(SigningProvider.BITGO),
                    signParams
                )

                expect(result).toEqual({
                    status: 'signed',
                    signature: 'bitgo-signature',
                    signedBy: wallet.namespace,
                    partyId: wallet.partyId,
                    externalTxId: 'bitgo-tx-1',
                })
            })

            it('returns pending status when signing is in progress', async () => {
                const signTransaction = vi.fn().mockResolvedValue({
                    status: 'pending',
                    txId: 'bitgo-tx-1',
                })
                const store = createStore()
                const service = createService(
                    store,
                    {
                        [SigningProvider.BITGO]: createDriver({
                            signTransaction,
                        }),
                    },
                    notifier,
                    logger
                )

                const result = await service.sign(
                    authContext,
                    walletWithProvider(SigningProvider.BITGO),
                    signParams
                )

                expect(result).toEqual({
                    status: 'pending',
                    externalTxId: 'bitgo-tx-1',
                    partyId: wallet.partyId,
                })
                expect(store.setTransactionStatus).toHaveBeenCalledWith(
                    pendingTransaction.id,
                    'awaiting-signature',
                    { externalTxId: 'bitgo-tx-1' }
                )
            })

            it('polls getTransaction when externalTxId is already set', async () => {
                const getTransaction = vi.fn().mockResolvedValue({
                    status: 'signed',
                    txId: 'bitgo-tx-1',
                    signature: 'bitgo-signature',
                })
                const store = createStore({
                    ...awaitingTransaction,
                    externalTxId: 'bitgo-tx-1',
                })
                const service = createService(
                    store,
                    {
                        [SigningProvider.BITGO]: createDriver({
                            getTransaction,
                        }),
                    },
                    notifier,
                    logger
                )

                const result = await service.refreshTransaction(
                    authContext,
                    walletWithProvider(SigningProvider.BITGO),
                    'bitgo-tx-1'
                )

                expect(getTransaction).toHaveBeenCalledWith(
                    expect.objectContaining({ txId: 'bitgo-tx-1' })
                )

                expect(result).toEqual({
                    status: 'signed',
                    externalTxId: 'bitgo-tx-1',
                })
            })

            it('throws when BitGo signing driver is not available', async () => {
                const service = createService(
                    createStore(),
                    {},
                    notifier,
                    logger
                )
                await expect(
                    service.sign(
                        authContext,
                        walletWithProvider(SigningProvider.BITGO),
                        signParams
                    )
                ).rejects.toThrow('No driver found for bitgo')
            })
        })

        it.each([
            {
                name: 'participant',
                provider: SigningProvider.PARTICIPANT,
                auth: authContext,
            },
            {
                name: 'wallet-kernel',
                provider: SigningProvider.WALLET_KERNEL,
                auth: authContext,
            },
            {
                name: 'blockdaemon',
                provider: SigningProvider.BLOCKDAEMON,
                auth: authContextWithEmail,
            },
            {
                name: 'fireblocks',
                provider: SigningProvider.FIREBLOCKS,
                auth: authContext,
            },
            {
                name: 'dfns',
                provider: SigningProvider.DFNS,
                auth: authContext,
            },
            {
                name: 'securosys',
                provider: SigningProvider.SECUROSYS,
                auth: authContext,
            },
            {
                name: 'bitgo',
                provider: SigningProvider.BITGO,
                auth: authContext,
            },
        ])(
            'rejects signing an already executed transaction for $name',
            async ({ provider, auth }) => {
                const store = createStore(executedTransaction)
                const service = createService(
                    store,
                    {
                        [provider]: createDriver({}),
                    },
                    notifier,
                    logger
                )
                const providerWallet = walletWithProvider(provider)

                await expect(
                    service.sign(auth, providerWallet, signParams)
                ).rejects.toThrow('Cannot sign an already executed transaction')
                expect(store.setTransactionSigned).not.toHaveBeenCalled()
                expect(store.setTransactionStatus).not.toHaveBeenCalled()
            }
        )
    })

    describe('execute', () => {
        // it.each(['pending', 'failed', 'executed'] as const)(
        //     'throws when execute is called for a %s transaction',
        //     async (status) => {
        //         const service = createService(
        //             createStore(),
        //             {},
        //             notifier,
        //             logger
        //         )
        //         const transaction = {
        //             ...pendingTransaction,
        //             status,
        //         }

        //         expect(() =>
        //             service.execute(
        //                 authContext.userId,
        //                 wallet,
        //                 transaction,
        //                 executeParams
        //             )
        //         ).toThrow(
        //             `Cannot execute a ${status} transaction. Expected status: signed.`
        //         )
        //     }
        // )

        describe('participant', () => {
            it('submits the prepared transaction to the ledger', async () => {
                const participantWallet = walletWithProvider(
                    SigningProvider.PARTICIPANT
                )
                const transaction = {
                    ...signedTransaction,
                    payload: {
                        commandId: pendingTransaction.commandId,
                        commands: [],
                    },
                }
                const store = createStore(transaction)
                const postWithRetry = vi
                    .fn()
                    .mockResolvedValue({ updateId: 'ledger-update-1' })
                const ledgerClient = {
                    postWithRetry,
                    getSynchronizerId: vi.fn(),
                } as unknown as LedgerClient
                const service = createService(store, {}, notifier, logger)

                const result = await service.execute(
                    authContext.userId,
                    participantWallet,
                    transaction,
                    executeParams,
                    ledgerClient,
                    network
                )

                expect(postWithRetry).toHaveBeenCalledWith(
                    '/v2/commands/submit-and-wait',
                    expect.objectContaining({
                        commandId: pendingTransaction.commandId,
                        userId: authContext.userId,
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

        describe('external signing providers', () => {
            it.each([
                // SigningProvider.WALLET_KERNEL,
                SigningProvider.BLOCKDAEMON,
                SigningProvider.FIREBLOCKS,
                SigningProvider.DFNS,
                SigningProvider.SECUROSYS,
            ])(
                'executes with the provided signature for %s',
                async (signingProviderId) => {
                    const getTransaction = vi.fn().mockResolvedValue({
                        status: 'signed',
                        signature: 'sig',
                    })

                    const store = createStore(signedWithExternal)

                    const service = createService(
                        store,
                        {
                            [signingProviderId]: createDriver({
                                getTransaction,
                            }),
                        },
                        notifier,
                        logger
                    )

                    const postWithRetry = vi
                        .fn()
                        .mockResolvedValue({ updateId: 'external-update-1' })

                    const result = await service.execute(
                        authContext.userId,
                        walletWithProvider(signingProviderId),
                        signedWithExternal,
                        executeParams,
                        { postWithRetry } as unknown as LedgerClient,
                        network
                    )

                    expect(postWithRetry).toHaveBeenCalledWith(
                        '/v2/interactive-submission/executeAndWait',
                        expect.objectContaining({
                            userId: authContext.userId,
                            preparedTransaction:
                                pendingTransaction.preparedTransaction,
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
                }
            )
        })

        // describe('signAndExecute', () => {
        //     const participantWallet = walletWithProvider(
        //         SigningProvider.PARTICIPANT
        //     )

        //     it('signs and executes when signing completes synchronously', async () => {
        //         const service = createService(createStore(), {}, notifier, logger)
        //         const executeSpy = vi
        //             .spyOn(service, 'execute')
        //             .mockResolvedValue({ commandId: 'cmd-1' })
        //         vi.spyOn(service, 'sign').mockResolvedValue({
        //             status: 'signed',
        //             signature: 'sig',
        //             signedBy: 'namespace',
        //             partyId: participantWallet.partyId,
        //         })

        //         const result = await service.signAndExecute(
        //             authContext,
        //             network,
        //             participantWallet,
        //             pendingTransaction
        //         )

        //         expect(result).toEqual({ commandId: 'cmd-1' })
        //         expect(executeSpy).toHaveBeenCalled()
        //     })

        //     it('returns pending sign result without executing', async () => {
        //         const service = createService(createStore(), {}, notifier, logger)
        //         const executeSpy = vi.spyOn(service, 'execute')
        //         vi.spyOn(service, 'sign').mockResolvedValue({
        //             status: 'pending',
        //             externalTxId: 'ext-1',
        //             partyId: participantWallet.partyId,
        //         })

        //         const result = await service.signAndExecute(
        //             authContext,
        //             network,
        //             participantWallet,
        //             pendingTransaction
        //         )

        //         expect(result).toEqual({
        //             status: 'pending',
        //             externalTxId: 'ext-1',
        //             partyId: participantWallet.partyId,
        //         })
        //         expect(executeSpy).not.toHaveBeenCalled()
        //     })
    })
})
