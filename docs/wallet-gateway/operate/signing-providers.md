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

It is available whenever a `signingStore` is configured; no other setup is required. See
[Configure the Wallet Gateway](configure.md#signing-store).

> [!WARNING]
> Private keys are stored in the signing store database. If it is compromised, all keys are at
> risk; if it is lost, they are unrecoverable. Protect the database file with strict filesystem
> permissions and never commit it to version control.

## Participant

Uses a Canton participant node to sign. The participant holds the key material and performs all
cryptographic operations, so keys never live in the Wallet Gateway.

It is always available and needs no additional configuration; select it when creating a party.
When a transaction is submitted, the Wallet Gateway forwards the command to the participant
node, which signs it using the party's key from the participant's keystore.

## Fireblocks

Enterprise-grade, HSM-backed key management and signing from Fireblocks. Keys stay in
Fireblocks' secure infrastructure.

1. Complete steps 1-3 from the [Fireblocks signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-fireblocks).
2. Supply `FIREBLOCKS_API_KEY` with your Fireblocks API key (from the `API User (ID)` column in
   the Fireblocks API users table).
3. Supply `FIREBLOCKS_SECRET` with your Fireblocks API secret key.

The provider reads its configuration from environment variables and key files; no additional
Wallet Gateway configuration is needed beyond placing the required files.

## Blockdaemon

Managed signing from Blockdaemon's infrastructure. Complete the setup from the
[Blockdaemon signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-blockdaemon),
then set the following environment variables:

| Variable              | Description                           |
| --------------------- | ------------------------------------- |
| `BLOCKDAEMON_API_URL` | The base URL for the Blockdaemon API. |
| `BLOCKDAEMON_API_KEY` | Your Blockdaemon API key.             |

## DFNS

Programmable, MPC-based key management and signing from DFNS. Keys are managed in DFNS' secure
infrastructure. Complete the setup from the
[DFNS signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-dfns).

Set up a service account with appropriate permissions and download its credentials, then set
the following environment variables:

| Variable           | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `DFNS_ORG_ID`      | Your DFNS organization ID.                            |
| `DFNS_BASE_URL`    | The DFNS API URL (defaults to `https://api.dfns.io`). |
| `DFNS_CRED_ID`     | Your service account credential ID.                   |
| `DFNS_PRIVATE_KEY` | Your service account private key (PEM format).        |
| `DFNS_AUTH_TOKEN`  | Your service account authentication token.            |

DFNS creates and activates Canton wallets directly through its validator integration: it
provisions a Canton-formatted key, registers the party on the network, and returns the wallet
ready for use. When signing, DFNS broadcasts the transaction to Canton in a single step and
returns the update ID.

> [!NOTE]
> Only `Canton` and `CantonTestnet` network wallets are supported.
