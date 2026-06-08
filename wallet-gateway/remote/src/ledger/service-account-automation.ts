// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import {
    AuthContext,
    assertConnected,
    assertServiceAccountUserAllowed,
    isServiceAccountRequest,
} from '@canton-network/core-wallet-auth'
import {
    Network,
    Store,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'
import type { AuthAware, Idp } from '@canton-network/core-wallet-auth'
import { TransactionService } from './transaction-service.js'
import type { SigningDrivers } from '../signing/signing-drivers.js'
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
        private readonly getIdp: (idpId: string) => Promise<Idp>,
        authContext?: AuthContext
    ) {
        this.authContext = authContext
    }

    withAuthContext(context?: AuthContext): ServiceAccountAutomation {
        return new ServiceAccountAutomation(
            this.config,
            this.signingDrivers,
            this.logger,
            this.getIdp,
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
        wallet: Wallet,
        transaction: Transaction,
        notifier: Notifier
    ): Promise<void> {
        assertServiceAccountUserAllowed(
            this.getAuthContext().userId,
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
            this.getAuthContext(),
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

        const executeParams: ExecuteParams = {
            transactionId: transaction.id,
            partyId: wallet.partyId,
            signature: signResult.signature,
            signedBy: signResult.signedBy,
        }

        await transactionService.execute(
            this.getAuthContext(),
            wallet,
            transaction,
            executeParams
        )
    }
}
