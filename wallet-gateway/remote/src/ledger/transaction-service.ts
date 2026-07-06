// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import { LedgerClient } from '@canton-network/core-ledger-client'
import {
    Store,
    Transaction,
    Wallet,
    Network,
} from '@canton-network/core-wallet-store'
import type { SignResult } from '../user-api/rpc-gen/typings.js'
import {
    Error as SigningError,
    GetTransactionResult,
    SigningProvider,
    SignTransactionResult,
} from '@canton-network/core-signing-lib'
import type { SigningDrivers } from '../signing/signing-drivers.js'
import {
    ExecuteParams,
    ExecuteResult,
    SignParams,
    SignResultSigned,
} from '../user-api/rpc-gen/typings.js'
import { UserId } from '../dapp-api/rpc-gen/typings.js'
import { Notifier } from '../notification/NotificationService.js'
import {
    ledgerPrepareParams,
    logDynamically,
    type PrepareParams,
} from '../utils.js'
import {
    AuthContext,
    AuthTokenProvider,
} from '@canton-network/core-wallet-auth'

export type SignAndExecuteResult = SignResult | ExecuteResult

function handleSigningError<T extends object>(result: SigningError | T): T {
    if ('error' in result) {
        throw new Error(
            `Error from signing driver: ${result.error_description}`
        )
    }
    return result
}

export class TransactionService {
    constructor(
        private store: Store,
        private logger: Logger,
        private signingDrivers: SigningDrivers = {},
        private notifier: Notifier
    ) {}

    public async sign(
        authContext: AuthContext,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider = wallet.signingProviderId as SigningProvider
        const driver = this.signingDrivers[signingProvider]?.controller(
            authContext.userId
        )
        if (!driver) {
            throw new Error(`No driver found for ${signingProvider}`)
        }

        switch (signingProvider) {
            case SigningProvider.PARTICIPANT: {
                return this.signWithParticipant(wallet)
            }
            case SigningProvider.WALLET_KERNEL: {
                return this.signWithWalletKernel(
                    authContext.userId,
                    wallet,
                    signParams
                )
            }
            case SigningProvider.BLOCKDAEMON: {
                if (!authContext.email) {
                    throw new Error(
                        'Email is required for Blockdaemon wallet allocation'
                    )
                }
                return this.signWithBlockdaemon(
                    authContext.email,
                    wallet,
                    signParams
                )
            }
            case SigningProvider.FIREBLOCKS: {
                return this.signWithFireblocks(
                    authContext.userId,
                    wallet,
                    signParams
                )
            }
            case SigningProvider.DFNS: {
                return this.signWithDfns(authContext.userId, wallet, signParams)
            }
            default:
                throw new Error(
                    `Unsupported signing provider: ${wallet.signingProviderId}`
                )
        }
    }

    public execute(
        userId: UserId,
        wallet: Wallet,
        transaction: Transaction,
        executeParams?: ExecuteParams,
        ledgerClient?: LedgerClient,
        network?: Network
    ): Promise<ExecuteResult> {
        if (transaction.status === 'executed') {
            throw new Error('Transaction is already executed.')
        }

        switch (wallet.signingProviderId) {
            case SigningProvider.PARTICIPANT: {
                try {
                    if (!executeParams) {
                        throw new Error(
                            'Execute params are required for participant signing'
                        )
                    }
                    if (!ledgerClient) {
                        throw new Error(
                            'Ledger client is required for participant signing'
                        )
                    }
                    if (!network) {
                        throw new Error(
                            'Network is required for participant signing'
                        )
                    }
                    return this.executeWithParticipant(
                        userId,
                        executeParams,
                        transaction,
                        ledgerClient,
                        network
                    )
                } catch (error) {
                    this.logger.error(error, 'Failed to submit transaction')
                    throw error
                }
            }
            case SigningProvider.WALLET_KERNEL:
            case SigningProvider.BLOCKDAEMON:
            case SigningProvider.FIREBLOCKS: {
                if (!executeParams) {
                    throw new Error(
                        'Execute params are required for external signing'
                    )
                }
                if (!ledgerClient) {
                    throw new Error(
                        'Ledger client is required for external signing'
                    )
                }
                return this.executeWithExternal(
                    userId,
                    executeParams,
                    transaction,
                    ledgerClient
                )
            }
            case SigningProvider.DFNS: {
                return this.executeWithDfns(transaction)
            }
            default:
                throw new Error(
                    `Unsupported signing provider: ${wallet.signingProviderId}`
                )
        }
    }

