# Service account automations

This guide explains how to configure the Wallet Gateway for **machine-to-machine (M2M) automation** and how to submit ledger transactions from a backend job, CI pipeline, or other service — without a human opening the approval UI.

Automation uses the **same DApp API** as interactive dApps (`prepareExecute`, `txChanged` events). When the network is configured for service accounts, the Gateway prepares, signs, and executes transactions straight through after `prepareExecute`.

## Overview

```text
┌─────────────────────┐   JWT (client credentials)   ┌──────────────────┐
│ Your automation     │ ───────────────────────────► │ Wallet Gateway   │
│ (backend / CI)      │   DApp API: prepareExecute   │                  │
└─────────────────────┘   User API: addSession       └────────┬─────────┘
         │                                                      │
         │  txChanged (SSE)                                     │ Ledger API
         └──────────────────────────────────────────────────────┤
                                                                ▼
                                                       ┌─────────────────┐
                                                       │ Canton          │
                                                       │ participant     │
                                                       └─────────────────┘
                                                                │
                                                                ▼ (optional)
                                                       ┌─────────────────┐
                                                       │ External signer │
                                                       │ Fireblocks,     │
                                                       │ Blockdaemon,    │
                                                       │ Dfns, …         │
                                                       └─────────────────┘
```

**What automation adds**

- On `prepareExecute`, the Gateway immediately runs **prepare → sign → execute** when the request is recognized as a service account flow.
- For external custody signers that approve asynchronously, a background **Signing worker** polls pending transactions and completes them when the provider approves.
- The `userUrl` in the `prepareExecute` response is still returned for API compatibility; automations should rely on **`txChanged`** events (or polling transaction status) instead of the approval UI.

**What automation does not replace**

- Ledger **users**, **parties**, and **rights** still come from your Canton / IDP setup.
- The Gateway still needs a **stored wallet** (party) and **session** for the acting user before `prepareExecute` can succeed.

## Prerequisites

Complete every item below before calling `prepareExecute` from automation.

### 1. Ledger user must exist in the Wallet Gateway

The Gateway identifies the acting user from the JWT **`sub`** claim. That value must be the **ledger user ID** you intend to automate — not the OAuth client ID, unless your IDP deliberately maps them to the same value.

If `server.serviceAccount.allowedUsers` is configured, the user's `sub` must appear in that list.

### 2. Wallet (party) must exist with ledger rights

`prepareExecute` uses the user's **primary wallet** in the Gateway store. That wallet represents a **party** the user may act as on the ledger.

The party must:

- Exist on the Canton participant (allocated and onboarded as required by your network).
- Grant the ledger user sufficient rights to **prepare and submit** the commands you automate (typically `actAs` / `readAs` for that party).

Create or sync wallets through the [User API](../apis/index.md) (`createWallet`, `syncWallets`) or the User UI **before** automation runs. If no primary wallet is stored, `prepareExecute` fails with **"No primary wallet found"**.

### 3. Signing provider must be configured

Each wallet records a **`signingProviderId`**. That field selects which driver signs the transaction:

| Provider        | Typical use                         |
| --------------- | ----------------------------------- |
| `participant`   | Keys on the Canton participant node |
| `fireblocks`    | Fireblocks custody                  |
| `blockdaemon`   | Blockdaemon signing                 |
| `dfns`          | Dfns custody                        |
| `wallet-kernel` | Internal Gateway signing (dev only) |

The provider must be **installed and configured** on the Gateway host (API keys, credential files, Helm `signing` values, and so on). See [Signing providers](../signing-providers/index.md) for setup per provider.

> [!IMPORTANT]
> Choosing the signing provider happens at **wallet creation** time. Automation cannot switch providers per request; it always uses the primary wallet's configured provider.

### 4. Network session must exist

`prepareExecute` needs a Gateway session to resolve the current network and persist transactions.

| Deployment                              | Session setup                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Single `client_credentials` network** | The Gateway can **bootstrap the session automatically** from your M2M JWT on the first `prepareExecute` call. |
| **Multiple M2M networks**               | Call User API **`addSession`** with `networkId` before `prepareExecute`.                                      |
| **Expired token**                       | The Gateway refreshes the session token from the network's `client_credentials` configuration.                |

For production systems, we still recommend an explicit `addSession` during automation startup so network selection is deterministic and failures surface before command submission.

### 5. Gateway network auth must be machine-to-machine

Service account straight-through execution is enabled when the network's `auth.method` is **`client_credentials`**, or when the access token carries the `gty: client_credentials` claim.

