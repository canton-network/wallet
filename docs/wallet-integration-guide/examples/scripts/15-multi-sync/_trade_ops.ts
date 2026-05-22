// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { randomUUID } from 'node:crypto'
import type { Logger } from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import { signTransactionHash } from '@canton-network/core-signing-lib'
import type { ContractSpec } from '../utils/index.js'
import type { MultiSyncSetup, PartyInfo } from './_setup.js'
import {
    PARTY_HINT_ALICE,
    PARTY_HINT_BOB,
    PARTY_HINT_TRADING_APP,
    PARTY_HINT_TOKEN_ADMIN,
    LOCALNET_TEST_TOKEN_REGISTRY_URL,
} from './_config.js'

export const AMULET_TEMPLATE_ID = '#splice-amulet:Splice.Amulet:Amulet'
export const TEST_TOKEN_PREFIX =
    '#splice-test-token-v1:Splice.Testing.Tokens.TestTokenV1'
export const TRADING_APP_PREFIX =
    '#splice-token-test-trading-app-v2:Splice.Testing.Apps.TradingAppV2'

export const ALICE_AMULET_TAP_AMOUNT = '2000000'
export const BOB_TOKEN_MINT_AMOUNT = '500'
export const TRADE_AMULET_AMOUNT = '100'
export const TRADE_TOKEN_AMOUNT = '20'

const MS_1_HOUR = 60 * 60 * 1000

// Splice.Api.Token.HoldingV2:Account
export interface V2Account {
    owner: string | null
    provider: string | null
    id: string
}
// Splice.Api.Token.AllocationV2:TransferLeg
export interface V2TransferLeg {
    transferLegId: string
    sender: V2Account
    receiver: V2Account
    amount: string
    instrumentId: string
    meta: { values: Record<string, string> }
}
// Splice.Testing.Apps.TradingAppV2:TradeLeg
export interface V2TradeLeg {
    admin: string
    leg: V2TransferLeg
}

/** A regular (non-delegated) account: just an owner, no provider, empty id. */
function account(partyId: string): V2Account {
    return { owner: partyId, provider: null, id: '' }
}

/**
 * Builds the two DvP transfer legs for the OTCTrade:
 *   leg-0: Alice → Bob, 100 Amulet     (instrument admin: Amulet DSO)
 *   leg-1: Bob → Alice, 20 TestToken   (instrument admin: tokenAdmin)
 */
export function buildTradeLegs(setup: MultiSyncSetup): V2TradeLeg[] {
    const { alice, bob, tokenAdmin, amuletAdmin } = setup
    return [
        {
            admin: amuletAdmin,
            leg: {
                transferLegId: 'leg-0',
                sender: account(alice.partyId),
                receiver: account(bob.partyId),
                amount: TRADE_AMULET_AMOUNT,
                instrumentId: 'Amulet',
                meta: { values: {} },
            },
        },
        {
            admin: tokenAdmin.partyId,
            leg: {
                transferLegId: 'leg-1',
                sender: account(bob.partyId),
                receiver: account(alice.partyId),
                amount: TRADE_TOKEN_AMOUNT,
                instrumentId: 'TestToken',
                meta: { values: {} },
            },
        },
    ]
}

export function buildContractReadSpec(setup: MultiSyncSetup): ContractSpec[] {
    const { p1Sdk, p2Sdk, p3Sdk, alice, bob, tradingApp, tokenAdmin } = setup
    return [
        {
            label: PARTY_HINT_ALICE,
            sdk: p1Sdk,
            templateIds: [
                AMULET_TEMPLATE_ID,
                `${TEST_TOKEN_PREFIX}:Token`,
                `${TRADING_APP_PREFIX}:OTCTradeAllocationRequest`,
            ],
            parties: [alice.partyId],
        },
        {
            label: PARTY_HINT_BOB,
            sdk: p2Sdk,
            templateIds: [
                AMULET_TEMPLATE_ID,
                `${TEST_TOKEN_PREFIX}:Token`,
                `${TRADING_APP_PREFIX}:OTCTradeAllocationRequest`,
            ],
            parties: [bob.partyId],
        },
        {
            label: PARTY_HINT_TOKEN_ADMIN,
            sdk: p3Sdk,
            templateIds: [`${TEST_TOKEN_PREFIX}:TokenRules`],
            parties: [tokenAdmin.partyId],
        },
        {
            label: PARTY_HINT_TRADING_APP,
            sdk: p3Sdk,
            templateIds: [
                `${TRADING_APP_PREFIX}:OTCTrade`,
                `${TRADING_APP_PREFIX}:OTCTradeAllocationRequest`,
                `${TRADING_APP_PREFIX}:TradeSettlementAgreement`,
            ],
            parties: [tradingApp.partyId],
        },
    ]
}

