// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import { errorCodes } from '@canton-network/core-rpc-errors'
import {
    assertConnected,
    type AuthContext,
    AuthTokenProvider,
} from '@canton-network/core-wallet-auth'
import { TransactionService } from '@canton-network/core-wallet-services'
import type { Session, Store } from '@canton-network/core-wallet-store'

import { logger } from '@/shared/logger.ts'

import type { TxChangedFailedEvent } from '../dapp/rpc-gen/typings.ts'
import { toSigningDrivers, type UserControllerDeps } from './deps.ts'
import type { Methods } from './rpc-gen/index.ts'
import type {
    DeleteTransactionParams,
    ExecuteParams,
    GetTransactionParams,
    GetTransactionResult,
    SignParams,
} from './rpc-gen/typings.ts'

async function requireSession(
    store: Store,
    accessToken: string
): Promise<Session> {
    const session = await store.getSession(accessToken)
    if (!session) {
        throw new Error('No active session found')
    }
    return session
}

/**
 * Signs and executes a transaction as `context`, reporting on the notifier
 * of `sessionId`. The user API and the transaction approvals share it.
 */
export function transactionSubmitter({
    signingDriver,
    notificationService,
}: Pick<UserControllerDeps, 'signingDriver' | 'notificationService'>) {
    const signingDrivers = toSigningDrivers(signingDriver)
    const createTransactionService = (store: Store, sessionId: string) =>
        new TransactionService(
            store,
            signingDrivers,
            notificationService.getNotifier(sessionId),
            'HASHING_SCHEME_VERSION_V3'
        )

    return {
        async sign(
            store: Store,
            context: AuthContext,
            sessionId: string,
            signParams: SignParams
        ) {
            const network = await store.getCurrentNetwork()
            if (network === undefined) {
                throw new Error('No network session found')
            }

            const wallets = await store.getWallets()
            const wallet = wallets.find(
                (candidate) => candidate.partyId === signParams.partyId
            )
            if (wallet === undefined) {
                throw new Error('No primary wallet found')
            }

            logger.info('Signing transaction', {
                transactionId: signParams.transactionId,
            })
            const response = await createTransactionService(
                store,
                sessionId
            ).sign(context, wallet, signParams)
            logger.info('Transaction signed', {
                transactionId: signParams.transactionId,
            })

            return response
        },
        async execute(
            store: Store,
            context: AuthContext,
            sessionId: string,
            executeParams: ExecuteParams
        ) {
            const wallets = await store.getWallets()
            const network = await store.getCurrentNetwork()
            const transaction = await store.getTransaction(
                executeParams.transactionId
            )
            const wallet = wallets.find(
                (candidate) => candidate.partyId === executeParams.partyId
            )

            if (wallet === undefined) {
                throw new Error('Requested wallet not found for user')
            }
            if (transaction === undefined) {
                throw new Error('No transaction found')
            }
            if (network === undefined) {
                throw new Error('No network session found')
            }

            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                accessTokenProvider: AuthTokenProvider.fromToken(
                    context.accessToken
                ),
            })

            logger.info('Executing transaction', {
                transactionId: executeParams.transactionId,
            })
            const response = await createTransactionService(
                store,
                sessionId
            ).execute(
                context.userId,
                wallet,
                transaction,
                executeParams,
                ledgerClient,
                context,
                network
            )
            logger.info('Transaction executed', {
                transactionId: executeParams.transactionId,
            })

            return response
        },
    }
}

export type TransactionSubmitter = ReturnType<typeof transactionSubmitter>

export const transactions = ({
    getStore,
    authContext,
    signingDriver,
    notificationService,
}: UserControllerDeps): Pick<
    Methods,
    | 'sign'
    | 'execute'
    | 'getTransaction'
    | 'listTransactions'
    | 'deleteTransaction'
    | 'getTransactionStatus'
> => {
    const submitter = transactionSubmitter({
        signingDriver,
        notificationService,
    })

    return {
        sign: async (signParams: SignParams) => {
            const context = assertConnected(await authContext.load())
            const store = await getStore()
            const session = await requireSession(store, context.accessToken)
            return submitter.sign(store, context, session.id, signParams)
        },
        execute: async (executeParams: ExecuteParams) => {
            const context = assertConnected(await authContext.load())
            const store = await getStore()
            const session = await requireSession(store, context.accessToken)
            return submitter.execute(store, context, session.id, executeParams)
        },
        getTransaction: async (
            params: GetTransactionParams
        ): Promise<GetTransactionResult> => {
            const store = await getStore()
            const transaction = await store.getTransaction(params.transactionId)
            if (!transaction) {
                throw new Error(
                    `Transaction not found with id: ${params.transactionId}`
                )
            }

            return {
                id: transaction.id,
                commandId: transaction.commandId,
                status: transaction.status,
                preparedTransaction: transaction.preparedTransaction,
                preparedTransactionHash: transaction.preparedTransactionHash,
                payload: transaction.payload
                    ? JSON.stringify(transaction.payload)
                    : '',
                ...(transaction.origin !== null && {
                    origin: transaction.origin,
                }),
                ...(transaction.createdAt && {
                    createdAt: transaction.createdAt.toISOString(),
                }),
                ...(transaction.signedAt && {
                    signedAt: transaction.signedAt.toISOString(),
                }),
                ...(transaction.externalTxId && {
                    externalTxId: transaction.externalTxId,
                }),
                ...(transaction.failureReason && {
                    failureReason: transaction.failureReason,
                }),
            }
        },
        listTransactions: async () => {
            throw new Error('Function listTransactions not implemented.')
        },
        deleteTransaction: async (
            params: DeleteTransactionParams
        ): Promise<null> => {
            const connectedContext = assertConnected(await authContext.load())
            const store = await getStore()
            const transaction = await store.getTransaction(params.transactionId)
            if (!transaction) {
                throw new Error(
                    `Transaction not found with id: ${params.transactionId}`
                )
            }
            if (transaction.status !== 'pending') {
                throw new Error(
                    `Cannot delete transaction with status '${transaction.status}'. Only pending transactions can be deleted.`
                )
            }

            const session = await requireSession(
                store,
                connectedContext.accessToken
            )

            await store.removeTransaction(transaction.id)
            notificationService.getNotifier(session.id).emit('txChanged', {
                status: 'failed',
                commandId: transaction.commandId,
                error: {
                    code: errorCodes.provider.userRejectedRequest,
                    message: 'Rejected by the user',
                },
            } satisfies TxChangedFailedEvent)
            return null
        },
        getTransactionStatus: async () => {
            throw new Error('Function getTransactionStatus not implemented.')
        },
    }
}
