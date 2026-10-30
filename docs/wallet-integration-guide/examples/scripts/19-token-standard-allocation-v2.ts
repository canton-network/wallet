import pino from 'pino'
import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import {
    localNetGlobalSynchronizer,
    TOKEN_NAMESPACE_CONFIG_SIMPLE,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
} from './utils/index.js'
import type { PartyInfo } from './04-token-standard-allocation.js'
import type { FinalizedAllocation } from '@canton-network/core-token-standard-v2'
import Decimal from 'decimal.js'
import {
    startRegistry,
    stopRegistry,
} from '@canton-network/example-test-token-v2-registry'
import { TEST_TOKEN_V2_REGISTRY } from './utils/constants.js'
import { assertV2 } from './utils/assert.js'
import { TestTokenV2 } from '@canton-network/core-splice-codegen'

/*
Used the TokenStandardV2AllocationIntegrationTest: https://github.com/canton-network/splice/blob/main/apps/app/src/test/scala/org/lfdecentralizedtrust/splice/integration/tests/TokenStandardV2AllocationIntegrationTest.scala
and the TokenStandardV2TestUtil https://github.com/canton-network/splice/blob/main/apps/app/src/test/scala/org/lfdecentralizedtrust/splice/integration/tests/TokenStandardV2TestUtil.scala
as a template for this
*/

async function poll<T>(
    description: string,
    fn: () => Promise<readonly T[] | undefined>,
    maxAttempts = 30,
    retryIntervalMs = 1000
): Promise<T[]> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result: T[] = [...((await fn()) ?? [])]
        if (result.length > 0) return result
        logger.info({ attempt, maxAttempts }, `Waiting for ${description}`)
        await new Promise((resolve) => setTimeout(resolve, retryIntervalMs))
    }
    throw new Error(`Timed out waiting for ${description}`)
}

const logger = pino({ name: 'v2-token-standard-allocation', level: 'info' })

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    // LocalNet may run both the global and an app synchronizer; the SDK refuses
    // to guess, so target the global one explicitly.
    synchronizerId: localNetGlobalSynchronizer,
    token: {
        auth: TOKEN_NAMESPACE_CONFIG_SIMPLE.auth,
        registries: [TEST_TOKEN_V2_REGISTRY.URL],
    },
})

await TestTokenV2.utils.vetDar(sdk)

// This example needs uploaded .dar for splice-token-test-trading-app
// It's in files of localnet, but it's not uploaded to participant, so we need to do this in the script
// Adjust if to your .localnet location
const PATH_TO_LOCALNET = '../../../../.localnet'
const PATH_TO_TRADING_APP_V2_DAR_IN_LOCALNET =
    '/dars/splice-token-test-trading-app-v2-1.0.0.dar'
const TRADING_APP_V2_PACKAGE_ID =
    '20d42271cbd760c26c08401e4d1eec624458f5b48c73ae44c87c754e35621f5d'

const here = path.dirname(fileURLToPath(import.meta.url))

const tradingDarPath = path.join(
    here,
    PATH_TO_LOCALNET,
    PATH_TO_TRADING_APP_V2_DAR_IN_LOCALNET
)

//upload dar
const darBytes = await fs.readFile(tradingDarPath)
await sdk.ledger.dar.upload(darBytes, TRADING_APP_V2_PACKAGE_ID)

logger.info('trading dar uploaded')

const aliceSendAmount = 100
const bobSendAmount = 20

const allocatedParties = await Promise.all(
    ['v2-04-alice', 'v2-04-bob', 'v2-04-venue'].map(async (partyHint) => {
        const partyKeys = sdk.keys.generate()
        const party = await sdk.party.external
            .create(partyKeys.publicKey, {
                partyHint,
            })
            .sign(partyKeys.privateKey)
            .execute()

        return [
            partyHint,
            {
                partyId: party.partyId,
                publicKeyFingerprint: party.publicKeyFingerprint,
                multiHash: party.multiHash,
                topologyTransactions: party.topologyTransactions,
                keyPair: partyKeys,
            },
        ] as const
    })
)

const adminKeys = sdk.keys.generate()
const admin = await sdk.party.external
    .create(adminKeys.publicKey, {
        partyHint: 'admin',
        isAdmin: true,
    })
    .sign(adminKeys.privateKey)
    .execute()

await startRegistry({
    sdk,
    port: TEST_TOKEN_V2_REGISTRY.PORT,
    operator: {
        party: admin.partyId,
        keys: adminKeys,
    },
})

const partyInfo: Map<string, PartyInfo> = new Map(allocatedParties)

