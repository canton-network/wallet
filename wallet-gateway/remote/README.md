# Wallet Gateway

The RPC-based (server-side) Wallet Gateway.

# Usage

Install the Wallet Gateway

```shell
$ npm install -g @canton-network/wallet-gateway-remote

...

$ wallet-gateway -c ./config.json
```

Alternatively, you can run it directly through npx (tested with NodeJS v24):

`npx @canton-network/wallet-gateway-remote -c ./config.json`

By default, the service runs on port `3030`, but this can be overridden via the `-p, --port` CLI argument.

- The User web interface runs on `localhost:3030`
- The dApp JSON-RPC API is exposed on `localhost:3030/api/v0/dapp`
- The User JSON-RPC API is exposed on `localhost:3030/api/v0/user`

## Configuration

A configuration file is required to start up the Gateway. Create an example config to edit as a starting point:

```bash
wallet-gateway --config-example > config.json
```

To show the full [JSON Schema](https://json-schema.org/) representation of the configuration file:

```bash
wallet-gateway --config-schema
```

# Developing

## Codegen

The JSON-RPC API specs from `api-specs/` are generated into strongly-typed method builders for the remote RPC server. To update the codegen, run `pnpm generate:dapp`.

## Dfns

1. Create a service account in the Dfns dashboard with permissions to create and sign with Canton wallets, then download its credentials.

2. Set the following environment variables before starting the Gateway:
    - `DFNS_ORG_ID` — your Dfns organization ID (required; the driver is skipped if unset)
    - `DFNS_BASE_URL` — Dfns API base URL (defaults to `https://api.dfns.io`)
    - `DFNS_CRED_ID` — service account credential ID
    - `DFNS_PRIVATE_KEY` — service account private key (PEM)
    - `DFNS_AUTH_TOKEN` — service account auth token

## Fireblocks

1. Complete steps 1–3 from the instructions at https://github.com/canton-network/wallet/tree/main/core/signing-fireblocks

2. set the environment variable `FIREBLOCKS_API_KEY` (get it from `API User (ID)` column in fireblocks api users table).

# Blockdaemon

1. Create a system user in the Blockdaemon dashboard and save the API key displayed after successful creation.

2. set the environment variables

- `BLOCKDAEMON_API_URL` - The base URL for the Blockdaemon API
- `BLOCKDAEMON_API_KEY` - Your Blockdaemon API key

## Securosys

The Securosys TSB signing driver is registered at startup as `securosys` when
`SECUROSYS_TSB_BASE_URL` is set. Set these environment variables before starting
the Gateway:

- `SECUROSYS_TSB_BASE_URL` — TSB base URL
- `SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY` — `X-API-KEY` optional for key-management endpoints
- `SECUROSYS_TSB_KEY_OPERATION_API_KEY` — `X-API-KEY` optional for signing/request endpoints
- `SECUROSYS_TSB_BEARER_TOKEN` — optional bearer token for access-token mode
- `SECUROSYS_TSB_MTLS_P12_PATH` — optional client PKCS#12/P12 file for mTLS
- `SECUROSYS_TSB_MTLS_P12_PASSWORD` — optional PKCS#12/P12 password
- `SECUROSYS_TSB_KEY_PASSWORD` — optional TSB key password
- `SECUROSYS_TSB_SIGNATURE_ALGORITHM` — TSB signature algorithm, defaults to `EDDSA`

See [`@canton-network/core-signing-securosys`](../../core/signing-securosys/README.md)
for key creation, public-key, and signature format details.

## Taurus-PROTECT

The Taurus-PROTECT signing driver is registered at startup as `taurus-protect` when
both of these environment variables are set before starting the Gateway:

- `TAURUS_PROTECT_GATEWAY_URL` — Base URL of the Taurus-PROTECT Canton gateway JSON-RPC endpoint
- `TAURUS_PROTECT_GATEWAY_TOKEN` — Bearer api-key for that gateway

See [`@canton-network/core-signing-taurus-protect`](../../core/signing-taurus-protect/README.md)
for the submission model, status mapping, and tenancy caveats.

## Postgres connection

To create a Postgres database you need to:

1. Start Postgres in Docker using:

```shell
$ docker run --network=host --name some-postgres -e POSTGRES_PASSWORD=postgres -d postgres
```

2. In the file `splice-wallet-kernel/wallet-gateway/test/config.json`, specify the connection settings for both databases (store and signingStore). The connection should look like this (it is important that `store.connection.database !== signingStore.connection.database !== 'postgres'`):

```json
{
    "store": {
        "connection": {
            "type": "postgres",
            "password": "postgres",
            "port": 5432,
            "user": "postgres",
            "host": "0.0.0.0",
            "database": "wallet_store"
        }
    },
    "signingStore": {
        "connection": {
            "type": "postgres",
            "password": "postgres",
            "port": 5432,
            "user": "postgres",
            "host": "0.0.0.0",
            "database": "signing_store"
        }
    }
}
```
