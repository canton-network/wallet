# Signing Providers

The Wallet Gateway supports multiple signing providers that handle cryptographic key management and transaction signing. Each provider has different use cases and security characteristics.

## Available Providers

## Wallet Gateway (Internal)

The Wallet Gateway provider stores private keys directly in the signing store database. This is suitable for development and testing but **not recommended for production** use cases where security is critical.

**Configuration:**

This provider is automatically available when a `signingStore` is configured in the Gateway configuration. No additional setup is required.

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

This provider is always available and requires no additional configuration. You simply select it when creating a party.

**Use Cases:**

- Enterprise deployments where the participant node manages keys
- Scenarios where key management is handled by the infrastructure
- Operator-controlled deployments where wallet creation is not exposed via the User API

**Security Considerations:**

> [!IMPORTANT]
> Participant-based signing is **not recommended** in production setups where the User API is accessible. Any user who can reach the User API can create parties that sign via your participant node, which may grant broader signing authority than intended. Reserve participant-based signing for deployments where wallet creation is restricted to trusted operators, or use an external signing provider (Fireblocks, Dfns, Blockdaemon, Securosys, Taurus-PROTECT) when the User API is exposed in production.

**How it Works:**

When a transaction is submitted, the Gateway forwards the command to the participant node, which signs it using the party's key stored in the participant's keystore.

## Fireblocks

Fireblocks is a third-party crypto custody service provider that offers enterprise-grade key management and signing services.

**Setup:**

1. Complete steps 1-3 from the [Fireblocks signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-fireblocks)

2. Supply an environment variable named `FIREBLOCKS_API_KEY` containing your Fireblocks API key (from the `API User (ID)` column in the Fireblocks API users table).

**Configuration:**

The Fireblocks provider reads configuration from environment variables and key files. No additional Gateway configuration is needed beyond placing the required files.

**Use Cases:**

- Enterprise deployments requiring HSM-backed key storage
- Compliance-sensitive applications
- High-security production environments

## Blockdaemon

Blockdaemon provides signing services as part of their infrastructure offerings.

**Configuration:**

Set the following environment variables:

- `BLOCKDAEMON_API_URL` - The base URL for the Blockdaemon API
- `BLOCKDAEMON_API_KEY` - Your Blockdaemon API key

**Use Cases:**

- Managed infrastructure deployments
- Cloud-native applications
- Environments leveraging Blockdaemon's services

## Dfns

Dfns is a crypto custody platform that provides programmable key management and signing infrastructure.

**Configuration:**

Set the following environment variables:

- `DFNS_ORG_ID` - Your Dfns organization ID
- `DFNS_BASE_URL` - The Dfns API URL (defaults to `https://api.dfns.io`)
- `DFNS_CRED_ID` - Your service account credential ID
- `DFNS_PRIVATE_KEY` - Your service account private key (PEM format)
- `DFNS_AUTH_TOKEN` - Your service account authentication token

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

Set the following environment variables:

- `SECUROSYS_TSB_BASE_URL` - Base URL of the TSB service
- `SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY` - API key for TSB key-management endpoints
- `SECUROSYS_TSB_KEY_OPERATION_API_KEY` - API key for TSB signing and request-status endpoints
- `SECUROSYS_TSB_BEARER_TOKEN` - Optional bearer access token (access-token auth mode)
- `SECUROSYS_TSB_MTLS_P12_PATH` - Optional path to a PKCS#12/P12 client certificate when TSB requires mTLS
- `SECUROSYS_TSB_MTLS_P12_PASSWORD` - Optional password for the PKCS#12/P12 client certificate
- `SECUROSYS_TSB_KEY_PASSWORD` - Optional TSB key password used for key attributes and signing
- `SECUROSYS_TSB_SIGNATURE_ALGORITHM` - Optional TSB signature algorithm (defaults to `EDDSA`)

**Use Cases:**

- Enterprise deployments requiring HSM-backed key storage
- Environments already using Securosys TSB / CloudHSM
- High-security production environments

## Taurus-PROTECT

Taurus-PROTECT provides custody-grade key management and governance for Canton parties. Unlike the sign-only providers, it is a **submit** provider: its Canton gateway prepares, signs (ECDSA P-256) and submits each CIP-103 command against its own validator under Taurus governance, while the Wallet Gateway forwards commands and tracks their status. Parties are provisioned in Taurus-PROTECT and imported by the Wallet Gateway rather than allocated.

**Setup:**

See the [Taurus-PROTECT signing documentation](https://github.com/canton-network/wallet/tree/main/core/signing-taurus-protect) for driver details, the submission model, status mapping, and known gateway limitations.

**Configuration:**

Set the following environment variables:

- `TAURUS_PROTECT_GATEWAY_URL` - Base URL of the Taurus-PROTECT Canton gateway JSON-RPC endpoint
- `TAURUS_PROTECT_GATEWAY_TOKEN` - Bearer api-key for that gateway

**Use Cases:**

- Enterprise deployments where parties are custodied in Taurus-PROTECT
- Governance-controlled signing with approval workflows
- High-security production environments

**Security Considerations:**

> [!IMPORTANT]
> The driver is single-tenant by design: one machine bearer token serves every Wallet Gateway user, so any authenticated user can list and import every party in the Taurus-PROTECT tenant, and submissions are not attributed to individual Wallet Gateway users. Deploy only where all Wallet Gateway users are equally trusted with every party in the tenant.

## Selecting a Provider

When creating a new party through the User API or web UI, you can select which signing provider to use. The choice depends on your security requirements, infrastructure setup, and compliance needs.

**Recommendations:**

- **Development/Testing**: Use Wallet Gateway (internal) or Participant-based signing
- **Production (User API accessible)**: Use Fireblocks, Dfns, Blockdaemon, Securosys, or Taurus-PROTECT
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
- **Taurus-PROTECT**: Keys are managed by Taurus-PROTECT; parties are hosted there and the platform signs and submits on their behalf

When migrating between providers, keys cannot be directly transferred. You'll need to:

1. Create a new party with the new provider
2. Transfer any assets/contracts to the new party
3. Update your dApp to use the new party
