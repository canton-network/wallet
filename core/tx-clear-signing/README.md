# @canton-network/core-tx-clear-signing

Describes what a Canton prepared transaction does, in words, before it is signed. Each root node (a create or an exercise) is described by a _clear-signing descriptor_: a JSON document bound to one exact Daml template (package ID, module and entity), with a stable intent, an interpolated intent and typed fields.

The descriptor format is the v1 _Canton Clear Signing Descriptor_ schema, modelled on ERC-7730. The schema is [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) in this package. The descriptors live in [examples/descriptors](examples/descriptors):

- [examples/descriptors/ping.json](examples/descriptors/ping.json);
- [examples/descriptors/bong.json](examples/descriptors/bong.json);
- [examples/descriptors/bong-proposal.json](examples/descriptors/bong-proposal.json);
- [examples/descriptors/explode.json](examples/descriptors/explode.json);
- [examples/descriptors/merge.json](examples/descriptors/merge.json);
- a subset of descriptors based on Splice [examples/descriptors/splice](examples/descriptors/splice);
- some descriptors the schema rejects, in [examples/descriptors/invalid](examples/descriptors/invalid).

The tests run every descriptor through the schema and through the parser `clearSign` uses, so the two cannot drift apart.

The files in [examples/descriptors/splice](examples/descriptors/splice) describe, among other things, the two token standards CIP56 and CIP112, while the remaining word the Splice roots captured next to them: governance locks and their transfer and substitution proposals, a DSO vote request, a Splitwell balance update, a wallet transfer offer, a featured app right, DSO rules, and the wallet and trading contracts. `src/splice-contracts.test.ts` describes every one of those captures. A descriptor has a `create` entry when that create can itself be a root, including when the usual network path creates the same contract inside a choice.

## The descriptor document

A descriptor is one JSON object. [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) is the specification of that object. Every field the schema defines is described there. This section is the map of the document: what the top-level keys are, and what each one holds. [examples/descriptors/ping.json](examples/descriptors/ping.json) is a complete example.

The object has two keys that are not sections, and four sections.

`$schema` is required. Its value is the `$id` of the schema file, `https://example.org/canton-clear-signing/v1/schema.json`. A descriptor that names another schema is rejected.

`$comment` is optional. It is a note for a person reading the file. `clearSign` ignores it.

### `context`

`context` says which Daml template this descriptor is about. The section has a single field, `template`, and `template` has three fields, all required:

- `packageId`, the package ID as 64 lowercase hex digits.
- `moduleName`, the dotted module name, such as `Canton.Internal.Ping`.
- `entityName`, the template name in that module, such as `Ping`.

A descriptor binds to a root only when all three equal that root's template ID. A second descriptor for the same three leaves the root `invalid`, if both descriptors are part of the call to `clearSign`.

### `metadata`

`metadata` describes the descriptor file itself. It does not describe the transaction.

`version`, `publisher` and `name` are required. `version` is the semver of this descriptor's wording, independent of the schema version. `publisher` and `name` are the claimed author and a human-readable title. Until signatures exist, `publisher` is only that claim.

`url` is optional. It is a URI with more information about the publisher or the application.

`enums` is optional. It is a set of named tables used by the `enum` format, described with the formats below. Each table has at least one entry. A key is a Daml constructor name, or the strings `true` and `false` for a `Bool`. The value is the text shown to the user.

### `display`

`display` is how a root of the bound template is shown. It has two fields:

- `create`, one operation, used when the root is a create.
- `exercises`, a list of one or more exercise entries, used when the root is an exercise.

At least one of the two must be present. A create root whose descriptor has no `create`, or an exercise root whose list has no matching entry, is `undescribed`. The displayed sentence is then the generic `Create Module:Entity` or `Exercise Choice on Module:Entity`.

An operation, whether `create` or `exercise`, has:

- `intent`, required. The sentence used when `interpolatedIntent` is absent. It cannot contain `{` or `}`, so it cannot contain a placeholder.
- `interpolatedIntent`, optional. The same kind of sentence with `{path}` placeholders. Each placeholder is the `path` of a field of this same operation, and is replaced by that field's formatted value. `{{` and `}}` are a literal brace. When this field is absent, `clearSign` shows `intent`. When it is present and a placeholder cannot be filled, the sentence is "The descriptor does not match this transaction." and the status is `fallback`.
- `fields`, optional. The ordered label/value rows. Omitting it means the operation shows a sentence and no rows. These fields can be formatted based on typing and should be treated as additional information accompanying the `intent`/`interpolatedIntent`. A field being listed means it has to be present in the prepared transaction, otherwise `clearSign` fails to describe the transaction.