const alice = partyInfo.get('v2-04-alice')!
const bob = partyInfo.get('v2-04-bob')!
const venue = partyInfo.get('v2-04-venue')!

logger.info(`fund alice`)

// Direct creation requires the admin and account owner to authorize it.
const adminTestTokenCreateCommand = TestTokenV2.commands.create.token({
    amount: '2000000',
    account: {
        owner: admin.partyId,
        provider: null,
        id: '',
    },
    instrumentId: {
        admin: admin.partyId,
    },
})

await sdk.ledger
    .prepare({
        partyId: admin.partyId,
        commands: adminTestTokenCreateCommand,
    })
    .sign(adminKeys.privateKey)
    .execute({ partyId: admin.partyId })

const [fundAliceCommand, fundAliceDisclosedContracts] =
    await sdk.token.v2.transfer.create({
        sender: admin.partyId,
        recipient: alice.partyId,
        instrumentId: TestTokenV2.DAR.TestTokenID,
        registryUrl: TEST_TOKEN_V2_REGISTRY.URL,
        amount: '2000000',
    })

await sdk.ledger
    .prepare({
        partyId: admin.partyId,
        commands: fundAliceCommand,
        disclosedContracts: fundAliceDisclosedContracts,
    })
    .sign(adminKeys.privateKey)
    .execute({ partyId: admin.partyId })

const alicePendingTransfers = await sdk.token.v2.transfer.pending(alice.partyId)
const fundingTransfer = alicePendingTransfers.find(
    (transfer) =>
        transfer.interfaceViewValue.transfer.sender.owner === admin.partyId &&
        transfer.interfaceViewValue.transfer.instrumentId.admin ===
            admin.partyId &&
        transfer.interfaceViewValue.transfer.instrumentId.id ===
            TestTokenV2.DAR.TestTokenID
)
assertV2(!!fundingTransfer, 'No funding transfer found for Alice')

const [acceptFundingCommand, acceptFundingDisclosedContracts] =
    await sdk.token.v2.transfer.accept(
        fundingTransfer.contractId,
        [alice.partyId],
        TEST_TOKEN_V2_REGISTRY.URL
    )

await sdk.ledger
    .prepare({
        partyId: alice.partyId,
        commands: acceptFundingCommand,
        disclosedContracts: acceptFundingDisclosedContracts,
    })
    .sign(alice.keyPair.privateKey)
    .execute({ partyId: alice.partyId })

const aliceUtxosAfterFunding = await sdk.token.v2.utxos.list({
    partyId: alice.partyId,
})
const aliceTestTokenUtxos = aliceUtxosAfterFunding.filter(
    (utxo) =>
        utxo.interfaceViewValue.instrumentId.admin === admin.partyId &&
        utxo.interfaceViewValue.instrumentId.id === TestTokenV2.DAR.TestTokenID
)
const aliceBalance = aliceTestTokenUtxos.reduce(
    (sum, u) => sum + Number(u.interfaceViewValue.amount),
    0
)

assertV2(
    aliceBalance >= 2_000_000,
    `Expected Alice to have at least 2000000 TestTokenV2 after funding, got ${aliceBalance}`
)

logger.info({ aliceBalance }, 'Funded Alice with TestTokenV2')

logger.info(`fund bob`)

await sdk.ledger
    .prepare({
        partyId: admin.partyId,
        commands: adminTestTokenCreateCommand,
    })
    .sign(adminKeys.privateKey)
    .execute({ partyId: admin.partyId })

const [fundBobCommand, fundBobDisclosedContracts] =
    await sdk.token.v2.transfer.create({
        sender: admin.partyId,
        recipient: bob.partyId,
        instrumentId: TestTokenV2.DAR.TestTokenID,
        registryUrl: TEST_TOKEN_V2_REGISTRY.URL,
        amount: '2000000',
    })

await sdk.ledger
    .prepare({
        partyId: admin.partyId,
        commands: fundBobCommand,
        disclosedContracts: fundBobDisclosedContracts,
    })
    .sign(adminKeys.privateKey)
    .execute({ partyId: admin.partyId })

const bobPendingTransfers = await sdk.token.v2.transfer.pending(bob.partyId)
const bobFundingTransfer = bobPendingTransfers.find(
    (transfer) =>
        transfer.interfaceViewValue.transfer.sender.owner === admin.partyId &&
        transfer.interfaceViewValue.transfer.instrumentId.admin ===
            admin.partyId &&
        transfer.interfaceViewValue.transfer.instrumentId.id ===
            TestTokenV2.DAR.TestTokenID
)
assertV2(!!bobFundingTransfer, 'No funding transfer found for Bob')

