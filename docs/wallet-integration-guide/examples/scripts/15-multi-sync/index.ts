import pino from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import { startTestTokenRegistry } from '@canton-network/core-test-token/registry'
import { logAllContracts } from '../utils/index.js'
import { setupMultiSyncTrade } from './_setup.js'
import {
    TEST_TOKEN_REGISTRY_PORT,
    TRADE_AMULET_AMOUNT,
    TRADE_TOKEN_AMOUNT,
} from './_constants.js'
import { mintAmuletForAlice, allocateAmuletForAlice } from './_amulet_ops.js'
import { createTokenRules, mintAndTransferTokenToBob } from './_token_setup.js'
import { allocateTokenForBob } from './_token_allocation.js'
import {
    aliceSelfTransferToApp,
    bobSelfTransferToApp,
} from './_token_transfer.js'
import { createAndInitiateOtcTrade } from './_trade_propose.js'
import { settleOtcTrade } from './_trade_settle.js'

// Multi-Synchronizer DvP: Alice pays 100 Amulet on global; Bob delivers 20 TestToken from app-sync.
// app-user participant hosts Alice + TradingApp, app-provider hosts Bob (+ TokenAdmin); both
// app-user and app-provider connect to the global + app synchronizers, sv is global-only.

const logger = pino({ name: 'v1-15-multi-sync-trade', level: 'info' })

// ── Setup: create SDKs, discover synchronizers, vet DARs, allocate parties ───
// Step 1: Create one SDK per party (Alice, TradingApp on the app-user participant; Bob, TokenAdmin on the app-provider participant; sv on its own) and discover global + app synchronizers
// Step 2: Vet DARs on both synchronizers for app-user + app-provider; global only for sv (not connected to app-synchronizer)
// Step 3: Allocate parties for Alice (app-user), Bob (app-provider), TradingApp (app-user, both synchronizers), and TokenAdmin (app-provider)
const setup = await setupMultiSyncTrade(logger)
const {
    aliceSdk,
    bobSdk,
    tradingAppSdk,
    tokenAdminSdk,
    bobTokenNamespace,
    alice,
    bob,
    tradingApp,
    tokenAdmin,
    synchronizers,
    amuletAdmin,
} = setup

// ── Start the TestToken registry (CIP-56 off-ledger APIs) ───────────────────
// The registry creates the TestToken `TokenRules` on both synchronizers as part
// of initialization, then serves the four Token Standard registry APIs for them.
const registry = await startTestTokenRegistry({
    admin: tokenAdmin.partyId,
    port: TEST_TOKEN_REGISTRY_PORT,
    ledgerUrl: localNetStaticConfig.LOCALNET_APP_PROVIDER_LEDGER_URL,
    synchronizerIds: [
        setup.globalSynchronizerId,
        setup.testTokenSynchronizerId,
    ],
    transferSynchronizerId: setup.testTokenSynchronizerId,
    allocationSynchronizerId: setup.globalSynchronizerId,
    createTokenRules: (synchronizerId) =>
        createTokenRules(setup, synchronizerId),
    logger,
})

// ── Steps 4–5: Init holdings ────────────────────────────────────────────────
// Step 4:  Mint Amulet for Alice (global synchronizer)
// Steps 5a–5e: TokenAdmin self-mints Token, offers to Bob via
//             TransferFactory_Transfer; Bob accepts via
//             TransferInstruction_Accept — all single-party submissions
//             (the TokenRules were created by the registry on start-up)
await Promise.all([
    mintAmuletForAlice(setup, logger),
    mintAndTransferTokenToBob(setup, logger),
])

logger.info('Contracts after setup:')
await logAllContracts(logger, synchronizers, [
    { sdk: aliceSdk, parties: [alice.partyId] },
    { sdk: bobSdk, parties: [bob.partyId] },
    { sdk: tokenAdminSdk, parties: [tokenAdmin.partyId] },
    { sdk: tradingAppSdk, parties: [tradingApp.partyId] },
])

// ── OTC trade terms ───────────────────────────────────────────────────────────
const transferLegs = {
    'leg-0': {
        sender: alice.partyId,
        receiver: bob.partyId,
        amount: TRADE_AMULET_AMOUNT,
        instrumentId: { admin: amuletAdmin, id: 'Amulet' },
        meta: { values: {} },
    },
    'leg-1': {
        sender: bob.partyId,
        receiver: alice.partyId,
        amount: TRADE_TOKEN_AMOUNT,
        instrumentId: { admin: tokenAdmin.partyId, id: 'TestToken' },
        meta: { values: {} },
    },
}

