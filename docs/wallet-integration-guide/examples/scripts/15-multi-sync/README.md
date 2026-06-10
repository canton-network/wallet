# Example 15: Multi-Synchronizer DvP Trade

This example implements a Delivery vs Payment (DvP) flow across two synchronizers: Amulet on the global synchronizer and a Token instrument on a private app-synchronizer, settled via the OTC Trading App using only single-party submissions.

## Running Locally

All commands are run from the **repository root** unless noted otherwise.

```bash
# Step 0: Build all components
yarn install

yarn build:all

# Step 1: Fetch localnet bundle (first time or after a Splice version update)
yarn script:fetch:localnet

# Step 2: Start localnet in multi-sync mode
yarn start:localnet -- --multi-sync

# Step 3: Run the example
yarn workspace docs-wallet-integration-guide-examples run-15

# Step 4: Stop when done (from the repository root)
yarn stop:localnet -- --multi-sync
```

# Example details

The goal here is to show an exchange operation with a custom token (`TestToken`) that is deployed to a private / local `app-synchronizer`.
A private synchronizer helps avoid some of the traffic costs of using the global synchronizer, but still enables parties to do transactions on the global network,
provided that at some point the contracts are re-assigned (automatically or explicitly) to the global synchronizer.

The parties in the example are:

- **Alice** — app-user, hosted on participant **P1**. Holds Amulet, buys `TestToken`.
- **Bob** — app-provider, hosted on participant **P2**. Holds `TestToken`, buys Amulet.
- **TokenAdmin** — issuer / admin of `TestToken`, also hosted on **P2**.
- **TradingApp** — the OTC settlement venue (DvP), hosted on the SV participant **P3**.

The trade is a two-legged Delivery-vs-Payment:

- **leg-0:** Alice pays **100 Amulet** to Bob — Amulet lives on the **global** synchronizer.
- **leg-1:** Bob delivers **20 `TestToken`** to Alice — `TestToken` lives on the **app** synchronizer.

The whole flow uses **single-party submissions only** (no multi-party signing) and is settled atomically by the TradingApp.
