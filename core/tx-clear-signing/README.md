# @canton-network/core-tx-clear-signing

Describes what a Canton prepared transaction does, in words, before it is signed. Each root node (a create or an exercise) is described by a _clear-signing descriptor_: a JSON document bound to one exact Daml template (package ID, module and entity), with a stable intent, an interpolated intent and typed fields.

The descriptor format is the v1 _Canton Clear Signing Descriptor_ schema, modelled on ERC-7730. The schema is [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) in this package. The descriptors live in [examples/descriptors](examples/descriptors):

- [examples/descriptors/ping.json](examples/descriptors/ping.json);
- [examples/descriptors/splice](examples/descriptors/splice);
- the descriptors the schema rejects, in [examples/descriptors/invalid](examples/descriptors/invalid).

These JSON files are kept unformatted. The tests run them through the schema and through the parser `clearSign` uses, so the two cannot drift apart.

`examples/descriptors/splice/amulet-*.json` and `utility-*.json` are reference descriptors for the token-standard roots a Canton Coin or Canton Network Utility holder submits. They cover V1 (CIP-56) and V2 (CIP-112). `src/token-standard.test.ts` describes each entry that has a captured prepared transaction.

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

A Daml `Text` value is shown as a JSON string literal, in the intent and in its field, so a value such as `x" and send 1000 to "Mallory` cannot pass as the descriptor's wording. Control, format and line-separator characters in values are escaped.

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
- **Child contracts.** The transfer instruction or allocation that a factory choice creates is a child. A `create` on its template is never used. Only the choices a party later exercises on that contract are roots.

The exercised contract must have the exercise's package name, module and entity. Its package ID may differ, because an upgrade keeps the package name. This is the one place where the package ID is not matched exactly.

## Optional values

A field fails on `None`. The ledger leaves trailing `None` fields out of a record, so a record field that is not in the record is `None` too; so is a mistyped path. `Some` is unwrapped at every step of a path.

Set `optional: true` when the path may pass through an `Optional`. `None` is then shown as `None`, and a `Some` with the field's `format`.

Example descriptors live in [examples/descriptors](examples/descriptors). A wallet stores the descriptors a user uploads and passes that list to `clearSign`.

A descriptor binds one exact package ID. [examples/descriptors/splice/amulet-external-party-amulet-rules.json](examples/descriptors/splice/amulet-external-party-amulet-rules.json) is bound to splice-amulet 0.1.25. The reference Utility descriptors are bound to utility-registry-app-v0 0.10.0 (`15cf1eaaf35b3736d95bc5c260d3da5507cbd1edc5680f2d55d98de04e34d545`) and utility-registry-v0 0.9.0 (`106145fd9ef9cb0545dcf0c04e983ed41f5fe5056dcc4c84b6cdf0d14a634408`). A network running another version of a package needs a copy bound to that version's ID.
