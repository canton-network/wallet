// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import {
    AuthContext,
    AuthTokenProvider,
    assertConnected,
    assertServiceAccountUserAllowed,
    type AuthAware,
} from '@canton-network/core-wallet-auth'
import { LedgerClient } from '@canton-network/core-ledger-client'
import { Network, Transaction, Wallet } from '@canton-network/core-wallet-store'
import { TransactionService } from '../ledger/transaction-service.js'
import type {
    ExecuteParams,
    ExecuteResult,
    SignParams,
    SignResult,
} from '../user-api/rpc-gen/typings.js'

export type SignAndExecuteResult = SignResult | ExecuteResult

export interface ServiceAccountWorkerConfig {
    allowedUsers?: string[]
}

export class ServiceAccountWorker implements AuthAware<ServiceAccountWorker> {
    authContext: AuthContext | undefined

    constructor(
        private readonly config: ServiceAccountWorkerConfig,
        private readonly transactionService: TransactionService,
        private readonly logger: Logger,
        authContext?: AuthContext
    ) {
        this.authContext = authContext
    }

    withAuthContext(context?: AuthContext): ServiceAccountWorker {
        return new ServiceAccountWorker(
            this.config,
            this.transactionService,
            this.logger,
            context
        )
    }

    private getAuthContext(): AuthContext {
        return assertConnected(this.authContext)
    }

    async signAndExecutePreparedTransaction(
        network: Network,
        wallet: Wallet,
        transaction: Transaction
    ): Promise<SignAndExecuteResult> {
        const authContext = this.getAuthContext()

        assertServiceAccountUserAllowed(
            authContext.userId,
            this.config.allowedUsers
        )

        const signParams: SignParams = {
            transactionId: transaction.id,
            partyId: wallet.partyId,
        }

        const signResult = await this.transactionService.sign(
            authContext,
            wallet,
            signParams
        )

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

        return this.transactionService.execute(
            authContext,
            wallet,
            transaction,
            executeParams,
            ledgerClient,
            network
        )
    }
}