const [acceptBobFundingCommand, acceptBobFundingDisclosedContracts] =
    await sdk.token.v2.transfer.accept(
        bobFundingTransfer.contractId,
        [bob.partyId],
        TEST_TOKEN_V2_REGISTRY.URL
    )

await sdk.ledger
    .prepare({
        partyId: bob.partyId,
        commands: acceptBobFundingCommand,
        disclosedContracts: acceptBobFundingDisclosedContracts,
    })
    .sign(bob.keyPair.privateKey)
    .execute({ partyId: bob.partyId })

const bobUtxosAfterFunding = await sdk.token.v2.utxos.list({
    partyId: bob.partyId,
})
const bobTestTokenUtxos = bobUtxosAfterFunding.filter(
    (utxo) =>
        utxo.interfaceViewValue.instrumentId.admin === admin.partyId &&
        utxo.interfaceViewValue.instrumentId.id === TestTokenV2.DAR.TestTokenID
)
const bobBalance = bobTestTokenUtxos.reduce(
    (sum, u) => sum + Number(u.interfaceViewValue.amount),
    0
)

assertV2(
    bobBalance >= 2_000_000,
    `Expected Bob to have at least 2000000 TestTokenV2 after funding, got ${bobBalance}`
)

logger.info(
    { aliceBalance, bobBalance },
    'Funded Alice and Bob with TestTokenV2'
)

const basicAccount = (partyId: string) => ({
    owner: partyId,
    provider: null,
    id: '',
})

const tradeLeg = (
    transferLegId: string,
    from: PartyInfo,
    to: PartyInfo,
    amount: number
) => ({
    admin: admin.partyId,
    leg: {
        transferLegId,
        sender: basicAccount(from.partyId),
        receiver: basicAccount(to.partyId),
        amount: String(amount),
        instrumentId: TestTokenV2.DAR.TestTokenID,
        meta: { values: {} },
    },
})

const tradeLegs = [
    tradeLeg('leg0', alice, bob, aliceSendAmount),
    tradeLeg('leg1', bob, alice, bobSendAmount),
]

//venue writes executed trade to ledger

const OTC_TRADE_TEMPLATE_ID =
    '#splice-token-test-trading-app-v2:Splice.Testing.Apps.TradingAppV2:OTCTrade'
const now = Date.now()
const createProposal = {
    CreateCommand: {
        templateId: OTC_TRADE_TEMPLATE_ID,
        createArguments: {
            venue: venue.partyId,
            tradeLegs,
            createdAt: new Date(now).toISOString(),
            settleAt: new Date(now + 30_000).toISOString(),
            settlementDeadline: new Date(now + 10 * 60_000).toISOString(),
        },
    },
}

await sdk.ledger
    .prepare({
        partyId: venue.partyId,
        commands: createProposal,
        disclosedContracts: [],
    })
    .sign(venue.keyPair.privateKey)
    .execute({ partyId: venue.partyId })

const activeTradeProposals = await sdk.ledger.acsReader.readJsContracts({
    templateIds: [OTC_TRADE_TEMPLATE_ID],
    parties: [venue.partyId],
    filterByParty: true,
})

const otcpCid = activeTradeProposals[0]?.contractId

assertV2(!!otcpCid, 'Unexpected lack of OTCTradeProposal contract')

logger.info('Created active trade proposal')

const requestAllocationsCmd = [
    {
        ExerciseCommand: {
            templateId: OTC_TRADE_TEMPLATE_ID,
            contractId: otcpCid,
            choice: 'OTCTrade_RequestAllocations',
            choiceArgument: {},
        },
    },
]

await sdk.ledger
    .prepare({
        partyId: venue.partyId,
        commands: requestAllocationsCmd,
        disclosedContracts: [],
    })
    .sign(venue.keyPair.privateKey)
    .execute({ partyId: venue.partyId })

logger.info(`Venue requested allocations from alice and bob`)

async function acceptAsTrader(trader: PartyInfo, name: string) {
    const [request] = await poll(`V2 allocation request for ${name}`, () =>
        sdk.token.v2.allocation.request.pending(trader.partyId)
    )

    const [commands, dc] = await sdk.token.v2.allocation.request.accept({
        request,
        partyId: trader.partyId,
    })

    // Interactive submission supports one command per prepared transaction.
    for (const command of commands) {
        await sdk.ledger
            .prepare({
                partyId: trader.partyId,
                commands: command,
                disclosedContracts: dc,
            })
            .sign(trader.keyPair.privateKey)
            .execute({ partyId: trader.partyId })
    }

    logger.info(
        { allocations: commands.length - 1 },
        `${name} allocated and accepted request`
    )

    return request.interfaceViewValue.settlement
}

