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
import { HASHING_SCHEME_VERSION } from '../env.js'

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
        private notifier: Notifier,
        private hashingSchemeVersion: HASHING_SCHEME_VERSION
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
            default:
                throw new Error(
                    `Unsupported signing provider: ${wallet.signingProviderId}`
                )
        }
    }

    public async execute(
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
                    return await this.executeWithParticipant(
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
                return await this.executeWithExternal(
                    userId,
                    executeParams,
                    wallet,
                    transaction,
                    ledgerClient
                )
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

    public async refreshTransaction(
        authContext: AuthContext,
        wallet: Wallet,
        transactionId: Transaction['id']
    ): Promise<{
        status: Transaction['status']
        externalTxId?: string
        failureReason?: string
    }> {
        const tx = await this.store.getTransaction(transactionId)
        if (!tx) {
            throw new Error(`Transaction not found with id: ${transactionId}`)
        }

        if (!tx.externalTxId || tx.status !== 'awaiting-signature') {
            return {
                status: tx.status,
                ...(tx.externalTxId && { externalTxId: tx.externalTxId }),
                ...(tx.failureReason && {
                    failureReason: tx.failureReason,
                }),
            }
        }

        const signingResult = await this.getSigningResult(
            authContext.userId,
            wallet,
            tx.externalTxId
        )

        logDynamically(this.logger, `Refreshed signing status`, {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        return this.applySigningResult(tx, wallet, signingResult)
    }

    private async getSigningResult(
        userId: UserId,
        wallet: Wallet,
        externalTxId: string
    ): Promise<Exclude<GetTransactionResult, SigningError>> {
        const provider = wallet.signingProviderId as SigningProvider
        const signingProvider = this.signingDrivers[provider]
        if (!signingProvider) {
            throw new Error(`No driver found for provider ${provider}`)
        }

        const driver = signingProvider.controller(userId)
        const args =
            provider === SigningProvider.SECUROSYS
                ? { txId: externalTxId }
                : { userId, txId: externalTxId }

        return driver.getTransaction(args).then(handleSigningError)
    }

    private async applySigningResult(
        tx: Transaction,
        wallet: Wallet,
        signingResult: Exclude<
            GetTransactionResult | SignTransactionResult,
            SigningError
        >
    ): Promise<{
        status: Transaction['status']
        externalTxId?: string
        failureReason?: string
    }> {
        const now = new Date()
        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error('No signature returned from signing driver')
            }

            const applied = await this.store.setTransactionSigned(
                tx.id,
                now,
                signingResult.txId,
                { expectedStatus: tx.status }
            )

            if (!applied) {
                const current = await this.store.getTransaction(tx.id)
                return { status: current!.status }
            }

            this.notifier.emit('txChanged', {
                ...tx,
                status: 'signed',
                signedAt: now,
                externalTxId: signingResult.txId,
            })

            return { status: 'signed', externalTxId: signingResult.txId }
        }

        const status =
            signingResult.status === 'pending' ? 'awaiting-signature' : 'failed'
        const failureReason =
            status === 'failed'
                ? `Signing provider returned status: ${signingResult.status}`
                : undefined

        await this.store.setTransactionStatus(tx.id, status, {
            externalTxId: signingResult.txId,
            ...(failureReason && { failureReason }),
        })

        this.notifier.emit('txChanged', {
            ...tx,
            status,
            externalTxId: signingResult.txId,
        })

        return {
            status,
            externalTxId: signingResult.txId,
            ...(failureReason && { failureReason }),
        }
    }

    private async loadPreparedTransactionForSigning(
        transactionId: Transaction['id']
    ): Promise<Transaction> {
        const existingTx = await this.store.getTransaction(transactionId)

        if (!existingTx) {
            throw new Error(`Transaction not found with id: ${transactionId}`)
        }

        if (existingTx.status !== 'pending' || existingTx.externalTxId) {
            throw new Error(
                `Cannot sign an already ${existingTx.status} transaction`
            )
        }

        return existingTx
    }

    private normalizeSignature(signingProviderId: string, signature: string) {
        if (signingProviderId === SigningProvider.FIREBLOCKS) {
            return Buffer.from(signature, 'hex').toString('base64')
        } else return signature
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
        const internalTxId = crypto
            .randomUUID()
            .replace(/-/g, '')
            .substring(0, 16)
        const signingResult = await driver
            .signTransaction({
                tx: tx.preparedTransaction,
                txHash: tx.preparedTransactionHash,
                keyIdentifier: {
                    publicKey: wallet.publicKey,
                },
                internalTxId,
            })
            .then(handleSigningError)

        logDynamically(this.logger, 'Blockdaemon signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        await this.applySigningResult(tx, wallet, signingResult)

        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error('No signature returned from signing driver')
            }

            return {
                status: signingResult.status,
                signature: signingResult.signature,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        }

        return {
            status: signingResult.status,
            externalTxId: signingResult.txId,
            partyId: wallet.partyId,
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

        const signingResult = await driver
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

        logDynamically(this.logger, 'Fireblocks signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        await this.applySigningResult(tx, wallet, signingResult)

        if (signingResult.status === 'signed') {
            if (!signingResult.signature) {
                throw new Error('No signature returned from signing driver')
            }

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
        }

        return {
            status: signingResult.status,
            externalTxId: signingResult.txId,
            partyId: wallet.partyId,
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

        const signingResult = await driver
            .signTransaction({
                tx: tx.preparedTransaction,
                txHash: tx.preparedTransactionHash,
                keyIdentifier: {
                    publicKey: wallet.publicKey,
                },
            })
            .then(handleSigningError)

        logDynamically(this.logger, 'Dfns signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        await this.applySigningResult(tx, wallet, signingResult)

        if (signingResult.status === 'signed') {
            return {
                status: 'signed',
                signature: signingResult.signature!,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        }

        return {
            status: signingResult.status,
            externalTxId: signingResult.txId,
            partyId: wallet.partyId,
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

        const signingResult = await driver
            .signTransaction({
                tx: tx.preparedTransaction,
                txHash: tx.preparedTransactionHash,
                keyIdentifier: {
                    id: keyLabelFromPublicKey(wallet.publicKey),
                    publicKey: wallet.publicKey,
                },
            })
            .then(handleSigningError)

        logDynamically(this.logger, 'Securosys signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        await this.applySigningResult(tx, wallet, signingResult)

        if (signingResult.status === 'signed') {
            return {
                status: 'signed',
                signature: signingResult.signature!,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        }

        return {
            status: signingResult.status,
            externalTxId: signingResult.txId,
            partyId: wallet.partyId,
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

        const signingResult = await driver
            .signTransaction({
                tx: tx.preparedTransaction,
                txHash: tx.preparedTransactionHash,
                keyIdentifier: {
                    publicKey: wallet.publicKey,
                },
            })
            .then(handleSigningError)

        logDynamically(this.logger, 'Bitgo signing result', {
            info: { transactionId: tx.id, status: signingResult.status },
            debug: { signingResult, tx },
        })

        await this.applySigningResult(tx, wallet, signingResult)

        if (signingResult.status === 'signed') {
            return {
                status: 'signed',
                signature: signingResult.signature!,
                signedBy: wallet.namespace,
                partyId: wallet.partyId,
                externalTxId: signingResult.txId,
            }
        }

        return {
            status: signingResult.status,
            externalTxId: signingResult.txId,
            partyId: wallet.partyId,
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
            transaction.payload as PrepareParams,
            this.hashingSchemeVersion
        )

        try {
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
        } catch (err) {
            const failureReason = this.extractLedgerError(err)

            this.logger.error(
                { err, transactionId: transaction.id },
                'Ledger rejected submission'
            )

            await this.store.setTransactionStatus(transaction.id, 'failed', {
                failureReason,
            })
            this.notifier.emit('txChanged', {
                ...transaction,
                status: 'failed',
            })

            throw new Error(`Ledger rejected submission ${failureReason}`, {
                cause: err,
            })
        }
    }

    private async executeWithExternal(
        userId: UserId,
        executeParams: ExecuteParams,
        wallet: Wallet,
        transaction: Transaction,
        ledgerClient: LedgerClient
    ): Promise<ExecuteResult> {
        const { partyId } = executeParams
        const { commandId } = transaction
        let rawSignature: string

        if (transaction.externalTxId) {
            const signingResult = await this.getSigningResult(
                userId,
                wallet,
                transaction.externalTxId
            )

            if (signingResult.status !== 'signed' || !signingResult.signature) {
                throw new Error(
                    `Status either not signed or no signature available`
                )
            }

            rawSignature = signingResult.signature
        } else if (wallet.signingProviderId === SigningProvider.WALLET_KERNEL) {
            const driver =
                this.signingDrivers[SigningProvider.WALLET_KERNEL]?.controller(
                    userId
                )

            if (!driver) {
                throw new Error(`Wallet kernel signing driver not available`)
            }

            const { signature } = await driver
                .signTransaction({
                    tx: transaction.preparedTransaction,
                    txHash: transaction.preparedTransactionHash,
                    keyIdentifier: { publicKey: wallet.publicKey },
                })
                .then(handleSigningError)

            if (!signature) {
                throw new Error(`Wallet kernel did not return a signature`)
            }

            rawSignature = signature
        } else {
            throw new Error('no signature available')
        }

        const signature = this.normalizeSignature(
            wallet.signingProviderId,
            rawSignature
        )

        const signedBy = wallet.namespace

        try {
            const result = await ledgerClient.postWithRetry(
                '/v2/interactive-submission/executeAndWait',
                {
                    userId,
                    preparedTransaction: transaction.preparedTransaction,
                    hashingSchemeVersion: this.hashingSchemeVersion,
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
        } catch (err) {
            const failureReason = this.extractLedgerError(err)
            this.logger.error(
                { err: err, transactionId: transaction.id },
                `Ledger rejected the submission`
            )

            await this.store.setTransactionStatus(transaction.id, 'failed', {
                failureReason: failureReason,
            })

            this.notifier.emit(`txChanged`, {
                ...transaction,
                status: 'failed',
            })

            throw new Error(`Ledger rejected submission ${failureReason}`, {
                cause: err,
            })
        }
    }

    private extractLedgerError(error: unknown): string {
        if (error instanceof Error) {
            return error.message
        }

        if (typeof error === 'object' && error !== null) {
            return JSON.stringify(error)
        }

        return String(error)
    }
}
