# Example 15: Multi-Synchronizer DvP Trade

This example implements a Delivery vs Payment (DvP) flow across two synchronizers using the **v2 OTC trading app** (`splice-token-test-trading-app-v2`): Alice pays 100 Amulet on the global synchronizer, and Bob delivers 20 TestToken whose home is a private app-synchronizer.

## DAR vetting placement

The two apps are vetted only where they belong:

- **Trading-app v2 DAR → global synchronizer only.** The venue, the `OTCTrade`, and the `OTCTradeAllocationRequest`s all live on global, and `OTCTrade_Settle` runs there.
- **TestToken v1 DAR → app-synchronizer (its home) and global (transit only).** The Token is minted on, and returns to, the private app-synchronizer. It is also vetted on global because `OTCTrade_Settle` is a single atomic Daml transaction on global that touches the Token allocation — Canton requires every package referenced by a transaction, and every package of a contract reassigned onto a synchronizer, to be vetted there. An atomic cross-synchronizer DvP cannot avoid vetting the Token package on the settlement synchronizer.

Vetting the package on global is **not** the same as Token _contracts_ living on global. `TokenRules` (the `AllocationFactory`/`TransferFactory` contract) is created on the app-synchronizer only and is exercised exclusively by app-synchronizer transactions, so it never reassigns to global. Bob's `TokenAllocation` and the settled `Token` holdings only _transit_ global during `OTCTrade_Settle`; the self-transfer step returns the holdings to the app-synchronizer, and `assertTokensOnAppSync` verifies that end state.

## Flow

1. Mint Amulet for Alice (global); mint TestToken for Bob (app-synchronizer).
2. The venue creates the v2 `OTCTrade` (signatory: venue only) and exercises `OTCTrade_RequestAllocations`.
3. The venue and each trader co-sign a `TradeSettlementAgreement` — the v2 trading app needs it to settle V1 token-standard assets.
4. Alice allocates Amulet on global; Bob allocates TestToken on the **app-synchronizer**, so the `AllocationFactory` (`TokenRules`) is exercised on app-sync and `TokenRules` never leaves it.
5. The venue settles via `OTCTrade_Settle` (`SettlementBatchV1` for both legs) on global. Bob's `TokenAllocation` reassigns app-sync → global so the atomic settlement can consume it.
6. Alice and Bob self-transfer their TestToken holdings back to the app-synchronizer; `assertTokensOnAppSync` verifies no TestToken holding remains on global.

## Running Locally

All commands are run from the **repository root** unless noted otherwise.

```bash
# Step 1: Fetch localnet bundle (first time or after a Splice version update)
yarn script:fetch:localnet

# Step 2: Start localnet in multi-sync mode
yarn start:localnet -- --multi-sync

# Step 3: Run the example
yarn workspace docs-wallet-integration-guide-examples run-15

# Step 4: Stop when done (from the repository root)
yarn stop:localnet -- --multi-sync
```
