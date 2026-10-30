# @canton-network/core-tx-hashing

Computes the hash of a Canton prepared transaction under hashing schemes V2 and V3. The validator returns this hash with the prepared transaction only for convenience: a wallet that does not trust the validator computes it from the bytes, compares, and signs its own.

`@canton-network/wallet-sdk` (`sdk.utils.hash.preparedTransaction`) and `@canton-network/core-tx-visualizer` (`hashPreparedTransaction`) hash with this package.

## Installation

```sh
pnpm add @canton-network/core-tx-hashing
```

It hashes with WebCrypto, which Node has and a browser has only in a secure context (https or localhost).

## Usage

```typescript
import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'

// response: what /v2/interactive-submission/prepare returned for a request
// with hashingSchemeVersion HASHING_SCHEME_VERSION_V2
if (response.hashingSchemeVersion !== 'HASHING_SCHEME_VERSION_V2') {
    throw new Error('the validator used another scheme')
}
const hash = await computePreparedTransactionHash(
    response.preparedTransaction,
    'HASHING_SCHEME_VERSION_V2'
)
if (btoa(String.fromCharCode(...hash)) !== response.preparedTransactionHash) {
    throw new Error('the validator returned another hash')
}
// sign hash, not response.preparedTransactionHash
```

`computePreparedTransactionHash(input, scheme, options?)` resolves to the 32-byte SHA-256 hash as a `Uint8Array`.

- `input`: the protobuf bytes of the `PreparedTransaction`, the same bytes in base64 as the JSON API returns them, or a protobuf-ts message. Prefer the bytes: a message is hashed as `@canton-network/core-ledger-proto` encodes it, so a field that its version does not know is dropped, not refused.
- `scheme`: `HashingSchemeVersion.V2` or `.V3` of `@canton-network/core-ledger-proto`, or the JSON API names `'HASHING_SCHEME_VERSION_V2'` and `'HASHING_SCHEME_VERSION_V3'`.
- `options.limits`: see [Limits](#limits).

The [wallet integration guide example](../../docs/wallet-integration-guide/examples/snippets/verify-transaction-hash.ts) runs the same check with the Wallet SDK, from prepare to execute.

Show the transaction as `@canton-network/core-ledger-proto` decodes it, directly or through `@canton-network/core-tx-visualizer`: that decoding is what the package hashes.

`metadata.globalKeyMapping` and `metadata.inputContracts[i].eventBlob` are accepted, but no scheme hashes them, so do not show their content as signed.

## Errors

Every refusal rejects the promise with a `TxHashingError`, whose `code` is one of the codes below.

Its `path`, where known, points into the transaction, such as `transaction.nodes[2].v1.exercise.children[0]`, or names the limit option, such as `options.limits.maxNodes`.

| Code                          | Refused when                                                                                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DECODE_FAILED`               | the input is of another type, or the bytes or base64 are empty, not canonical or not a `PreparedTransaction`                                                                                             |
| `UNKNOWN_FIELD`               | a message holds a field number that its definition does not have                                                                                                                                         |
| `UNSUPPORTED_SCHEME`          | the scheme is neither V2 nor V3                                                                                                                                                                          |
| `UNSUPPORTED_NODE_VERSION`    | a node is not a `v1` node                                                                                                                                                                                |
| `UNSUPPORTED_LF_VERSION`      | the LF version of a node or of the transaction is one the scheme does not hash (V2 hashes `2.1`, V3 `2.1` and `2`), or under V3 a node of LF `2.1` has a key, has `byKey = true` or is a QueryByKey node |
| `FIELD_NOT_COVERED_BY_SCHEME` | a field that the scheme does not hash is set, such as a contract key under V2                                                                                                                            |
| `MISSING_FIELD`               | a part that the hash needs is absent                                                                                                                                                                     |
| `MISSING_NODE_SEED`           | a create or exercise node has no seed                                                                                                                                                                    |
| `DUPLICATE_NODE_SEED`         | a node has more than one seed                                                                                                                                                                            |
| `INVALID_NODE_ID`             | a node id is not a decimal from 0 to 2147483647 without leading zeros                                                                                                                                    |
| `DUPLICATE_NODE_ID`           | two nodes have the same id                                                                                                                                                                               |
| `DANGLING_NODE_REFERENCE`     | a root, a child or a seed names a node that does not exist                                                                                                                                               |
| `SHARED_CHILD`                | a node is referenced more than once                                                                                                                                                                      |
| `CYCLE`                       | a node is its own ancestor                                                                                                                                                                               |
| `ORPHAN_NODE`                 | a node is not reachable from a root                                                                                                                                                                      |
| `NODE_LIMIT_EXCEEDED`         | the transaction has more nodes than `maxNodes`                                                                                                                                                           |
| `DEPTH_LIMIT_EXCEEDED`        | nodes nest deeper than `maxNodeDepth`, or a value deeper than `maxValueDepth`                                                                                                                            |
| `INVALID_HEX`                 | a contract id is not lower case hex of even length                                                                                                                                                       |
| `INVALID_VALUE`               | a value is not valid, such as a seed that is not 32 bytes or a time outside 0001-01-01 to 9999-12-31, a message object changes when encoded as protobuf, or a limit option is not valid                  |

## Limits

`options.limits` overrides any of the defaults, which `DEFAULT_LIMITS` holds.

| Limit           | Default | Bounds                                      |
| --------------- | ------- | ------------------------------------------- |
| `maxNodes`      | 10,000  | nodes in the transaction                    |
| `maxNodeDepth`  | 100     | levels of nodes, a root at level 1          |
| `maxValueDepth` | 101     | levels of a value, the outermost at level 1 |

Each limit is an integer of at least 1, and `maxValueDepth` is at most 256. Decoding runs before the limits apply, so cap the size of the prepare response.

## Vectors

[`vectors/`](vectors/README.md) holds the test vectors: captured prepare responses with the hash returned for each, and mutation and reject cases. The [conformance repository](https://github.com/FTP-Tech-LLC/canton-tx-hashing-conformance) also holds the corpus captured again on Canton 3.6.4 with protocol version 36, for which the package gives the hash that Canton returned.
