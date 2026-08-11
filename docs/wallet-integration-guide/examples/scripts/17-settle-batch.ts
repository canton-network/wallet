/**
 * CIP-0112 SettleBatch e2e against the example test-token registry.
 *
 * Flow: OfferMint → accept offer → AllocationFactory_Allocate (V2) →
 * SettlementFactory_SettleBatch.
 *
 * Requires: localnet + test-token registry on :5634.
 * Skips cleanly when the registry is unreachable so `script:test:examples`
 * stays green without the registry process.
 *
 * AllocationRequest.accept is covered by SDK unit tests; creating an
 * AllocationRequest still needs the trading-app OTC path (`04`).
 */
import {
    ALLOCATION_INTERFACE_ID_V2,
    AllocationViewV2,
    basicAccount,
    FinalizedAllocation,
} from '@canton-network/core-token-standard'
import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import { pino } from 'pino'
import {
    AMULET_NAMESPACE_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
} from './utils/index.js'

const logger = pino({ name: 'v2-17-settle-batch', level: 'info' })
const TEST_TOKEN_REGISTRY = new URL('http://localhost:5634')
const INSTRUMENT_ID = 'test-token-v2'
const HOLDING_TEMPLATE_ID =
    '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Holding:Token'
const ALLOCATION_TEMPLATE_ID =
    '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV2'

async function registryReachable(): Promise<boolean> {
    try {
        const res = await fetch(
            new URL('/registry/metadata/v1/info', TEST_TOKEN_REGISTRY)
        )
        return res.ok
    } catch {
        return false
    }
}

async function offerMint(
    receiver: string,
    amount: string
): Promise<{ offerCid: string }> {
    const res = await fetch(
        new URL('/admin/v2/offer-mint', TEST_TOKEN_REGISTRY),
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                receiver,
                amount,
                instrumentId: INSTRUMENT_ID,
            }),
        }
    )
    if (!res.ok) {
        throw new Error(`offer-mint failed: ${res.status} ${await res.text()}`)
    }
    return (await res.json()) as { offerCid: string }
}

if (!(await registryReachable())) {
    logger.warn(
        'test-token registry not reachable on :5634 — skipping SettleBatch e2e'
    )
    process.exit(0)
}

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    token: {
        registries: [TEST_TOKEN_REGISTRY],
        auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
        apiVersion: 'v2',
    },
    amulet: AMULET_NAMESPACE_CONFIG,
    asset: {
        registries: [TEST_TOKEN_REGISTRY],
        auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    },
})

async function createParty(hint: string) {
    const keys = sdk.keys.generate()
    const party = await sdk.party.external
        .create(keys.publicKey, { partyHint: hint })
        .sign(keys.privateKey)
        .execute()
    return { ...party, keys }
}

async function executePrepared(
    partyId: string,
    privateKey: string,
    prepared: readonly [unknown, unknown]
) {
    const [commands, disclosedContracts] = prepared as [
        Parameters<typeof sdk.ledger.prepare>[0]['commands'],
        NonNullable<
            Parameters<typeof sdk.ledger.prepare>[0]['disclosedContracts']
        >,
    ]
    return sdk.ledger
        .prepare({
            partyId,
            commands,
            ...(disclosedContracts ? { disclosedContracts } : {}),
        })
        .sign(privateKey)
        .execute({ partyId })
}

const alice = await createParty('cip112-17-alice')
const bob = await createParty('cip112-17-bob')
const executor = await createParty('cip112-17-exec')

const asset = await sdk.asset.find(INSTRUMENT_ID, TEST_TOKEN_REGISTRY)
logger.info({ admin: asset.admin, id: asset.id }, 'TestTokenV2 instrument')

const mintAmount = '100.0'
const settleAmount = '40.0'
const { offerCid } = await offerMint(alice.partyId, mintAmount)
logger.info({ offerCid }, 'OfferMint created')

const acceptPrepared = await sdk.token.transfer.accept({
    transferInstructionCid: offerCid,
    registryUrl: TEST_TOKEN_REGISTRY,
})
await executePrepared(alice.partyId, alice.keys.privateKey, acceptPrepared)
logger.info('Alice accepted mint offer')

const aliceHoldingsBefore = await sdk.ledger.acsReader.readJsContracts({
    filterByParty: true,
    parties: [alice.partyId],
    templateIds: [HOLDING_TEMPLATE_ID],
})
if (aliceHoldingsBefore.length === 0) {
    throw new Error('Expected Alice holdings after mint accept')
}

