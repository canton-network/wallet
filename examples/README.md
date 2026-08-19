# Examples

This directory contains example applications that demonstrate different ways
to integrate with the Wallet Gateway and Canton Network.

| Example                        | Description                                                                                               | Development port |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------- |
| [Ping](ping)                   | Minimal React dApp demonstrating Wallet Gateway connectivity and transaction submission.                  | `8080`           |
| [Portfolio](portfolio)         | Portfolio dApp demonstrating holdings, transfers, allocations, and transaction history.                   | `8081`           |
| [WalletConnect](walletconnect) | Wallet-side WalletConnect v2 implementation using Reown WalletKit.                                        | `8082`           |
| [Automation](automation)       | Python service-account example that calls the Wallet Gateway JSON-RPC API without running a local server. | None             |

## Reserved ports

The browser-based examples reserve the following ports for local development:

| Port   | Service               |
| ------ | --------------------- |
| `8080` | Ping example          |
| `8081` | Portfolio example     |
| `8082` | WalletConnect example |

The examples expect a Wallet Gateway at
[`http://localhost:3030`](http://localhost:3030). Port `3030` belongs to the
Wallet Gateway and is not reserved by an example.

## Running the examples

Install and build dependencies from the repository root:

```bash
pnpm install
pnpm build:all
```

See each example's README for its configuration and run commands.
