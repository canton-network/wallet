---
title: "Integration Overview"
description: "How wallet providers make themselves discoverable to Canton dApps."
---

This section is for **wallet authors** who want their wallet to be
[CIP-103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)
compatible, so it can interoperate with Canton dApps and be listed in the wallet picker the
dApp SDK opens on `connect()`. Choose one or more of the integration paths below.

## Choose your integration

| How your wallet connects | Approach |
| --- | --- |
| Browser extension | [Browser extension](/sdks-tools/sdks/dapp-sdk/wallet-providers/browser-extension): announce with `canton:announceProvider`, and an optional `target` for `postMessage` |
| Remote (server-side) wallet | [Remote wallet](/sdks-tools/sdks/dapp-sdk/wallet-providers/remote-wallet): expose a public CIP-103 RPC URL |
| Mobile / QR wallet | [WalletConnect](/sdks-tools/sdks/dapp-sdk/wallet-providers/walletconnect) via `additionalAdapters` |

## What every wallet must provide

Regardless of path, a conforming wallet must:

- Implement the CIP-103 request methods (`connect`, `status`, `listAccounts`,
  `getPrimaryAccount`, `signMessage`, `prepareExecute`, `ledgerApi`, ...).
- Emit the CIP-103 events (`statusChanged`, `accountsChanged`, `txChanged`).
- Remain solely responsible for authorization and signing.
- Present clear approval UI before signing or executing.

See the [CIP-103 specification](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)
for the full protocol.

## Get listed by default

Once your wallet is CIP-103 compliant, submit a pull request adding it to
[`wallets.json`](https://github.com/canton-network/wallet/blob/main/sdk/dapp-sdk/src/wallets.json).
Wallets in that list are included in the SDK's default set, so every dApp lists your wallet
in the picker without any extra configuration.

## Next steps

<CardGroup cols={2}>
  <Card title="Browser Extension" href="/sdks-tools/sdks/dapp-sdk/wallet-providers/browser-extension">
    Announce a provider from an extension.
  </Card>
  <Card title="CIP-103 Specification" href="https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md">
    The full protocol your wallet must implement.
  </Card>
</CardGroup>
