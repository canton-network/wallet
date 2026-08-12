# WalletConnect “Wallet” (WalletKit) Example

This example is a small **Vite + React** app that runs a **WalletConnect v2 Wallet** using **Reown WalletKit** (`@reown/walletkit`). It’s intended for local development/testing with the Wallet Gateway ecosystem.

## What this is (and isn’t)

- **This is**: a “wallet-side” WalletConnect implementation (a wallet UI that can accept session proposals + requests).
- **This isn’t**: the dApp-side integration (see `examples/ping/` for a dApp that connects to wallets).

## Prerequisites

- **Node/pnpm**: use the repo’s normal toolchain (workspace/pnpm).
- **WalletConnect Cloud project**: you need a `VITE_WC_PROJECT_ID`.

## Configure

Create or edit `examples/walletconnect/.env`:

```bash
# WalletConnect Cloud project ID (get one at https://dashboard.walletconnect.com/)
VITE_WC_PROJECT_ID=...
```

## Run

From the repo root:

```bash
pnpm --filter @canton-network/example-walletconnect dev
```

Or from this folder:

```bash
pnpm dev
```

Then open [http://localhost:8082](http://localhost:8082).

## Using it with other examples

- Pair a dApp (for example `examples/ping/`) with this wallet by using the WalletConnect flow (QR / pairing URI), then approve proposals/requests in this UI.
