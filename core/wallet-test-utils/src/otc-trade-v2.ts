// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import Decimal from 'decimal.js'
import type { PartyId } from '@canton-network/core-types'
import {
    SDK,
    type TokenProviderConfig,
    localNetStaticConfig,
} from '@canton-network/wallet-sdk'
import type { FinalizedAllocation } from '@canton-network/core-token-standard-v2'
import { getLogger } from '@logtape/logtape'
import { localNetGlobalSynchronizer } from './localnet.js'

// This example needs the uploaded .dar for splice-token-test-trading-app-v2.
// It ships with LocalNet but isn't uploaded to the participant, so we do it here.
// Adjust to your .localnet location
const PATH_TO_LOCALNET = '../../../.localnet'
const PATH_TO_DAR_IN_LOCALNET =
    '/dars/splice-token-test-trading-app-v2-1.0.0.dar'
const TRADING_APP_V2_PACKAGE_ID =
    '20d42271cbd760c26c08401e4d1eec624458f5b48c73ae44c87c754e35621f5d'
const OTC_TRADE_TEMPLATE_ID =
    '#splice-token-test-trading-app-v2:Splice.Testing.Apps.TradingAppV2:OTCTrade'
const ALLOCATION_V2_API = 'splice-api-token-allocation-v2'

// ---------------------------------------------------------------------------
// SDK and types
// ---------------------------------------------------------------------------

const localNetStaticAuth = (clientId: string): TokenProviderConfig => ({
    method: 'self_signed',
    issuer: 'unsafe-auth',
    credentials: {
        clientId,
        clientSecret: 'unsafe',
        audience: 'https://canton.network.global',
        scope: '',
    },
})

async function createV2Sdk(clientId: string, registryUrl: URL) {
    const auth = localNetStaticAuth(clientId)
    const sdk = await SDK.create({
        auth,
        ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
        // LocalNet may run both the global and an app synchronizer; target the global one
        synchronizerId: localNetGlobalSynchronizer,
    })
    return sdk.extend({ token: { auth, registries: [registryUrl] } })
}

type V2Sdk = Awaited<ReturnType<typeof createV2Sdk>>
type AllocationRequest = Awaited<
    ReturnType<V2Sdk['token']['v2']['allocation']['request']['pending']>
>[number]
export type SettlementRef =
    AllocationRequest['interfaceViewValue']['settlement']
type V2Allocations = Awaited<
    ReturnType<V2Sdk['token']['v2']['allocation']['scan']>
>

type Account = { owner: PartyId; provider: null; id: string }

export type TradeLeg = {
    admin: string
    leg: {
        transferLegId: string
        sender: Account
        receiver: Account
        amount: string
        instrumentId: string
        meta: { values: Record<string, string> }
    }
}

export type OTCTradeV2Setup = {
    otcTradeCid: string
    settlement: SettlementRef
    tradeLegs: TradeLeg[]
    expectedAllocationCount: number
    instrumentAdmin: string
}

type Amounts = { aliceSends: string; bobSends: string; bobToCarol: string }

