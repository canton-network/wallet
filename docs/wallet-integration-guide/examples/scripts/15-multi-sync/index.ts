import pino from 'pino'
import { logAllContracts } from '../utils/index.js'
import { setupMultiSyncTrade } from './_setup.js'
import { startRegistry } from './_registry/index.js'
import { LOCALNET_TRADING_APP_LEDGER_URL } from './_config.js'
import {
    mintAmuletForAlice,
    createTokenRulesAndMintForBob,
    buildTradeLegs,
    createOtcTradeAndRequestAllocations,
    createSettlementAgreement,
    allocateAmuletForAlice,
    allocateTokenForBob,
    settleOtcTradeV2,
    aliceSelfTransferToApp,
    bobSelfTransferToApp,
    buildContractReadSpec,
} from './_trade_ops.js'

// Multi-Synchronizer DvP via the v2 OTC trading app.
// Alice pays 100 Amulet on global; Bob delivers 20 TestToken (home: app-synchronizer).
// P1 = app-user (Alice), P2 = app-provider (Bob), P3 = sv (TradingApp + TokenAdmin).
// See README.md for the full flow description.

const logger = pino({ name: 'v1-15-multi-sync-trade', level: 'info' })

// ── Setup: create SDKs, discover synchronizers, vet DARs, allocate parties ───
// Step 1: Create SDKs for all 3 participants (P1, P2, P3) and discover global + app synchronizers
// Step 2: Vet DARs — trading-app-v2 on global only; test-token-v1 on app-sync + global
// Step 3: Allocate parties for Alice (P1), Bob (P2), TradingApp (P3), and TokenAdmin (P3)
const setup = await setupMultiSyncTrade(logger)
const {
    tokenNamespaceP2,
    alice,
    bob,
    tokenAdmin,
    synchronizers,
    globalSynchronizerId,
    appSynchronizerId,
} = setup

// Start the Token Standard registry server now that tokenAdmin party ID is known.
// The server must be up before wallet-SDK calls for allocation and transfer factory.
// The registry uses P3's ledger URL: P3 (sv) hosts tokenAdmin on both synchronizers,
// so it can read TokenRules on both global and app-synchronizer.
const REGISTRY_PORT = parseInt(process.env['REGISTRY_PORT'] ?? '5975', 10)
const registry = await startRegistry({
    tokenAdminPartyId: tokenAdmin.partyId,
    port: REGISTRY_PORT,
    ledgerUrl: LOCALNET_TRADING_APP_LEDGER_URL,
    globalSynchronizerId,
    appSynchronizerId,
    logger,
})

const allPartySpecs = buildContractReadSpec(setup)

// ── Step 4–5: Init holdings ─────────────────────────────────────────────────
// Step 4:  Mint Amulet for Alice (global synchronizer)
// Step 5:  TokenAdmin creates TokenRules on global + app, self-mints Token,
//          offers to Bob and Bob accepts — Bob's TestToken lands on app-synchronizer
await Promise.all([
    mintAmuletForAlice(setup, logger),
    createTokenRulesAndMintForBob(setup, logger),
])

logger.info('Contracts after setup:')
await logAllContracts(logger, synchronizers, allPartySpecs)

// ── Step 6: Venue creates the v2 OTCTrade and requests allocations ──────────
// The v2 OTCTrade is signatory-venue-only; OTCTrade_RequestAllocations issues an
// OTCTradeAllocationRequest per trading party.
const tradeLegs = buildTradeLegs(setup)
const { otcTradeCid, allocationRequestCids } =
    await createOtcTradeAndRequestAllocations(setup, tradeLegs, logger)

// ── Step 7: Create TradeSettlementAgreements (venue + each trader) ──────────
// Required by the v2 trading app to settle V1 token-standard assets: the agreement
// carries the trader authority the venue needs inside OTCTrade_Settle. Each is a
// two-signatory contract, created via a co-signed interactive submission.
// Created before allocation so each trader already has global-synchronizer standing.
// Each agreement is prepared on the trader's own participant (which co-hosts the venue).
const aliceAgreementCid = await createSettlementAgreement(
    setup,
    setup.p1Sdk,
    setup.p1SdkCtx,
    alice,
    logger
)
const bobAgreementCid = await createSettlementAgreement(
    setup,
    setup.p2Sdk,
    setup.p2SdkCtx,
    bob,
    logger
)

logger.info('Contracts after trade initiation:')
await logAllContracts(logger, synchronizers, allPartySpecs)

// ── Steps 8–9: Allocate in parallel ────────────────────────────────────────
// Step 8: Alice allocates Amulet for leg-0 (global synchronizer)
// Step 9: Bob allocates TestToken for leg-1 (global synchronizer; the input Token
//         auto-reassigns app-sync → global — no explicit reassignment)
const [legIdAlice, { legId: legIdBob }] = await Promise.all([
    allocateAmuletForAlice(setup, logger),
    allocateTokenForBob(setup, logger),
])
logger.info('Contracts after allocations:')
await logAllContracts(logger, synchronizers, allPartySpecs)

// ── Step 10a: Locate Bob's TestToken allocation ────────────────────────────
const allocationsBob = await tokenNamespaceP2.allocation.pending(bob.partyId)
const testTokenAllocation = allocationsBob.find(
    (a) => a.interfaceViewValue.allocation.transferLegId === legIdBob
)
if (!testTokenAllocation) throw new Error('TestToken allocation not found')
const testTokenAllocationCid = testTokenAllocation.contractId

// ── Step 10b: TradingApp settles the OTCTrade ──────────────────────────────
await settleOtcTradeV2(
    setup,
    {
        otcTradeCid,
        legIdAlice,
        legIdBob,
        testTokenAllocationCid,
        aliceAgreementCid,
        bobAgreementCid,
        allocationRequestCids,
    },
    logger
)
logger.info('Contracts after settlement:')
await logAllContracts(logger, synchronizers, allPartySpecs)

// ── Step 11: Self-transfer TestTokens back to app-synchronizer ─────────────
await Promise.all([
    aliceSelfTransferToApp(setup, logger),
    bobSelfTransferToApp(setup, logger),
])
logger.info('Final contract state:')
await logAllContracts(logger, synchronizers, allPartySpecs)

await registry.stop()
logger.info('Token Standard registry server stopped')
