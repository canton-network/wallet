// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import { v4 } from 'uuid'
import {
    AuthContext,
    AuthTokenProvider,
    isClientCredentialsNetworkAuth,
    jwtExpired,
} from '@canton-network/core-wallet-auth'
import { StoreSql } from '@canton-network/core-wallet-store-sql'
import {
    Network,
    Session,
    Transaction,
} from '@canton-network/core-wallet-store'
import { NotificationService } from '../notification/NotificationService.js'
import { TransactionService } from '../ledger/transaction-service.js'
import type { SigningDrivers } from './signing-drivers.js'
import {
    ServiceAccountWorker,
    ServiceAccountWorkerConfig,
} from './service-account-worker.js'

export type AccessTokenProviderFactory = (
    network: Network
) => Promise<AuthTokenProvider>

export interface PendingSigningPollerOptions {
    intervalMs: number
    workerConfig: ServiceAccountWorkerConfig
    signingDrivers: SigningDrivers
    store: StoreSql
    notificationService: NotificationService
    createAccessTokenProvider: AccessTokenProviderFactory
    logger: Logger
}

interface RunContext {
    authContext: AuthContext
    scopedStore: StoreSql
    network: Network
}

export class PendingSigningPoller {
    private timer: ReturnType<typeof setInterval> | undefined
    private running = false
    // Cache access token providers by network ID to avoid creating new ones for each request.
    private readonly accessTokenProvidersByNetworkId = new Map<
        string,
        AuthTokenProvider
    >()

    constructor(private readonly options: PendingSigningPollerOptions) {}

    start(): void {
        this.options.logger.info('Starting pending external signing poller')
        if (this.timer) {
            return
        }
        this.timer = setInterval(() => {
            void this.tick()
        }, this.options.intervalMs)
        this.options.logger.info(
            { intervalMs: this.options.intervalMs },
            'Pending external signing poller started'
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
                'Pending signing poller tick failed'
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

        const runContext = await this.prepareRunContext(userId, networkId)
        if (!runContext) {
            this.options.logger.debug(
                { userId, networkId, transactionId: transaction.id },
                'Skipping pending poll: no run context'
            )
            return
        }

        const { authContext, scopedStore, network } = runContext

        const wallets = await scopedStore.getWallets()
        const wallet = wallets.find((w) => w.primary) ?? wallets[0]
        if (!wallet) {
            this.options.logger.warn(
                { userId, transactionId: transaction.id },
                'Skipping pending poll: no wallet'
            )
            return
        }

        const refreshedTx = await scopedStore.getTransaction(transaction.id)
        if (!refreshedTx || refreshedTx.status !== 'pending') {
            return
        }

        const notifier = this.options.notificationService.getNotifier(userId)
        const workerLogger = this.options.logger.child({
            component: 'ServiceAccountWorker',
        })
        const worker = new ServiceAccountWorker(
            this.options.workerConfig,
            new TransactionService(
                scopedStore,
                workerLogger,
                this.options.signingDrivers,
                notifier
            ),
            workerLogger,
            authContext
        )

        try {
            const result = await worker.signAndExecutePreparedTransaction(
                network,
                wallet,
                refreshedTx
            )
            if ('status' in result && result.status === 'pending') {
                this.options.logger.info(
                    {
                        userId,
                        transactionId: transaction.id,
                        externalTxId: result.externalTxId,
                    },
                    'Pending service account transaction still awaiting external signing'
                )
            } else {
                this.options.logger.info(
                    {
                        userId,
                        transactionId: transaction.id,
                        externalTxId: transaction.externalTxId,
                        result,
                    },
                    'Completed pending service account transaction'
                )
            }
        } catch (error) {
            this.options.logger.error(
                {
                    err: error,
                    userId,
                    transactionId: transaction.id,
                    externalTxId: transaction.externalTxId,
                },
                'Failed to complete pending service account transaction'
            )
        }
    }

    /**
     * Resolves auth for a pending transaction. Service-account networks can run
     * without a pre-existing session by minting an access token. Interactive
     * networks still require a valid stored session.
     */
    private async prepareRunContext(
        userId: string,
        networkId: string
    ): Promise<RunContext | undefined> {
        const network = await this.options.store.getNetwork(networkId)
        if (!network) {
            this.options.logger.warn(
                { userId, networkId },
                'Skipping pending poll: network not found'
            )
            return undefined
        }

        const existingSession =
            await this.options.store.getSessionForUser(userId)
        const sessionMatchesNetwork =
            existingSession?.network === networkId &&
            !jwtExpired(existingSession.accessToken)

        // This will also enable polling for non-service-account users for as long as the session is valid.
        if (sessionMatchesNetwork && existingSession) {
            const authContext: AuthContext = {
                userId,
                accessToken: existingSession.accessToken,
            }
            const scopedStore = this.options.store.withAuthContext(authContext)
            await scopedStore.setSession(existingSession)
            return { authContext, scopedStore, network }
        }

        // If there is no valid session, we cannot poll for a non-service-account user because we need to mint an access token.
        if (!isClientCredentialsNetworkAuth(network.auth)) {
            this.options.logger.debug(
                { userId, transactionId: networkId },
                'Skipping pending poll: no valid session for interactive network'
            )
            return undefined
        }

        // After here we are dealing with a service-account, for which we can mint an access token.
        const provider = await this.getAccessTokenProvider(network)
        const accessToken = await provider.getAccessToken()
        const authContext: AuthContext = { userId, accessToken }
        const session: Session = {
            id: existingSession?.id ?? v4(),
            network: networkId,
            accessToken,
        }
        const scopedStore = this.options.store.withAuthContext(authContext)
        await scopedStore.setSession(session)

        this.options.logger.debug(
            { userId, networkId, createdSession: !existingSession },
            'Prepared service account session for pending poll'
        )

        return { authContext, scopedStore, network }
    }

    private async getAccessTokenProvider(
        network: Network
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
