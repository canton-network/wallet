// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import { LedgerClient, Types } from '@canton-network/core-ledger-client'
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
import { keyLabelFromPublicKey } from '@canton-network/core-signing-securosys'

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
                return this.signWithParticipant(wallet, signParams)
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
            case SigningProvider.SECUROSYS: {
                return this.signWithSecurosys(
                    authContext.userId,
                    wallet,
                    signParams
                )
            }
            case SigningProvider.BITGO: {
                return this.signWithBitgo(
                    authContext.userId,
                    wallet,
                    signParams
                )
            }
            case SigningProvider.TAURUS_PROTECT: {
                return this.signWithTaurusProtect(
                    authContext.userId,
                    wallet,
                    signParams
                )
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
        if (transaction.status !== 'signed') {
            throw new Error(
                `Cannot execute a ${transaction.status} transaction. Expected status: signed.`
            )
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
            case SigningProvider.FIREBLOCKS:
            case SigningProvider.DFNS:
            case SigningProvider.SECUROSYS:
            case SigningProvider.BITGO: {
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
            case SigningProvider.TAURUS_PROTECT: {
                return this.executeWithSubmitProvider(userId, transaction)
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
            { ...transaction, status: 'signed' as const },
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

    // This doesn't really sign the transaction.
    // For participant both signing and execution are handled by /v2/commands/submit-and-wait using participant keys
    // This behavior is unique to signing provider participant.
    // This step intended for making participant wallets conform to a common API.
    private async signWithParticipant(
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResultSigned> {
        const tx = await this.loadPreparedTransactionForSigning(
            signParams.transactionId
        )
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
                throw new Error(
                    'No signature returned from Dfns signing driver'
                )
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

    private async signWithSecurosys(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider = this.signingDrivers[SigningProvider.SECUROSYS]
        if (!signingProvider) {
            throw new Error('Securosys signing driver not available')
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
                    txId: tx.externalTxId,
                })
                .then(handleSigningError)
        } else {
            signingResult = await driver
                .signTransaction({
                    tx: tx.preparedTransaction,
                    txHash: tx.preparedTransactionHash,
                    keyIdentifier: {
                        id: keyLabelFromPublicKey(wallet.publicKey),
                        publicKey: wallet.publicKey,
                    },
                })
                .then(handleSigningError)
        }

        const now = new Date()

        logDynamically(this.logger, 'Securosys signing result', {
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

    private async signWithBitgo(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider = this.signingDrivers[SigningProvider.BITGO]
        if (!signingProvider) {
            throw new Error('BitGo signing driver not available')
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

        logDynamically(this.logger, 'BitGo signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error(
                    'No signature returned from BitGo signing driver'
                )
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

    /** Gateway signs and submits the CIP-103 command; forward on first call, re-poll after, terminal only once `executed` carries the updateId. */
    private async signWithTaurusProtect(
        userId: UserId,
        wallet: Wallet,
        signParams: SignParams
    ): Promise<SignResult> {
        const signingProvider =
            this.signingDrivers[SigningProvider.TAURUS_PROTECT]
        if (!signingProvider) {
            throw new Error('Taurus-PROTECT signing driver not available')
        }
        const driver = signingProvider.controller(userId)

        const tx = await this.loadPreparedTransactionForSigning(
            signParams.transactionId
        )

        let signingResult: Exclude<
            GetTransactionResult | SignTransactionResult,
            SigningError
        >
        let requestId: string
        if (tx.externalTxId) {
            // Already submitted — re-poll (requestId lets the RPC fallback work after restart).
            signingResult = await driver
                .getTransaction({
                    txId: tx.commandId,
                    requestId: tx.externalTxId,
                })
                .then(handleSigningError)
            requestId = tx.externalTxId
        } else {
            // Only what the gateway consumes; disclosedContracts, readAs and
            // packageIdSelectionPreference are inert there and already ride
            // inside the prepared transaction.
            const payload = (tx.payload ?? {}) as PrepareParams
            const command = JSON.stringify({
                commands: payload.commands,
                actAs: payload.actAs?.length ? payload.actAs : [wallet.partyId],
                commandId: tx.commandId,
                preparedTransaction: tx.preparedTransaction,
            })
            signingResult = await driver
                .signTransaction({
                    tx: command,
                    txHash: tx.preparedTransactionHash,
                    keyIdentifier: {
                        id: wallet.partyId,
                        publicKey: wallet.publicKey,
                    },
                })
                .then(handleSigningError)
            // txId is the commandId here; persisting it would strand the row.
            const returned = signingResult.metadata?.requestId as
                string | undefined
            if (!returned) {
                throw new Error(
                    'Taurus-PROTECT gateway accepted the command without returning a requestId'
                )
            }
            requestId = returned
        }

        const gatewayStatus =
            (signingResult.metadata?.gatewayStatus as string | undefined) ??
            signingResult.status
        // Only a real ledger updateId; the requestId is not one, and the
        // gateway can report `executed` before the updateId is observable.
        const updateId = signingResult.metadata?.updateId as string | undefined
        const now = new Date()

        logDynamically(this.logger, 'Taurus-PROTECT signing result', {
            info: { transactionId: tx.id, status: gatewayStatus },
            debug: { signingResult, tx },
        })

        if (gatewayStatus === 'executed' && updateId) {
            const signedTx: Transaction = {
                id: tx.id,
                commandId: tx.commandId,
                status: 'signed',
                preparedTransaction: tx.preparedTransaction,
                preparedTransactionHash: tx.preparedTransactionHash,
                origin: tx?.origin ?? null,
                ...(tx?.createdAt && { createdAt: tx.createdAt }),
                signedAt: now,
                externalTxId: requestId,
            }
            await this.store.setTransactionSigned(tx.id, now, requestId)
            this.notifier.emit('txChanged', signedTx)

            return {
                status: 'signed',
                signature: updateId,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: requestId,
            }
        }

        // pending / signed (in-flight under governance), executed before the
        // updateId is observable, or failed.
        const status: 'pending' | 'failed' =
            gatewayStatus === 'failed' ? 'failed' : 'pending'
        const pendingTx: Transaction = {
            id: tx.id,
            commandId: tx.commandId,
            status,
            preparedTransaction: tx.preparedTransaction,
            preparedTransactionHash: tx.preparedTransactionHash,
            origin: tx?.origin ?? null,
            ...(tx?.createdAt && { createdAt: tx.createdAt }),
            externalTxId: requestId,
        }
        await this.store.setTransactionStatus(tx.id, status, {
            externalTxId: requestId,
        })
        this.notifier.emit('txChanged', pendingTx)

        if (status === 'failed') {
            return {
                status: 'failed',
                partyId: wallet.partyId,
                externalTxId: requestId,
            }
        }
        return {
            status: 'pending',
            partyId: wallet.partyId,
            externalTxId: requestId,
        }
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
                hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V3',
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
            } as Types['JsExecuteSubmissionAndWaitRequest']
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

    /**
     * Reconcile the stored tx against the provider's status; the provider
     * already submitted, so this never posts to the ledger. Callers poll
     * repeatedly: the row stays 'signed' and pollable until `executed`
     * carries the updateId, then persists terminal.
     */
    private async executeWithSubmitProvider(
        userId: UserId,
        transaction: Transaction
    ): Promise<ExecuteResult> {
        const signingProvider =
            this.signingDrivers[SigningProvider.TAURUS_PROTECT]
        if (!signingProvider) {
            throw new Error('Taurus-PROTECT signing driver not available')
        }
        const driver = signingProvider.controller(userId)

        const result = await driver
            .getTransaction({
                txId: transaction.commandId,
                ...(transaction.externalTxId && {
                    requestId: transaction.externalTxId,
                }),
            })
            .then(handleSigningError)

        const gatewayStatus =
            (result.metadata?.gatewayStatus as string | undefined) ??
            result.status
        // Only a real ledger id: callers resolve this against the ledger.
        const updateId = result.metadata?.updateId as string | undefined
        const contractId = result.metadata?.contractId as string | undefined

        const status =
            gatewayStatus === 'executed' && updateId
                ? 'executed'
                : gatewayStatus === 'failed'
                  ? 'failed'
                  : 'pending'

        logDynamically(this.logger, 'Taurus-PROTECT execution result', {
            info: { transactionId: transaction.id, status },
            debug: { result, transaction, userId },
        })

        // Leave the row 'signed': demoting it fails the guard on the next
        // poll, and `executed` without the updateId is not yet complete.
        if (status === 'pending') {
            return { status }
        }

        // The gateway never reports a real offset, hence 0; omitted on
        // failure so the stored payload survives.
        const resultPayload =
            status === 'executed'
                ? { updateId, completionOffset: 0 }
                : undefined
        const reconciledTx: Transaction = {
            id: transaction.id,
            commandId: transaction.commandId,
            status,
            preparedTransaction: transaction.preparedTransaction,
            preparedTransactionHash: transaction.preparedTransactionHash,
            // TxChangedExecutedEvent requires payload.
            ...(resultPayload && { payload: resultPayload }),
            origin: transaction.origin ?? null,
            ...(transaction.createdAt && { createdAt: transaction.createdAt }),
            ...(transaction.signedAt && { signedAt: transaction.signedAt }),
            ...(transaction.externalTxId && {
                externalTxId: transaction.externalTxId,
            }),
        }
        // Persisted so a history reload needn't re-poll the gateway.
        await this.store.setTransactionStatus(transaction.id, status, {
            ...(resultPayload && { payload: resultPayload }),
            ...(transaction.externalTxId && {
                externalTxId: transaction.externalTxId,
            }),
        })
        this.notifier.emit('txChanged', reconciledTx)

        return {
            status,
            ...(updateId && { updateId }),
            ...(contractId && { contractId }),
        }
    }
}
