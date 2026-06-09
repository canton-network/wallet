// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import { StoreSql } from '@canton-network/core-wallet-store-sql'
import { Transaction } from '@canton-network/core-wallet-store'
import { NotificationService } from '../notification/NotificationService.js'
import {
    ServiceAccountConfig,
    TransactionService,
} from '../ledger/transaction-service.js'
import type { SigningDrivers } from './signing-drivers.js'
import {
    AccessTokenProviderFactory,
    resolveAutomationRunContext,
} from './service-account-session.js'

export type { AccessTokenProviderFactory } from './service-account-session.js'

export interface SigningWorkerOptions {
    intervalMs: number
    serviceAccountConfig: ServiceAccountConfig
    signingDrivers: SigningDrivers
    store: StoreSql
    notificationService: NotificationService
    createAccessTokenProvider: AccessTokenProviderFactory
    logger: Logger
}

export class SigningWorker {
    private timer: ReturnType<typeof setInterval> | undefined
    private running = false
    private readonly accessTokenProvidersByNetworkId = new Map<
        string,
        AuthTokenProvider
    >()

    constructor(private readonly options: SigningWorkerOptions) {}

    start(): void {
        this.options.logger.info('Starting signing worker')
        if (this.timer) {
            return
        }
        this.timer = setInterval(() => {
            void this.tick()
        }, this.options.intervalMs)
        this.options.logger.info(
            { intervalMs: this.options.intervalMs },
            'Signing worker started'
        )
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = undefined
        }
    }

    async tick(): Promise<void> {
        if (this.running) {
            return
        }
        this.running = true
        try {
            const pending =
                await this.options.store.listPendingExternalTransactions()
            for (const entry of pending) {
                await this.processPending(
                    entry.userId,
                    entry.networkId,
                    entry.transaction
                )
            }
        } catch (error) {
            this.options.logger.error(
                { err: error },
                'Signing worker tick failed'
            )
        } finally {
            this.running = false
        }
    }

    private async processPending(
        userId: string,
        networkId: string,
        transaction: Transaction
    ): Promise<void> {
        if (!transaction.externalTxId) {
            return
        }

        const runContext = await resolveAutomationRunContext(
            this.options.store,
            userId,
            networkId,
            (network) => this.getAccessTokenProvider(network),
            this.options.logger
        )
        if (!runContext) {
            this.options.logger.debug(
                { userId, networkId, transactionId: transaction.id },
                'Skipping signing worker tick: no run context'
            )
            return
        }

        const { authContext, scopedStore, network } = runContext

        const wallet = await scopedStore.getPrimaryWallet()
        if (!wallet) {
            this.options.logger.warn(
                {
                    userId,
                    networkId,
                    transactionId: transaction.id,
                    commandId: transaction.commandId,
                },
                'Skipping signing worker tick: no primary wallet configured for user'
            )
            return
        }

        const refreshedTx = await scopedStore.getTransaction(transaction.id)
        if (!refreshedTx || refreshedTx.status !== 'pending') {
            return
        }

        const notifier = this.options.notificationService.getNotifier(userId)
        const transactionLogger = this.options.logger.child({
            component: 'TransactionService',
        })
        const transactionService = new TransactionService(
            scopedStore,
            transactionLogger,
            this.options.signingDrivers,
            notifier
        )

        try {
            const result = await transactionService.signAndExecute(
                authContext,
                network,
                wallet,
                refreshedTx,
                this.options.serviceAccountConfig
            )
            if ('status' in result && result.status === 'pending') {
                this.options.logger.info(
                    {
                        userId,
                        networkId,
                        transactionId: transaction.id,
                        commandId: transaction.commandId,
                        externalTxId: result.externalTxId,
                        signingProviderId: wallet.signingProviderId,
                    },
                    'Signing worker: transaction still awaiting external signing'
                )
            } else {
                this.options.logger.info(
                    {
                        userId,
                        networkId,
                        transactionId: transaction.id,
                        commandId: transaction.commandId,
                        externalTxId: transaction.externalTxId,
                        partyId: wallet.partyId,
                        signingProviderId: wallet.signingProviderId,
                        result,
                    },
                    'Signing worker completed service account transaction'
                )
            }
        } catch (error) {
            this.options.logger.error(
                {
                    err: error,
                    userId,
                    networkId,
                    transactionId: transaction.id,
                    commandId: transaction.commandId,
                    externalTxId: transaction.externalTxId,
                    partyId: wallet.partyId,
                    signingProviderId: wallet.signingProviderId,
                },
                'Signing worker failed to complete service account transaction'
            )
        }
    }

    private async getAccessTokenProvider(
        network: Parameters<AccessTokenProviderFactory>[0]
    ): Promise<AuthTokenProvider> {
        const existing = this.accessTokenProvidersByNetworkId.get(network.id)
        if (existing) {
            return existing
        }

        const provider = await this.options.createAccessTokenProvider(network)
        this.accessTokenProvidersByNetworkId.set(network.id, provider)
        return provider
    }
}