// ── Steps 6a–6c + 7: Propose → Accept → Initiate settlement → Read OTCTrade ─
const otcTradeCid = await createAndInitiateOtcTrade(setup, transferLegs, logger)
logger.info('Contracts after trade initiation:')
await logAllContracts(logger, synchronizers, [
    { sdk: aliceSdk, parties: [alice.partyId] },
    { sdk: bobSdk, parties: [bob.partyId] },
    { sdk: tokenAdminSdk, parties: [tokenAdmin.partyId] },
    { sdk: tradingAppSdk, parties: [tradingApp.partyId] },
])
// ── Steps 8–9: Allocate in parallel ────────────────────────────────────────
// Step 8:  Alice allocates Amulet for leg-0 (global synchronizer)
// Step 9: Bob allocates TestToken for leg-1 (global synchronizer)
const [legIdAlice, { legId: legIdBob }] = await Promise.all([
    allocateAmuletForAlice(setup, logger),
    allocateTokenForBob(setup, logger),
])
logger.info('Contracts after allocations:')
await logAllContracts(logger, synchronizers, [
    { sdk: aliceSdk, parties: [alice.partyId] },
    { sdk: bobSdk, parties: [bob.partyId] },
    { sdk: tokenAdminSdk, parties: [tokenAdmin.partyId] },
    { sdk: tradingAppSdk, parties: [tradingApp.partyId] },
])
// ── Step 10a: Locate Bob's TestToken allocation ────────────────────────────────────
const allocationsBob = await bobTokenNamespace.allocation.pending(bob.partyId)
const testTokenAllocation = allocationsBob.find(
    (a) => a.interfaceViewValue.allocation.transferLegId === legIdBob
)
if (!testTokenAllocation) throw new Error('TestToken allocation not found')
const testTokenAllocationCid = testTokenAllocation.contractId
// Disclose Bob's TestToken allocation to the TradingApp's settlement
// participant (app-user): the allocation is created on the app-provider
// participant, so it may not yet be in app-user's ACS when settlement runs.
// Disclosing it makes settlement independent of cross-participant propagation timing.
const testTokenAllocationDisclosed = {
    templateId: testTokenAllocation.activeContract.createdEvent.templateId,
    contractId: testTokenAllocation.contractId,
    createdEventBlob:
        testTokenAllocation.activeContract.createdEvent.createdEventBlob!,
    synchronizerId: '',
}

await bobSdk.ledger.internal.reassign({
    submitter: bob.partyId,
    contractId: testTokenAllocationCid,
    source: synchronizers.testTokenSynchronizerId,
    target: synchronizers.globalSynchronizerId,
    skipIfAlreadyOn: true,
})
logger.info(
    'Bob: TestToken allocation reassigned app-synchronizer → global ahead of settlement'
)

// ── Step 10c: TradingApp settles the OTCTrade ─────────────────────────────────
try {
    await settleOtcTrade(
        setup,
        {
            otcTradeCid,
            legIdAlice,
            legIdBob,
            testTokenAllocationCid,
            testTokenAllocationDisclosed,
        },
        logger
    )
} catch (e) {
    logger.error(
        { err: e },
        'Settlement failed — compensation applied, funds returned'
    )
    await bobSelfTransferToApp(setup, logger)
    logger.info('Contracts after settlement failure (compensation applied):')
    await logAllContracts(logger, synchronizers, [
        { sdk: aliceSdk, parties: [alice.partyId] },
        { sdk: bobSdk, parties: [bob.partyId] },
        { sdk: tokenAdminSdk, parties: [tokenAdmin.partyId] },
        { sdk: tradingAppSdk, parties: [tradingApp.partyId] },
    ])
    await registry.stop()
    process.exit(1)
}
logger.info('Contracts after settlement:')
await logAllContracts(logger, synchronizers, [
    { sdk: aliceSdk, parties: [alice.partyId] },
    { sdk: bobSdk, parties: [bob.partyId] },
    { sdk: tokenAdminSdk, parties: [tokenAdmin.partyId] },
    { sdk: tradingAppSdk, parties: [tradingApp.partyId] },
])
// ── Step 11: Self-transfer TestTokens back to app-synchronizer ─────────────────
await Promise.all([
    aliceSelfTransferToApp(setup, logger),
    bobSelfTransferToApp(setup, logger),
])
logger.info('Final contract state:')
await logAllContracts(logger, synchronizers, [
    { sdk: aliceSdk, parties: [alice.partyId] },
    { sdk: bobSdk, parties: [bob.partyId] },
    { sdk: tokenAdminSdk, parties: [tokenAdmin.partyId] },
    { sdk: tradingAppSdk, parties: [tradingApp.partyId] },
])

await registry.stop()
process.exit(0)
