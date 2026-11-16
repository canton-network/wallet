# @canton-network/core-wallet-services

Services needed to implement a wallet. Both wallet gateways use this package: the server-side gateway (`wallet-gateway/remote`) and the browser extension (`wallet-gateway/extension`).

## Clear signing

`@canton-network/core-wallet-services/clear-signing` is the browser-safe entry for reading a descriptor's template. It does not load the ledger client or the logger.

- `templateIdOf` and `templateKeyOf` read `context.template` (`packageId`, `moduleName`, `entityName`) so an upload can be stored and can replace another descriptor for that template. They do not validate the rest.

`clearSign` in `@canton-network/core-tx-clear-signing` takes the descriptors stored for the user. It checks the hash, binds each root to the descriptor for its template, ignores the rest, and describes each root.
