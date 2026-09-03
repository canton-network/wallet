# Signing Providers

The Wallet Gateway supports multiple signing providers that handle cryptographic key management and transaction signing. Each provider has different use cases and security characteristics.

## Available Providers

Each signing provider has an `enable` property in the root-level block
`signingProviders` in Wallet Gateway config . Providers default to enabled, while external providers are
available only when their required environment variables and config properties are also set.
Legacy non-secret environment variables remain supported as deprecated
fallbacks when the corresponding config value is omitted.

## Wallet Gateway (Internal)

The Wallet Gateway provider stores private keys directly in the signing store database. This is suitable for development and testing but **not recommended for production** use cases where security is critical.

**Configuration:**

- Gateway config:
    - `signingProviders.walletKernel.enable` - optional, defaults to `true`
    - `signingStore` - required, the provider is unavailable when the signing store is omitted
- Environment variables:
    - None

**Use Cases:**

- Local development
- Testing environments
- Proof-of-concept applications

**Security Considerations:**

> [!IMPORTANT]
> Private keys are stored in the database. If the database is compromised, all keys are at risk. Use only in non-production environments.

## Participant-Based Signing

The Participant signing provider uses Canton's participant node for signing transactions. The participant maintains the key material and handles all cryptographic operations.

**Configuration:**

- Gateway config:
    - `signingProviders.participant.enable` - optional, defaults to `true`
- Environment variables:
    - None

**Use Cases:**

- Enterprise deployments where the participant node manages keys
- Scenarios where key management is handled by the infrastructure
- Operator-controlled deployments where wallet creation is not exposed via the User API

**Security Considerations:**

> [!IMPORTANT]
> Participant-based signing is **not recommended** in production setups where the User API is accessible. Any user who can reach the User API can create parties that sign via your participant node, which may grant broader signing authority than intended. Reserve participant-based signing for deployments where wallet creation is restricted to trusted operators, or use an external signing provider (Fireblocks, Dfns, Blockdaemon, Securosys, BitGo) when the User API is exposed in production.

**How it Works:**

When a transaction is submitted, the Gateway forwards the command to the participant node, which signs it using the party's key stored in the participant's keystore.

## Fireblocks

Fireblocks is a third-party crypto custody service provider that offers enterprise-grade key management and signing services.

**Setup:**

1. Complete steps 1-3 from the [Fireblocks signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-fireblocks)

**Configuration:**

- Gateway config:
    - `signingProviders.fireblocks.enable` - optional, defaults to `true`
    - `signingProviders.fireblocks.apiPath` - optional, falls back to `FIREBLOCKS_API_PATH`, then defaults to `https://api.fireblocks.io/v1`
- Environment variables:
    - `FIREBLOCKS_API_KEY` - required Fireblocks API key from the `API User (ID)` column
    - `FIREBLOCKS_SECRET` - required corresponding API secret
    - `FIREBLOCKS_API_PATH` - deprecated optional fallback for `signingProviders.fireblocks.apiPath`

**Use Cases:**

- Enterprise deployments requiring HSM-backed key storage
- Compliance-sensitive applications
- High-security production environments

## Blockdaemon

Blockdaemon provides signing services as part of their infrastructure offerings.

**Configuration:**

- Gateway config:
    - `signingProviders.blockdaemon.enable` - optional, defaults to `true`
    - `signingProviders.blockdaemon.baseUrl` - optional, falls back to `BLOCKDAEMON_API_URL`, then defaults to `http://localhost:5080/api/cwp/canton`
    - `signingProviders.blockdaemon.caip2` - optional, falls back to `BLOCKDAEMON_CAIP2`, then defaults to `canton:testnet`
- Environment variables:
    - `BLOCKDAEMON_API_KEY` - required API key
    - `BLOCKDAEMON_API_URL` - deprecated optional fallback for `signingProviders.blockdaemon.baseUrl`
    - `BLOCKDAEMON_CAIP2` - deprecated optional fallback for `signingProviders.blockdaemon.caip2`

**Use Cases:**

- Managed infrastructure deployments
- Cloud-native applications
- Environments leveraging Blockdaemon's services

## Dfns

Dfns is a crypto custody platform that provides programmable key management and signing infrastructure.

**Configuration:**

- Gateway config:
    - `signingProviders.dfns.enable` - optional, defaults to `true`
    - `signingProviders.dfns.orgId` - required, falls back to `DFNS_ORG_ID`
    - `signingProviders.dfns.credId` - required, falls back to `DFNS_CRED_ID`
    - `signingProviders.dfns.baseUrl` - optional, falls back to `DFNS_BASE_URL`, then defaults to `https://api.dfns.io`
- Environment variables:
    - `DFNS_PRIVATE_KEY` - required service account private key
    - `DFNS_AUTH_TOKEN` - required service account authentication token
    - `DFNS_ORG_ID` - deprecated optional fallback for `signingProviders.dfns.orgId`
    - `DFNS_CRED_ID` - deprecated optional fallback for `signingProviders.dfns.credId`
    - `DFNS_BASE_URL` - deprecated optional fallback for `signingProviders.dfns.baseUrl`

