# Hash vectors

Prepared transactions with the hash an implementation must compute for each, or the code this package refuses it with. [`vectors.test.ts`](../src/__tests__/vectors.test.ts) runs them all. They are not published to npm.

| Folder      | Files | Content                                                                                                                                        |
| ----------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `v2/`       | 24    | prepare responses of a Canton 3.5.10 participant on protocol version 35 under V2, with the hash it returned                                    |
| `v3/`       | 31    | the same under V3                                                                                                                              |
| `held-out/` | 12    | V3 prepare responses captured after the package was written                                                                                    |
| `mutation/` | 16    | a vector of `v2/` or `v3/` with one byte of a hashed field changed, with this package's hash, which Canton's Python hashing example also gives |
| `reject/`   | 45    | input that must be refused, with the error code                                                                                                |

One file holds one vector, here with `preparedTransaction` cut short:

```json
{
    "id": "v3-create-with-key",
    "kind": "accepted",
    "scheme": "HASHING_SCHEME_VERSION_V3",
    "preparedTransaction": "CrYICgEyEgEwGokICgEwwj6CCAr/BwoBMhJCMDBmNDBkMTUwYWFj...",
    "expected": {
        "hash": "3cce7f73f948ba147c6a7e7d2a9098900313f48063545b1cb57cb24a3ec68e4a"
    },
    "source": {
        "canton": "3.5.10",
        "protocolVersion": 35,
        "scenario": "create-with-key"
    }
}
```

- `preparedTransaction`: the protobuf bytes in canonical standard base64, padded and without whitespace.
- `expected`: `{ "hash": "<64 lowercase hex digits>" }`, or `{ "error": "<code>" }` with one of the [error codes](../README.md#errors).
- `limits`: in some reject vectors, the limits to run with.
- `source`: `{ canton, protocolVersion, scenario }` for a capture, `{ from, mutation }` for a vector made by changing another.

[canton-tx-hashing-conformance](https://github.com/FTP-Tech-LLC/canton-tx-hashing-conformance) holds the generator of these vectors. It checks all but `reject/` against the Python hashing examples of Canton v3.5.1 and, for V2, `@canton-network/core-tx-visualizer` 1.9.1.

Its [VECTORS.md](https://github.com/FTP-Tech-LLC/canton-tx-hashing-conformance/blob/main/VECTORS.md) says what each vector covers.
