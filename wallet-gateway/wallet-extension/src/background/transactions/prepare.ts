// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    LedgerClient,
    type PrepareSubmissionResponse,
} from '@canton-network/core-ledger-client'
import { rpcErrors } from '@canton-network/core-rpc-errors'
import { SigningProvider } from '@canton-network/core-signing-lib'
import {
    type AuthContext,
    AuthTokenProvider,
} from '@canton-network/core-wallet-auth'
import { ledgerPrepareParams } from '@canton-network/core-wallet-services'
import type { Store, Transaction } from '@canton-network/core-wallet-store'

import { logger } from '@/shared/logger.ts'

import type { PrepareExecuteParams } from '../controllers/dapp/rpc-gen/typings.ts'

/** The hashing scheme transactions are prepared, and checked, with. */
export const HASHING_SCHEME = 'HASHING_SCHEME_VERSION_V3'

export interface PrepareRequest {
    transactionId: string
    commandId: string
    /** Who asked: a dApp page, or the extension itself. */
    origin: string
    params: PrepareExecuteParams
}

/**
 * Prepares a transaction on the ledger as the user of `store` and stores it
 * as pending. The acting parties default to the primary wallet and must all
 * be the user's.
 */
export async function prepareTransaction(
    store: Store,
    context: AuthContext,
    { transactionId, commandId, origin, params }: PrepareRequest
): Promise<void> {
    const primaryWallet = await store.getPrimaryWallet()
    const wallets = await store.getWallets()
    const network = await store.getCurrentNetwork()

    let actAs = params.actAs ? [...params.actAs] : []
    if (actAs.length === 0) {
        if (!primaryWallet) {
            throw new Error(
                'No primary wallet found. Create or sync a wallet and set it as primary before prepareExecute.'
            )
        }
        actAs = [primaryWallet.partyId]
    }

    for (const party of actAs) {
        if (!wallets.some((wallet) => wallet.partyId === party)) {
            throw new Error(`Acting party ${party} does not belong to user`)
        }
    }

    const wallet = wallets.find((candidate) => candidate.partyId === actAs[0])
    if (!wallet) {
        throw new Error(
            'No wallet found for the first acting party. Create or sync a wallet and set it as primary before prepareExecute.'
        )
    }
    // An external signature is the first acting party's alone, while the
    // participant executes for all of them.
    if (
        new Set(actAs).size > 1 &&
        wallet.signingProviderId !== SigningProvider.PARTICIPANT
    ) {
        throw rpcErrors.invalidParams({
            message:
                'Multi-party external signing is not supported: a transaction with more than one acting party needs a participant-hosted first party',
        })
    }

    const ledgerClient = new LedgerClient({
        baseUrl: new URL(network.ledgerApi.baseUrl),
        accessTokenProvider: AuthTokenProvider.fromToken(context.accessToken),
    })
    const synchronizerId =
        network.synchronizerId ?? (await ledgerClient.getSynchronizerId())

    logger.info('Preparing transaction on the ledger', {
        transactionId,
        commandId,
        actAs,
    })

    const prepared: PrepareSubmissionResponse =
        await ledgerClient.postWithRetry(
            '/v2/interactive-submission/prepare',
            ledgerPrepareParams({
                userId: context.userId,
                commandId,
                actAs,
                synchronizerId,
                params,
                hashingSchemeVersion: HASHING_SCHEME,
            })
        )

    const transaction: Transaction = {
        id: transactionId,
        commandId,
        status: 'pending',
        preparedTransaction: prepared.preparedTransaction,
        preparedTransactionHash: prepared.preparedTransactionHash,
        payload: { ...params, commandId, actAs },
        origin,
        createdAt: new Date(),
    }

    await store.setTransaction(transaction)
}