const settlement = await acceptAsTrader(alice, 'Alice')
await acceptAsTrader(bob, 'Bob')

//venue batch settles the trade

const allocations = await sdk.token.v2.allocation.scan({
    partyId: venue.partyId,
    settlement,
    transferLegIds: tradeLegs.map((t) => t.leg.transferLegId),
})

const allLegSides = allocations.flatMap(
    (a) => a.interfaceViewValue.allocation.transferLegSides
)

for (const leg of tradeLegs) {
    const legSide = allLegSides.find(
        (ls) => ls.transferLegId === leg.leg.transferLegId
    )
    assertV2(
        legSide !== undefined,
        `No allocation found for leg ${leg.leg.transferLegId}`
    )

    const actualAmount = new Decimal(legSide.amount)
    const legAmount = new Decimal(leg.leg.amount)

    assertV2(
        actualAmount.equals(legAmount),
        `Allocation for ${leg.leg.transferLegId} has amount ${actualAmount}, expected ${legAmount}`
    )
}

const emptyExtraArgs = { context: { values: {} }, meta: { values: {} } }

const finalizedAllocation: FinalizedAllocation[] = allocations.map(
    (a) =>
        ({
            allocationCid: a.contractId,
            extraTransferLegSides: [],
            nextIterationFunding: null,
        }) as unknown as FinalizedAllocation
)

const { factoryId, choiceContext } =
    await sdk.token.v2.allocation.settlement.factory({
        registryUrl: TEST_TOKEN_V2_REGISTRY.URL,
        args: {
            settlement,
            transferLegs: tradeLegs.map((t) => t.leg),
            allocations: finalizedAllocation,
            actors: [venue.partyId],
            extraArgs: emptyExtraArgs,
        },
    })

const settleCmd = [
    {
        ExerciseCommand: {
            templateId: OTC_TRADE_TEMPLATE_ID,
            contractId: otcpCid,
            choice: 'OTCTrade_Settle',
            choiceArgument: {
                batchesByAdmin: [
                    [
                        admin.partyId,
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
                                            choiceContext.choiceContextData
                                                ?.values ?? {},
                                    },
                                    meta: { values: {} },
                                },
                            },
                        },
                    ],
                ],
                allocationRequests: [], // AllocationRequest_Accept already consumed the requests.
            },
        },
    },
]

await sdk.ledger
    .prepare({
        partyId: venue.partyId,
        commands: settleCmd,
        disclosedContracts: choiceContext.disclosedContracts,
    })
    .sign(venue.keyPair.privateKey)
    .execute({ partyId: venue.partyId })

logger.info(`venue settled OTCTrade`)

const utxosAliceV2 = await sdk.token.v2.utxos.list({
    partyId: alice.partyId,
    includeLocked: true,
})

logger.info(utxosAliceV2)

const utxosBobV2 = await sdk.token.v2.utxos.list({
    partyId: bob.partyId,
    includeLocked: true,
})

logger.info(utxosBobV2)

function sumUnlocked(
    utxos: Awaited<ReturnType<typeof sdk.token.v2.utxos.list>>
) {
    return utxos
        .filter(
            (u) =>
                u.interfaceViewValue.lock === null &&
                u.interfaceViewValue.instrumentId.admin === admin.partyId &&
                u.interfaceViewValue.instrumentId.id ===
                    TestTokenV2.DAR.TestTokenID
        )
        .reduce((sum, u) => sum + Number(u.interfaceViewValue.amount), 0)
}

const aliceBalanceBeforeTrade = aliceBalance
const bobBalanceBeforeTrade = bobBalance

const aliceBalanceAfter = sumUnlocked(utxosAliceV2)
const bobBalanceAfter = sumUnlocked(utxosBobV2)

const aliceNet = aliceBalanceAfter - aliceBalanceBeforeTrade
const bobNet = bobBalanceAfter - bobBalanceBeforeTrade

assertV2(
    aliceNet === bobSendAmount - aliceSendAmount,
    `Alice's net balance change was ${aliceNet}, expected ${
        bobSendAmount - aliceSendAmount
    }`
)
assertV2(
    bobNet === aliceSendAmount - bobSendAmount,
    `Bob's net balance change was ${bobNet}, expected ${
        aliceSendAmount - bobSendAmount
    }`
)

logger.info(
    { aliceNet, bobNet },
    'Verified settlement produced expected balance changes'
)
stopRegistry()