    public async signAndExecute(
        authContext: AuthContext,
        network: Network,
        wallet: Wallet,
        transaction: Transaction
    ): Promise<SignAndExecuteResult> {
        const signParams: SignParams = {
            transactionId: transaction.id,
            partyId: wallet.partyId,
        }

        const signResult = await this.sign(authContext, wallet, signParams)

        if (signResult.status === 'pending') {
            return signResult
        }

        if (signResult.status !== 'signed') {
            throw new Error(
                `Service account signing failed with status: ${signResult.status}`
            )
        }

        if (
            !('signature' in signResult) ||
            signResult.signature === undefined
        ) {
            throw new Error(
                'Service account signing did not return a signature'
            )
        }

        const ledgerClient = new LedgerClient({
            baseUrl: new URL(network.ledgerApi.baseUrl),
            logger: this.logger,
            accessTokenProvider: AuthTokenProvider.fromToken(
                authContext.accessToken,
                this.logger
            ),
        })

        const executeParams: ExecuteParams = {
            transactionId: transaction.id,
            partyId: wallet.partyId,
            signature: signResult.signature,
            signedBy: signResult.signedBy,
        }

        const userId = authContext.isApiKey
            ? authContext.ledgerUserId
            : authContext.userId

        return this.execute(
            userId,
            wallet,
            transaction,
            executeParams,
            ledgerClient,
            network
        )
    }

    private async loadPreparedTransactionForSigning(
        transactionId: Transaction['id']
    ): Promise<Transaction> {
        const existingTx = await this.store.getTransaction(transactionId)

        if (!existingTx) {
            throw new Error(`Transaction not found with id: ${transactionId}`)
        }

        if (existingTx.status !== 'pending') {
            throw new Error(
                `Cannot sign an already ${existingTx.status} transaction`
            )
        }

        return existingTx
    }

    private signWithParticipant(wallet: Wallet): SignResultSigned {
        return {
            status: 'signed',
            signature: 'none',
            signedBy: wallet.namespace,
            partyId: wallet.partyId,
        }
    }

    private async signWithWalletKernel(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResultSigned> {
        const signingProvider =
            this.signingDrivers[SigningProvider.WALLET_KERNEL]
        if (!signingProvider) {
            throw new Error('Wallet Gateway signing driver not available')
        }
        const driver = signingProvider.controller(userId)

        const tx = await this.loadPreparedTransactionForSigning(
            signParams.transactionId
        )
        const { signature } = await driver
            .signTransaction({
                tx: tx.preparedTransaction,
                txHash: tx.preparedTransactionHash,
                keyIdentifier: {
                    publicKey: wallet.publicKey,
                },
            })
            .then(handleSigningError)

        if (!signature) {
            throw new Error(
                'Failed to sign transaction: ' + JSON.stringify(signature)
            )
        }

        const now = new Date()

        const signedTx: Transaction = {
            id: tx.id,
            commandId: tx.commandId,
            status: 'signed',
            preparedTransaction: tx.preparedTransaction,
            preparedTransactionHash: tx.preparedTransactionHash,
            origin: tx?.origin ?? null,
            ...(tx?.createdAt && {
                createdAt: tx.createdAt,
            }),
            signedAt: now,
        }

        await this.store.setTransactionSigned(tx.id, now)
        this.notifier.emit('txChanged', signedTx)

        return {
            status: 'signed',
            signature,
            signedBy: wallet.namespace,
            partyId: wallet.partyId,
        }
    }

    private async signWithBlockdaemon(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider = this.signingDrivers[SigningProvider.BLOCKDAEMON]
        if (!signingProvider) {
            throw new Error('Blockdaemon signing driver not available')
        }
        const driver = signingProvider.controller(userId)

        const tx = await this.loadPreparedTransactionForSigning(
            signParams.transactionId
        )

        let signingResult: Exclude<
            GetTransactionResult | SignTransactionResult,
            SigningError
        >
        if (tx.externalTxId) {
            signingResult = await driver
                .getTransaction({
                    userId,
                    txId: tx.externalTxId,
                })
                .then(handleSigningError)
        } else {
            const internalTxId = crypto
                .randomUUID()
                .replace(/-/g, '')
                .substring(0, 16)
            signingResult = await driver
                .signTransaction({
                    tx: tx.preparedTransaction,
                    txHash: tx.preparedTransactionHash,
                    keyIdentifier: {
                        publicKey: wallet.publicKey,
                    },
                    internalTxId,
                })
                .then(handleSigningError)
        }

        const now = new Date()

        logDynamically(this.logger, 'Blockdaemon signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error('No signature returned from signing driver')
            }

            const signedTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status: signingResult.status,
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && {
                    createdAt: tx.createdAt,
                }),
                signedAt: now,
                externalTxId: signingResult.txId,
            }

            await this.store.setTransactionSigned(
                tx.id,
                now,
                signingResult.txId
            )
            this.notifier.emit('txChanged', signedTx)

