# Token Standard

Canton Network Token Standard clients and types for **CIP-0056 (V1)** and **CIP-0112 (V2)**.

## Codegen

- OpenAPI (registry OffLedger APIs): `yarn script:generate:openapi` — includes `*-v1.yaml` and `*-v2.yaml` under splice `0.6.12+`.
- Daml JS interfaces: `yarn generate:tokenstandard` — stubs in [`damljs/token-standard-models`](../../damljs/token-standard-models).

## API version routing

Use `resolveTokenApiVersion(preference, supportedApis)` with preference `'auto' | 'v1' | 'v2'`:

- **auto** (default): prefer V2 when the instrument advertises V2 packages in metadata `supportedApis`.
- **v1** / **v2**: force that major version (forced V2 errors if not advertised).

Helpers: `assertInstrumentNotPaused`, `basicAccount(party)`, V2 interface ID constants (`*_V2`, `SETTLEMENT_FACTORY_INTERFACE_ID`, `EVENT_LOG_INTERFACE_ID`).
