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
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import { localNetStaticConfig, SDK } from '@canton-network/wallet-sdk'
import { pino } from 'pino'
import {
    AMULET_NAMESPACE_CONFIG,
    TEST_TOKEN_REGISTRY,
    TEST_TOKEN_REGISTRY_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
} from './utils/index.js'

const logger = pino({ name: 'v2-17-settle-batch', level: 'info' })
const authTokenProvider = new AuthTokenProvider(
    TOKEN_PROVIDER_CONFIG_DEFAULT,
    logger
)
const INSTRUMENT_ID = 'test-token-v2'
const HOLDING_TEMPLATE_ID =
    '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Holding:Token'
const ALLOCATION_TEMPLATE_ID =
    '#splice-test-token-v2:Splice.Testing.Tokens.TestTokenV2.Allocation:TokenAllocationV2'
const ACS_WAIT_MS = 30_000
const ACS_POLL_MS = 500

type TransferSide = 'SenderSide' | 'ReceiverSide'

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitUntil<T>(
    label: string,
    fn: () => Promise<T | undefined>
): Promise<T> {
    const deadline = Date.now() + ACS_WAIT_MS
    while (Date.now() < deadline) {
        const value = await fn()
        if (value !== undefined) return value
        await sleep(ACS_POLL_MS)
    }
    throw new Error(`Timed out waiting for ${label}`)
}

function allocationMatches(
    view:
        | {
              settlement?: { id?: string }
              allocation?: { transferLegSides?: Array<{ side?: string }> }
          }
        | undefined,
    settlementId: string,
    side: TransferSide
): boolean {
    if (view?.settlement?.id !== settlementId) return false
    return (view.allocation?.transferLegSides ?? []).some(
        (s) => s.side === side
    )
}

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
    const token = await authTokenProvider.getAccessToken()
    const res = await fetch(
        new URL('/admin/v2/offer-mint', TEST_TOKEN_REGISTRY),
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
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
        'SKIP: test-token registry not running on :5634 — SettleBatch e2e not executed'
    )
    process.exit(0)
}

const sdk = await SDK.create({
    auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
    ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
    token: TEST_TOKEN_REGISTRY_CONFIG,
    amulet: AMULET_NAMESPACE_CONFIG,
    asset: {
        registries: TEST_TOKEN_REGISTRY_CONFIG.registries,
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
    apiVersion: 'v2',
    actors: [alice.partyId],
    supportedApis: asset.supportedApis,
})
const mintResult = await executePrepared(
    alice.partyId,
    alice.keys.privateKey,
    acceptPrepared
)
logger.info('Alice accepted mint offer')

const aliceHoldingsBefore = await waitUntil(
    'Alice holdings after mint accept',
    async () => {
        const holdings = await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [alice.partyId],
            templateIds: [HOLDING_TEMPLATE_ID],
            offset: mintResult.completionOffset,
        })
        return holdings.length > 0 ? holdings : undefined
    }
)

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
    offset: number,
    side: TransferSide
): Promise<string> {
    return waitUntil(`V2 Allocation (${side}) for ${partyId}`, async () => {
        const allocations =
            (await sdk.token.allocation.pending<AllocationViewV2>(
                partyId,
                ALLOCATION_INTERFACE_ID_V2
            )) || []
        const match = allocations.find((a) =>
            allocationMatches(a.interfaceViewValue, settlement.id, side)
        )?.contractId
        if (match) return match

        const byTemplate = await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [partyId],
            templateIds: [ALLOCATION_TEMPLATE_ID],
            offset,
        })
        return byTemplate.find((c) => {
            const payload =
                'createArgument' in c
                    ? c.createArgument
                    : 'createArguments' in c
                      ? c.createArguments
                      : undefined
            return allocationMatches(
                payload as Parameters<typeof allocationMatches>[0],
                settlement.id,
                side
            )
        })?.contractId
    })
}

const aliceAllocationCid = await findAllocationCid(
    alice.partyId,
    allocateAliceResult.completionOffset,
    'SenderSide'
)
const bobAllocationCid = await findAllocationCid(
    bob.partyId,
    allocateBobResult.completionOffset,
    'ReceiverSide'
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
const settleResult = await executePrepared(
    executor.partyId,
    executor.keys.privateKey,
    settlePrepared
)
logger.info('SettlementFactory_SettleBatch executed')

const bobHoldings = await waitUntil(
    'Bob holdings after SettleBatch',
    async () => {
        const holdings = await sdk.ledger.acsReader.readJsContracts({
            filterByParty: true,
            parties: [bob.partyId],
            templateIds: [HOLDING_TEMPLATE_ID],
            offset: settleResult.completionOffset,
        })
        return holdings.length > 0 ? holdings : undefined
    }
)

logger.info(
    {
        aliceHoldingCount: aliceHoldingsBefore.length,
        bobHoldingCount: bobHoldings.length,
        bobHoldingCid: bobHoldings[0]?.contractId,
    },
    'CIP-0112 mint → allocate V2 → SettleBatch e2e passed'
)
process.exit(0)