**Prerequisites:**

1. Set up a service account with appropriate permissions in Dfns
2. Generate and download the service account credentials

**Use Cases:**

- Enterprise deployments requiring MPC-based key management
- Programmable custody with policy controls
- Multi-party approval workflows
- High-security production environments

## Securosys

Securosys provides HSM-backed key management and signing through the Securosys TSB (Transaction Security Broker).

**Setup:**

See the [Securosys signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-securosys) for driver details, local deployment, and authentication modes (API keys, bearer token, and/or mTLS).

**Configuration:**

- Gateway config:
    - `signingProviders.securosys.enable` - optional, defaults to `true`
    - `signingProviders.securosys.baseUrl` - required, falls back to `SECUROSYS_TSB_BASE_URL`
    - `signingProviders.securosys.mtlsP12Path` - optional, falls back to `SECUROSYS_TSB_MTLS_P12_PATH`
    - `signingProviders.securosys.signatureAlgorithm` - optional, falls back to `SECUROSYS_TSB_SIGNATURE_ALGORITHM`, then defaults to `EDDSA`
- Environment variables:
    - `SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY` - optional API key for TSB key-management endpoints when using API-key authentication
    - `SECUROSYS_TSB_KEY_OPERATION_API_KEY` - optional API key for TSB signing and request-status endpoints when using API-key authentication
    - `SECUROSYS_TSB_BEARER_TOKEN` - optional bearer access token (access-token auth mode)
    - `SECUROSYS_TSB_MTLS_P12_PASSWORD` - optional password for the PKCS#12/P12 client certificate
    - `SECUROSYS_TSB_KEY_PASSWORD` - optional TSB key password used for key attributes and signing
    - `SECUROSYS_TSB_BASE_URL` - deprecated optional fallback for `signingProviders.securosys.baseUrl`
    - `SECUROSYS_TSB_MTLS_P12_PATH` - deprecated optional fallback for `signingProviders.securosys.mtlsP12Path`
    - `SECUROSYS_TSB_SIGNATURE_ALGORITHM` - deprecated optional fallback for `signingProviders.securosys.signatureAlgorithm`

**Use Cases:**

- Enterprise deployments requiring HSM-backed key storage
- Environments already using Securosys TSB / CloudHSM
- High-security production environments

## BitGo

BitGo provides MPC-based custodial wallet and transaction-signing services.

**Setup:**

See the [BitGo signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-bitgo) for credential setup and driver behavior.

**Configuration:**

- Gateway config:
    - `signingProviders.bitgo.enable` - optional, defaults to `true`
    - `signingProviders.bitgo.baseUrl` - optional, falls back to `BITGO_API_URL`, then defaults to `https://app.bitgo.com`
    - `signingProviders.bitgo.enterpriseId` - optional, falls back to `BITGO_ENTERPRISE_ID`; required for wallet creation and restart-safe transaction lookup
    - `signingProviders.bitgo.coin` - optional, falls back to `BITGO_COIN`, then auto-detected from the API URL
- Environment variables:
    - `BITGO_ACCESS_TOKEN` - required long-lived access token
    - `BITGO_API_URL` - deprecated optional fallback for `signingProviders.bitgo.baseUrl`
    - `BITGO_ENTERPRISE_ID` - deprecated optional fallback for `signingProviders.bitgo.enterpriseId`
    - `BITGO_COIN` - deprecated optional fallback for `signingProviders.bitgo.coin`

**Use Cases:**

- Enterprise deployments requiring MPC-based custody
- Deployments already using BitGo wallet infrastructure
- High-security production environments

## Selecting a Provider

When creating a new party through the User API or web UI, you can select which signing provider to use. The choice depends on your security requirements, infrastructure setup, and compliance needs.

**Recommendations:**

- **Development/Testing**: Use Wallet Gateway (internal) or Participant-based signing
- **Production (User API accessible)**: Use Fireblocks, Dfns, Blockdaemon, Securosys, or BitGo
- **Production (operator-controlled, User API restricted)**: Participant-based signing may be appropriate when wallet creation is limited to trusted operators

The signing provider is selected per-party, so you can have different parties using different providers within the same Gateway instance.

## Key Management

Each provider handles key management differently:

- **Wallet Gateway**: Keys are stored in the signing store database
- **Participant**: Keys are managed by the Canton participant node
- **Fireblocks**: Keys are stored in Fireblocks' secure infrastructure (HSM-backed)
- **Blockdaemon**: Keys are managed by Blockdaemon's infrastructure
- **Dfns**: Keys are managed by Dfns' secure infrastructure
- **Securosys**: Keys are managed by Securosys TSB (HSM-backed)
- **BitGo**: Keys are managed by BitGo's MPC custody infrastructure

When migrating between providers, keys cannot be directly transferred. You'll need to:

1. Create a new party with the new provider
2. Transfer any assets/contracts to the new party
3. Update your dApp to use the new party
