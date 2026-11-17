# @canton-network/core-tx-clear-signing

Describes what a Canton prepared transaction does, in words, before it is signed. Each root node (a create or an exercise) is described by a _clear-signing descriptor_: a JSON document bound to one exact Daml template (package ID, module and entity), with a stable intent, an interpolated intent and typed fields.

The descriptor format is the v1 _Canton Clear Signing Descriptor_ schema, modelled on ERC-7730. The schema is [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) in this package. The descriptors live in [examples/descriptors](examples/descriptors):

- [examples/descriptors/ping.json](examples/descriptors/ping.json);
- [examples/descriptors/splice](examples/descriptors/splice);
- the descriptors the schema rejects, in [examples/descriptors/invalid](examples/descriptors/invalid).

The tests run every descriptor through the schema and through the parser `clearSign` uses, so the two cannot drift apart.

`examples/descriptors/splice/amulet-*.json` and `utility-*.json` are the token-standard roots a Canton Coin or Canton Network Utility holder submits. They cover V1 (CIP-56) and V2 (CIP-112). `src/token-standard.test.ts` describes each of those entries that has a captured prepared transaction.

The other files in [examples/descriptors/splice](examples/descriptors/splice) word the Splice roots captured next to them: governance locks and their transfer and substitution proposals, a DSO vote request, a Splitwell balance update, a wallet transfer offer, a featured app right, DSO rules, and the wallet and trading contracts. `src/splice-contracts.test.ts` describes every one of those captures. A descriptor has a `create` entry when that create can itself be a root, including when the usual network path creates the same contract inside a choice.

## Usage

```typescript
import { clearSign } from '@canton-network/core-tx-clear-signing'

// preparedTransaction and preparedTransactionHash: base64, as returned by
// /v2/interactive-submission/prepare. descriptors: any number of descriptors.
const { complete, operations } = await clearSign(
    preparedTransaction,
    descriptors,
    preparedTransactionHash
)
// operations[0].intent: 'Ping "04d887dd-…" from alice::1220… to alice::1220…'
// operations[0].fields: [{ label: 'Ping ID', value: '"04d887dd-…"' }, …]
```

The package exports `clearSign`, `HashMismatchError`, and the types `ClearSigningResult` and `Descriptor`.

Three fixed transactions in [examples/](examples) run `clearSign` on their own:

- a ping;
- a two-leg V2 allocation;
- three token standard roots submitted together: a transfer and an allocation through the Amulet factory, and the withdrawal of an allocation.

Each prints the wording, and exits with an error if that wording changes:

```bash
pnpm exec tsx core/tx-clear-signing/examples/ping.ts
pnpm exec tsx core/tx-clear-signing/examples/allocation.ts
pnpm exec tsx core/tx-clear-signing/examples/showcase.ts
```

## Input

- **The transaction**, base64. Unknown protobuf fields are refused.
- **Descriptors**, any number. A descriptor binds to the roots whose template has its package ID, module and entity. A descriptor that binds to no root is ignored.
- **The hash** the user is asked to approve, base64. The transaction is described only when its bytes hash to this value, under scheme V3 or V2. Otherwise `clearSign` throws `HashMismatchError`.

## Output

The output follows ERC-7730: one sentence and a list of label/value fields per operation.

```typescript
interface ClearSigningResult {
    complete: boolean // every root described, every field has a value
    operations: {
        kind: 'create' | 'exercise' | 'other'
        template?: TemplateRef // from the transaction
        choiceId?: string // from the transaction
        interface?: TemplateRef // from the transaction
        status:
            | 'described'
            | 'fallback'
            | 'undescribed'
            | 'invalid'
            | 'undescribable'
        reason?: string // why invalid or undescribable
        descriptor?: { name; publisher; version; url? } // the bound descriptor's claim
        intent: string
        fields: ({ label; value: string } | { label; error: string })[]
    }[]
}
```

`intent` is, in order of preference:

1. `described`: the descriptor's `interpolatedIntent`, with each `{path}` replaced by its field's value. An operation without one shows its stable `intent`.
2. `fallback`: a placeholder's field could not be shown. `intent` is "The descriptor does not match this transaction." It is not the descriptor's stable intent. `reason` names each placeholder that failed, and `fields` still lists what resolved and what did not.
3. `undescribed`, `invalid`, `undescribable`: a generic sentence.
    - The sentence is `Create Module:Entity` or `Exercise Choice on Module:Entity`. For a root that is neither a create nor an exercise, it is `Cannot describe <nodeType> node`.
    - `undescribed`: no descriptor words the node.
    - `invalid`: the bound descriptor fails validation, or two descriptors bind the template.
    - `undescribable`: the node is not a create or an exercise, or the contract it exercises is missing, repeated or of another template.