export async function mintAmuletForAlice(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { p1Sdk, alice, globalSynchronizerId, scanProxy } = setup
    const [amuletRulesContract, activeRoundContract] = await Promise.all([
        scanProxy.getAmuletRules(),
        scanProxy.getActiveOpenMiningRound(),
    ])
    if (!activeRoundContract) throw new Error('No active OpenMiningRound found')
    const amuletRulesCid = amuletRulesContract.contract_id
    const openMiningRoundCid = activeRoundContract.contract_id

    await p1Sdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [
                {
                    ExerciseCommand: {
                        templateId:
                            '#splice-amulet:Splice.AmuletRules:AmuletRules',
                        contractId: amuletRulesCid,
                        choice: 'AmuletRules_DevNet_Tap',
                        choiceArgument: {
                            receiver: alice.partyId,
                            amount: ALICE_AMULET_TAP_AMOUNT,
                            openRound: openMiningRoundCid,
                        },
                    },
                },
            ],
            disclosedContracts: [
                {
                    templateId: amuletRulesContract.template_id,
                    contractId: amuletRulesCid,
                    createdEventBlob: amuletRulesContract.created_event_blob,
                    synchronizerId: globalSynchronizerId,
                },
                {
                    templateId: activeRoundContract.template_id,
                    contractId: openMiningRoundCid,
                    createdEventBlob: activeRoundContract.created_event_blob,
                    synchronizerId: globalSynchronizerId,
                },
            ],
            synchronizerId: globalSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info(
        `Alice: Amulet minted (${ALICE_AMULET_TAP_AMOUNT}) on global synchronizer`
    )
}

