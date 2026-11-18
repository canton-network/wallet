# @canton-network/core-wallet-services

Services needed to implement a wallet. Both wallet gateways use this package: the server-side gateway (`wallet-gateway/remote`) and the browser extension (`wallet-gateway/extension`).

## Clear signing

The descriptor schema, `clearSign`, and the path from the approval screen to the signature are documented in [@canton-network/core-tx-clear-signing](../tx-clear-signing/README.md).

`TransactionService.sign` recomputes the hash of the stored prepared transaction under the gateway's configured hashing scheme. It refuses to sign unless that hash equals the stored hash and the hash the approval screen submitted. It logs who approved that hash, and only then asks the signing provider to sign. An API-key session has no approval screen: `signAndExecute` performs the same hash check, logs the approval as a service account, and signs.

`@canton-network/core-wallet-services/clear-signing` exports `templateIdOf`. It reads `context.template` (`packageId`, `moduleName`, `entityName`) so an upload can be stored under that template. It does not validate the rest of the descriptor, and it does not load the ledger client.