A Daml `Text` value is shown as a JSON string literal, in the intent and in its field, so a value such as `x" and send 1000 to "Mallory` cannot pass as the descriptor's wording. A `party` is shown only when it is 1 to 255 letters, digits, colons, minuses and underscores: a space is legal in a ledger party and fails the field. A `number` is a canonical int64, or a Daml numeric with a decimal point, at most 38 digits and at most 37 of them after the point. Anything else fails the field. Control, format and line-separator characters in values, labels and errors are escaped.

`kind`, `template`, `choiceId` and `interface` are read from the transaction, so a descriptor cannot change which action the user is told about. `descriptor` is unauthenticated in v1: descriptors carry no verified signature yet.

`complete` is false when any root is not `described` or any field has an error. A wallet should warn the user then. `clearSign` throws only on a hash mismatch and on a transaction it cannot read or hash.

## How it works

[src/clear-sign.ts](src/clear-sign.ts) checks the hash, then:

1. **Decodes** the transaction ([src/roots.ts](src/roots.ts)), and indexes the contracts an exercise can act on: the input contracts, and the contracts the transaction creates.
2. **Binds** each root template to its descriptor, and validates that descriptor ([src/descriptor.ts](src/descriptor.ts)).
3. **Selects** the entry: `create` for a create node. For an exercise, the `exercises` entry whose choice and interface both equal the node's. An interface is its module and entity. When the entry also sets `packageId`, that must equal the node's interface package ID. When it omits `packageId`, the module and entity match on any package: the template's package ID already selects the interface package the template was compiled against, so the package ID is only needed to tell two such interfaces apart. An entry that sets the package is preferred over one that omits it. When the node carries an interface and no entry names that choice and interface, the entry for the same choice with no interface is used. A node with no interface matches only that entry. An entry for one interface never matches a node exercised through another, or through none.
4. **Resolves fields** ([src/path.ts](src/path.ts)) and **formats** them ([src/format.ts](src/format.ts)). A path starts at the create or choice argument. In an exercise, a `@.contract.` path starts at the create argument of the exercised contract. `@.contractId`, `@.signatories`, `@.stakeholders`, `@.synchronizerId` and `@.actAs` read the prepared transaction, on a create and an exercise. `@.actingParties`, `@.choiceObservers` and `@.consuming` do so on an exercise only. A party list is shown with `raw`.
5. **Interpolates** the intent ([src/intent.ts](src/intent.ts)).

Only root nodes are described. A child node is a consequence of its root's choice, which the root's descriptor words. Every root is shown, described or not.

A descriptor must therefore be bound to the template a root carries.

- **Interface choices.** A token-standard command names an interface, but its root node carries the template of the contract it is exercised on, such as the factory `ExternalPartyAmuletRules`, and the interface in `interface_id`. The descriptor's interface names that module and entity. `packageId` is optional: leave it out and the entry follows the interface package the template package was compiled against. Set it to require that exact interface package.
- **Child contracts.** The transfer instruction or allocation that a factory choice creates is a child of that root. The factory's descriptor words the choice. A `create` entry on the child's template is used only when that create is itself a root, which a submitter who acts as every signatory can prepare. `src/splice-contracts.test.ts` includes those roots: a governance lock, its transfer and substitution proposals, a vote request, a balance update, a transfer offer, a featured app right, a transfer preapproval, and the external-party amulet rules.

The exercised contract must have the exercise's package name, module and entity. Its package ID may differ, because an upgrade keeps the package name. This is the one place where the package ID is not matched exactly.

## The descriptor document

[canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) is the field-by-field specification. A descriptor's `$schema` must be that file's `$id`. The document has four sections:

- **`context.template`**. The package ID, module and entity the descriptor binds to. All three must equal the root's template.
- **`metadata`**. `version` (semver of the descriptor, not of the schema), `publisher`, `name`, an optional `url`, and `enums`. An enum table maps a constructor, or `true` and `false`, to the words shown for `format: enum`.
- **`display`**. `create`, `exercises`, or both. Each operation has a stable `intent`, an optional `interpolatedIntent`, and `fields`. An exercise entry names its `choice` and, when the choice is exercised through an interface, that `interface`.
- **`signatures`**. Reserved. The array must be empty. Descriptors are unsigned in v1, so `publisher` is a claim.