export async function createTokenRulesAndMintForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const {
        p2Sdk,
        p3Sdk,
        tokenNamespaceP2,
        bob,
        tokenAdmin,
        appSynchronizerId,
        globalSynchronizerId,
    } = setup

    // Create TokenRules on both synchronizers in parallel via p3Sdk.
    // P3 (sv) is connected to both global and app-synchronizer, so p3Sdk can submit
    // as tokenAdmin (primary on P3) to either synchronizer without any secondary registrations.
    await Promise.all([
        p3Sdk.ledger
            .prepare({
                partyId: tokenAdmin.partyId,
                commands: {
                    CreateCommand: {
                        templateId: `${TEST_TOKEN_PREFIX}:TokenRules`,
                        createArguments: { admin: tokenAdmin.partyId },
                    },
                },
                disclosedContracts: [],
                synchronizerId: globalSynchronizerId,
            })
            .sign(tokenAdmin.keyPair.privateKey)
            .execute({ partyId: tokenAdmin.partyId }),
        p3Sdk.ledger
            .prepare({
                partyId: tokenAdmin.partyId,
                commands: {
                    CreateCommand: {
                        templateId: `${TEST_TOKEN_PREFIX}:TokenRules`,
                        createArguments: { admin: tokenAdmin.partyId },
                    },
                },
                disclosedContracts: [],
                synchronizerId: appSynchronizerId,
            })
            .sign(tokenAdmin.keyPair.privateKey)
            .execute({ partyId: tokenAdmin.partyId }),
    ])

    // Mint Token on app-synchronizer via p3Sdk (P3/sv is connected to both synchronizers).
    await p3Sdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: [
                {
                    CreateCommand: {
                        templateId: `${TEST_TOKEN_PREFIX}:Token`,
                        createArguments: {
                            holding: {
                                owner: tokenAdmin.partyId,
                                instrumentId: {
                                    admin: tokenAdmin.partyId,
                                    id: 'TestToken',
                                },
                                amount: BOB_TOKEN_MINT_AMOUNT,
                                lock: null,
                                meta: { values: {} },
                            },
                        },
                    },
                },
            ],
            disclosedContracts: [],
            synchronizerId: appSynchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })

    const adminTokenHoldings = await p3Sdk.ledger.acs.read({
        templateIds: [`${TEST_TOKEN_PREFIX}:Token`],
        parties: [tokenAdmin.partyId],
        filterByParty: true,
    })
    const adminTokenCid = adminTokenHoldings[0]?.contractId
    if (!adminTokenCid)
        throw new Error('TokenAdmin Token holding not found after mint')

    // Transfer Token from tokenAdmin to Bob on app-synchronizer.
    // The registry returns the app-sync TokenRules as the transfer factory.
    const [transferCommand, transferDisclosed] =
        await p3Sdk.token.transfer.create({
            sender: tokenAdmin.partyId,
            recipient: bob.partyId,
            amount: BOB_TOKEN_MINT_AMOUNT,
            instrumentId: 'TestToken',
            registryUrl: LOCALNET_TEST_TOKEN_REGISTRY_URL,
            inputUtxos: [adminTokenCid],
        })

    await p3Sdk.ledger
        .prepare({
            partyId: tokenAdmin.partyId,
            commands: [transferCommand],
            disclosedContracts: transferDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(tokenAdmin.keyPair.privateKey)
        .execute({ partyId: tokenAdmin.partyId })

    let transferOfferCid: string | undefined
    const deadline = Date.now() + 30_000
    while (!transferOfferCid && Date.now() < deadline) {
        const transferOffers = await p2Sdk.ledger.acs.read({
            templateIds: [`${TEST_TOKEN_PREFIX}:TokenTransferOffer`],
            parties: [bob.partyId],
            filterByParty: true,
        })
        transferOfferCid = transferOffers[0]?.contractId
        if (!transferOfferCid)
            await new Promise((res) => setTimeout(res, 2_000))
    }
    if (!transferOfferCid)
        throw new Error('TokenTransferOffer not found for Bob after 30s')

    const [acceptCommand, acceptDisclosed] =
        await tokenNamespaceP2.transfer.accept({
            transferInstructionCid: transferOfferCid,
            registryUrl: LOCALNET_TEST_TOKEN_REGISTRY_URL,
        })

    await p2Sdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [acceptCommand],
            disclosedContracts: acceptDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        `TokenAdmin: TokenRules created on global + app synchronizers; Bob: ${BOB_TOKEN_MINT_AMOUNT} TestToken minted on app-synchronizer`
    )
}

/**
 * Venue creates the v2 `OTCTrade` and requests allocations from the traders.
 *
 * The v2 trading app splits the trade into single-signatory steps:
 *   1. Venue creates `OTCTrade` — signatory is the venue ONLY (no trader approval
 *      dance like the v1 `OTCTradeProposal`). Single-party submission.
 *   2. Venue exercises `OTCTrade_RequestAllocations` (nonconsuming) → one
 *      `OTCTradeAllocationRequest` per authorizing account. Traders observe these
 *      requests and allocate against them.
 *
 * Because `OTCTrade` carries only the venue's authority, settling V1 assets later
 * needs the `TradeSettlementAgreement` infrastructure (see createSettlementAgreement).
 */
