# @canton-network/core-test-token

A minimal, self-contained test token that implements the Canton Network Token
Standard (CIP-56). It exists so wallet and dApp flows can be exercised end-to-end
against a real registry-backed token without depending on Amulet.

Exports:

- **Main export** - TypeScript codegen bindings for the `splice-test-token-v1`
  DAML package (`Splice`, `packageId`) plus small command builders
  (`buildCreateTokenRulesCommand`, `buildMintTokenCommand`).
- **`./registry`** - `startTestTokenRegistry()`, an HTTP server that creates the
  token's `TokenRules` contracts and serves the four Token Standard off-ledger
  registry APIs (metadata, transfer-instruction, allocation-instruction,
  allocation). Once started, the token looks like any other CIP-56 token, with an
  admin party and a registry URL.
- **`./setup`** - helpers to locate and read the compiled
  `splice-test-token-v1` DAR (`TEST_TOKEN_V1_DAR_PATH`, `readTestTokenV1Dar`) so
  callers can vet it on their synchronizers.
