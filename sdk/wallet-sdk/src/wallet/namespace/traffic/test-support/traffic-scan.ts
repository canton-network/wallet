// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Stands in for the participant TEA that credits purchased traffic.
 *
 * `TrafficPurchaser_PurchaseCredits` credits the traffic on-ledger by exercising
 * the non-consuming `PublishCredit` choice on a `TrafficCreditIssuer` for the
 * target account. The choice creates no contract, so nothing lands in the active
 * contract set, but the exercise is in the transaction tree. The real
 * participant TEA reads that exercise and moves the account; this follows the
 * participant's own update stream and does the same through `topUpTraffic`,
 * which is the smallest thing that applies it off-ledger.
 *
 * It is test-grade on purpose: in-memory state and a poll loop, not a durable
 * subscription with a persisted offset and retries -- a real crediting service
 * would want both.
 */
import { LedgerProvider, type Ops } from '@canton-network/core-provider-ledger'
import {
    AuthTokenProvider,
    type TokenProviderConfig,
} from '@canton-network/core-wallet-auth'
import {
    TrafficCreditIssuer,
    type PublishCredit,
} from '@canton-network/core-traffic-purchase'
import type { PartyId } from '@canton-network/core-types'
import type { TrafficAccountNamespace } from '../namespace.js'

/**
 * The interface whose `PublishCredit` exercises this scan reads, by package
 * *name*: its id is package-name qualified, e.g.
 * `#canton-traffic-credit:Canton.Traffic.Credit:TrafficCreditIssuer`. An
 * exercised event carries this as its `interfaceId`, so matching on it keeps
 * this working across the package upgrades that change the id but not the name.
 */
const trafficCreditIssuerInterfaceId = TrafficCreditIssuer.templateId

/** A credit this scan applied, and what the account came to afterwards. */
export type AppliedCredit = {
    /** The TEA account the credit named. */
    accountId: string
    /** Whole bytes credited, i.e. the exercise's `trafficAmount`. */
    balanceDelta: number
    /** The account balance the participant reported after the credit. */
    balance: number
}

type Waiter = {
    resolve: (credit: AppliedCredit) => void
    reject: (error: unknown) => void
}

export class TrafficScan {
    private readonly ledger: LedgerProvider
    private readonly aborter = new AbortController()
    private readonly credited = new Map<string, AppliedCredit>()
    private readonly waiters = new Map<string, Waiter[]>()
    private offset: number
    private running: Promise<void> | undefined
    private failure: unknown

    private constructor(
        ledgerApiUrl: URL,
        auth: TokenProviderConfig,
        private readonly traffic: TrafficAccountNamespace,
        private readonly parties: PartyId[],
        beginExclusive: number
    ) {
        this.ledger = new LedgerProvider({
            baseUrl: ledgerApiUrl,
            accessTokenProvider: new AuthTokenProvider(auth),
        })
        this.offset = beginExclusive
    }

    /**
     * Starts following the stream, from the participant's current ledger end
     * unless told otherwise: a purchase made before this starts is not this
     * scan's business.
     */
    static async start(options: {
        ledgerApiUrl: URL
        auth: TokenProviderConfig
        /** The base traffic namespace `topUpTraffic` is applied through. */
        traffic: TrafficAccountNamespace
        /** The parties to watch -- a purchase names a buyer and a paymaster. */
        parties: PartyId[]
        beginExclusive?: number
    }): Promise<TrafficScan> {
        const scan = new TrafficScan(
            options.ledgerApiUrl,
            options.auth,
            options.traffic,
            options.parties,
            options.beginExclusive ?? 0
        )
        if (options.beginExclusive === undefined) {
            scan.offset = await scan.ledgerEnd()
        }
        scan.running = scan.follow()
        return scan
    }

    /** Stops following, and waits for the poll in flight to come back. */
    async stop(): Promise<void> {
        this.aborter.abort()
        await this.running?.catch(() => undefined)
    }

