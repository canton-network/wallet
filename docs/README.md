# Documentation

This directory contains developer guides and supporting reference documents for the Wallet Gateway project.

> [!NOTE]
> Migration guides for each release are published in [Discussions](https://github.com/canton-network/wallet/discussions).

## Guides

### dApp SDK

**Published:** TBD
**Path:** [`dapp-sdk/`](dapp-sdk/)

For **dApp developers** integrating `@canton-network/dapp-sdk` to discover wallets, connect users, read parties, request signatures, and submit transactions.

**Contents:**

- [Overview](dapp-sdk/overview.md) — How the SDK, CIP-103 provider, adapters, and wallets fit together
- [Quickstart](dapp-sdk/quickstart.md) — Install, connect a wallet, read the primary party, and submit a transaction
- Guides
    - [Wallet discovery](dapp-sdk/guides/wallet-discovery.md)
    - [Connect & sessions](dapp-sdk/guides/connect-and-sessions.md)
    - [Parties & transactions](dapp-sdk/guides/parties-and-transactions.md)
    - [Handle events](dapp-sdk/guides/handle-events.md)
- [SDK methods](dapp-sdk/reference/sdk-methods.md)
- [Provider API](dapp-sdk/reference/provider-api.md)
- Wallet providers
    - [Integration overview](dapp-sdk/wallet-providers/integration-overview.md) — How wallets and extensions appear in the SDK picker
    - [Browser extension](dapp-sdk/wallet-providers/browser-extension.md)
    - [Remote wallet](dapp-sdk/wallet-providers/remote-wallet.md)
    - [WalletConnect](dapp-sdk/wallet-providers/walletconnect.md)

**Audience:** Frontend developers building dApps that connect users to Canton wallets. Start here if you want to call `connect()`, list accounts, or prepare and execute transactions.

---

### Wallet Gateway

**Published:** TBD
**Path:** [`wallet-gateway/`](wallet-gateway/)

For developers **running or configuring** the Wallet Gateway server that mediates between dApps, Canton validators, and signing providers.

**Contents:**

- [Getting Started](wallet-gateway/getting-started/index.md)
- [Configuration](wallet-gateway/configuration/index.md)
- [Automations](wallet-gateway/automations/index.md)
- [Usage](wallet-gateway/usage/index.md)
- [APIs](wallet-gateway/apis/index.md)
- [Signing Providers](wallet-gateway/signing-providers/index.md)
- [Deployment](wallet-gateway/deployment/index.md)
- [Troubleshooting](wallet-gateway/troubleshooting/index.md)

**Audience:** Operators and backend developers deploying the Wallet Gateway or integrating it with signing providers and identity systems.

---

### dApp Building Guide

**Published:** TBD
**Path:** [`dapp-building/`](dapp-building/)

High-level orientation for **dApp developers** building on the Canton Network. Use the [dApp SDK](dapp-sdk/) in your frontend to connect users to their wallets, and the [Wallet Gateway](wallet-gateway/) to mediate between your dApp, Canton validator nodes, and signing providers.

**Contents:**

- [Overview](dapp-building/Readme.md) — Architecture, key concepts, and how the pieces connect
- [Examples](dapp-building/examples/index.md) — Sample dApps (Ping and Portfolio) you can run and learn from

**Audience:** Developers who want the big picture before diving into the SDK or Gateway docs.

**Preview locally:**

```bash
cd docs/dapp-building
poetry install
poetry run sphinx-autobuild -c . src build -W
```

---

### Wallet Integration Guide

**Published:** [docs.digitalasset.com](https://docs.digitalasset.com/integrate/devnet/index.html)
**Path:** [`wallet-integration-guide/`](wallet-integration-guide/)

For **wallet providers, exchanges, and custodians** integrating directly with the Canton Network. Covers lower-level topics from party management and transaction signing through to exchange-specific workflows.

**Topics covered:**

| Section                                | Description                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| **Canton Network Overview**            | Network topology, synchronizers, participants                                      |
| **Integrating with Canton Network**    | Connection setup, authentication, environment configuration                        |
| **Party Management**                   | Creating and managing external parties with keypairs                               |
| **Finding and Reading Data**           | Querying active contracts and ledger state                                         |
| **Preparing and Signing Transactions** | Interactive submission flow, transaction hashing, signature formats                |
| **Signing Transactions from dApps**    | End-to-end flow when a dApp requests a signature through the Wallet Gateway        |
| **Token Standard**                     | Canton Token Standard (CTS) contracts, transfers, holdings                         |
| **Wallet SDK Configuration**           | Configuring the `@canton-network/wallet-sdk`                                       |
| **Traffic**                            | Traffic management and rate limiting                                               |
| **Tokenomics and Rewards**             | Reward mechanisms and validator economics                                          |
| **User Management**                    | Identity providers, user rights, multi-tenancy                                     |
| **Canton Coin Considerations**         | Canton Coin-specific implementation details                                        |
| **Deposits into Exchanges**            | Deposit detection, reconciliation patterns                                         |
| **USDCx Support**                      | USDCx-specific integration notes                                                   |
| **Exchange Integration**               | Full exchange architecture, workflows, testing, disaster recovery, node operations |
| **Release Notes**                      | Version history and breaking changes                                               |

**Audience:** Teams building custodial wallets, exchange integrations, or any backend that talks directly to the Canton Ledger API. The guide recommends using the Wallet SDK but also documents raw API usage.

**Preview locally:**

```bash
cd docs/wallet-integration-guide
poetry install
poetry run sphinx-autobuild -c . src build -W
```

The guide includes runnable TypeScript examples under [`wallet-integration-guide/examples/`](wallet-integration-guide/examples/).

---

## Reference Documents

| File                               | Description                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute to the project (branching, PRs, code review)        |
| [CLEANCODING.md](CLEANCODING.md)   | Clean coding guidelines and conventions                               |
| [GLOSSARY.md](GLOSSARY.md)         | Terminology reference for Canton, Splice, and Wallet Gateway concepts |
| [RELEASES.md](RELEASES.md)         | Release process and versioning policy                                 |
