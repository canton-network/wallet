# @canton-network/core-tx-clear-signing-lib

The clear-signing interface for Canton prepared transactions, and the meta-schema of the clear-signing descriptor. The package has no implementation and no runtime dependencies. An implementation, and the code that consumes one, depend on this package so that neither depends on the other.

Clear signing describes a prepared transaction in words, before it is signed. An implementation takes the prepared-transaction bytes, the hash the user is asked to approve, and any number of descriptors. It returns one operation per root node of the transaction, in root order.

The package contains:

- the interface `ClearSigner`, and the types `ClearSigningResult`, `OperationDescription`, `OperationStatus`, `DescribedField` and `TemplateRef`, exported from the package entry point;
- the meta-schema, as the file `@canton-network/core-tx-clear-signing-lib/canton-clear-signing-v1.schema.json`.

## The interface

```typescript
import type { ClearSigner } from '@canton-network/core-tx-clear-signing-lib'

declare const signer: ClearSigner

const { operations } = await signer.clearSign({
    preparedTransaction, // base64, as /v2/interactive-submission/prepare returns it
    preparedTransactionHash, // base64 of the digest the user is asked to approve
    descriptors, // any number of descriptor documents, as JSON text
})
```

### Input

`clearSign(request)`:

- `preparedTransaction` is the prepared transaction, base64, as `/v2/interactive-submission/prepare` returns `preparedTransaction`.
- `preparedTransactionHash` is the hash the user is asked to approve, base64 of the digest.
- `descriptors` is any number of JSON texts, valid or not. An implementation parses a text only when it names a root of the transaction. They are text because a descriptor is signed as text, and a duplicate member name is only visible there.

A descriptor binds to a root when `context.template.packageId`, `moduleName` and `entityName` all equal that root's template ID. A descriptor that binds to no root is ignored. A second descriptor for a template that is already bound leaves that root `invalid`.

The description is only as trustworthy as its binding to what is signed. An implementation describes the transaction only when it hashes to `preparedTransactionHash`.

### Errors

`clearSign` rejects when the transaction cannot be described as a whole. The error carries a `code`:

| `code`                  | Meaning                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `HASH_MISMATCH`         | The transaction does not hash to `preparedTransactionHash`.      |
| `HASH_UNVERIFIABLE`     | The transaction cannot be hashed, so the hash cannot be checked. |
| `MALFORMED_TRANSACTION` | The transaction hashes correctly but cannot be read.             |

With the first two, a description would not be bound to what is signed, so a consumer must not let the transaction be approved on the strength of one. With the third, the hash is confirmed and only the description is missing.

Everything else is reported per root, in the result, so that one bad descriptor does not stop the other roots from being described.

### Output

```typescript
interface ClearSigningResult {
    /** One entry per root node, in root order. */
    operations: OperationDescription[]
}
```

An operation is a create, an exercise or another root, told apart by `kind`. `kind`, `template`, and for an exercise `choiceId` and `interface`, are read from the transaction. A descriptor does not change which action is reported. `fields` and `descriptor` come from the bound descriptor. `choiceId` and `interface` exist only on an exercise.

`status` is one of:

| `status`        | Meaning                                                                                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `described`     | `intent` is the descriptor's interpolated intent, or its stable intent when it has none. There is one row per field, in the order the descriptor lists them.                                                                                                                                               |
| `unfilled`      | The descriptor has an interpolated intent and a placeholder's field has no value. `intent` is a generic sentence saying the descriptor does not match the transaction, and `reason` names each failed placeholder. The descriptor is trusted and valid. The rows still list what resolved and what failed. |
| `undescribed`   | No descriptor words the node: none binds, or the bound one has no matching `create` or exercise entry. `intent` is generic and `fields` is empty.                                                                                                                                                          |
| `unverified`    | The descriptor bound to the node is not trusted. `intent` is generic, `fields` is empty, `descriptor` is absent and `reason` says why.                                                                                                                                                                     |
| `invalid`       | The descriptor bound to the node is not valid, or more than one is. `intent` is generic, `fields` is empty and `reason` says why.                                                                                                                                                                          |
| `indescribable` | The node cannot be worded: it is not a create or an exercise, or the contract an exercise acts on cannot be read. `intent` is generic.                                                                                                                                                                     |

`reason` is for display. It is absent for `described` and `undescribed`.

A field row is `{ label, value }`, or `{ label, error }` when the field cannot be shown. A field error on a `described` operation leaves the status `described`. Text values from the transaction are JSON-quoted in `intent` and in rows, so a value cannot pass as the descriptor's own wording.

A consumer treats the description as complete when every operation is `described` and no row has an `error`.

`descriptor` is the bound descriptor's `metadata`: `name`, `version`, `publisher` and, when it has one, `url`. It is present only when a trusted, valid descriptor is bound to the node.

Which descriptors are trusted is up to the implementation. `publisher` is part of the signed document, so a signature that verifies covers it. Whether the signing key belongs to that publisher is for the implementation's trust decision. A signature does not establish that the wording is right.

## The meta-schema

[canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) is a JSON Schema 2020-12 document. It is the specification of a descriptor, and every field it defines is described there. A descriptor names the schema's `$id` in its `$schema` member, and the schema defines that value.

A descriptor is one JSON object bound to one Daml template. It has four sections:

- `context` names the template by package ID, module and entity.
- `metadata` describes the descriptor file: its semver `version`, its `publisher` and `name`, an optional `url`, and optional `enums` tables for the `enum` format.
- `display` says how a root of the template is shown. `create` is one operation. `exercises` is a list of entries, each for a choice and, optionally, the interface it is exercised through. An operation has a stable `intent`, an optional `interpolatedIntent` with `{path}` placeholders, and ordered `fields`. A field has a `path`, an optional `label`, a `format`, and `params` for the `enum` format.
- `signatures` is an optional array of signatures over the descriptor with that array removed, serialized with JCS (RFC 8785).

JSON Schema cannot express every rule of the format. A processor must also enforce these, before it applies the schema:

- The document is I-JSON (RFC 7493): no duplicate member names on any level, well-formed Unicode, and numbers an IEEE 754 double represents.
- No Unicode normalization is applied to the document, or to any text read from it.

An implementation may reject more than the schema does. For example, it may reject a `{path}` placeholder that is not the path of a field of the same operation, or two exercise entries for the same choice and interface.

```typescript
import schema from '@canton-network/core-tx-clear-signing-lib/canton-clear-signing-v1.schema.json' with { type: 'json' }
import Ajv2020 from 'ajv/dist/2020.js'

const validate = new Ajv2020({ strict: false }).compile(schema)
```
