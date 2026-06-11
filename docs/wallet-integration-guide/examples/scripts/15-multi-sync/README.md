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

# Step 2: Start localnet (multi-sync is the default; pass --no-multi-sync for single-synchronizer debug mode)
yarn start:localnet

# Step 3: Run the example
yarn workspace docs-wallet-integration-guide-examples run-15

# Step 4: Stop when done (from the repository root)
yarn stop:localnet
```

# Example details

The goal here is to show an exchange operation with a custom token (`TestToken`) that is deployed to a private / local `app-synchronizer`.
A private synchronizer helps avoid some of the traffic costs of using the global synchronizer, but still enables parties to do transactions on the global network,
provided that at some point the contracts are re-assigned (automatically or explicitly) to the global synchronizer.

The parties in the example are:

- **Alice** — app-user, hosted on the **app-user** participant. Holds Amulet, buys `TestToken`.
- **Bob** — app-provider, hosted on the **app-provider** participant. Holds `TestToken`, buys Amulet.
- **TokenAdmin** — issuer / admin of `TestToken`, also hosted on the **app-provider** participant.
- **TradingApp** — the OTC settlement venue (DvP), hosted on the **sv** participant.

The trade is a two-legged Delivery-vs-Payment:

- **leg-0:** Alice pays **100 Amulet** to Bob — Amulet lives on the **global** synchronizer.
- **leg-1:** Bob delivers **20 `TestToken`** to Alice — `TestToken` lives on the **app** synchronizer.

The whole flow uses **single-party submissions only** (no multi-party signing) and is settled atomically by the TradingApp.

## Topology & DAR vetting

Vetting is per **(participant, synchronizer)**. `app-user` and `app-provider` connect to both
synchronizers and vet the same two DARs on each; `sv` connects to the **global** synchronizer only.

```text
GLOBAL synchronizer  —  Amulet*  ·  leg-0:  Alice --100 CC-->  Bob
══════════╤═══════════════════════╤═══════════════════════╤═════════════════
          │                       │                       │
          │ vetted on GLOBAL:  TestTokenV1, trading-app  (+ Amulet* preinstalled)  — all 3 participants
          │                       │                       │
   ┌──────┴───────┐        ┌──────┴───────┐        ┌──────┴───────┐
   │ app-user     │        │ app-provider │        │ sv           │
   │ participant  │        │ participant  │        │ participant  │
   │ Alice        │        │ Bob          │        │ TradingApp   │
   │              │        │ TokenAdmin   │        │              │
   └──────┬───────┘        └──────┬───────┘        └──────────────┘
          │                       │
          │ vetted on APP:  TestTokenV1, trading-app  — app-user & app-provider only (sv not connected)
          │                       │
══════════╧═══════════════════════╧═════════════════════════════════════════
APP synchronizer  —  TestToken  ·  leg-1:  Bob --20 TT-->  Alice
```

Vetting matrix (which DAR is vetted where):

| Participant (hosts)                | global synchronizer                  | app synchronizer         |
| ---------------------------------- | ------------------------------------ | ------------------------ |
| **app-user** (Alice)               | TestTokenV1, trading-app, (Amulet\*) | TestTokenV1, trading-app |
| **app-provider** (Bob, TokenAdmin) | TestTokenV1, trading-app, (Amulet\*) | TestTokenV1, trading-app |
| **sv** (TradingApp)                | TestTokenV1, trading-app, (Amulet\*) | — _(not connected)_      |

DARs referenced above:

- **TestTokenV1** = `splice-test-token-v1-1.0.0.dar` (built locally from `damljs/splice-test-token-v1`)
- **trading-app** = `splice-token-test-trading-app-1.0.0.dar` (from the localnet bundle)
- **Amulet\*** = `splice-amulet` — pre-vetted on the **global** synchronizer by localnet, **not** by this example.