    /**
     * Waits for the account `accountId` names to have been credited.
     *
     * Resolves once `topUpTraffic` has applied the credit, so the balance
     * `getTraffic` reports afterwards includes it. A purchase credited before
     * this was called resolves at once -- the outcome is kept, not just
     * signalled.
     */
    async waitForCredit(
        accountId: string,
        timeoutMs = 60_000
    ): Promise<AppliedCredit> {
        const already = this.credited.get(accountId)
        if (already !== undefined) return already
        if (this.failure !== undefined) throw this.failure

        return new Promise<AppliedCredit>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.forget(accountId, waiter)
                reject(
                    new Error(
                        `No traffic credit for account ${accountId} within ${timeoutMs}ms`
                    )
                )
            }, timeoutMs)
            timer.unref?.()

            const waiter: Waiter = {
                resolve: (credit) => {
                    clearTimeout(timer)
                    resolve(credit)
                },
                reject: (error) => {
                    clearTimeout(timer)
                    reject(error)
                },
            }
            this.waiters.set(accountId, [
                ...(this.waiters.get(accountId) ?? []),
                waiter,
            ])
        })
    }

    private async ledgerEnd(): Promise<number> {
        return (
            (
                await this.ledger.request<Ops.GetV2StateLedgerEnd>({
                    method: 'ledgerApi',
                    params: {
                        resource: '/v2/state/ledger-end',
                        requestMethod: 'get',
                        query: {},
                    },
                })
            ).offset ?? 0
        )
    }

    /** Polls until stopped. The loop is the whole component. */
    private async follow(): Promise<void> {
        while (!this.aborter.signal.aborted) {
            let responses: Array<{ update?: unknown }>
            try {
                responses = await this.ledger.request<Ops.PostV2Updates>({
                    method: 'ledgerApi',
                    params: {
                        resource: '/v2/updates',
                        requestMethod: 'post',
                        body: {
                            beginExclusive: this.offset,
                            updateFormat: {
                                includeTransactions: {
                                    transactionShape:
                                        'TRANSACTION_SHAPE_LEDGER_EFFECTS',
                                    eventFormat: {
                                        filtersByParty: Object.fromEntries(
                                            this.parties.map((party) => [
                                                party,
                                                // Every event the party is privy
                                                // to: under the ledger-effects
                                                // shape this delivers the
                                                // `PublishCredit` exercise, which
                                                // creates no contract to filter
                                                // on by template.
                                                {
                                                    cumulative: [
                                                        {
                                                            identifierFilter: {
                                                                WildcardFilter:
                                                                    {
                                                                        value: {
                                                                            includeCreatedEventBlob: false,
                                                                        },
                                                                    },
                                                            },
                                                        },
                                                    ],
                                                },
                                            ])
                                        ),
                                        verbose: true,
                                    },
                                },
                            },
                        },
                        query: { limit: 100, stream_idle_timeout_ms: 500 },
                    },
                })
            } catch (error) {
                if (this.aborter.signal.aborted) return
                this.fail(error)
                return
            }

            for (const { update } of responses) {
                if (this.aborter.signal.aborted) return
                await this.apply(update)
            }
        }
    }

    /** Credits every matching exercise in one update, and advances past it. */
    private async apply(update: unknown): Promise<void> {
        if (typeof update !== 'object' || update === null) return

        if (!('Transaction' in update)) {
            this.offset = offsetOf(update) ?? this.offset
            return
        }

        const transaction = (
            update as {
                Transaction: { value: { events: unknown[]; offset: number } }
            }
        ).Transaction.value
        for (const event of transaction.events) {
            await this.applyEvent(event)
        }
        this.offset = transaction.offset
    }

    private async applyEvent(event: unknown): Promise<void> {
        if (
            typeof event !== 'object' ||
            event === null ||
            !('ExercisedEvent' in event)
        ) {
            return
        }

        const exercised = (
            event as {
                ExercisedEvent: {
                    offset: number
                    nodeId: number
                    interfaceId?: string
                    choice: string
                    choiceArgument?: unknown
                }
            }
        ).ExercisedEvent

        // Only the credit-issuing choice, and only on the interface this scan
        // trusts: a choice that merely shares the `PublishCredit` name from some
        // other interface is not a traffic credit.
        if (
            exercised.choice !== 'PublishCredit' ||
            exercised.interfaceId !== trafficCreditIssuerInterfaceId ||
            exercised.choiceArgument === undefined
        ) {
            return
        }

        // The argument carries everything the account move needs: whom to credit
        // (`accountId`) and by how much (`trafficAmount`, whole bytes as an Int).
        const credit = exercised.choiceArgument as PublishCredit
        const accountId = credit.accountId.value
        const balanceDelta = Number(credit.trafficAmount)
        const account = await this.traffic.topUpTraffic({
            accountId,
            balanceDelta,
            // The exercise's place in the tree is unique per credit, so re-seeing
            // the same exercise cannot top the account up twice.
            deduplicationId: `${exercised.offset}:${exercised.nodeId}`,
        })

        const applied: AppliedCredit = {
            accountId,
            balanceDelta,
            balance: account.balance,
        }
        this.credited.set(accountId, applied)
        this.settle(accountId, applied)
    }

    private settle(accountId: string, credit: AppliedCredit): void {
        const waiting = this.waiters.get(accountId)
        if (waiting === undefined) return
        this.waiters.delete(accountId)
        for (const waiter of waiting) waiter.resolve(credit)
    }

    private forget(accountId: string, waiter: Waiter): void {
        const waiting = this.waiters.get(accountId)
        if (waiting === undefined) return
        const rest = waiting.filter((candidate) => candidate !== waiter)
        if (rest.length === 0) this.waiters.delete(accountId)
        else this.waiters.set(accountId, rest)
    }

    /** The loop is done for: nothing further is going to be credited. */
    private fail(error: unknown): void {
        this.failure = error
        for (const [accountId, waiting] of this.waiters) {
            for (const waiter of waiting) waiter.reject(error)
            this.waiters.delete(accountId)
        }
    }
}

/** The offset of an `Update` that is not a `Transaction`. */
function offsetOf(update: object): number | undefined {
    if ('OffsetCheckpoint' in update) {
        return (update as { OffsetCheckpoint: { value: { offset: number } } })
            .OffsetCheckpoint.value.offset
    }
    if ('Reassignment' in update) {
        return (update as { Reassignment: { value: { offset: number } } })
            .Reassignment.value.offset
    }
    if ('TopologyTransaction' in update) {
        return (
            update as { TopologyTransaction: { value: { offset: number } } }
        ).TopologyTransaction.value.offset
    }
    return undefined
}
