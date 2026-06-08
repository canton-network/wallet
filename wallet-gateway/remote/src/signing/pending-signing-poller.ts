// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import {
    AuthContext,
    AuthTokenProvider,
    Idp,
    jwtExpired,
} from '@canton-network/core-wallet-auth'
import { StoreSql } from '@canton-network/core-wallet-store-sql'
import { Session, Transaction } from '@canton-network/core-wallet-store'
import { NotificationService } from '../notification/NotificationService.js'
import type { SigningDrivers } from './signing-drivers.js'
import {
    ServiceAccountAutomation,
    ServiceAccountAutomationConfig,
} from './service-account-automation.js'

export interface PendingSigningPollerOptions {
    intervalMs: number
    automationConfig: ServiceAccountAutomationConfig
    signingDrivers: SigningDrivers
    store: StoreSql
    notificationService: NotificationService
    getIdp: (idpId: string) => Promise<Idp>
    logger: Logger
}

export class PendingSigningPoller {
    private timer: ReturnType<typeof setInterval> | undefined
    private readonly automation: ServiceAccountAutomation
    private running = false

    constructor(private readonly options: PendingSigningPollerOptions) {
        this.automation = new ServiceAccountAutomation(
            options.automationConfig,
            options.signingDrivers,
            options.logger.child({ component: 'ServiceAccountAutomation' })
        )
    }

    start(): void {
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

        const sessionRow = await this.options.store.getSessionForUser(userId)
        if (!sessionRow || sessionRow.network !== networkId) {
            this.options.logger.debug(
                { userId, transactionId: transaction.id },
                'Skipping pending poll: no matching session'
            )
            return
        }

        const accessToken = await this.resolveAccessToken(userId, sessionRow)

        const authContext: AuthContext = { userId, accessToken }
        const scopedStore = this.options.store.withAuthContext(authContext)
        await scopedStore.setSession({ ...sessionRow, accessToken })

        const network = await scopedStore.getNetwork(networkId)
        if (!this.automation.isAutomationRequest(network, accessToken)) {
            return
        }

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

        try {
            await this.automation
                .withAuthContext(authContext)
                .signAndExecutePreparedTransaction(
                    scopedStore,
                    network,
                    wallet,
                    refreshedTx,
                    notifier
                )
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

    private async resolveAccessToken(
        userId: string,
        session: Session
    ): Promise<string> {
        if (!jwtExpired(session.accessToken)) {
            return session.accessToken
        }

        const scopedStore = this.options.store.withAuthContext({
            userId,
            accessToken: session.accessToken,
        })
        await scopedStore.setSession(session)
        const network = await scopedStore.getNetwork(session.network)

        if (network.auth.method !== 'client_credentials') {
            return session.accessToken
        }

        const idp = await this.options.getIdp(network.identityProviderId)
        const accessToken = await AuthTokenProvider.fromGatewayConfig(
            idp,
            network.auth,
            this.options.logger
        ).getAccessToken()

        await scopedStore.setSession({ ...session, accessToken })
        return accessToken
    }
}