export async function createOtcTradeAndRequestAllocations(
    setup: MultiSyncSetup,
    tradeLegs: V2TradeLeg[],
    logger: Logger
): Promise<{ otcTradeCid: string; allocationRequestCids: string[] }> {
    const { p3Sdk, tradingApp, globalSynchronizerId } = setup

    const now = Date.now()
    const createdAt = new Date(now).toISOString()
    const settleAt = new Date(now + MS_1_HOUR).toISOString()

    await p3Sdk.ledger
        .prepare({
            partyId: tradingApp.partyId,
            commands: {
                CreateCommand: {
                    templateId: `${TRADING_APP_PREFIX}:OTCTrade`,
                    createArguments: {
                        venue: tradingApp.partyId,
                        tradeLegs,
                        createdAt,
                        settleAt,
                        settlementDeadline: null,
                    },
                },
            },
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(tradingApp.keyPair.privateKey)
        .execute({ partyId: tradingApp.partyId })

    const otcTradeContracts = await p3Sdk.ledger.acs.read({
        templateIds: [`${TRADING_APP_PREFIX}:OTCTrade`],
        parties: [tradingApp.partyId],
        filterByParty: true,
    })
    const otcTradeCid = otcTradeContracts[0]?.contractId
    if (!otcTradeCid) throw new Error('OTCTrade not found after creation')
    logger.info('TradingApp: OTCTrade created (leg-0 Amulet, leg-1 TestToken)')

    await p3Sdk.ledger
        .prepare({
            partyId: tradingApp.partyId,
            commands: [
                {
                    ExerciseCommand: {
                        templateId: `${TRADING_APP_PREFIX}:OTCTrade`,
                        contractId: otcTradeCid,
                        choice: 'OTCTrade_RequestAllocations',
                        choiceArgument: {},
                    },
                },
            ],
            disclosedContracts: [],
            synchronizerId: globalSynchronizerId,
        })
        .sign(tradingApp.keyPair.privateKey)
        .execute({ partyId: tradingApp.partyId })

    const allocationRequests = await p3Sdk.ledger.acs.read({
        templateIds: [`${TRADING_APP_PREFIX}:OTCTradeAllocationRequest`],
        parties: [tradingApp.partyId],
        filterByParty: true,
    })
    const allocationRequestCids = allocationRequests.map((c) => c.contractId)
    if (allocationRequestCids.length === 0)
        throw new Error('No OTCTradeAllocationRequest created')
    logger.info(
        `TradingApp: OTCTrade_RequestAllocations executed → ${allocationRequestCids.length} allocation request(s)`
    )

    return { otcTradeCid, allocationRequestCids }
}

/**
 * Creates a `TradeSettlementAgreement` between the venue and a single trader.
 *
 * This contract is `signatory venue, trader`, so creating it needs the authority
 * of BOTH parties — it cannot be a single-party submission. The wallet SDK only
 * exposes single-party `prepare().sign().execute()`, so we drive the interactive
 * submission flow by hand: prepare once with `actAs: [venue, trader]`, have each
 * party sign the prepared-transaction hash, then submit `executeAndWait` with both
 * party signatures.
 *
 * `preparingSdk` must be the trader's own participant SDK (P1 for Alice, P2 for Bob):
 * the preparing participant has to be able to act for both `actAs` parties, and the
 * setup co-hosts the venue on P1/P2 exactly so the trader participant can do this.
 *
 * The agreement gives the venue the standing it needs to drive V1 allocation
 * settlement on the trader's behalf inside `OTCTrade_Settle`.
 */
export async function createSettlementAgreement(
    setup: MultiSyncSetup,
    preparingSdk: MultiSyncSetup['p1Sdk'],
    preparingSdkCtx: MultiSyncSetup['p1SdkCtx'],
    trader: PartyInfo,
    logger: Logger
): Promise<string> {
    const { tradingApp, globalSynchronizerId } = setup

    const prepared = await preparingSdk.ledger.internal.prepare({
        commands: [
            {
                CreateCommand: {
                    templateId: `${TRADING_APP_PREFIX}:TradeSettlementAgreement`,
                    createArguments: {
                        venue: tradingApp.partyId,
                        trader: trader.partyId,
                    },
                },
            },
        ],
        actAs: [tradingApp.partyId, trader.partyId],
        synchronizerId: globalSynchronizerId,
        disclosedContracts: [],
    })

    const partySignatures = [tradingApp, trader].map((p) => ({
        party: p.partyId,
        signatures: [
            {
                signature: signTransactionHash(
                    prepared.preparedTransactionHash,
                    p.keyPair.privateKey
                ),
                // The fingerprint is the namespace part of the party id.
                signedBy: p.partyId.split('::')[1],
                format: 'SIGNATURE_FORMAT_CONCAT',
                signingAlgorithmSpec: 'SIGNING_ALGORITHM_SPEC_ED25519',
            },
        ],
    }))

    const ledgerProvider = preparingSdkCtx.ledgerProvider as unknown as {
        request: (opts: {
            method: string
            params: Record<string, unknown>
        }) => Promise<unknown>
    }
    await ledgerProvider.request({
        method: 'ledgerApi',
        params: {
            resource: '/v2/interactive-submission/executeAndWait',
            requestMethod: 'post',
            body: {
                userId: preparingSdkCtx.userId,
                preparedTransaction: prepared.preparedTransaction,
                hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V2',
                submissionId: randomUUID(),
                deduplicationPeriod: { Empty: {} },
                partySignatures: { signatures: partySignatures },
            },
        },
    })

    const agreements = await preparingSdk.ledger.acs.read({
        templateIds: [`${TRADING_APP_PREFIX}:TradeSettlementAgreement`],
        parties: [trader.partyId],
        filterByParty: true,
    })
    const agreement = agreements.find(
        (c) =>
            (c as unknown as { createArgument?: { trader?: string } })
                .createArgument?.trader === trader.partyId
    )
    if (!agreement)
        throw new Error(
            `TradeSettlementAgreement not found for trader ${trader.partyId}`
        )

    logger.info(
        `TradeSettlementAgreement created: venue + ${trader.partyId.split('::')[0]}`
    )
    return agreement.contractId
}

export async function allocateAmuletForAlice(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<string> {
    const {
        p1Sdk,
        tokenNamespaceP1,
        alice,
        globalSynchronizerId,
        amuletAdmin,
    } = setup

    const pendingRequests = await tokenNamespaceP1.allocation.request.pending(
        alice.partyId
    )
    let requestView:
        | (typeof pendingRequests)[number]['interfaceViewValue']
        | undefined = undefined
    let legId: string | undefined = undefined
    for (const req of pendingRequests) {
        const view = req.interfaceViewValue
        if (!view) continue
        const found = Object.keys(view.transferLegs).find(
            (key) => view.transferLegs[key].sender === alice.partyId
        )
        if (found) {
            requestView = view
            legId = found
            break
        }
    }
    if (!requestView || !legId)
        throw new Error('No transfer leg found for Alice')

    const amuletHoldings = await p1Sdk.ledger.acs.read({
        templateIds: [AMULET_TEMPLATE_ID],
        parties: [alice.partyId],
        filterByParty: true,
    })
    const amuletHoldingCid = amuletHoldings[0]?.contractId
    if (!amuletHoldingCid) throw new Error('Amulet holding not found for Alice')

    const [command, disclosedContracts] =
        await tokenNamespaceP1.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: 'Amulet',
                displayName: 'Amulet',
                symbol: 'CC',
                registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
                admin: amuletAdmin,
            },
            inputUtxos: [amuletHoldingCid],
            requestedAt: new Date().toISOString(),
        })

    await p1Sdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [command],
            disclosedContracts,
            synchronizerId: globalSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info('Alice: Amulet allocated for leg-0 (global synchronizer)')
    return legId
}

