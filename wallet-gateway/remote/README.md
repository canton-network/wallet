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

## Signing providers

All signing providers are enabled by default. Set the provider's optional
`enable` config field to `false` to prevent it from being registered.

### Wallet Kernel

**Gateway config:**

- `signingProviders.walletKernel.enable` - optional, defaults to `true`
- `signingStore` - required for this provider, the provider is unavailable when the signing store is omitted

**Environment variables:**

- None

### Participant

**Gateway config:**

- `signingProviders.participant.enable` - optional, defaults to `true`

**Environment variables:**

- None

### Dfns

Create a service account in the Dfns dashboard with permissions to create and sign with Canton wallets, then download its credentials.

**Gateway config:**

- `signingProviders.dfns.enable` - optional, defaults to `true`
- `signingProviders.dfns.orgId` - required, falls back to the deprecated `DFNS_ORG_ID` environment variable
- `signingProviders.dfns.credId` - required, falls back to the deprecated `DFNS_CRED_ID` environment variable
- `signingProviders.dfns.baseUrl` - optional, falls back to the deprecated `DFNS_BASE_URL` environment variable, then defaults to `https://api.dfns.io`

**Environment variables:**

- `DFNS_PRIVATE_KEY` - required service account private key (PEM)
- `DFNS_AUTH_TOKEN` - required service account auth token
- `DFNS_ORG_ID` - deprecated optional fallback for `signingProviders.dfns.orgId`
- `DFNS_CRED_ID` - deprecated optional fallback for `signingProviders.dfns.credId`
- `DFNS_BASE_URL` - deprecated optional fallback for `signingProviders.dfns.baseUrl`

### Fireblocks

Complete steps 1–3 from the instructions at https://github.com/canton-network/wallet/tree/main/core/signing-fireblocks.

**Gateway config:**

- `signingProviders.fireblocks.enable` - optional, defaults to `true`
- `signingProviders.fireblocks.apiPath` - optional, falls back to the deprecated `FIREBLOCKS_API_PATH` environment variable, then defaults to `https://api.fireblocks.io/v1`

**Environment variables:**

- `FIREBLOCKS_API_KEY` - required API key from the `API User (ID)` column in the Fireblocks API users table
- `FIREBLOCKS_SECRET` - required corresponding API secret
- `FIREBLOCKS_API_PATH` - deprecated optional fallback for `signingProviders.fireblocks.apiPath`

### Blockdaemon

Create a system user in the Blockdaemon dashboard and save the API key displayed after successful creation.

**Gateway config:**

- `signingProviders.blockdaemon.enable` - optional, defaults to `true`
- `signingProviders.blockdaemon.baseUrl` - optional, falls back to the deprecated `BLOCKDAEMON_API_URL` environment variable, then defaults to `http://localhost:5080/api/cwp/canton`
- `signingProviders.blockdaemon.caip2` - optional, falls back to the deprecated `BLOCKDAEMON_CAIP2` environment variable, then defaults to `canton:testnet`

**Environment variables:**

- `BLOCKDAEMON_API_KEY` - required API key for authenticating with Blockdaemon
- `BLOCKDAEMON_API_URL` - deprecated optional fallback for `signingProviders.blockdaemon.baseUrl`
- `BLOCKDAEMON_CAIP2` - deprecated optional fallback for `signingProviders.blockdaemon.caip2`

### Securosys

**Gateway config:**

- `signingProviders.securosys.enable` - optional, defaults to `true`
- `signingProviders.securosys.baseUrl` - required, falls back to the deprecated `SECUROSYS_TSB_BASE_URL` environment variable
- `signingProviders.securosys.mtlsP12Path` - optional client PKCS#12/P12 file for mTLS, falls back to the deprecated `SECUROSYS_TSB_MTLS_P12_PATH` environment variable
- `signingProviders.securosys.signatureAlgorithm` - optional TSB signature algorithm, falls back to the deprecated `SECUROSYS_TSB_SIGNATURE_ALGORITHM` environment variable, then defaults to `EDDSA`

**Environment variables:**

- `SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY` - required `X-API-KEY` for key-management endpoints
- `SECUROSYS_TSB_KEY_OPERATION_API_KEY` - required `X-API-KEY` for signing/request endpoints
- `SECUROSYS_TSB_BEARER_TOKEN` - optional bearer token for access-token mode
- `SECUROSYS_TSB_MTLS_P12_PASSWORD` - optional PKCS#12/P12 password
- `SECUROSYS_TSB_KEY_PASSWORD` - optional TSB key password
- `SECUROSYS_TSB_BASE_URL` - deprecated optional fallback for `signingProviders.securosys.baseUrl`
- `SECUROSYS_TSB_MTLS_P12_PATH` - deprecated optional fallback for `signingProviders.securosys.mtlsP12Path`
- `SECUROSYS_TSB_SIGNATURE_ALGORITHM` - deprecated optional fallback for `signingProviders.securosys.signatureAlgorithm`

See [`@canton-network/core-signing-securosys`](../../core/signing-securosys/README.md)
for key creation, public-key, and signature format details.

## Postgres connection

To create a Postgres database you need to:

1. Start Postgres in Docker using:

```shell
$ docker run --network=host --name some-postgres -e POSTGRES_PASSWORD=postgres -d postgres
```

2. In the file `wallet/wallet-gateway/test/config.json`, specify the connection settings for both databases - store (required) and signingStore (optional, only for needed for signing provider `wallet-kernel`). The connection should look like this (it is important that `store.connection.database !== signingStore.connection.database !== 'postgres'`):

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
