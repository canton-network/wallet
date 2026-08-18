# Portfolio — dApp

A feature-rich dApp showcasing a wallet portfolio built with the [`@canton-network/dapp-sdk`](https://www.npmjs.com/package/@canton-network/dapp-sdk). Built with React + TypeScript + Vite + MUI + TanStack Router/Query.

## What It Shows

- Wallet connectivity and account management
- Viewing token holdings across multiple instruments
- Initiating and settling transfers between parties
- Allocation requests and settlement workflows
- Transaction history
- Network and registry validation
- Dark/light theme support

## Prerequisites

- Node.js 20+
- A running [Wallet Gateway](../../docs/wallet-gateway/getting-started/index.md) (default: `http://localhost:3030`)

## Running

First, install and build dependencies from the repository root:

```bash
pnpm install
pnpm build:all
```

Then start the dev server from this directory:

```bash
cd examples/portfolio
pnpm dev
```

Or from the repository root:

```bash
pnpm --filter @canton-network/example-portfolio dev
```

The app will be available at [http://localhost:8081](http://localhost:8081).

## Runtime configuration

The app loads `config.json` at startup and validates it before rendering. The local/default config is in [`public/config.json`](public/config.json):

```json
{
    "amulet": {
        "validatorUrl": "http://localhost:2000/api/validator",
        "registry": "http://scan.localhost:4000/registry/"
    },
    "token": {
        "validatorUrl": "http://localhost:2000/api/validator",
        "registries": [
            {
                "name": "DA Registry",
                "partyId": "operator::1234567890",
                "url": "https://apps.da.com/registrar/operator::1234567890/"
            }
        ]
    }
}
```

The `amulet` section configures Canton Coin (Amulet) operations. The `token` section configures token-standard operations and default registries. Registry `partyId` values are optional; when omitted, the app discovers the registry admin party from the registry metadata endpoint.

For static or Docker deployments, replace or mount `/config.json`.

Alternatively, start all services (Wallet Gateway + example dApps) together from the repository root:

```bash
pnpm start:all     # starts all services via pm2
pnpm stop:all      # stops all services
```

## Running with Docker Compose

[`docker-compose.yaml`](docker-compose.yaml) wires together the published Wallet Gateway and Splice Portfolio Docker images against a LocalNet instance, using the config files in [`docker/`](docker/).

First, start LocalNet from the repository root (if it isn't already running):

```bash
pnpm script:fetch:localnet
pnpm start:localnet
```

Then, from this directory:

```bash
cd examples/portfolio
docker compose up
```

- Portfolio UI: [http://localhost:3333](http://localhost:3333)
- Wallet Gateway: [http://localhost:3030](http://localhost:3030)

Stop everything with `docker compose down` (and `pnpm stop:localnet` from the repository root).

See [Deploying a wallet gateway](../../docs/wallet-gateway/deployment/index.md) for production Docker/Helm deployment guidance.

## Further Reading

See the [dApp Building Guide](../../docs/dapp-building) for full documentation on the dApp SDK, Wallet Gateway configuration, APIs, and signing providers.
