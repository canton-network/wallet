# dApp Building

Build decentralized applications (dApps) that interact with the **Canton Network** through the **Wallet Gateway**. Use the **dApp SDK** in your frontend to connect users to their wallets, and the Wallet Gateway to mediate between your dApp, Canton validator nodes, and signing providers.

> [!NOTE]
> Migration guides for each release are published in [Discussions](https://github.com/canton-network/wallet/discussions).

## Contents

- [Overview](overview/index.md) — Architecture, key concepts, and how the pieces connect
- [dApp SDK](dapp-sdk/overview.md) — TypeScript library for wallet connectivity, accounts, signing, and transactions
    - [Overview](dapp-sdk/overview.md)
    - [Quickstart](dapp-sdk/quickstart.md)
    - [Wallet discovery](dapp-sdk/guides/wallet-discovery.md)
    - [Connect & sessions](dapp-sdk/guides/connect-and-sessions.md)
    - [Parties & transactions](dapp-sdk/guides/parties-and-transactions.md)
    - [Handle events](dapp-sdk/guides/handle-events.md)
    - [SDK methods](dapp-sdk/reference/sdk-methods.md)
    - [Provider API](dapp-sdk/reference/provider-api.md)
    - [Wallet providers](dapp-sdk/wallet-providers/integration-overview.md) — How wallets and extensions appear in the SDK picker
- [Wallet Gateway](wallet-gateway/index.md) — Server setup, configuration, APIs, signing providers, and troubleshooting
    - [Getting Started](wallet-gateway/getting-started/index.md)
    - [Configuration](wallet-gateway/configuration/index.md)
    - [Usage](wallet-gateway/usage/index.md)
    - [APIs](wallet-gateway/apis/index.md)
    - [Signing Providers](wallet-gateway/signing-providers/index.md)
    - [Deployment](wallet-gateway/deployment/index.md)
    - [Troubleshooting](wallet-gateway/troubleshooting/index.md)
- [Examples](examples/index.md) — Sample dApps (Ping and Portfolio) you can run and learn from