See [Configuration — Service account automation](../configuration/index.md#service-account-automation) for server-level options.

## Gateway configuration

### Network: client credentials

Configure the target network with M2M OAuth for normal ledger access:

```json
{
    "id": "canton:mainnet",
    "name": "Mainnet",
    "identityProviderId": "idp-oauth",
    "ledgerApi": {
        "baseUrl": "https://ledger.example.com"
    },
    "auth": {
        "method": "client_credentials",
        "clientId": "wallet-gateway-m2m",
        "clientSecretEnv": "WG_M2M_CLIENT_SECRET",
        "audience": "https://canton.network.global",
        "scope": "openid daml_ledger_api offline_access"
    },
    "adminAuth": {
        "method": "client_credentials",
        "clientId": "wallet-gateway-admin",
        "clientSecretEnv": "WG_ADMIN_CLIENT_SECRET",
        "audience": "https://canton.network.global",
        "scope": "openid daml_ledger_api offline_access"
    }
}
```

| Field       | Purpose                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `auth`      | Token the automation uses for ledger operations via the Gateway         |
| `adminAuth` | Machine credentials for wallet sync and party allocation on first setup |

`adminAuth` is required when the user has **no wallets yet** and the Gateway should discover parties from the ledger on `addSession`. See [Authentication: `auth` and `adminAuth`](../configuration/index.md#authentication-auth-and-adminauth).

### Server: service account settings

```json
{
    "server": {
        "serviceAccount": {
            "allowedUsers": ["automation-ledger-user-id"],
            "pendingSigningPollIntervalMs": 5000
        }
    }
}
```

| Field                          | Description                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `allowedUsers`                 | Optional allow-list of JWT `sub` values permitted to use automation. Omit to allow any authenticated user on an M2M network. |
| `pendingSigningPollIntervalMs` | How often the Signing worker polls external signers when a transaction stays `pending` after submit. Default: `5000` ms.     |

### Signing provider configuration

Follow the provider-specific guide under [Signing providers](../signing-providers/index.md). For Helm deployments, set the chart `signing` block and mount secrets as documented in [Deployment](../deployment/index.md).

Participant-only signing does not require external custody configuration.

## One-time setup workflow

Perform these steps once per **ledger user** and **network** you automate (or repeat when wallets change).

### Step 1 — Obtain an access token

Request a token from your IDP using the network's `client_credentials` configuration. The token must:

- Be accepted by the Canton participant (`audience`, scopes).
- Contain `sub` equal to the **ledger user ID** the automation acts as.

### Step 2 — Create a Gateway session

Call the User API `addSession` with the token in the `Authorization` header:

```bash
curl -s -X POST "https://gateway.example.com/api/v0/user" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "addSession",
    "params": { "networkId": "canton:mainnet" }
  }'
```

On first login with no wallets, the Gateway may run an automatic wallet sync using `adminAuth`. Ensure `adminAuth` is valid or create wallets manually in the next step.

### Step 3 — Ensure a wallet exists and is primary

List wallets:

```bash
curl -s -X POST "https://gateway.example.com/api/v0/user" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"listWallets","params":[]}'
```

If empty, create a wallet (allocates a new party) or sync existing ledger parties:

```bash
# New party via Gateway allocation
curl -s -X POST "https://gateway.example.com/api/v0/user" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "createWallet",
    "params": {
      "partyHint": "automation-party",
      "signingProviderId": "fireblocks",
      "primary": true
    }
  }'
```

If the party already exists on the ledger but not in the Gateway store, call `syncWallets()` instead, then `setPrimaryWallet({ "partyId": "my-party::fingerprint" })` if needed.

Verify the primary wallet via the DApp API:

```bash
curl -s -X POST "https://gateway.example.com/api/v0/dapp" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"listAccounts","params":[]}'
```

## Submitting transactions from automation

### `prepareExecute` (straight-through)

Use the DApp API with the same access token. Example:

```bash
curl -s -X POST "https://gateway.example.com/api/v0/dapp" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "prepareExecute",
    "params": {
      "commands": [{
        "CreateCommand": {
          "templateId": "#AdminWorkflows:Canton.Internal.Ping:Ping",
          "createArguments": {
            "id": "automation-ping-1",
            "initiator": "my-party::fingerprint",
            "responder": "my-party::fingerprint"
          }
        }
      }]
    }
  }'
```

For service accounts the Gateway:

1. Prepares the transaction on the ledger.
2. Signs with the primary wallet's signing provider.
3. Executes immediately when signing returns `signed`.
4. Returns `{ "userUrl": "…" }` (ignore for automation; monitor events instead).

Ensure `actAs` / `readAs` in the command match parties the ledger user may use. When omitted, the Gateway uses the primary wallet's `partyId`.

### Participant signing (synchronous)

When the primary wallet uses **`participant`** signing, the full flow usually completes inside the `prepareExecute` call.

### External signing (asynchronous)

When the primary wallet uses **Fireblocks**, **Blockdaemon**, or **Dfns**:

1. `prepareExecute` prepares the transaction and submits it to the custody provider.
2. Signing may return **`pending`** until the provider approves the request.
3. The **Signing worker** background process polls pending external transactions and calls sign → execute when approval completes.
4. Tune `pendingSigningPollIntervalMs` if you need faster completion.

Your automation should wait for a `txChanged` event with status **`executed`** (or handle `failed` / prolonged `pending`).

### Monitor with Server-Sent Events

Subscribe to DApp API events for transaction lifecycle updates:

```javascript
const eventsUrl = new URL('/api/v0/dapp/events', 'https://gateway.example.com')
eventsUrl.searchParams.set('token', accessToken)
const es = new EventSource(eventsUrl.toString())

es.addEventListener('txChanged', (e) => {
    const tx = JSON.parse(e.data)
    console.log('Transaction update:', tx.status, tx.commandId)
})
```

See [APIs — Server-Sent Events](../apis/index.md#server-sent-events-sse-support).

## End-to-end checklist

| Step | Action                                                                                   | API            |
| ---- | ---------------------------------------------------------------------------------------- | -------------- |
| 1    | Configure M2M network + signing provider + `serviceAccount`                              | Gateway config |
| 2    | Obtain JWT with correct `sub` (ledger user)                                              | Your IDP       |
| 3    | `addSession` for target network (recommended; required when multiple M2M networks exist) | User API       |
| 4    | Create / sync wallet; set primary; confirm signing provider                              | User API / UI  |
| 5    | `prepareExecute` with Daml commands                                                      | DApp API       |
| 6    | Listen for `txChanged` until `executed`                                                  | DApp SSE       |

## Production operations

Treat service account automation as a **critical dependency** in production. The following practices apply to high-traffic or business-critical integrations.

### Configuration hardening

- Set **`server.serviceAccount.allowedUsers`** to an explicit allow-list of ledger user IDs your automations may act as.
- Configure **`adminAuth`** even when wallets are pre-provisioned — recovery flows and manual sync still depend on it.
- Verify every automated wallet uses a [signing provider](../signing-providers/index.md) that is configured and monitored in the target environment.
- Use separate OAuth clients for automation (`auth`) and administration (`adminAuth`) where your IDP supports it.

### Observability

Monitor Gateway logs for these structured messages:

| Log message                                                           | Meaning                                                                |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `Service account straight-through prepare/sign/execute`               | `prepareExecute` entered automation path                               |
| `Service account sign/execute failed after prepare`                   | Prepare succeeded but sign or execute failed — investigate immediately |
| `Signing worker completed service account transaction`                | Background completion of an external signing request                   |
| `Signing worker: transaction still awaiting external signing`         | Custody approval still pending                                         |
| `Skipping signing worker tick: no primary wallet configured for user` | Wallet setup missing for a pending external transaction                |

Subscribe to **`txChanged`** SSE events in your automation and alert when:

- Status stays `pending` longer than your custody SLA
- Status becomes `failed`
- `prepareExecute` returns an HTTP / JSON-RPC error

### Availability

- The **Signing worker** runs inside the Gateway process and polls pending external transactions at `pendingSigningPollIntervalMs` (default 5 s). Run at least one Gateway replica with this process active (default: enabled on startup).
- Persist the Gateway **store** (PostgreSQL recommended) so wallets, sessions, and pending transactions survive restarts.
- Rotate M2M secrets via `clientSecretEnv` without embedding credentials in config files.

### Pre-flight validation

Before promoting an automation to production, verify in a staging environment:

1. JWT `sub` matches the intended ledger user.
2. `listAccounts` (DApp API) returns the expected primary party.
3. A test `prepareExecute` reaches `executed` (or `pending` → `executed` for external signers).
4. `allowedUsers` rejects tokens for non-approved users when configured.

## Security recommendations

- Set **`allowedUsers`** in production to restrict which ledger users automation may impersonate.
- Store `clientSecret` values in environment variables or Kubernetes secrets (`clientSecretEnv`), not in plain config files.
- Use a dedicated OAuth client for `auth` (automation) separate from `adminAuth` when your IDP supports least-privilege clients.
- Prefer external custody signers ([Signing providers](../signing-providers/index.md)) over `wallet-kernel` internal signing in production.

## Troubleshooting

| Symptom                                                  | Likely cause                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `No primary wallet found`                                | No wallet in store, or none marked primary — run setup step 3                                       |
| `No session found`                                       | Missing session and automatic bootstrap could not resolve network — call `addSession`               |
| `Multiple client_credentials networks configured`        | Call `addSession` with explicit `networkId`                                                         |
| `No primary wallet found. Create or sync a wallet…`      | Wallet setup incomplete — see prerequisite 2                                                        |
| `User "…" is not allowed for service account automation` | `sub` not in `allowedUsers`                                                                         |
| `No driver found for …`                                  | Signing provider not configured on Gateway — see [Signing providers](../signing-providers/index.md) |
| Transaction stays `pending`                              | External signer awaiting approval; check custody dashboard and Signing worker logs                  |
| HTTP 401 on User API                                     | Expired token or missing session for protected methods                                              |

See also [Troubleshooting](../troubleshooting/index.md) for ledger connectivity, `addSession` HTTP 500, and auth debugging.

## Related documentation

- [Configuration](../configuration/index.md) — networks, `auth`, `adminAuth`, `serviceAccount`
- [Signing providers](../signing-providers/index.md) — Fireblocks, Blockdaemon, Dfns, participant
- [APIs](../apis/index.md) — DApp and User API reference
- [Usage](../usage/index.md) — interactive flows and User UI
