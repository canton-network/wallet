# @canton-network/core-signing-dsrv

This package provides a signing driver for integrating the Wallet Gateway with the
[DSRV](https://www.dsrv.com/en) signing API. It implements the `SigningDriverInterface`
defined in `@canton-network/core-signing-lib`. Keys are created and held by the signing API.
The Wallet Gateway only sees public keys and signatures.

The driver is a thin HTTP client for the signing API described below.

## Installation

This package is part of the Wallet Gateway monorepo and is typically installed as a workspace dependency.

```bash
pnpm add @canton-network/core-signing-dsrv
```

## Usage

```typescript
import DsrvSigningDriver, {
    type DsrvConfig,
} from '@canton-network/core-signing-dsrv'

const config: DsrvConfig = {
    baseUrl: 'https://signing.example.com',
    bearerToken: '<bearer token>',
}

const driver = new DsrvSigningDriver(config)
```

The driver uses external parties (`PartyMode.EXTERNAL`): the Wallet Gateway takes the public key
from `createKey`, builds the party's topology transactions, has the driver sign their hash, and
allocates the party.

### Features

- **Key Management**:
    - `createKey`: Creates a new Ed25519 key at the signing API.
    - `getKeys`: Retrieves the keys available at the signing API.
- **Signing**:
    - `signTransaction`: Asks the signing API to sign a transaction hash. Signing is asynchronous:
      the signing API may answer `pending` and the Wallet Gateway polls `getTransaction`.
- **Transaction Monitoring**:
    - `getTransaction`: Retrieves the status and, once signed, the signature of a signing request.
    - `getTransactions`: Retrieves signing requests by ID or by public key.
- **Configuration**:
    - `getConfiguration`: Returns the base URL, and `***HIDDEN***` in place of the bearer token.
    - `setConfiguration`: Updates the base URL or the bearer token at runtime.

`signMessage` is not supported and returns a `not_allowed` error.

## Configuration

The driver accepts a `DsrvConfig` object:

| Property      | Type     | Description                                                            |
| :------------ | :------- | :--------------------------------------------------------------------- |
| `baseUrl`     | `string` | Base URL of the signing API. Requests go to `{baseUrl}/api/signing/*`. |
| `bearerToken` | `string` | Sent as `Authorization: Bearer <token>` on every request.              |

### Wallet Gateway Configuration

When running the Wallet Gateway (Remote), listing `dsrv` under `signingProviders` opts the
provider in:

- `signingProviders.dsrv.baseUrl`: Base URL of the signing API. Required.
- `signingProviders.dsrv.bearerTokenEnv`: Name of the environment variable that holds the bearer
  token. Defaults to `DSRV_SIGNING_API_TOKEN`.

The token value stays in that environment variable and is never stored in the config file. If the
variable is not set, the Wallet Gateway does not register the provider and reports a warning at
startup.

```json
{
    "signingProviders": {
        "dsrv": {
            "baseUrl": "https://signing.example.com",
            "bearerTokenEnv": "DSRV_SIGNING_API_TOKEN"
        }
    }
}
```

## Signing API

Every operation is a `POST` to `{baseUrl}/api/signing/{operation}` with a JSON body
(`Content-Type: application/json`) and a JSON response.

| Operation         | Path                           | Purpose                                      |
| :---------------- | :----------------------------- | :------------------------------------------- |
| `createKey`       | `/api/signing/createKey`       | Create an Ed25519 key, return its public key |
| `getKeys`         | `/api/signing/getKeys`         | List the keys                                |
| `signTransaction` | `/api/signing/signTransaction` | Start signing a hash                         |
| `getTransaction`  | `/api/signing/getTransaction`  | Read one signing request                     |
| `getTransactions` | `/api/signing/getTransactions` | Read signing requests by ID or public key    |

The driver sends the `params` object of the method with the same name in the Wallet Gateway
[Signing API](https://github.com/canton-network/wallet/blob/main/api-specs/openrpc-signing-api.json)
as the request body, and reads that method's result from the response body. `createKey` and
`signTransaction` also carry `requestedBy`, described below.

### Authentication

Every request carries:

```
Authorization: Bearer <token>
```

The token identifies the calling Wallet Gateway. It does not authenticate the user or the
individual request. The signing API answers a missing or wrong token with HTTP 401, which the
driver treats like any other failed call (see below): the Wallet Gateway reports, for example,
`DSRV signing API signTransaction failed (401): ...`.

### Results and errors

- A successful call answers HTTP 200 with the result.
- A refused call (unknown key, invalid parameters, refused by the server's policy, ...) answers
  HTTP 200 with an error body. The driver hands it to the Wallet Gateway unchanged:

    ```json
    { "error": "key_not_found", "error_description": "no such key" }
    ```

    The error codes are chosen by the server. If `error_description` is missing, the driver uses
    the error code as description.

- Any other HTTP status fails the call. The driver then returns its own error
  (`create_key_error`, `fetch_error`, `signing_error` or `transaction_not_found`, depending on
  the operation) with the status and up to 300 characters of the response body.
- If the signing API cannot be reached, the driver returns the same error with the connection
  error as description.
- A `signed` transaction without a `signature` is passed to the Wallet Gateway as `pending`.

### `requestedBy`

`createKey` and `signTransaction` carry `requestedBy`, the ID of the Wallet Gateway user the call
is made for, when the Wallet Gateway knows it. It is meant for the signing API's audit trail and
is not authenticated.

## License

Apache-2.0