const settlement = {
    executors: [executor.partyId],
    id: `cip112-settle-${Date.now()}`,
    cid: null,
    meta: { values: {} },
}

const transferLegId = 'leg0'
const transferLegs = [
    {
        transferLegId,
        sender: basicAccount(alice.partyId),
        receiver: basicAccount(bob.partyId),
        amount: settleAmount,
        instrumentId: INSTRUMENT_ID,
        meta: { values: {} },
    },
]

const allocateAlice = await sdk.token.allocation.instruction.create({
    allocation: {
        admin: asset.admin,
        authorizer: basicAccount(alice.partyId),
        transferLegSides: [
            {
                transferLegId,
                side: 'SenderSide' as const,
                otherside: basicAccount(bob.partyId),
                amount: settleAmount,
                instrumentId: INSTRUMENT_ID,
                meta: { values: {} },
            },
        ],
        settlementDeadline: null,
        nextIterationFunding: null,
        committed: true,
        meta: { values: {} },
    },
    settlement,
    asset,
    actors: [alice.partyId],
})
const allocateAliceResult = await executePrepared(
    alice.partyId,
    alice.keys.privateKey,
    allocateAlice
)
logger.info(
    { offset: allocateAliceResult.completionOffset },
    'Alice created SenderSide allocation'
)

const allocateBob = await sdk.token.allocation.instruction.create({
    allocation: {
        admin: asset.admin,
        authorizer: basicAccount(bob.partyId),
        transferLegSides: [
            {
                transferLegId,
                side: 'ReceiverSide' as const,
                otherside: basicAccount(alice.partyId),
                amount: settleAmount,
                instrumentId: INSTRUMENT_ID,
                meta: { values: {} },
            },
        ],
        settlementDeadline: null,
        nextIterationFunding: null,
        committed: true,
        meta: { values: {} },
    },
    settlement,
    asset,
    actors: [bob.partyId],
    inputUtxos: [],
})
const allocateBobResult = await executePrepared(
    bob.partyId,
    bob.keys.privateKey,
    allocateBob
)
logger.info(
    { offset: allocateBobResult.completionOffset },
    'Bob created ReceiverSide allocation'
)

async function findAllocationCid(
    partyId: string,
    offset: number
): Promise<string> {
    const allocations =
        (await sdk.token.allocation.pending<AllocationViewV2>(
            partyId,
            ALLOCATION_INTERFACE_ID_V2
        )) || []
    const match = allocations.find(
        (a) => a.interfaceViewValue?.settlement?.id === settlement.id
    )?.contractId
    if (match) return match

    const byTemplate = await sdk.ledger.acsReader.readJsContracts({
        filterByParty: true,
        parties: [partyId],
        templateIds: [ALLOCATION_TEMPLATE_ID],
        offset,
    })
    const cid = byTemplate[byTemplate.length - 1]?.contractId
    if (!cid) {
        throw new Error(`V2 Allocation not found for ${partyId}`)
    }
    return cid
}

const aliceAllocationCid = await findAllocationCid(
    alice.partyId,
    allocateAliceResult.completionOffset
)
const bobAllocationCid = await findAllocationCid(
    bob.partyId,
    allocateBobResult.completionOffset
)
logger.info(
    { aliceAllocationCid, bobAllocationCid },
    'Allocations ready for SettleBatch'
)

const settlePrepared = await sdk.token.allocation.settleBatch({
    registryUrl: TEST_TOKEN_REGISTRY,
    settlement,
    transferLegs,
    allocations: [
        {
            allocationCid:
                aliceAllocationCid as FinalizedAllocation['allocationCid'],
            extraTransferLegSides: [],
            nextIterationFunding: null,
        },
        {
            allocationCid:
                bobAllocationCid as FinalizedAllocation['allocationCid'],
            extraTransferLegSides: [],
            nextIterationFunding: null,
        },
    ],
    actors: [executor.partyId],
})
await executePrepared(
    executor.partyId,
    executor.keys.privateKey,
    settlePrepared
)
logger.info('SettlementFactory_SettleBatch executed')

const bobHoldings = await sdk.ledger.acsReader.readJsContracts({
    filterByParty: true,
    parties: [bob.partyId],
    templateIds: [HOLDING_TEMPLATE_ID],
})
if (bobHoldings.length === 0) {
    throw new Error('Expected Bob holdings after SettleBatch')
}

logger.info(
    {
        bobHoldingCount: bobHoldings.length,
        bobHoldingCid: bobHoldings[0]?.contractId,
    },
    'CIP-0112 mint → allocate V2 → SettleBatch e2e passed'
)
process.exit(0)