An exercise entry has those three, plus:

- `choice`, required. The choice name, exactly.
- `interface`, optional. It has `moduleName` and `entityName`, and an optional `packageId`. Leave `packageId` out if it's unambiguous which interface is meant. Set `packageId` to match only that interface package specifically. An entry that sets it is preferred over one that does not. An entry with no `interface` matches the choice and is the fallback for that choice when no entry names the node's interface. An entry for one interface does not match a node exercised through another, or through none.

No two exercise entries may share a choice and the same interface. A set `packageId` is part of that identity, so one entry may name the package and another may omit it.

### A field

Each element of `fields` is one value to show.

`path` is required. It names the value, as described under Paths. `label` is the text in front of the value. When `label` is omitted, the path is shown. `format` selects how the value is rendered. When `format` is omitted, the value is shown with `raw`. `optional` is a boolean. Set it when the path may be `None`: `None` is then the word `None`, and a `Some` is shown with `format`. Without it, the parsing fails on `None`.

`params` is allowed only when `format` is `enum`, and then it is required. It has one field, `$ref`, whose value is `$.metadata.enums.` followed by the table's name.

### Paths

A path is a sequence of steps.

A path with no prefix starts at the create argument, or at the choice argument of an exercise. `@.contract.` is valid on an exercise only. It starts at the create argument of the contract being exercised, and must continue with at least one step.

A step that is a name selects the record field of that name, or the payload of a variant whose constructor is that name. A different constructor fails the field. `["key"]` after a name selects that entry of a text map. The key is a JSON string, so a quote or a backslash inside it is written with a JSON escape. A final step `length` on a list or a text map is the number of elements, as an integer. There is no step that picks one element of a list, or every element of a list or map: a list or map of variable size is shown whole, with `raw`.

`Some` is unwrapped at every step, including several `Some`s wrapped around each other. `None` at any step makes the whole path `None`. The ledger also leaves a trailing `None` field out of a record, and a field that is not in the record is treated as `None`. A mistyped path looks the same.

Five paths read the prepared transaction on both a create and an exercise: `@.contractId`, `@.signatories`, `@.stakeholders`, `@.synchronizerId` and `@.actAs`. Three more exist only on an exercise: `@.actingParties`, `@.choiceObservers` and `@.consuming`. A party list is shown with `raw`.

### Formats

`format` accepts only the Daml kinds named here. It does not coerce a value of another kind. A value that does not match fails the field.

- `string` shows a `Text` as a JSON string literal, in double quotes, so the text cannot pass as the descriptor's own wording.
- `number` shows an `Int64` as a canonical decimal (no leading zero, and not `-0`), or a `Numeric` as the ledger writes it: an optional minus, digits, a decimal point and digits, with at most 38 digits and at most 37 of them after the point.
- `boolean` shows a `Bool` as `true` or `false`.
- `party` shows a party identifier of 1 to 255 letters, digits, colons, minuses and underscores. A space is legal on the ledger and fails the field, so a party cannot extend the sentence.
- `contractId` shows a contract identifier in full.
- `dateTime` shows a `Time` as an ISO 8601 UTC timestamp with microseconds, or a `Date` as `YYYY-MM-DD`.
- `duration` shows a `DA.Time` `RelTime` in days, hours, minutes and seconds, such as `1d 2h 0.5s`.
- `enum` shows the table entry for an enum constructor, a variant constructor with no payload, or a `Bool`. The table is the one named by `params`. A value missing from the table fails the field.
- `raw` shows any value: a record, list or map as JSON, a variant as an object keyed by its constructor, `Text` as a JSON string literal, and other scalars as they are.

Text shown to the user, including labels, intents and enum entries, cannot contain a control, format, line-separator or paragraph-separator character. The same characters in a transaction value are shown escaped.

### What the parser checks beyond the schema