            return {
                status: signingResult.status,
                signature: signingResult.signature,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        } else {
            const status =
                signingResult.status === 'pending' ? 'pending' : 'failed'
            const pendingTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status,
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                externalTxId: signingResult.txId,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && {
                    createdAt: tx.createdAt,
                }),
            }

            await this.store.setTransactionStatus(tx.id, status, {
                externalTxId: signingResult.txId,
            })

            this.notifier.emit('txChanged', pendingTx)

            return {
                status: signingResult.status,
                externalTxId: signingResult.txId,
                partyId: wallet.partyId,
            }
        }
    }

    private async signWithFireblocks(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider = this.signingDrivers[SigningProvider.FIREBLOCKS]
        if (!signingProvider) {
            throw new Error('Fireblocks signing driver not available')
        }
        const driver = signingProvider.controller(userId)

        const tx = await this.loadPreparedTransactionForSigning(
            signParams.transactionId
        )
        let signingResult: Exclude<
            GetTransactionResult | SignTransactionResult,
            SigningError
        >

        if (tx.externalTxId) {
            signingResult = await driver
                .getTransaction({
                    userId,
                    txId: tx.externalTxId,
                })
                .then(handleSigningError)
        } else {
            signingResult = await driver
                .signTransaction({
                    userId,
                    tx: tx.preparedTransaction,
                    txHash: Buffer.from(
                        tx.preparedTransactionHash,
                        'base64'
                    ).toString('hex'),
                    keyIdentifier: {
                        publicKey: wallet.publicKey,
                    },
                })
                .then(handleSigningError)
        }

        const now = new Date()

        logDynamically(this.logger, 'Fireblocks signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error('No signature returned from signing driver')
            }

            const signedTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status: signingResult.status,
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && {
                    createdAt: tx.createdAt,
                }),
                signedAt: now,
                externalTxId: signingResult.txId,
            }

            await this.store.setTransactionSigned(
                tx.id,
                now,
                signingResult.txId
            )
            this.notifier.emit('txChanged', signedTx)

            // return signature in format that is already usable in execute
            const decodedSignature = Buffer.from(
                signingResult.signature,
                'hex'
            ).toString('base64')

            return {
                status: signingResult.status,
                signature: decodedSignature,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        } else {
            const status =
                signingResult.status === 'pending' ? 'pending' : 'failed'
            const pendingTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status,
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                externalTxId: signingResult.txId,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && {
                    createdAt: tx.createdAt,
                }),
            }

            await this.store.setTransactionStatus(tx.id, status, {
                externalTxId: signingResult.txId,
            })
            this.notifier.emit('txChanged', pendingTx)

            return {
                status: signingResult.status,
                externalTxId: signingResult.txId,
                partyId: wallet.partyId,
            }
        }
    }

    /**
     * Dfns broadcasts the prepared transaction to Canton itself, so we get back
     * an updateId rather than a raw signature. We persist the updateId as the
     * signature payload (the controller short-circuits Dfns execute) and surface
     * the same SignResult shape the other external providers use.
     */
    private async signWithDfns(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider = this.signingDrivers[SigningProvider.DFNS]
        if (!signingProvider) {
            throw new Error('Dfns signing driver not available')
        }
        const driver = signingProvider.controller(userId)

        const tx = await this.loadPreparedTransactionForSigning(
            signParams.transactionId
        )

        let signingResult: Exclude<
            GetTransactionResult | SignTransactionResult,
            SigningError
        >
        if (tx.externalTxId) {
            signingResult = await driver
                .getTransaction({
                    userId,
                    txId: tx.externalTxId,
                })
                .then(handleSigningError)
        } else {
            signingResult = await driver
                .signTransaction({
                    tx: tx.preparedTransaction,
                    txHash: tx.preparedTransactionHash,
                    keyIdentifier: {
                        publicKey: wallet.publicKey,
                    },
                })
                .then(handleSigningError)
        }

        const now = new Date()

        logDynamically(this.logger, 'Dfns signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error('No updateId returned from Dfns')
            }

            const signedTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status: signingResult.status,
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && {
                    createdAt: tx.createdAt,
                }),
                signedAt: now,
                externalTxId: signingResult.txId,
            }

            await this.store.setTransactionSigned(
                tx.id,
                now,
                signingResult.txId
            )
            this.notifier.emit('txChanged', signedTx)

            return {
                status: signingResult.status,
                signature: signingResult.signature,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        } else {
            const status =
                signingResult.status === 'pending' ? 'pending' : 'failed'
            const pendingTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status,
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                externalTxId: signingResult.txId,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && {
                    createdAt: tx.createdAt,
                }),
            }

            await this.store.setTransactionStatus(tx.id, status, {
                externalTxId: signingResult.txId,
            })
            this.notifier.emit('txChanged', pendingTx)

            return {
                status: signingResult.status,
                externalTxId: signingResult.txId,
                partyId: wallet.partyId,
            }
        }
    }

    /**
     * Dfns has already broadcast the transaction at sign-time, so execute is a
     * state reconciliation: mark the stored transaction as executed and return
     * the updateId Dfns gave us. We deliberately don't post to the ledger here.
     */
    private async executeWithDfns(
        transaction: Transaction
    ): Promise<ExecuteResult> {
        if (!transaction.externalTxId) {
            throw new Error(
                'Cannot execute Dfns transaction without externalTxId from Dfns'
            )
        }

        const executedTx: Transaction = {
            id: transaction.id,
            commandId: transaction.commandId,
            status: 'executed',
            preparedTransaction: transaction.preparedTransaction,
            preparedTransactionHash: transaction.preparedTransactionHash,
            origin: transaction.origin ?? null,
            ...(transaction.createdAt && {
                createdAt: transaction.createdAt,
            }),
            ...(transaction.signedAt && {
                signedAt: transaction.signedAt,
            }),
            externalTxId: transaction.externalTxId,
        }
        await this.store.setTransactionStatus(transaction.id, 'executed', {
            externalTxId: transaction.externalTxId,
        })
        this.notifier.emit('txChanged', executedTx)

        return { updateId: transaction.externalTxId }
    }

    private async executeWithParticipant(
        userId: UserId,
        executeParams: ExecuteParams,
        transaction: Transaction,
        ledgerClient: LedgerClient,
        network: Network
    ): Promise<ExecuteResult> {
        const { partyId } = executeParams
        const { commandId } = transaction

        const synchronizerId =
            network.synchronizerId ?? (await ledgerClient.getSynchronizerId())

        const prep = ledgerPrepareParams(
            userId,
            [partyId],
            synchronizerId,
            transaction.payload as PrepareParams
        )
        const result = await ledgerClient.postWithRetry(
            '/v2/commands/submit-and-wait',
            prep
        )

        logDynamically(this.logger, 'Participant execution result', {
            info: { transactionId: transaction.id },
            debug: { result, transaction, executeParams, userId },
        })

        const executedTx: Transaction = {
            id: transaction.id,
            commandId,
            status: 'executed',
            preparedTransaction: transaction.preparedTransaction,
            preparedTransactionHash: transaction.preparedTransactionHash,
            payload: result,
            origin: transaction.origin ?? null,
            ...(transaction.createdAt && {
                createdAt: transaction.createdAt,
            }),
            ...(transaction.signedAt && {
                signedAt: transaction.signedAt,
            }),
        }
        await this.store.setTransactionStatus(transaction.id, 'executed', {
            payload: result,
        })
        this.notifier.emit('txChanged', executedTx)

        return result
    }

    private async executeWithExternal(
        userId: UserId,
        executeParams: ExecuteParams,
        transaction: Transaction,
        ledgerClient: LedgerClient
    ): Promise<ExecuteResult> {
        const { partyId, signature, signedBy } = executeParams
        const { commandId } = transaction

        const result = await ledgerClient.postWithRetry(
            '/v2/interactive-submission/executeAndWait',
            {
                userId,
                preparedTransaction: transaction.preparedTransaction,
                hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V2',
                submissionId: commandId,
                deduplicationPeriod: {
                    Empty: {},
                },
                partySignatures: {
                    signatures: [
                        {
                            party: partyId,
                            signatures: [
                                {
                                    signature,
                                    signedBy,
                                    format: 'SIGNATURE_FORMAT_CONCAT',
                                    signingAlgorithmSpec:
                                        'SIGNING_ALGORITHM_SPEC_ED25519',
                                },
                            ],
                        },
                    ],
                },
            }
        )

        logDynamically(this.logger, 'Externally signed execution result', {
            info: { transactionId: transaction.id },
            debug: { result, transaction, executeParams, userId },
        })

        const executedTx: Transaction = {
            id: transaction.id,
            commandId,
            status: 'executed',
            preparedTransaction: transaction.preparedTransaction,
            preparedTransactionHash: transaction.preparedTransactionHash,
            payload: result,
            origin: transaction.origin ?? null,
            ...(transaction.createdAt && {
                createdAt: transaction.createdAt,
            }),
            ...(transaction.signedAt && {
                signedAt: transaction.signedAt,
            }),
        }
        await this.store.setTransactionStatus(transaction.id, 'executed', {
            payload: result,
        })
        this.notifier.emit('txChanged', executedTx)

        return result
    }
}
