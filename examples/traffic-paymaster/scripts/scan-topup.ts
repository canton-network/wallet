// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Stands in for the participant TEA that credits purchased traffic (adapted
 * from `wallet-sdk`'s own `TrafficScan` test double, which is private to that
 * package). `TrafficPurchaser_PurchaseCredits` credits the traffic on-ledger by
 * exercising the non-consuming `PublishCredit` choice on a `TrafficCreditIssuer`;
 * the exercise is in the transaction tree even though it creates no contract.
 * This follows the update stream for those exercises and applies each with
 * `topUpTraffic`. Long-running: scans forever until Ctrl+C. For a one-off
 * manual credit instead, see `topup.ts`.
 */
import {
    LedgerProvider,
    localNetStaticConfig,
} from '@canton-network/wallet-sdk'
import type { Ops } from '@canton-network/core-provider-ledger'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import {
    TrafficCreditIssuer,
    type PublishCredit,
} from '@canton-network/core-traffic-purchase'
import { createAdminSdk, localNetAuth, type AdminSdk } from './lib.js'
import { requireEnvVar } from './env-file.js'

const trafficCreditIssuerQualifiedName = TrafficCreditIssuer.templateId.slice(
    TrafficCreditIssuer.templateId.indexOf(':')
)

async function main() {
    const paymaster = await requireEnvVar('VITE_PAYMASTER_PARTY_ID')
    const admin = await createAdminSdk()

    const ledger = new LedgerProvider({
        baseUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
        accessTokenProvider: new AuthTokenProvider(
            localNetAuth(localNetStaticConfig.LOCALNET_USER_ID)
        ),
    })

    let offset =
        (
            await ledger.request<Ops.GetV2StateLedgerEnd>({
                method: 'ledgerApi',
                params: {
                    resource: '/v2/state/ledger-end',
                    requestMethod: 'get',
                    query: {},
                },
            })
        ).offset ?? 0

    console.log(
        `Scanning purchases for paymaster ${paymaster} from offset ${offset}`
    )
    console.log('Leave this running. Ctrl+C to stop.')

    let stopped = false
    process.on('SIGINT', () => {
        stopped = true
    })

    while (!stopped) {
        const responses = await ledger.request<Ops.PostV2Updates>({
            method: 'ledgerApi',
            params: {
                resource: '/v2/updates',
                requestMethod: 'post',
                body: {
                    beginExclusive: offset,
                    updateFormat: {
                        includeTransactions: {
                            transactionShape:
                                'TRANSACTION_SHAPE_LEDGER_EFFECTS',
                            eventFormat: {
                                filtersByParty: { [paymaster]: {} },
                                verbose: true,
                            },
                        },
                    },
                },
                query: { limit: 100, stream_idle_timeout_ms: 1000 },
            },
        })

        for (const { update } of responses) {
            if (typeof update !== 'object' || update === null) continue
            if (!('Transaction' in update)) continue

            const transaction = (
                update as {
                    Transaction: {
                        value: { events: unknown[]; offset: number }
                    }
                }
            ).Transaction.value
            for (const event of transaction.events) {
                await applyEvent(admin, event)
            }
            offset = transaction.offset
        }
    }
}

async function applyEvent(admin: AdminSdk, event: unknown): Promise<void> {
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

    if (exercised.choice !== 'PublishCredit') return
    if (
        exercised.interfaceId === undefined ||
        !exercised.interfaceId.endsWith(trafficCreditIssuerQualifiedName)
    ) {
        return
    }
    if (exercised.choiceArgument === undefined) return

    const credit = exercised.choiceArgument as PublishCredit
    const accountId = credit.accountId.value
    const balanceDelta = Number(credit.trafficAmount)
    const deduplicationId = `${exercised.offset}:${exercised.nodeId}`
    const account = await admin.traffic.topUpTraffic({
        accountId,
        balanceDelta,
        // The exercise's place in the tree is unique per credit, so re-seeing
        // the same exercise cannot top the account up twice.
        deduplicationId,
    })
    console.log(
        `Credited ${balanceDelta} bytes to ${accountId} ` +
            `(exercise ${deduplicationId}); balance is now ${account.balance}`
    )
}

main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
})