export async function allocateTokenForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<{ legId: string }> {
    const { p2Sdk, tokenNamespaceP2, bob, tokenAdmin, globalSynchronizerId } =
        setup

    const pendingRequests = await tokenNamespaceP2.allocation.request.pending(
        bob.partyId
    )
    let requestView:
        | (typeof pendingRequests)[number]['interfaceViewValue']
        | undefined = undefined
    let legId: string | undefined = undefined
    for (const req of pendingRequests) {
        const view = req.interfaceViewValue
        if (!view) continue
        const found = Object.keys(view.transferLegs).find(
            (key) => view.transferLegs[key].sender === bob.partyId
        )
        if (found) {
            requestView = view
            legId = found
            break
        }
    }
    if (!requestView || !legId) throw new Error('No transfer leg found for Bob')

    const tokenHoldings = await p2Sdk.ledger.acs.read({
        templateIds: [`${TEST_TOKEN_PREFIX}:Token`],
        parties: [bob.partyId],
        filterByParty: true,
    })
    const tokenHolding = tokenHoldings[0]
    if (!tokenHolding) throw new Error('Token holding not found for Bob')

    const [command, disclosedFromHelper] =
        await tokenNamespaceP2.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: 'TestToken',
                displayName: 'TestToken',
                symbol: 'TT',
                registryUrl: LOCALNET_TEST_TOKEN_REGISTRY_URL,
                admin: tokenAdmin.partyId,
            },
            inputUtxos: [tokenHolding.contractId],
            requestedAt: new Date(Date.now()).toISOString(),
        })

    await p2Sdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [command],
            disclosedContracts: disclosedFromHelper,
            synchronizerId: globalSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        'Bob: TestToken allocated for leg-1 (global synchronizer; input auto-reassigned app-sync → global)'
    )
    return { legId }
}

