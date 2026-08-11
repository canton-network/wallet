# amulet-service

Client helpers for Splice Amulet operations (tap, transfers against AmuletRules, etc.).

## Token Standard version

Tap and related factory disclosure currently use the **CIP-0056 (V1)** transfer-factory choice context (`fetchTransferFactoryChoiceContext`). Amulet’s on-ledger tap choice still consumes V1-shaped disclosed contracts from the registry; this package intentionally does **not** route through CIP-0112 V2 factories.

For CIP-0112 wallet flows (Account-based transfers, SettleBatch, EventLog), use `@canton-network/wallet-sdk` `sdk.token.*` with `apiVersion: 'auto' | 'v1' | 'v2'`.
