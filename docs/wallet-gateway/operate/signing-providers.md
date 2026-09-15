---
title: 'Signing Providers'
description: 'How the Wallet Gateway delegates transaction signing, and how to configure each provider.'
---

The Wallet Gateway does not have to hold private keys. Signing is delegated to a **signing
provider** chosen per wallet, so you decide where each wallet's keys live and who performs the
cryptographic signing. Different wallets in the same Wallet Gateway can use different providers,
and you select the provider per party when you create a wallet.

When a wallet submits a transaction, the Wallet Gateway hands the prepared transaction to that
wallet's signing provider, which signs it with the party's key and returns it for the Wallet
Gateway to submit.

## Configuration

List each provider you want under `signingProviders`. Presence of the key opts the provider in.
Non-secret settings come from the config object. Secret values stay in the environment, `*Env`
fields name those variables (each defaults to the name in the environment-variable tables
below).

```json
{
    "signingProviders": {
        "participant": {},
        "fireblocks": {
            "apiPath": "https://api.fireblocks.io/v1",
            "apiKeyEnv": "FIREBLOCKS_API_KEY",
            "secretEnv": "FIREBLOCKS_SECRET"
        }
    }
}
```

Omit a provider to leave it unregistered. An empty `"signingProviders": {}` registers none.

> [!NOTE]
> If `signingProviders` is omitted entirely, the Wallet Gateway uses a legacy discovery mode
> (every provider is available when its required environment variables are set). That mode is
> deprecated and will be removed.

## Available providers

| Provider                    | Key custody                           | Best for                                             |
| --------------------------- | ------------------------------------- | ---------------------------------------------------- |
| [Internal](#internal)       | Wallet Gateway signing store database | Local development and testing only.                  |
| [Participant](#participant) | Canton participant node               | Enterprise deployments with a dedicated participant. |
| [Fireblocks](#fireblocks)   | Fireblocks (HSM-backed)               | Compliance-sensitive, high-security production.      |
| [Blockdaemon](#blockdaemon) | Blockdaemon infrastructure            | Managed, cloud-native deployments.                   |
| [DFNS](#dfns)               | DFNS (MPC)                            | Programmable custody with policy controls.           |

> [!WARNING]
> The internal provider stores private keys in the Wallet Gateway's signing store database. Do not
> use it for wallets holding valuable assets. Prefer a participant node or an external custody
> provider in production.

## Internal

Stores private keys directly in the Wallet Gateway's signing store database and signs
transactions itself. Suitable for development and testing only.

See [Configure the Wallet Gateway](configure.md#signing-store).

| Config field                    | Required | Description                                                             |
| ------------------------------- | -------- | ----------------------------------------------------------------------- |
| `signingProviders.walletKernel` | yes      | Include `{}` to opt in.                                                 |
| `signingStore`                  | yes      | Signing-store database. The provider is unavailable if this is omitted. |

> [!WARNING]
> Private keys are stored in the signing store database. If it is compromised, all keys are at
> risk; if it is lost, they are unrecoverable. Protect the database file with strict filesystem
> permissions and never commit it to version control.

## Participant

Uses a Canton participant node to sign. The participant holds the key material and performs all
cryptographic operations, so keys never live in the Wallet Gateway.

When a transaction is submitted, the Wallet Gateway forwards the command to the participant
node, which signs it using the party's key from the participant's keystore.

| Config field                   | Required | Description             |
| ------------------------------ | -------- | ----------------------- |
| `signingProviders.participant` | yes      | Include `{}` to opt in. |

## Fireblocks

Enterprise-grade, HSM-backed key management and signing from Fireblocks. Keys stay in
Fireblocks' secure infrastructure.

Complete steps 1-3 from the [Fireblocks signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-fireblocks).
The API key is the value in the `API User (ID)` column in the Fireblocks API users table,
then set the following config fields and environment variables:

| Config field                            | Required | Description                                                                     |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `signingProviders.fireblocks`           | yes      | Include this object to opt in.                                                  |
| `signingProviders.fireblocks.apiPath`   | no       | Fireblocks API URL. Defaults to `https://api.fireblocks.io/v1`.                 |
| `signingProviders.fireblocks.apiKeyEnv` | no       | Name of the env var that holds the API key. Defaults to `FIREBLOCKS_API_KEY`.   |
| `signingProviders.fireblocks.secretEnv` | no       | Name of the env var that holds the API secret. Defaults to `FIREBLOCKS_SECRET`. |

| Environment variable | Required | Description                                            |
| -------------------- | -------- | ------------------------------------------------------ |
| `FIREBLOCKS_API_KEY` | yes      | Fireblocks API key. Override name with `apiKeyEnv`.    |
| `FIREBLOCKS_SECRET`  | yes      | Fireblocks API secret. Override name with `secretEnv`. |

## Blockdaemon

Managed signing from Blockdaemon's infrastructure. Complete the setup from the
[Blockdaemon signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-blockdaemon),
then set the following config fields and environment variables:

| Config field                             | Required | Description                                                                    |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `signingProviders.blockdaemon`           | yes      | Include this object to opt in.                                                 |
| `signingProviders.blockdaemon.baseUrl`   | no       | Blockdaemon API URL. Defaults to `http://localhost:5080/api/cwp/canton`.       |
| `signingProviders.blockdaemon.caip2`     | no       | CAIP-2 network identifier. Defaults to `canton:testnet`.                       |
| `signingProviders.blockdaemon.apiKeyEnv` | no       | Name of the env var that holds the API key. Defaults to `BLOCKDAEMON_API_KEY`. |

| Environment variable  | Required | Description                                          |
| --------------------- | -------- | ---------------------------------------------------- |
| `BLOCKDAEMON_API_KEY` | yes      | Blockdaemon API key. Override name with `apiKeyEnv`. |

## DFNS

Programmable, MPC-based key management and signing from DFNS. Keys are managed in DFNS' secure
infrastructure. Complete the setup from the
[DFNS signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-dfns).

Set up a service account with appropriate permissions and download its credentials, then set
the following config fields and environment variables:

| Config field                          | Required | Description                                                                     |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `signingProviders.dfns`               | yes      | Include this object to opt in.                                                  |
| `signingProviders.dfns.orgId`         | yes      | Dfns organization ID.                                                           |
| `signingProviders.dfns.credId`        | yes      | Dfns service account credential ID.                                             |
| `signingProviders.dfns.baseUrl`       | no       | Dfns API URL. Defaults to `https://api.dfns.io`.                                |
| `signingProviders.dfns.privateKeyEnv` | no       | Name of the env var that holds the private key. Defaults to `DFNS_PRIVATE_KEY`. |
| `signingProviders.dfns.authTokenEnv`  | no       | Name of the env var that holds the auth token. Defaults to `DFNS_AUTH_TOKEN`.   |

| Environment variable | Required | Description                                                            |
| -------------------- | -------- | ---------------------------------------------------------------------- |
| `DFNS_PRIVATE_KEY`   | yes      | Service account private key (PEM). Override name with `privateKeyEnv`. |
| `DFNS_AUTH_TOKEN`    | yes      | Service account auth token. Override name with `authTokenEnv`.         |

DFNS creates and activates Canton wallets directly through its validator integration: it
provisions a Canton-formatted key, registers the party on the network, and returns the wallet
ready for use. When signing, DFNS broadcasts the transaction to Canton in a single step and
returns the update ID.

> [!NOTE]
> Only `Canton` and `CantonTestnet` network wallets are supported.
