// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getLogger } from '@logtape/logtape'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type {
    Network,
    Store,
    Transaction,
    Wallet,
} from '@canton-network/core-wallet-store'
import { TransactionService } from './transaction-service.js'
import type { HASHING_SCHEME_VERSION, SigningDrivers } from './types.js'
import type { Notifier } from './notification/index.js'

const logger = getLogger(['core', 'wallet-services', 'signing-worker'])

/**
 * Everything the {@link SigningWorker} needs to complete a single pending
 * transaction, as returned by a {@link SigningWorkerRunContextResolver}.
 */
export interface SigningWorkerRunContext {
    authContext: AuthContext
    /** Store scoped to {@link SigningWorkerRunContext.authContext}. */
    store: Store
    network: Network
    notifier: Notifier
}

/**
 * Resolves the auth context, scoped store, network and notifier used to complete
 * a pending transaction. Return `undefined` to skip the transaction for this tick.
 */
export type SigningWorkerRunContextResolver = (
    transaction: Transaction & { userId: string; networkId: string }
) => Promise<SigningWorkerRunContext | undefined>

/** Configuration for {@link SigningWorker}. */
export interface SigningWorkerOptions {
    /** Poll interval in ms. */
    intervalMs: number
    /** Unscoped store, used only to list pending transactions across all users. */
    store: Pick<Store, 'listAllPendingTransactions'>
    resolveRunContext: SigningWorkerRunContextResolver
    signingDrivers: SigningDrivers
    hashingSchemeVersion: HASHING_SCHEME_VERSION
}

/**
 * Background poller that completes transactions waiting on an external signing
 * provider (Fireblocks, Blockdaemon, Dfns, ...).
 *
 * When an external provider returns `pending` instead of a signature, the
 * transaction is stored as `awaiting-signature` with the provider's
 * `externalTxId`. On each tick the worker lists those rows via
 * {@link Store.listAllPendingTransactions} (rows without an `externalTxId` are
 * skipped) and, for each one:
 *
 * 1. asks {@link SigningWorkerOptions.resolveRunContext} for an auth context,
 *    scoped store, network and notifier; `undefined` skips the row,
 * 2. resolves the submitting wallet (the `actAs[0]` wallet, else the primary),
 * 3. re-reads the transaction and skips it if it is no longer pending, so a
 *    concurrent caller or an earlier tick that already completed it is ignored,
 * 4. calls {@link TransactionService.signAndExecute}, which polls the provider
 *    for the existing request (it never submits a new one) and executes once
 *    the provider reports `signed`.
 *
 * A failure on one row is logged and does not stop the remaining rows. Rows
 * that reach `failed` are no longer listed, so they are not retried.
 *
 * Ticks are serialized: a tick started while another is running does nothing.
 * {@link SigningWorker.tick} can also be driven by an external scheduler
 * instead of {@link SigningWorker.start}.
 */
export class SigningWorker {
    private timer: ReturnType<typeof setInterval> | undefined
    private running = false

    constructor(private readonly options: SigningWorkerOptions) {}

    /** Starts the interval timer. Does nothing if already started. */
    start(): void {
        if (this.timer) {
            return
        }
        this.timer = setInterval(() => {
            void this.tick()
        }, this.options.intervalMs)
        logger.info('Signing worker started', {
            intervalMs: this.options.intervalMs,
        })
    }

    /** Clears the interval timer. */
    stop(): void {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = undefined
        }
    }

    /** Runs one poll cycle over all pending transactions. */
    async tick(): Promise<void> {
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
                try {
                    await this.processPending(tx)
                } catch (err) {
                    logger.error(
                        'Signing worker failed to process pending transaction',
                        { ...transactionLogContext(tx), err }
                    )
                }
            }
        } catch (err) {
            logger.error('Signing worker tick failed', { err })
        } finally {
            this.running = false
        }
    }

    private async processPending(transaction: Transaction): Promise<void> {
        const { userId, networkId, externalTxId } = transaction
        const logContext = transactionLogContext(transaction)

        if (!externalTxId || !userId || !networkId) {
            logger.debug(
                'Skipping signing worker tick: missing required fields',
                logContext
            )
            return
        }

        const runContext = await this.options.resolveRunContext({
            ...transaction,
            userId,
            networkId,
        })

        if (!runContext) {
            logger.debug(
                'Skipping signing worker tick: no run context',
                logContext
            )
            return
        }

        const { authContext, store, network, notifier } = runContext
        const wallet = await resolveWalletFromTransaction(transaction, store)
        if (!wallet) {
            logger.warn(
                'Skipping signing worker tick: could not deduce submitting wallet from transaction payload',
                logContext
            )
            return
        }

        const refreshedTx = await store.getTransaction(transaction.id)

        if (
            !refreshedTx ||
            (refreshedTx.status !== 'pending' &&
                refreshedTx.status !== 'awaiting-signature')
        ) {
            logger.debug(
                'Skipping signing worker tick: transaction no longer pending',
                { ...logContext, status: refreshedTx?.status }
            )
            return
        }

        const transactionService = new TransactionService(
            store,
            this.options.signingDrivers,
            notifier,
            this.options.hashingSchemeVersion
        )

        const signingLogContext = {
            ...logContext,
            partyId: wallet.partyId,
            signingProviderId: wallet.signingProviderId,
        }

        try {
            const result = await transactionService.signAndExecute(
                authContext,
                network,
                wallet,
                refreshedTx
            )
            if ('status' in result && result.status === 'pending') {
                logger.info(
                    'Signing worker: transaction still awaiting external signing',
                    signingLogContext
                )
            } else {
                logger.info(
                    'Signing worker completed service account transaction',
                    { ...signingLogContext, result }
                )
            }
        } catch (err) {
            logger.error(
                'Signing worker failed to complete service account transaction',
                { ...signingLogContext, err }
            )
        }
    }
}

function transactionLogContext(tx: Transaction) {
    return {
        userId: tx.userId,
        networkId: tx.networkId,
        transactionId: tx.id,
        commandId: tx.commandId,
        externalTxId: tx.externalTxId,
    }
}

/**
 * Resolves the wallet that submitted the transaction: the wallet matching the
 * payload's first `actAs` party, or the primary wallet when there is no match.
 */
async function resolveWalletFromTransaction(
    tx: Transaction,
    store: Store
): Promise<Wallet | undefined> {
    const payload = tx.payload
    if (payload && typeof payload === 'object') {
        const actAs = (payload as { actAs?: unknown }).actAs

        if (Array.isArray(actAs) && actAs.length !== 0) {
            if (actAs.length > 1) {
                logger.warn(
                    'Transaction has multiple acting parties; using the first one to resolve wallet',
                    { transactionId: tx.id, actAs }
                )
            }

            const wallets = await store.getAllWallets()
            const wallet = wallets.find((w) => w.partyId === actAs[0])
            if (wallet) {
                return wallet
            }
        }
    }

    return store.getPrimaryWallet()
}