export interface SettleParams {
    otcTradeCid: string
    legIdAlice: string
    legIdBob: string
    testTokenAllocationCid: string
    aliceAgreementCid: string
    bobAgreementCid: string
    allocationRequestCids: string[]
}

/**
 * Venue settles the trade with the v2 `OTCTrade_Settle` choice.
 *
 * Both legs are V1-token-standard assets (Amulet and the v1 TestToken), so each is
 * settled through the `SettlementBatchV1` path: per leg the venue supplies the V1
 * allocation, the registry-provided choice context (`extraArgs`), and the sender's
 * and receiver's `TradeSettlementAgreement`s — the latter carry the trader authority
 * needed to exercise `Allocation_ExecuteTransfer`.
 *
 * `OTCTrade_Settle` is a single atomic transaction on the global synchronizer, so the
 * Token allocation must be on global at this point (the allocation step above moved
 * it there). After settlement the Token holdings are on global; the self-transfer
 * step returns them to the app-synchronizer.
 */
export async function settleOtcTradeV2(
    setup: MultiSyncSetup,
    params: SettleParams,
    logger: Logger
): Promise<void> {
    const {
        p3Sdk,
        tokenNamespaceP1,
        tokenNamespaceP2,
        alice,
        tradingApp,
        tokenAdmin,
        amuletAdmin,
        globalSynchronizerId,
    } = setup
    const {
        otcTradeCid,
        legIdAlice,
        legIdBob,
        testTokenAllocationCid,
        aliceAgreementCid,
        bobAgreementCid,
        allocationRequestCids,
    } = params

    const allocationsAlice = await tokenNamespaceP1.allocation.pending(
        alice.partyId
    )
    const amuletAllocation = allocationsAlice.find(
        (a) => a.interfaceViewValue.allocation.transferLegId === legIdAlice
    )
    if (!amuletAllocation) throw new Error('Amulet allocation not found')

    const [amuletExecCtx, tokenExecCtx] = await Promise.all([
        tokenNamespaceP1.allocation.context.execute({
            allocationCid: amuletAllocation.contractId,
            registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
        }),
        tokenNamespaceP2.allocation.context.execute({
            allocationCid: testTokenAllocationCid,
            registryUrl: LOCALNET_TEST_TOKEN_REGISTRY_URL,
        }),
    ])

    const toExtraArgs = (ctx: {
        choiceContextData?: { values?: Record<string, unknown> }
    }) => ({
        context: { values: ctx.choiceContextData?.values ?? {} },
        meta: { values: {} },
    })

    const batchesByAdmin = [
        [
            amuletAdmin,
            {
                tag: 'SettlementBatchV1',
                value: {
                    allocationsWithContext: {
                        [legIdAlice]: {
                            allocationCid: amuletAllocation.contractId,
                            extraArgs: toExtraArgs(amuletExecCtx),
                            // leg-0 sender = Alice, receiver = Bob
                            senderAgreementCid: aliceAgreementCid,
                            receiverAgreementCid: bobAgreementCid,
                        },
                    },
                },
            },
        ],
        [
            tokenAdmin.partyId,
            {
                tag: 'SettlementBatchV1',
                value: {
                    allocationsWithContext: {
                        [legIdBob]: {
                            allocationCid: testTokenAllocationCid,
                            extraArgs: toExtraArgs(tokenExecCtx),
                            senderAgreementCid: bobAgreementCid,
                            receiverAgreementCid: aliceAgreementCid,
                        },
                    },
                },
            },
        ],
    ]

    const disclosedContracts = [
        ...(amuletExecCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
        ...(tokenExecCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
    ]

    await p3Sdk.ledger
        .prepare({
            partyId: tradingApp.partyId,
            commands: [
                {
                    ExerciseCommand: {
                        templateId: `${TRADING_APP_PREFIX}:OTCTrade`,
                        contractId: otcTradeCid,
                        choice: 'OTCTrade_Settle',
                        choiceArgument: {
                            batchesByAdmin,
                            allocationRequests: allocationRequestCids,
                        },
                    },
                },
            ],
            disclosedContracts,
            synchronizerId: globalSynchronizerId,
        })
        .sign(tradingApp.keyPair.privateKey)
        .execute({ partyId: tradingApp.partyId })

    logger.info(
        `TradingApp: OTCTrade_Settle executed — ${TRADE_AMULET_AMOUNT} Amulet → Bob, ${TRADE_TOKEN_AMOUNT} TestToken → Alice`
    )
}

export async function aliceSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { p1Sdk, tokenNamespaceP1, alice, appSynchronizerId } = setup

    const aliceTokens = await p1Sdk.ledger.acs.read({
        templateIds: [`${TEST_TOKEN_PREFIX}:Token`],
        parties: [alice.partyId],
        filterByParty: true,
    })
    const aliceTokenCid = aliceTokens[0]?.contractId
    if (!aliceTokenCid)
        throw new Error('Alice: Token holding not found after settlement')

    const [transferCommand, transferDisclosed] =
        await tokenNamespaceP1.transfer.create({
            sender: alice.partyId,
            recipient: alice.partyId,
            amount: TRADE_TOKEN_AMOUNT,
            instrumentId: 'TestToken',
            registryUrl: LOCALNET_TEST_TOKEN_REGISTRY_URL,
            inputUtxos: [aliceTokenCid],
        })

    // Alice's Token is on global after settlement; targeting app-sync causes Canton to
    // auto-reassign it. Alice is the owner/stakeholder of her Token, so this is allowed.
    // The registry returns the app-sync TokenRules as the factory, which is already on
    // app-sync — no PRESCRIBED_SYNCHRONIZER_ID_MISMATCH.
    await p1Sdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [transferCommand],
            disclosedContracts: transferDisclosed,
            synchronizerId: appSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info(
        `Alice: ${TRADE_TOKEN_AMOUNT} TestToken self-transferred on app-synchronizer`
    )
}

export async function bobSelfTransferToApp(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { p2Sdk, tokenNamespaceP2, bob, appSynchronizerId } = setup

    const bobTokens = await p2Sdk.ledger.acs.read({
        templateIds: [`${TEST_TOKEN_PREFIX}:Token`],
        parties: [bob.partyId],
        filterByParty: true,
    })

    if (bobTokens.length === 0) {
        logger.info('Bob: no TestToken holdings to self-transfer')
        return
    }

    for (const token of bobTokens) {
        const holdingAmount = (
            token as unknown as {
                createArgument: { holding: { amount: string } }
            }
        ).createArgument?.holding?.amount
        if (!holdingAmount)
            throw new Error('Cannot read amount from Bob Token holding')

        const [transferCommand, transferDisclosed] =
            await tokenNamespaceP2.transfer.create({
                sender: bob.partyId,
                recipient: bob.partyId,
                amount: holdingAmount,
                instrumentId: 'TestToken',
                registryUrl: LOCALNET_TEST_TOKEN_REGISTRY_URL,
                inputUtxos: [token.contractId],
            })

        // Bob's Token is on global after the allocation; targeting app-sync causes
        // Canton to auto-reassign it. Bob is the owner/stakeholder, so this is allowed.
        // The registry returns the app-sync TokenRules as the factory.
        await p2Sdk.ledger
            .prepare({
                partyId: bob.partyId,
                commands: [transferCommand],
                disclosedContracts: transferDisclosed,
                synchronizerId: appSynchronizerId,
            })
            .sign(bob.keyPair.privateKey)
            .execute({ partyId: bob.partyId })
    }

    logger.info(`Bob: TestToken self-transferred on app-synchronizer`)
}
