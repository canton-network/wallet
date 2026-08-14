# @canton-network/core-signing-taurus-protect

This package provides a signing driver for integrating the Wallet Gateway with [Taurus-PROTECT](https://www.taurushq.com/). It implements the `SigningDriverInterface` defined in `@canton-network/core-signing-lib`, allowing the Wallet Gateway to submit Canton commands through a Taurus-PROTECT Canton gateway.

## Tenancy model

This driver is **single-tenant by design**. One machine bearer token serves every
Wallet Gateway user — `controller(userId)` ignores its `userId`, and the gateway's
account list is tenant-global. Consequences to be aware of before deploying:

- Any authenticated Wallet Gateway user can list every party in the Taurus-PROTECT
  tenant and import any of them as their own wallet.
- Signing requests carry no per-user identity, so the gateway cannot attribute a
  submission to the Wallet Gateway user who triggered it.

Deploy this driver only where all Wallet Gateway users are equally trusted with
every party in the tenant. Per-user scoping would require per-user credentials at
the gateway, which the current API does not offer.

## Installation

This package is part of the Wallet Gateway monorepo and is typically installed as a workspace dependency.

```bash
pnpm add @canton-network/core-signing-taurus-protect
```

## Usage

The `TaurusProtectSigningDriver` requires the gateway's JSON-RPC base URL and a bearer api-key.

### Initialization

```typescript
import TaurusProtectSigningDriver, {
    TaurusProtectConfig,
} from '@canton-network/core-signing-taurus-protect'

const config: TaurusProtectConfig = {
    baseUrl: '<taurus-canton-gateway-url>',
    token: '<gateway-api-key>',
}

const driver = new TaurusProtectSigningDriver(config)
```

### Features

Unlike the sign-only providers, Taurus-PROTECT is a **submit** provider: the gateway prepares, signs (ECDSA P-256) and submits each CIP-103 command against its own validator under Taurus governance. This driver never signs a hash itself — it forwards commands and tracks status.

- **Key Management**:
    - `getKeys`: Lists Canton parties already provisioned in Taurus-PROTECT, filtered to `allocated` parties that carry a `publicKey`. Parties are named by their prefix (falling back to the partyId).
    - `createKey`: Not supported — parties are provisioned in Taurus-PROTECT, and this driver only imports existing ones.
- **Signing**:
    - `signTransaction`: Expects `tx` to be a JSON-encoded CIP-103 command (`{ commands, actAs?, commandId?, preparedTransaction? }`) and forwards it to the gateway. Always returns `pending` — signing and execution happen asynchronously under governance. Only those four fields reach the gateway; see [Known gateway limitations](#known-gateway-limitations) for `disclosedContracts` / `readAs` / `packageIdSelectionPreference`.
    - `signMessage`: Not supported yet.
- **Status**:
    - `getTransaction`: Polls the gateway for command status. An optional `requestId` re-seeds the RPC fallback after a restart, when the client-side cache is cold.
    - `getTransactions`: Batch variant keyed by `txIds` (required — Taurus-PROTECT does not enumerate by public key). It takes no `requestId`, so commands whose cached mapping is gone are omitted from the result.
- **Configuration**:
    - `getConfiguration` / `setConfiguration`. `getConfiguration` masks the token.

### Status mapping

`core-signing-lib` has no `executed` state, so the real gateway state is carried in `metadata.gatewayStatus` alongside the mapped `SigningStatus`:

| Gateway status | `SigningStatus` | `metadata.gatewayStatus` |
| :------------- | :-------------- | :----------------------- |
| `pending`      | `pending`       | `pending`                |
| `signed`       | `signed`        | `signed`                 |
| `executed`     | `signed`        | `executed`               |
| `failed`       | `failed`        | `failed`                 |
| anything else  | `failed`        | the raw value            |

`metadata` also carries `requestId` and `commandId` on submission, and `updateId` / `contractId` once the gateway reports the ledger result. `TransactionService` never posts to the ledger for this provider, and treats the command as complete only on `failed`, or on `gatewayStatus === 'executed'` once the `updateId` is present — the ledger `updateId` then stands in for the signature.

## Configuration

The driver accepts a `TaurusProtectConfig` object:

| Property  | Type     | Required | Description                                                                    |
| :-------- | :------- | :------- | :----------------------------------------------------------------------------- |
| `baseUrl` | `string` | Yes      | Base URL of the Taurus-PROTECT Canton gateway JSON-RPC endpoint.               |
| `token`   | `string` | Yes      | Bearer api-key (HMAC-JWT); mint one via the gateway's `api-key issue` command. |

### Wallet Gateway Configuration

When running the Wallet Gateway (Remote), the driver is registered only when both variables are set; otherwise it logs a warning and stays unavailable.

- `TAURUS_PROTECT_GATEWAY_URL`: Base URL of the Taurus-PROTECT Canton gateway.
- `TAURUS_PROTECT_GATEWAY_TOKEN`: Bearer api-key for that gateway.

Example usage:

```bash
TAURUS_PROTECT_GATEWAY_URL="<taurus-canton-gateway-url>" \
TAURUS_PROTECT_GATEWAY_TOKEN="<gateway-api-key>" \
pnpm start
```

## Known gateway limitations

Behaviours of the Taurus-PROTECT Canton gateway that this driver works around or cannot work
around. Each is a gateway-side issue; none is a wallet bug.

### The command's arguments are validated and then discarded (worked around)

On the encoded path — which is the only path this driver uses, because the Wallet Gateway prepares
every transaction itself — the gateway converts the command's entire argument tree, and _then_
replaces it with the `preparedTransaction` and forwards only that. Nothing it validated is ever
used, but the validation still rejects:

| Gateway rule                     | What a real Splice command carries                                     |
| :------------------------------- | :--------------------------------------------------------------------- |
| `templateId` must begin with `#` | a registry package-id, e.g. `6c5802f8…:Splice.AmuletRules:AmuletRules` |
| bare JSON arrays unsupported     | `inputs: […]`, `issuingMiningRounds: []`                               |
| bare `null` ambiguous            | `featuredAppRight: null`                                               |

So `GatewayClient.prepareExecute` normalises the command down to the routing fields the gateway
actually reads: it prefixes `#` on a templateId that lacks one, blanks `createArguments` /
`choiceArgument`, and drops everything else. This applies **only** when a non-empty
`preparedTransaction` is present — with an empty one the gateway takes the structured path, where
those arguments _are_ the submission, and blanking them would put an argument-less contract in
front of an approver.

**Delete `routingOnlyCommands` once the gateway stops converting a tree it discards** (taking the
create-vs-exercise discriminator straight off the wire when a `preparedTransaction` is set).

### `disclosedContracts`, `readAs` and `packageIdSelectionPreference` are inert

The gateway has no `prepareExecute` field for `disclosedContracts` or
`packageIdSelectionPreference`, and does not reject unknown JSON — they are silently dropped. It
parses `readAs` and never reads it, deliberately: validatord's governance rules are the sole
authority on read access. All three were already baked into the `preparedTransaction` at prepare
time, so nothing is lost, and this driver does not send them.

### Cannot be worked around from here

| Limitation                                                                                                           | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The gateway reads the request body through a 1 MiB `io.LimitReader`, which truncates _silently_                      | An oversized request comes back as a bare `-32700` parse error. `GatewayClient` pre-checks the body size so the real reason is reported, but the ceiling itself (~750 KB of prepared transaction after base64) stands, and the gateway's own advertised 10 MiB limit is unreachable.                                                                                                                                                                                           |
| A validatord 404 maps to `-32603` Internal error                                                                     | An unknown `requestId` is indistinguishable from a gateway fault.                                                                                                                                                                                                                                                                                                                                                                                                              |
| CIP-103's lifecycle has no `rejected` state                                                                          | A governance decline and an HSM fault both arrive as `failed`, even though `core-signing-lib`'s `SigningStatus` can express `rejected`.                                                                                                                                                                                                                                                                                                                                        |
| `prepareExecute` submits to validatord _before_ registering its status poller, and reports only the poller's failure | A poller-capacity rejection can arrive with the request already live and its `requestId` discarded. This driver always sends a `commandId`, which the gateway passes to validatord as an idempotency key, so re-submitting the same `commandId` returns the original request instead of a duplicate — that is the recovery path, and the error message says so. Note the per-user poller cap (10) applies to the whole driver, since one machine token means one gateway user. |

## Canton Network Support

Parties are provisioned and hosted in Taurus-PROTECT, so the Wallet Gateway imports them rather than allocating them: `TaurusProtectWalletAllocator` records the party with no topology transaction and no hash signing. A single machine token serves all users, so `controller(userId)` ignores its argument.

## License

Apache-2.0
