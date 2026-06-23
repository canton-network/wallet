// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from 'pino'
import { AuthAware, AuthContext } from '@canton-network/core-wallet-auth'
import { Store, Transaction } from '@canton-network/core-wallet-store'
import { NotificationService } from '../notification/NotificationService.js'
import { TransactionService } from '../ledger/transaction-service.js'
import type { SigningDrivers } from './signing-drivers.js'
// import { resolveAutomationRunContext } from './service-account-session.js'

export type { AccessTokenProviderFactory } from './service-account-session.js'

/** Configuration for {@link SigningWorker}. */
export interface SigningWorkerOptions {
    /** Poll interval in ms (`server.signingWorker.pollInterval`, default 5000). */
    intervalMs: number
    signingDrivers: SigningDrivers
    store: Store & AuthAware<Store>
    notificationService: NotificationService
    logger: Logger
}

/**
 * Background poller that completes service-account transactions stuck in external
 * custody approval.
 *
 * ## When this runs
 *
 * During M2M automation (`prepareExecute` → `signAndExecute`), external signing
 * providers (Fireblocks, Blockdaemon, Dfns) may return `pending` instead of a
 * signature. The gateway persists the transaction with `status: 'pending'` and
 * an `externalTxId` from the provider. This worker picks up those rows on each
 * tick via {@link Store.listAllPendingTransactions} (rows with an
 * `externalTxId` are processed; others are skipped).
 *
 * Participant and wallet-kernel sign synchronously and never appear here.
 *
 * ## What happens on each tick
 *
 * For every pending row the worker resolves an M2M auth context
 * ({@link resolveAutomationRunContext}), loads the user's primary wallet, and
 * calls {@link TransactionService.signAndExecute}.
 *
 * Although the worker always invokes `signAndExecute`, **retries do not submit a
 * new sign request**. `TransactionService.sign()` checks whether the stored
 * transaction already has an `externalTxId`:
 *
 * - **First pass** (no `externalTxId`): `driver.signTransaction()` submits to
 *   custody and stores the returned `externalTxId`.
 * - **Subsequent ticks** (`externalTxId` present): `driver.getTransaction()`
 *   polls the existing custody request for an updated status/signature.
 *
 * `signAndExecute` then:
 *
 * - returns early while the provider still reports `pending` (worker logs and
 *   waits for the next tick), or
 * - calls `execute()` once signing is `signed` (Dfns is special: it broadcasts
 *   at sign-time, so execute only reconciles local state).
 *
 * A transaction is re-read before processing so a concurrent DApp call or an
 * earlier tick that already completed it is skipped.
 *
 * ## Lifecycle
 *
 * Started once at gateway init (`start()`). Ticks are serialized: if a tick is
 * still running, the next interval callback is a no-op. Use `stop()` on shutdown.
 */
export class SigningWorker {
    private timer: ReturnType<typeof setInterval> | undefined
    private running = false

    constructor(private readonly options: SigningWorkerOptions) {}

    /** Starts the interval timer. Idempotent if already started. */
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

    /** Clears the interval timer. */
    stop(): void {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = undefined
        }
    }

    /**
     * One poll cycle: list all pending transactions and attempt to complete
     * external-custody rows via {@link processPending}. Safe to call directly in
     * tests.
     */
    async tick(): Promise<void> {
        this.options.logger.trace(
            { intervalMs: this.options.intervalMs },
            `Executing tick`
        )

        if (this.running) {
            return
        }
        this.running = true
        try {
            const pending =
                await this.options.store.listAllPendingTransactions()
            for (const tx of pending) {
                if (!tx.externalTxId) {
                    continue
                }
                await this.processPending(tx.userId!, tx.networkId!, tx)
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

    /**
     * Drives a single pending transaction through `signAndExecute`. Skips when
     * automation context, primary wallet, or refreshed `pending` status is missing.
     * Errors are logged per transaction; other rows in the same tick still run.
     */
    private async processPending(
        authContext: AuthContext | undefined,
        transaction: Transaction
    ): Promise<void> {
        if (!transaction.externalTxId) {
            return
        }

        // const runContext = await resolveAutomationRunContext(
        //     this.options.store,
        //     userId,
        //     networkId,
        //     this.options.logger
        // )
        if (!authContext) {
            this.options.logger.debug(
                { authContext, transactionId: transaction.id },
                'Skipping signing worker tick: no auth context'
            )
            return
        }

        // const { authContext, scopedStore, network } = runContext

        // const wallet = await scopedStore.getPrimaryWallet()
        // if (!wallet) {
        //     this.options.logger.warn(
        //         {
        //             userId,
        //             networkId,
        //             transactionId: transaction.id,
        //             commandId: transaction.commandId,
        //         },
        //         'Skipping signing worker tick: no primary wallet configured for user'
        //     )
        //     return
        // }

        const userId = authContext.userId

        const refreshedTx = await scopedStore.getTransaction(transaction.id)
        if (!refreshedTx || refreshedTx.status !== 'pending') {
            return
        }

        const notifier = this.options.notificationService.getNotifier(
            authContext.userId
        )
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
                refreshedTx
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
}
