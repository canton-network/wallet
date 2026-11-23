# @canton-network/core-wallet-services

Services needed to implement a wallet. Both wallet gateways use this package: the server-side gateway (`wallet-gateway/remote`) and the browser extension (`wallet-gateway/extension`).

## Clear signing

The descriptor schema, `clearSign`, and the path from the approval screen to the signature are documented in [@canton-network/core-tx-clear-signing](../tx-clear-signing/README.md).

`TransactionService.sign` recomputes the hash of the stored prepared transaction under the gateway's configured hashing scheme. It refuses to sign unless that hash equals the stored hash and, when the client sends one, the hash the approval screen submitted. `preparedTransactionHash` is optional in the `sign` request, so clients that predate it still sign after the stored-hash check. It logs who approved that hash, and only then asks the signing provider to sign. An API-key session has no approval screen: `signAndExecute` performs the same hash check, logs the approval as a service account, and signs.