// Small defaults so wallets funded by a tap can cover them
const DEFAULT_AMOUNTS: Amounts = {
    aliceSends: '10',
    bobSends: '2',
    bobToCarol: '0.5',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const basicAccount = (owner: PartyId): Account => ({
    owner,
    provider: null,
    id: '',
})

async function registryAdmin(registryUrl: URL): Promise<string> {
    const response = await fetch(
        new URL('/registry/metadata/v1/info', registryUrl)
    )
    if (!response.ok)
        throw new Error(`Registry info unavailable: ${response.status}`)
    const { adminId } = (await response.json()) as { adminId: string }
    return adminId
}

/** Whether the registry advertises `api` for the instrument (same signal as the portfolio) */
async function registrySupports(
    registryUrl: URL,
    instrumentId: string,
    api: string
): Promise<boolean> {
    const response = await fetch(
        new URL('/registry/metadata/v1/instruments', registryUrl)
    )
    if (!response.ok)
        throw new Error(`Registry metadata unavailable: ${response.status}`)
    const { instruments } = (await response.json()) as {
        instruments: { id: string; supportedApis?: Record<string, number> }[]
    }
    return instruments.some(
        (i) => i.id === instrumentId && i.supportedApis?.[api] != null
    )
}

// ---------------------------------------------------------------------------
// OTCTradeV2
// ---------------------------------------------------------------------------

export class OTCTradeV2 {
    private logger = getLogger(['core', 'wallet-test-utils', 'OTCTradeV2'])

    private venue: PartyId
    private alice: PartyId
    private bob: PartyId
    private carol: PartyId | undefined
    private clientId: string
    private registryUrl: URL
    private instrumentId: string
    private amounts: Amounts
    private sdk: V2Sdk | null = null

    constructor(args: {
        venue: PartyId
        alice: PartyId
        bob: PartyId
        // Optional receive-only trader (adds a bob -> carol leg)
        carol?: PartyId
        // Ledger user that submits for the venue, so it needs to be able to
        // act as it. Traders allocate themselves in the portfolio UI.
        clientId?: string
        registryUrl?: string | URL
        instrumentId?: string
        amounts?: Partial<Amounts>
    }) {
        this.venue = args.venue
        this.alice = args.alice
        this.bob = args.bob
        this.carol = args.carol
        this.clientId = args.clientId ?? 'ledger-api-user'
        this.registryUrl = new URL(
            args.registryUrl ?? localNetStaticConfig.LOCALNET_REGISTRY_API_URL
        )
        this.instrumentId = args.instrumentId ?? 'Amulet'
        this.amounts = { ...DEFAULT_AMOUNTS, ...args.amounts }
    }

    private async getSdk(): Promise<V2Sdk> {
        if (!this.sdk) {
            this.sdk = await createV2Sdk(this.clientId, this.registryUrl)
            this.logger.info('SDK initialized')
        }
        return this.sdk
    }

    async setup(
        args: { settlementDeadlineMinutes?: number } = {}
    ): Promise<OTCTradeV2Setup> {
        const sdk = await this.getSdk()
        const settlementDeadlineMinutes = args.settlementDeadlineMinutes ?? 20

        // Upload dar
        const here = path.dirname(fileURLToPath(import.meta.url))
        const darBytes = await fs.readFile(
            path.join(here, PATH_TO_LOCALNET, PATH_TO_DAR_IN_LOCALNET)
        )
        await sdk.ledger.dar.upload(darBytes, TRADING_APP_V2_PACKAGE_ID)
        this.logger.info('Trading app V2 DAR uploaded')

        // Resolve the instrument admin and check V2 allocation support
        const instrumentAdmin = await registryAdmin(this.registryUrl)
        if (
            !(await registrySupports(
                this.registryUrl,
                this.instrumentId,
                ALLOCATION_V2_API
            ))
        ) {
            throw new Error(
                `Registry ${this.registryUrl.href} does not advertise ${ALLOCATION_V2_API} for ${this.instrumentId}`
            )
        }

        // Define what holdings each party will trade
        const leg = (
            transferLegId: string,
            from: PartyId,
            to: PartyId,
            amount: string,
            meta: Record<string, string> = {}
        ): TradeLeg => ({
            admin: instrumentAdmin,
            leg: {
                transferLegId,
                sender: basicAccount(from),
                receiver: basicAccount(to),
                amount,
                instrumentId: this.instrumentId,
                meta: { values: meta },
            },
        })

        const tradeLegs: TradeLeg[] = [
            // Leg meta, to check it comes through to the request's leg sides (and the dialog)
            leg('leg0', this.alice, this.bob, this.amounts.aliceSends, {
                'example.com/note': 'demo leg',
            }),
            leg('leg1', this.bob, this.alice, this.amounts.bobSends),
            ...(this.carol
                ? [leg('leg2', this.bob, this.carol, this.amounts.bobToCarol)]
                : []),
        ]

        // Venue creates the OTCTrade
        const now = Date.now()
        const createTrade = {
            CreateCommand: {
                templateId: OTC_TRADE_TEMPLATE_ID,
                createArguments: {
                    venue: this.venue,
                    tradeLegs,
                    createdAt: new Date(now).toISOString(),
                    settleAt: new Date(now + 60_000).toISOString(),
                    settlementDeadline: new Date(
                        now + settlementDeadlineMinutes * 60_000
                    ).toISOString(),
                },
            },
        }

        await sdk.ledger.internal.submit({
            commands: [createTrade],
            disclosedContracts: [],
            actAs: [this.venue],
        })
        this.logger.info('Venue created OTCTrade')

        const otcTrades = await sdk.ledger.acsReader.readJsContracts({
            templateIds: [OTC_TRADE_TEMPLATE_ID],
            parties: [this.venue],
            filterByParty: true,
        })
        const otcTradeCid = otcTrades[0]?.contractId
        if (!otcTradeCid) throw new Error('OTCTrade not found for venue')

        // Venue requests allocations from every trader
        const requestAllocationsCmd = [
            {
                ExerciseCommand: {
                    templateId: OTC_TRADE_TEMPLATE_ID,
                    contractId: otcTradeCid,
                    choice: 'OTCTrade_RequestAllocations',
                    choiceArgument: {},
                },
            },
        ]

        await sdk.ledger.internal.submit({
            commands: requestAllocationsCmd,
            actAs: [this.venue],
        })
        this.logger.info('Venue requested allocations')

        // The venue sees every trader's request
        const requests = await this.waitFor(
            'V2 allocation requests',
            async () => sdk.token.v2.allocation.request.pending(this.venue),
            (found) => found.length > 0
        )
        const settlement = requests[0].interfaceViewValue.settlement

        this.logger.info(
            `Requests for settlement ${settlement.id} are visible in the portfolio (Offers → Allocations)`
        )

        return {
            otcTradeCid,
            settlement,
            tradeLegs,
            expectedAllocationCount: tradeLegs.length,
            instrumentAdmin,
        }
    }

    async settle(
        args: OTCTradeV2Setup & { maxAttempts?: number; intervalMs?: number }
    ): Promise<void> {
        // Once the legs have been allocated, venue settles the trade triggering transfer of holdings
        const sdk = await this.getSdk()
        const { otcTradeCid, settlement, tradeLegs, instrumentAdmin } = args
        const legIds = tradeLegs.map((t) => t.leg.transferLegId)

        const legsCovered = (allocations: V2Allocations) => {
            const sides = allocations.flatMap(
                (a) => a.interfaceViewValue.allocation.transferLegSides
            )
            return legIds.every(
                (id) =>
                    sides.some(
                        (s) => s.transferLegId === id && s.side === 'SenderSide'
                    ) &&
                    sides.some(
                        (s) =>
                            s.transferLegId === id && s.side === 'ReceiverSide'
                    )
            )
        }

        // Poll until every leg is allocated on both sides
        const allocations = await this.waitFor(
            'allocations covering every leg',
            async () =>
                sdk.token.v2.allocation
                    .scan({
                        partyId: this.venue,
                        settlement,
                        transferLegIds: legIds,
                        maxAttempts: 1,
                        retryIntervalMs: 1000,
                    })
                    .catch(() => [] as unknown as V2Allocations),
            legsCovered,
            {
                maxAttempts: args.maxAttempts ?? 60,
                intervalMs: args.intervalMs ?? 15_000,
            }
        )

        for (const { leg } of tradeLegs) {
            const side = allocations
                .flatMap(
                    (a) => a.interfaceViewValue.allocation.transferLegSides
                )
                .find((s) => s.transferLegId === leg.transferLegId)
            if (!side || !new Decimal(side.amount).equals(leg.amount)) {
                throw new Error(
                    `Allocation for ${leg.transferLegId} doesn't match the trade`
                )
            }
        }
        this.logger.info(
            `Every leg is allocated (${allocations.length} allocations)`
        )

        const { factoryId, choiceContext } =
            await sdk.token.v2.allocation.settlement.factory({
                registryUrl: this.registryUrl,
                args: {
                    settlement,
                    transferLegs: tradeLegs.map((t) => t.leg),
                    allocations: allocations.map(
                        (a) =>
                            ({
                                allocationCid: a.contractId,
                                extraTransferLegSides: [],
                                nextIterationFunding: null,
                            }) as unknown as FinalizedAllocation
                    ),
                    actors: [this.venue],
                    extraArgs: {
                        context: { values: {} },
                        meta: { values: {} },
                    },
                },
            })

        const settleCmd = [
            {
                ExerciseCommand: {
                    templateId: OTC_TRADE_TEMPLATE_ID,
                    contractId: otcTradeCid,
                    choice: 'OTCTrade_Settle',
                    choiceArgument: {
                        batchesByAdmin: [
                            [
                                instrumentAdmin,
                                {
                                    tag: 'SettlementBatchV2',
                                    value: {
                                        allocationCids: allocations.map(
                                            (a) => a.contractId
                                        ),
                                        missingAllocations: [],
                                        factoryCid: factoryId,
                                        extraArgs: {
                                            context: {
                                                ...choiceContext.choiceContextData,
                                                values:
                                                    choiceContext
                                                        .choiceContextData
                                                        ?.values ?? {},
                                            },
                                            meta: { values: {} },
                                        },
                                    },
                                },
                            ],
                        ],
                        // AllocationRequest_Accept already consumed the requests
                        allocationRequests: [],
                    },
                },
            },
        ]

        await sdk.ledger.internal.submit({
            commands: settleCmd,
            disclosedContracts: choiceContext.disclosedContracts ?? [],
            actAs: [this.venue],
        })

        this.logger.info(
            `Venue settled the OTCTrade (settlement ${settlement.id}), holdings are transferred`
        )
    }

    private async waitFor<T>(
        description: string,
        fn: () => Promise<T>,
        done: (value: T) => boolean,
        { maxAttempts = 30, intervalMs = 1000 } = {}
    ): Promise<T> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const value = await fn()
            if (done(value)) return value
            this.logger.info(
                `Waiting for ${description} (attempt ${attempt}/${maxAttempts})`
            )
            await new Promise((resolve) => setTimeout(resolve, intervalMs))
        }
        throw new Error(`Timed out waiting for ${description}`)
    }
}
