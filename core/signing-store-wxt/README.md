# @canton-network/core-signing-store-wxt

A WxtStore is a browser-extension implementation of the `SigningDriverStore` interface from `@canton-network/core-signing-lib` backed by `@wxt-dev/storage`.

This store persists signing keys, signing transactions, and per driver configuration in the extension's local storage area.

The extension is single-user, so all data for a given record type is kept in a single flat array under one storage key rather than one storage imem per record plus separate lookup indexes.

| Data                 | Storage key                    | Shape                      |
| :------------------- | :----------------------------- | :------------------------- |
| Signing Keys         | local:signingKeys              | SigningKeyRecord[]         |
| Signing Transactions | local:signingTransactions      | SigningTransactionRecord[] |
| Driver config        | local: signingDriverConfigItem | SigningDriverConfigRecord  |

# Usage

```ts
import { WxtStore } from '@canton-network/core-signing-store-wxt'

const userId = 'myUser'
const store = new WxtStore(userId)
await store.setSigningKey(userId, {
    id: 'key1',
    name: 'pkey1',
    publicKey: '...',
    privateKey: '...',
    createdAt: new Date(),
    updatedAt: new Date(),
})

const key = await store.getSigningKeyByName(userId, 'primary')
const allKeys = await store.listSigningKeys(userId)
```