A field has a `path`, an optional `label` (the path is used when the label is omitted), a `format`, and `optional`. `params` is allowed only for `enum`, and its `$ref` is `$.metadata.enums.<name>`. The formats are `string`, `number`, `boolean`, `party`, `contractId`, `dateTime`, `duration`, `enum` and `raw`.

A path with no prefix reads the create or choice argument. `@.contract.<path>` reads the exercised contract. `@.contractId`, `@.signatories`, `@.stakeholders`, `@.synchronizerId` and `@.actAs` read the prepared transaction. `@.actingParties`, `@.choiceObservers` and `@.consuming` do so on an exercise only. A name selects a record field or a variant constructor. `["key"]` selects a text-map entry. A final `length` on a list or text map is its number of elements. `Some` is unwrapped at every step. A list or map of variable size is shown whole, with `raw`.

`{{` and `}}` in an interpolated intent are literal braces. A `{path}` placeholder must be the path of a field of the same operation.

[src/descriptor.ts](src/descriptor.ts) accepts a document only when the schema does, and then checks the rules a JSON Schema does not express: each path is declared once, every placeholder names such a path, every enum reference names a table, and no two exercise entries share a choice and interface. An interface `packageId`, when set, is part of that identity.

## Where the pieces are

| Piece                                             | Where                                                                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Schema                                            | [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json)                                 |
| Parser, including the rules above                 | [src/descriptor.ts](src/descriptor.ts)                                                                     |
| Hash, decode, bind, select, interpolate           | [src/clear-sign.ts](src/clear-sign.ts)                                                                     |
| Root nodes and the contracts an exercise can read | [src/roots.ts](src/roots.ts)                                                                               |
| Paths                                             | [src/path.ts](src/path.ts)                                                                                 |
| Formats                                           | [src/format.ts](src/format.ts)                                                                             |
| `{path}` placeholders                             | [src/intent.ts](src/intent.ts)                                                                             |
| V2 and V3 hashing                                 | [src/hash.ts](src/hash.ts)                                                                                 |
| Public exports                                    | [src/index.ts](src/index.ts)                                                                               |
| Descriptors, and the documents the schema rejects | [examples/descriptors](examples/descriptors), [examples/descriptors/invalid](examples/descriptors/invalid) |
| Schema and parser checked against the same files  | [src/schema.node.test.ts](src/schema.node.test.ts)                                                         |
| Captured Amulet and Utility roots                 | [src/token-standard.test.ts](src/token-standard.test.ts)                                                   |
| Captured Splice roots                             | [src/splice-contracts.test.ts](src/splice-contracts.test.ts)                                               |

## Optional values

A field fails on `None`. The ledger leaves trailing `None` fields out of a record, so a record field that is not in the record is `None` too; so is a mistyped path. `Some` is unwrapped at every step of a path.

Set `optional: true` when the path may pass through an `Optional`. `None` is then shown as `None`, and a `Some` with the field's `format`.

Example descriptors live in [examples/descriptors](examples/descriptors). A wallet stores the descriptors a user uploads and passes that list to `clearSign`.

A descriptor binds one exact package ID. A network running another version of a package needs a copy bound to that version's ID.

| Package                 | Version              | Package ID                                                         | Descriptors                                                                                     |
| ----------------------- | -------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| splice-amulet           | 0.1.25               | `c5203dee918350373a993328e345872113bd5f8c8f0f51967014d813e583ae66` | Amulet, governance locks, featured app right, transfer preapproval, external-party amulet rules |
| splice-wallet           | 0.1.26               | `5838793a7f11fbc16159065094823fb662120184ede48922dff092958dae6857` | Wallet transfer offer                                                                           |
| splice-dso-governance   | the captured package | `0ff9141699e5eb734de1e1a8d11f97233ffd3892d1108872600cb3019fd4a86e` | DSO rules and vote requests                                                                     |
| splitwell               | the captured package | `4c380e09c99b2c5cb938f6cce2a92c03f8941ca6f7af7df7c7370b2d421346da` | Balance updates                                                                                 |
| utility-registry-app-v0 | 0.10.0               | `15cf1eaaf35b3736d95bc5c260d3da5507cbd1edc5680f2d55d98de04e34d545` | Utility app templates                                                                           |
| utility-registry-v0     | 0.9.0                | `106145fd9ef9cb0545dcf0c04e983ed41f5fe5056dcc4c84b6cdf0d14a634408` | Utility registry templates                                                                      |
