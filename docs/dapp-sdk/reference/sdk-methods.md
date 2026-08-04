---
title: 'SDK Methods'
description: 'Reference for the high-level dApp SDK methods.'
---

# SDK Methods

High-level dApp SDK methods for discovering wallets, connecting users,
reading parties, requesting signatures, and submitting transactions.

Import from `@canton-network/dapp-sdk`:

```ts
import { init, connect, listAccounts } from '@canton-network/dapp-sdk'
```

## Accounts

### listAccounts()

```ts
function listAccounts(): Promise<ListAccountsResult>
```

Returns all parties the user has access to. Delegates to `DappSDK.listAccounts`.

#### Returns

`Promise`\<`ListAccountsResult`\>

## Configuration

### DappSDKConnectOptions

Options for `DappSDK.init` / the module-level [init](#init).

#### Type Parameters

| Type Parameter                                | Default type      |
| --------------------------------------------- | ----------------- |
| `TDefaultAdapter` _extends_ `ProviderAdapter` | `ProviderAdapter` |

#### Properties

##### additionalAdapters?

```ts
optional additionalAdapters?: ProviderAdapter[];
```

Extra adapters to register alongside the defaults
(or alongside `defaultAdapters` when that is set).

##### defaultAdapters?

```ts
optional defaultAdapters?: TDefaultAdapter[];
```

Replaces the default list of remote wallets.
Pass `[]` to register none.

##### enableSuggestedWallets?

```ts
optional enableSuggestedWallets?: boolean;
```

When `true` (default), suggested browser-extension wallets are shown
in the wallet picker.

## Events

### onAccountsChanged()

```ts
function onAccountsChanged(listener): Promise<void>
```

Subscribes to account list changes.
Delegates to `DappSDK.onAccountsChanged`.

#### Parameters

| Parameter  | Type                                      |
| ---------- | ----------------------------------------- |
| `listener` | `EventListener`\<`AccountsChangedEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### onConnected()

```ts
function onConnected(listener): Promise<void>
```

Subscribes to successful connection events.
Delegates to `DappSDK.onConnected`.

#### Parameters

| Parameter  | Type                             |
| ---------- | -------------------------------- |
| `listener` | `EventListener`\<`StatusEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### onStatusChanged()

```ts
function onStatusChanged(listener): Promise<void>
```

Subscribes to connection status / session changes.
Delegates to `DappSDK.onStatusChanged`.

#### Parameters

| Parameter  | Type                             |
| ---------- | -------------------------------- |
| `listener` | `EventListener`\<`StatusEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### onTxChanged()

```ts
function onTxChanged(listener): Promise<void>
```

Subscribes to transaction lifecycle updates.
Delegates to `DappSDK.onTxChanged`.

#### Parameters

| Parameter  | Type                                |
| ---------- | ----------------------------------- |
| `listener` | `EventListener`\<`TxChangedEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### removeOnAccountsChanged()

```ts
function removeOnAccountsChanged(listener): Promise<void>
```

Removes a listener registered with [onAccountsChanged](#onaccountschanged).

#### Parameters

| Parameter  | Type                                      |
| ---------- | ----------------------------------------- |
| `listener` | `EventListener`\<`AccountsChangedEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### removeOnConnected()

```ts
function removeOnConnected(listener): Promise<void>
```

Removes a listener registered with [onConnected](#onconnected).

#### Parameters

| Parameter  | Type                             |
| ---------- | -------------------------------- |
| `listener` | `EventListener`\<`StatusEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### removeOnStatusChanged()

```ts
function removeOnStatusChanged(listener): Promise<void>
```

Removes a listener registered with [onStatusChanged](#onstatuschanged).

#### Parameters

| Parameter  | Type                             |
| ---------- | -------------------------------- |
| `listener` | `EventListener`\<`StatusEvent`\> |

#### Returns

`Promise`\<`void`\>

---

### removeOnTxChanged()

```ts
function removeOnTxChanged(listener): Promise<void>
```

Removes a listener registered with [onTxChanged](#ontxchanged).

#### Parameters

| Parameter  | Type                                |
| ---------- | ----------------------------------- |
| `listener` | `EventListener`\<`TxChangedEvent`\> |

#### Returns

`Promise`\<`void`\>

## Lifecycle

### connect()

#### Call Signature

```ts
function connect(): Promise<ConnectResult>
```

Opens the wallet picker and connects.

Prefer [init](#init) with adapters at startup; `options` here is a legacy
convenience that forwards to `DappSDK.init`.

##### Returns

`Promise`\<`ConnectResult`\>

#### Call Signature

```ts
function connect(options): Promise<ConnectResult>
```

##### Parameters

| Parameter | Type                                              |
| --------- | ------------------------------------------------- |
| `options` | [`DappSDKConnectOptions`](#dappsdkconnectoptions) |

##### Returns

`Promise`\<`ConnectResult`\>

##### Deprecated

Pass options to [init](#init) instead.

---

### disconnect()

```ts
function disconnect(): Promise<null>
```

Ends the session between the dApp and the wallet. Delegates to `DappSDK.disconnect`.

#### Returns

`Promise`\<`null`\>

---

### init()

```ts
function init(options?): Promise<void>
```

Registers wallet adapters and silently restores a previous session **without**
opening the wallet picker. Delegates to `DappSDK.init`.

#### Parameters

| Parameter  | Type                                                                   | Description                              |
| ---------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| `options?` | [`DappSDKConnectOptions`](#dappsdkconnectoptions)\<`ProviderAdapter`\> | Adapter and wallet-picker configuration. |

#### Returns

`Promise`\<`void`\>

---

### open()

```ts
function open(): Promise<void>
```

Opens the connected wallet's user UI. Delegates to `DappSDK.open`.

#### Returns

`Promise`\<`void`\>

## Provider access

### getConnectedProvider()

```ts
function getConnectedProvider(): Provider<RpcTypes> | null
```

Returns the raw CIP-103 provider for the active session, or `null`.
Delegates to `DappSDK.getConnectedProvider`.

#### Returns

`Provider`\<`RpcTypes`\> \| `null`

## Signing & transactions

### ledgerApi()

```ts
function ledgerApi(params): Promise<LedgerApiResult>
```

Proxies an authenticated request to the Canton JSON Ledger API.
Delegates to `DappSDK.ledgerApi`.

#### Parameters

| Parameter | Type              | Description                                            |
| --------- | ----------------- | ------------------------------------------------------ |
| `params`  | `LedgerApiParams` | HTTP method, Ledger API path, and optional body/query. |

#### Returns

`Promise`\<`LedgerApiResult`\>

---

### prepareExecute()

```ts
function prepareExecute(params): Promise<null>
```

Prepares, requests signature for, and executes a Daml transaction.
Delegates to `DappSDK.prepareExecute`.

#### Parameters

| Parameter | Type                   | Description                                           |
| --------- | ---------------------- | ----------------------------------------------------- |
| `params`  | `PrepareExecuteParams` | The Daml commands (and optional metadata) to execute. |

#### Returns

`Promise`\<`null`\>

---

### prepareExecuteAndWait()

```ts
function prepareExecuteAndWait(params): Promise<PrepareExecuteAndWaitResult>
```

Like [prepareExecute](#prepareexecute), but waits for execution and returns the result.
Delegates to `DappSDK.prepareExecuteAndWait`.

#### Parameters

| Parameter | Type                   | Description                                           |
| --------- | ---------------------- | ----------------------------------------------------- |
| `params`  | `PrepareExecuteParams` | The Daml commands (and optional metadata) to execute. |

#### Returns

`Promise`\<`PrepareExecuteAndWaitResult`\>

## Status

### isConnected()

```ts
function isConnected(): Promise<ConnectResult>
```

Returns whether the user is connected **without** triggering the login flow.
Delegates to `DappSDK.isConnected`.

#### Returns

`Promise`\<`ConnectResult`\>

---

### status()

```ts
function status(): Promise<StatusEvent>
```

Returns network- and session-related information for the current connection.
Delegates to `DappSDK.status`.

#### Returns

`Promise`\<`StatusEvent`\>