[src/descriptor.ts](src/descriptor.ts) rejects a document the schema rejects. It then rejects a document the schema accepts when one of these is true: a path is declared twice in one operation, a `{path}` placeholder does not equal the path of a field of that operation, an enum reference does not name a table in `metadata`, or two exercise entries share a choice and interface. A descriptor that fails and still names a root's template leaves that root `invalid`. The other roots are still described.

### Handling Signatures

The handling of signatures is currently future work. When these are used, they should be verified either by the clear signing module in combination with verifying that the hash is correct, or by a trusted codebase in which the clear signing module also runs. This requires the knowledge of public keys corresponding to private keys held by trusted descriptor authors. How these are to be distributed is likewise left as future work, but a trivial solution would be to fix them in the codebase.

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

`complete` is false when any root is not `described` or any field has an error. The remote gateway warns and still offers approval. `clearSign` throws only on a hash mismatch and on a transaction it cannot read or hash.

## From the screen to the signature

The signing provider signs the hash of the prepared-transaction bytes. The sentences are computed from those bytes, after `clearSign` has checked that the bytes hash to the hash the screen will submit.

On the remote gateway, the approval page (`/approve`) loads the stored prepared transaction and its hash, and calls `clearSign` with the descriptors stored for that user. Those sentences are the "What you are signing" section. The page submits that hash with the approval. Approval is disabled when the bytes do not hash to it.

`TransactionService.sign` in `@canton-network/core-wallet-services` recomputes the hash of the stored bytes under the gateway's configured scheme (V3 unless `hashingScheme.version` sets another). It refuses to sign unless that equals the stored hash and the hash the page submitted. It logs the transaction id, the hash, the user, the party, the signing provider, and the time, and only then asks the signing provider to sign.

The page warns and still offers approval when the hash matches and the description is incomplete or could not be produced. It also shows the decoded transaction. If the descriptors cannot be loaded, the page calls `clearSign` with an empty list. An API-key session has no page: the gateway checks the stored hash, logs the approval as a service account, and signs. The browser extension's approval page checks the hash of the bytes it displays and submits that hash. It does not call `clearSign`. The same `sign` check and log apply.

## How it works

[src/clear-sign.ts](src/clear-sign.ts) checks the hash, then:

1. **Decodes** the transaction ([src/roots.ts](src/roots.ts)), and indexes the contracts an exercise can act on: the input contracts, and the contracts the transaction creates.
2. **Binds** each root template to its descriptor, and validates that descriptor ([src/descriptor.ts](src/descriptor.ts)).
3. **Selects** the entry: `create` for a create node. For an exercise, the `exercises` entry whose choice and interface both equal the node's. An interface is its module and entity. When the entry also sets `packageId`, that must equal the node's interface package ID. When it omits `packageId`, the module and entity match on any package: the template's package ID already selects the interface package the template was compiled against, so the package ID is only needed to tell two such interfaces apart. An entry that sets the package is preferred over one that omits it. When the node carries an interface and no entry names that choice and interface, the entry for the same choice with no interface is used. A node with no interface matches only that entry. An entry for one interface never matches a node exercised through another, or through none.
4. **Resolves fields** ([src/path.ts](src/path.ts)) and **formats** them ([src/format.ts](src/format.ts)), using the paths and formats in the descriptor document above. A party list is shown with `raw`.
5. **Interpolates** the intent ([src/intent.ts](src/intent.ts)).

Only root nodes are described. A child node is a consequence of its root's choice, which the root's descriptor words. Every root is shown, described or not.

A descriptor must therefore be bound to the template a root carries.

- **Interface choices.** A token-standard command names an interface, but its root node carries the template of the contract it is exercised on, such as the factory `ExternalPartyAmuletRules`, and the interface in `interface_id`. The descriptor's interface names that module and entity. `packageId` is optional: leave it out and the entry follows the interface package the template package was compiled against. Set it to require that exact interface package.
- **Child contracts.** The transfer instruction or allocation that a factory choice creates is a child of that root. The factory's descriptor words the choice. A `create` entry on the child's template is used only when that create is itself a root, which a submitter who acts as every signatory can prepare. `src/splice-contracts.test.ts` includes those roots: a governance lock, its transfer and substitution proposals, a vote request, a balance update, a transfer offer, a featured app right, a transfer preapproval, and the external-party amulet rules.

The exercised contract must have the exercise's package name, module and entity. Its package ID may differ, because an upgrade keeps the package name. This is the one place where the package ID is not matched exactly.
