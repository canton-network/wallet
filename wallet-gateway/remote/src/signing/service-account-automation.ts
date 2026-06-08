// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import {
    AuthContext,
    AuthTokenProvider,
    assertConnected,
    assertServiceAccountUserAllowed,
    isServiceAccountRequest,
    type AuthAware,
} from '@canton-network/core-wallet-auth'
import { LedgerClient } from '@canton-network/core-ledger-client'
import {
    Network,
    Store,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'
import { TransactionService } from '../ledger/transaction-service.js'
import type { SigningDrivers } from './signing-drivers.js'
import { Notifier } from '../notification/NotificationService.js'
import type { ExecuteParams, SignParams } from '../user-api/rpc-gen/typings.js'

export interface ServiceAccountAutomationConfig {
    allowedUsers?: string[]
}

export class ServiceAccountAutomation implements AuthAware<ServiceAccountAutomation> {
    authContext: AuthContext | undefined

    constructor(
        private readonly config: ServiceAccountAutomationConfig,
        private readonly signingDrivers: SigningDrivers,
        private readonly logger: Logger,
        authContext?: AuthContext
    ) {
        this.authContext = authContext
    }

    withAuthContext(context?: AuthContext): ServiceAccountAutomation {
        return new ServiceAccountAutomation(
            this.config,
            this.signingDrivers,
            this.logger,
            context
        )
    }

    private getAuthContext(): AuthContext {
        return assertConnected(this.authContext)
    }

    isAutomationRequest(network: Network, accessToken: string): boolean {
        return isServiceAccountRequest(network.auth, accessToken)
    }

    async signAndExecutePreparedTransaction(
        store: Store,
        network: Network,
        wallet: Wallet,
        transaction: Transaction,
        notifier: Notifier
    ): Promise<void> {
        const authContext = this.getAuthContext()

        assertServiceAccountUserAllowed(
            authContext.userId,
            this.config.allowedUsers
        )

        const transactionService = new TransactionService(
            store,
            this.logger,
            this.signingDrivers,
            notifier
        )

        const signParams: SignParams = {
            transactionId: transaction.id,
            partyId: wallet.partyId,
        }

        const signResult = await transactionService.sign(
            authContext,
            wallet,
            signParams
        )

        if (signResult.status === 'pending') {
            this.logger.info(
                {
                    transactionId: transaction.id,
                    externalTxId: signResult.externalTxId,
                },
                'Service account signing pending external approval'
            )
            return
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

        await transactionService.execute(
            authContext,
            wallet,
            transaction,
            executeParams,
            ledgerClient,
            network
        )
    }
}
