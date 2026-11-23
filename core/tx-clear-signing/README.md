# @canton-network/core-tx-clear-signing

Describes a Canton prepared transaction in words, before it is signed. `clearSign` takes the prepared-transaction bytes, the hash the user is asked to approve, and any number of clear-signing descriptors. It returns one operation per root node, in root order. A descriptor can word a create or an exercise. Every other root is still returned.

A descriptor is one JSON document bound to one Daml template, by package ID, module and entity. It has a stable sentence, an optional sentence with placeholders, and typed fields. The document format is the v1 Canton Clear Signing Descriptor schema, modelled on ERC-7730. The schema is [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json). The next section is the map of that document. The tests run every example through the schema and through the parser `clearSign` uses.

## Example descriptors

The descriptors live in [examples/descriptors](examples/descriptors). Each file binds to the template named here. A `create` entry is present when that create can itself be a root, including when the usual network path creates the same contract inside a choice.

The built-in Ping and Bong templates:

- [ping.json](examples/descriptors/ping.json) — `Canton.Internal.Ping:Ping`
- [bong-proposal.json](examples/descriptors/bong-proposal.json) — `Canton.Internal.Bong:BongProposal`
- [bong.json](examples/descriptors/bong.json) — `Canton.Internal.Bong:Bong`
- [explode.json](examples/descriptors/explode.json) — `Canton.Internal.Bong:Explode`
- [merge.json](examples/descriptors/merge.json) — `Canton.Internal.Bong:Merge`
- [collapse.json](examples/descriptors/collapse.json) — `Canton.Internal.Bong:Collapse`

[examples/descriptors/splice](examples/descriptors/splice) holds the Splice descriptors. [src/splice-contracts.test.ts](src/splice-contracts.test.ts) describes every captured prepared transaction in `src/__tests__/fixtures/splice` with them.

Amulet:

- [amulet-external-party-amulet-rules.json](examples/descriptors/splice/amulet-external-party-amulet-rules.json) — `Splice.ExternalPartyAmuletRules:ExternalPartyAmuletRules`. The create of the rules, and the factory choices through `TransferFactory`, `AllocationFactory` and `SettlementFactory`.
- [amulet-rules.json](examples/descriptors/splice/amulet-rules.json) — `Splice.AmuletRules:AmuletRules`, including the DevNet tap.
- [amulet-allocation.json](examples/descriptors/splice/amulet-allocation.json) — `Splice.AmuletAllocation:AmuletAllocation`, the V1 allocation.
- [amulet-allocation-v2.json](examples/descriptors/splice/amulet-allocation-v2.json) — `Splice.AmuletAllocationV2:AmuletAllocationV2`.
- [amulet-transfer-instruction.json](examples/descriptors/splice/amulet-transfer-instruction.json) — `Splice.AmuletTransferInstruction:AmuletTransferInstruction`.
- [amulet-transfer-preapproval.json](examples/descriptors/splice/amulet-transfer-preapproval.json) — `Splice.AmuletRules:TransferPreapproval`.
- [amulet-transfer-preapproval-proposal.json](examples/descriptors/splice/amulet-transfer-preapproval-proposal.json) — `Splice.Wallet.TransferPreapproval:TransferPreapprovalProposal`.
- [amulet-external-party-setup-proposal.json](examples/descriptors/splice/amulet-external-party-setup-proposal.json) — `Splice.AmuletRules:ExternalPartySetupProposal`.
- [amulet-locked-amulet.json](examples/descriptors/splice/amulet-locked-amulet.json) — `Splice.Amulet:LockedAmulet`.

Utility:

- [utility-allocation-factory.json](examples/descriptors/splice/utility-allocation-factory.json) — `Utility.Registry.App.V0.Service.AllocationFactory:AllocationFactory`, and the factory choices exercised on it.
- [utility-allocation-v2.json](examples/descriptors/splice/utility-allocation-v2.json) — `Utility.Registry.V0.Holding.AllocationV2:AllocationV2`.
- [utility-dvp-leg-allocation.json](examples/descriptors/splice/utility-dvp-leg-allocation.json) — `Utility.Registry.V0.Holding.Allocation:DvpLegAllocation`.
- [utility-transfer-offer.json](examples/descriptors/splice/utility-transfer-offer.json) — `Utility.Registry.App.V0.Model.Transfer:TransferOffer`.
- [utility-transfer-preapproval.json](examples/descriptors/splice/utility-transfer-preapproval.json) — `Utility.Registry.App.V0.Model.TransferPreapproval:TransferPreapproval`.
- [utility-mint-offer.json](examples/descriptors/splice/utility-mint-offer.json) — `Utility.Registry.App.V0.Model.Mint:MintOffer`.
- [utility-mint-request.json](examples/descriptors/splice/utility-mint-request.json) — `Utility.Registry.App.V0.Model.Mint:MintRequest`.
- [utility-burn-offer.json](examples/descriptors/splice/utility-burn-offer.json) — `Utility.Registry.App.V0.Model.Burn:BurnOffer`.
- [utility-burn-request.json](examples/descriptors/splice/utility-burn-request.json) — `Utility.Registry.App.V0.Model.Burn:BurnRequest`.

Other Splice roots:

- [governance-lock.json](examples/descriptors/splice/governance-lock.json) — `Splice.GovernanceLock:GovernanceLock`.
- [governance-lock-transfer.json](examples/descriptors/splice/governance-lock-transfer.json) — `Splice.GovernanceLock.Transfer:GovernanceLockTransfer`, and the transfer-instruction choices on it.
- [governance-lock-substitution.json](examples/descriptors/splice/governance-lock-substitution.json) — `Splice.GovernanceLock.Substitution:GovernanceLockSubstitution`, and the transfer-instruction choices on it.
- [vote-request.json](examples/descriptors/splice/vote-request.json) — `Splice.DsoRules:VoteRequest`.
- [dso-rules.json](examples/descriptors/splice/dso-rules.json) — `Splice.DsoRules:DsoRules`.
- [balance-update.json](examples/descriptors/splice/balance-update.json) — `Splice.Splitwell:BalanceUpdate`. One create entry covers both a transfer update and a netting update. The `update` variant is shown with `raw`.
- [transfer-offer.json](examples/descriptors/splice/transfer-offer.json) — `Splice.Wallet.TransferOffer:TransferOffer`.
- [featured-app-right.json](examples/descriptors/splice/featured-app-right.json) — `Splice.Amulet:FeaturedAppRight`.
- [wallet-user-proxy.json](examples/descriptors/splice/wallet-user-proxy.json) — `Splice.Util.FeaturedApp.WalletUserProxy:WalletUserProxy`.
- [otc-trade-proposal.json](examples/descriptors/splice/otc-trade-proposal.json) — `Splice.Testing.Apps.TradingApp:OTCTradeProposal`.
- [batching-utility.json](examples/descriptors/splice/batching-utility.json) — `Splice.Util.Token.Wallet.BatchingUtilityV2:BatchingUtility`.

[examples/descriptors/invalid](examples/descriptors/invalid) holds descriptors the schema rejects. The parser rejects each of them too. The file name is the rejection.

## The descriptor document

A descriptor is one JSON object. [canton-clear-signing-v1.schema.json](canton-clear-signing-v1.schema.json) is the specification of that object. Every field the schema defines is described there. This section is the map of the document: what the top-level keys are, and what each one holds. [examples/descriptors/ping.json](examples/descriptors/ping.json) is a complete example. A descriptor must not contain duplicate keys on any layer. A descriptor containing duplicate keys should get rejected by `clearSign`.

The object has two keys that are not sections, `$schema` and `$comment`, and four sections: `context`, `metadata`, `display` and `signatures`.

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

`version`, `publisher` and `name` are required. `version` is the semver of this descriptor's wording, independent of the schema version. `publisher` and `name` are the claimed author and a human-readable title. A signature does not check that claim. `signedBy`, on a described operation, names the trusted keys that signed the descriptor.

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
- `fields`, optional. The ordered rows that accompany the sentence. Omitting it means the operation shows a sentence and no rows. Each row is resolved from the prepared transaction and rendered with its `format`. A path that is missing, or a value the format refuses, gives that row an error. When the field is a placeholder in `interpolatedIntent`, the status is `fallback`. When it is not, the status stays `described` and `complete` is false.

An exercise entry has those three, plus:

- `choice`, required. The choice name, exactly.
- `interface`, optional. It has `moduleName` and `entityName`, and an optional `packageId`. Leave `packageId` out if it's unambiguous which interface is meant. Set `packageId` to match only that interface package specifically. An entry that sets it is preferred over one that does not. An entry with no `interface` matches the choice and is the fallback for that choice when no entry names the node's interface. An entry for one interface does not match a node exercised through another, or through none.

No two exercise entries may share a choice and the same interface. A set `packageId` is part of that identity, so one entry may name the package and another may omit it.

### A field

Each element of `fields` is one value to show.

`path` is required. It names the value, as described under Paths. `label` is the text in front of the value. When `label` is omitted, the path is shown. `format` selects how the value is rendered. When `format` is omitted, the value is shown with `raw`. `optional` is a boolean. Set it when the path may be `None`: `None` is then the word `None`, and a `Some` is shown with `format`. Without `optional`, `None` fails the field.

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
- `raw` shows any value: a record, list or map as JSON, a variant as an object keyed by its constructor, `Text` as a JSON string literal, and other scalars as they are. Every entry is written, in order. A text-map key or a record label that occurs twice is shown twice, as `{"to":"alice","to":"mallory"}`, never merged. A record field with an empty label is keyed by its position.
- `dateTime`, and `raw` on a timestamp or date, fail a value outside Daml's range, 0001-01-01 to 9999-12-31. The hasher refuses such a transaction first, so `clearSign` does not reach this.

Text shown to the user, including labels, intents and enum entries, cannot contain:

- a control, format, line-separator or paragraph-separator character;
- a private-use character;
- a default-ignorable code point, such as the Hangul fillers U+115F, U+1160, U+3164 and U+FFA0, variation selectors and zero-width characters, which render blank;
- U+2800, the blank Braille cell;
- a run of more than two nonspacing or enclosing marks, which would stack over the text around them.

The same characters in a value or name read from the transaction are shown escaped as `\u{...}`. So are unassigned code points, and every mark after the second in a run. Descriptor text does not reject unassigned code points, because which code points are assigned depends on the JavaScript engine's Unicode version. Characters that only look like others, such as a Cyrillic `С` in `USDС`, are not flagged.

### Size limits

The caps guard against abuse. How much of a long text fits on a screen is the wallet's concern. Lengths count Unicode code points, as JSON Schema's `maxLength` does. The schema states each cap, and [src/descriptor.ts](src/descriptor.ts) exports them as `LIMITS`.

| What                                        | Cap             |
| ------------------------------------------- | --------------- |
| `label`, `publisher`, `name`, an enum entry | 256 characters  |
| `intent`, `interpolatedIntent`              | 512 characters  |
| `$comment`                                  | 4096 characters |
| `path`                                      | 1024 characters |
| `fields` of one operation                   | 256             |
| `exercises`                                 | 256             |
| enum tables                                 | 256             |
| entries in one enum table                   | 1024            |
| `signatures`                                | 16              |

Descriptor text larger than 256 KiB of UTF-8 (`MAX_DESCRIPTOR_BYTES`) is refused before it is parsed. An upload is rejected. In `clearSign`, such a text is ignored, because it is not read far enough to find the template it names.

### What the parser checks beyond the schema

A descriptor is I-JSON (RFC 7493). [src/strict-json.ts](src/strict-json.ts) rejects duplicate member names, lone surrogates, non-finite numbers and trailing data before the schema runs. A member named `__proto__` is an ordinary member: it is kept, and it does not change the object's prototype. Nesting deeper than 64 arrays or objects is rejected. JSON Schema cannot express those rules. `parseDescriptorText` is that parse followed by the schema.

[src/descriptor.ts](src/descriptor.ts) rejects a document the schema rejects. It then rejects a document the schema accepts when one of these is true: a path is declared twice in one operation, a `{path}` placeholder does not equal the path of a field of that operation, an enum reference does not name a table in `metadata`, or two exercise entries share a choice and interface. A descriptor that fails and still names a root's template leaves that root `invalid`. The other roots are still described.

### `signatures`

`signatures` is optional (but in this reference implementation required). It is an array of signatures over the descriptor with this array removed. Each entry is an object:

- `scheme`, required. A string. The reference implementation verifies `ed25519` and rejects any other value.
- `hashAlgorithm`, optional. A string. It is not supported. A signature that sets it fails verification. When it is omitted, the signature is over the canonical bytes. Ed25519 hashes internally.
- `signature`, required. The Ed25519 signature, standard base64 of 64 bytes.
- `publicKey`, required. The Ed25519 public key, standard base64 of 32 bytes.

Both must be canonical base64, as `decodeBase64` of `@canton-network/core-tx-hashing` accepts it: padded, and with the unused bits of the last character zero. Another encoding of the same bytes does not decode, and the signature is reported as `could not be decoded`.

No other field is allowed. The entries are independent, so their order does not matter. Omitting the array and sending an empty array have the same effect: the descriptor has no signature.

### Signing a descriptor

The signed message is the descriptor with `signatures` removed. `$comment` and `$schema` are part of the message.

1. Remove `signatures`.
2. Serialize the remaining value with RFC 8785 (JSON Canonicalization Scheme). Object keys are sorted by UTF-16 code unit. There is no whitespace. Strings and numbers use the ECMAScript `JSON.stringify` rules. A lone surrogate, a non-finite number, or nesting deeper than 64 arrays or objects is rejected. Encode that text as UTF-8.
3. Sign with Ed25519.
4. Append the signature entry to `signatures`.

`signDescriptor` does this. `signingMessage` returns the canonical bytes. [examples/sign-descriptors.ts](examples/sign-descriptors.ts) signs every file in [examples/descriptors](examples/descriptors) with the reference key.

### Verification

`clearSign` checks the hash of the prepared transaction first. It then checks each descriptor that binds to a root, before it parses that descriptor. A descriptor that binds to no root is not checked.

A descriptor is verified when it has at least one signature and every signature verifies. A signature verifies when the signature bytes are valid for the embedded public key and that key is in [src/trusted-keys.ts](src/trusted-keys.ts) (`TRUSTED_KEYS`), matched on scheme and key bytes. One signature from a key that is not in the list leaves the descriptor unverified, including when another signature is from a trusted key.

A root bound to an unverified descriptor has status `unverified`. `intent` is the generic sentence, `fields` is empty, and `descriptor` is absent. `reason` lists the problems, joined with `; `. The other roots are still described. `clearSign` does not throw.

A verified descriptor that then fails to parse leaves the root `invalid`, as before. A descriptor that is both unsigned and malformed is `unverified`.

The list shipped with this package contains one key, named `reference`. Its private key is in [src/testing/reference-key.ts](src/testing/reference-key.ts), exported as `@canton-network/core-tx-clear-signing/testing`, so the examples and the tests can sign. That private key is not a secret. A deployment that trusts a descriptor author replaces `TRUSTED_KEYS` with that author's public key. Removing a key from the list is how a signature from it stops being accepted. v1 has no expiry and no revocation record.

`verifySignatures(json)` checks the embedded keys only. `verifySignatures(json, TRUSTED_KEYS)` is what `clearSign` calls. Storing a descriptor uses the first form, so a descriptor can be kept while the trusted list still changes.

A signature establishes that the holder of the key signed these bytes. It does not establish that the wording is right, or that `publisher` is true.

## Usage

```typescript
import { clearSign } from '@canton-network/core-tx-clear-signing'

// Both strings are base64, as /v2/interactive-submission/prepare returns them.
// descriptors is any number of descriptor documents.
const { complete, operations } = await clearSign(
    preparedTransaction,
    descriptors,
    preparedTransactionHash
)
```

`operations` has one entry per root, in root order. `operations[0].intent` is the sentence. `operations[0].fields` is the rows: `{ label, value }` when the row resolved, `{ label, error }` when it did not. `complete` is true when every root is `described` and every row has a value.

The package exports `clearSign`, `HashMismatchError`, `signDescriptor`, `signingMessage`, `verifySignatures`, `canonicalize`, `TRUSTED_KEYS`, and the types `ClearSigningResult`, `Descriptor`, `DescriptorSignature` and `TrustedKey`. `Descriptor` is the parsed document. `clearSign` accepts the JSON values and parses them. The arguments and the result are described under Input and Output. `@canton-network/core-tx-clear-signing/testing` exports the reference private key.

### The examples

Three fixed transactions in [examples/](examples) call `clearSign` and print the sentences. Each exits with an error when the wording changes. Run them from the wallet repository:

```bash
pnpm exec tsx core/tx-clear-signing/examples/ping.ts
pnpm exec tsx core/tx-clear-signing/examples/allocation.ts
pnpm exec tsx core/tx-clear-signing/examples/showcase.ts
```

[examples/ping.ts](examples/ping.ts) is one `Ping` create, described with [ping.json](examples/descriptors/ping.json). The sentence it requires is `intent` in that file:

> Ping "04d887dd-15b8-4954-8b79-a853811ce7cf" from v1-01-alice::1220ee2624190834dddf28f194685acee8f00cbde9ee0d211dae277f4d799884f289 to v1-01-alice::1220ee2624190834dddf28f194685acee8f00cbde9ee0d211dae277f4d799884f289

[examples/allocation.ts](examples/allocation.ts) is one `AllocationFactory_Allocate`, exercised through the V2 allocation-factory interface on `ExternalPartyAmuletRules`. The capture and [amulet-external-party-amulet-rules.json](examples/descriptors/splice/amulet-external-party-amulet-rules.json) are both splice-amulet 0.1.25. The sentence is one settlement of two legs, and it is `intent` in that file.

[examples/sign-descriptors.ts](examples/sign-descriptors.ts) signs every descriptor under [examples/descriptors](examples/descriptors) with the reference key. Run it after changing a descriptor's wording. A second run writes the same bytes.

```bash
pnpm exec tsx core/tx-clear-signing/examples/sign-descriptors.ts
```

[examples/showcase.ts](examples/showcase.ts) is three roots in one transaction, described with that same factory descriptor and [amulet-allocation-v2.json](examples/descriptors/splice/amulet-allocation-v2.json):

1. A transfer through the factory on `ExternalPartyAmuletRules`.
2. An allocation through the same factory. The allocation contract that choice creates is a child, so it has no sentence of its own.
3. The withdrawal of an earlier allocation, exercised on `AmuletAllocationV2`.

The three sentences are `intents` in that file, in root order.

## Input

`clearSign(tx, descriptors, expectedHash)`.

### The transaction

`tx` is the prepared transaction, base64, as `/v2/interactive-submission/prepare` returns `preparedTransaction`. The bytes are a protobuf `PreparedTransaction`.

The hasher refuses a message that contains a field number its definition does not have. That error is a `TxHashingError` with code `UNKNOWN_FIELD`, thrown before any sentence is produced. Decoding the bytes after the hash matches refuses the same fields. The codes the hasher can throw are listed in [the tx-hashing README](../tx-hashing/README.md).

A transaction with no `transaction` message, or with no roots, is refused by the hasher. A create, exercise, fetch, or query-by-key root whose template ID is missing throws while the roots are read, and no operation is returned.

### The descriptors

`descriptors` is any number of JSON texts, valid or not. A text is parsed when it names a root.

Each text is parsed strictly first. A duplicate member name, a lone surrogate, text that is not JSON, or nesting deeper than 64 arrays or objects leaves a bound root `invalid`. `reason` is that problem. `JSON.parse` is used only to find which root the bad text would have bound to. A text that cannot be read, or that names no root, is ignored.

A document binds to a root when `context.template.packageId`, `moduleName` and `entityName` are non-empty strings and all three equal that root's template ID. The comparison is exact, including the package ID. The key is `packageId:moduleName:entityName`.

A document is ignored when those three strings are missing or empty, or when no root has that template. A descriptor for a template that appears only as a child is ignored.

A document that names a root's template and fails the schema leaves that root `invalid`, after its signatures have been checked. `reason` is the parser's problems, joined with `; `. An upload through `setClearSigningDescriptor` rejects the same document instead of storing it.

A second document for the same three strings replaces that binding. The root is `invalid`, and `reason` is `more than one descriptor for template '<packageId:moduleName:entityName>'`. The first document is dropped. Another document for the same three strings leaves that same reason in place.

### The hash

`expectedHash` is the hash the user is asked to approve: base64 of the 32-byte digest.

[src/hash.ts](src/hash.ts) hashes the bytes with `@canton-network/core-tx-hashing` under scheme V3, then under scheme V2. A digest that equals `expectedHash` selects that scheme. V2 runs when the V3 digest differs. When both schemes can hash the transaction, the digests differ, so the hash the caller passes selects one of them.

When both schemes produce a digest and neither equals `expectedHash`, `clearSign` throws `HashMismatchError`. The message is `prepared transaction does not hash to '<expectedHash>'`.

When a scheme refuses the transaction, that error is thrown and the later scheme is not tried. V3 runs first, so a refusal from V3 ends the call. A transaction that V3 can hash and V2 refuses, such as one with a contract key, throws V2's `TxHashingError` with code `FIELD_NOT_COVERED_BY_SCHEME` when the V3 digest differs from `expectedHash`.

## Output

The result is one sentence and its rows for each root, in root order. Values are rendered as Formats describes, in the sentence and in the row. A `Text` is a JSON string literal, so the value stays distinct from the descriptor's own words.

```typescript
interface ClearSigningResult {
    /** True when every root is `described` and every field has a value. */
    complete: boolean
    /** One entry per root node, in order. */
    operations: OperationDescription[]
}

interface OperationDescription {
    kind: 'create' | 'exercise' | 'other'
    /** Absent when the root is not a create or an exercise and carries no template. */
    template?: { packageId: string; moduleName: string; entityName: string }
    /** The exercised choice. */
    choiceId?: string
    /** The interface the choice is exercised through, when the node has one. */
    interface?: { packageId: string; moduleName: string; entityName: string }
    status:
        | 'described'
        | 'fallback'
        | 'undescribed'
        | 'unverified'
        | 'invalid'
        | 'undescribable'
    reason?: string
    /** The bound descriptor's claim about itself, and the trusted keys that signed it. */
    descriptor?: {
        name: string
        publisher: string
        version: string
        url?: string
        /** Names from the trusted list, one per signature, in signature order. */
        signedBy: string[]
    }
    /** The sentence. Text values from the transaction are JSON-quoted. */
    intent: string
    fields: (
        | { label: string; value: string }
        | { label: string; error: string }
    )[]
}
```

`kind`, `template`, `choiceId` and `interface` are read from the transaction. A descriptor does not change which action is reported. Their strings, the generic intent built from them, and a `reason` that quotes the transaction are escaped as transaction values are, so a bidirectional or invisible character in a choice or module name is shown as `\u{...}`. The descriptor is bound with the unescaped names.

`template` is present on a create, an exercise, a fetch, and a query-by-key. It is absent on a rollback, on a root id that has no node, and on a node whose type is unset.

`descriptor` is set when a valid descriptor is bound to the template: a `described` root, a `fallback`, an `undescribed` root whose descriptor has no matching entry, and an `undescribable` exercise whose contract cannot be read. It is absent when no descriptor binds, and when the bound document is `invalid`. `name`, `publisher` and `version` are the descriptor's claim about itself. `url` is present when the descriptor has one.

`fields` is empty for `undescribed`, `invalid`, and `undescribable`. For `described` and `fallback` there is one row per field, in the order the descriptor lists them. A resolved row is `{ label, value }`. A failed row is `{ label, error }`. `label` is the field's label, or its path when the label is omitted.

`complete` is true when every operation is `described` and every row has a `value`. A field error on a `described` operation makes `complete` false, and `clearSign` still returns the result.

### `described`

`intent` is `interpolatedIntent` with each `{path}` replaced by that field's value. When `interpolatedIntent` is absent, `intent` is the stable sentence, and the fields are still resolved. A field error that is not a placeholder leaves the status `described`.

### `fallback`

A placeholder's field has no value. `intent` is `The descriptor does not match this transaction.` `reason` names each failed placeholder, in order, as `placeholder '{path}' failed: <the field's error>`, joined with `; `. A placeholder whose path has no field is `placeholder '{path}' failed: has no field`. The rows still list what resolved and what failed.

### `undescribed`

No descriptor binds the template, or the bound descriptor has no `create` for a create, or no exercise entry matches the choice and interface. `intent` is `Create <module>:<entity>` or `Exercise <choice> on <module>:<entity>`. The module, entity and choice come from the transaction. `reason` is absent. `fields` is empty.

### `unverified`

The document bound to the template has no signature, or a signature that does not verify against a trusted key. `intent` is the same generic create or exercise sentence. `reason` is the signature problems joined with `; `. `fields` is empty. `descriptor` is absent, so the document's wording is not shown. The other roots are still described.

### `invalid`

The document bound to the template failed to parse, or more than one document names it. The signature check passed: an unsigned document is `unverified` and is not parsed. `intent` is the same generic create or exercise sentence. `reason` is the parser's problems joined with `; `, or `more than one descriptor for template '<packageId:moduleName:entityName>'`.

### `undescribable`

The root cannot be worded, and the other roots are still described.

A root that is not a create or an exercise has `intent` `Cannot describe <nodeType> node`. `nodeType` is `fetch`, `rollback`, `queryByKey`, `missing` when the root id has no v1 node, or `empty` when the node type is unset. `reason` is `root node '<nodeId>' is a '<nodeType>' node`.

An exercise whose contract cannot be read keeps the generic exercise sentence. `reason` is one of:

- `contract '<contractId>' occurs more than once`
- `contract '<contractId>' is neither an input contract nor created by the transaction`
- `contract '<contractId>' is '<packageName:module:entity>', not '<packageName:module:entity>'`

`clearSign` throws while checking the hash, and while reading a transaction whose shape it cannot read. A returned result is the description of every root, whether or not `complete` is true.

## From the screen to the signature

The signing provider signs the hash of the prepared-transaction bytes. The sentences are computed from those bytes, after the hash of the bytes has been checked against the hash the screen will submit.

### The remote approval page

The remote gateway's `/approve` page, [wallet-gateway/remote/src/web/frontend/approve/index.ts](../../wallet-gateway/remote/src/web/frontend/approve/index.ts), loads the stored prepared transaction and its stored hash, and the descriptor texts stored for the logged-in user. When the descriptor load throws, the list is empty. The page then calls `clearSign` with the stored bytes, that list, and the stored hash. With an empty list, each create and each exercise comes back `undescribed`.

An upload on `/descriptors` sends the file text unchanged. The gateway keeps it only when the text is within the size cap, parses strictly, the document is valid against the schema, and every signature verifies against the public key it contains. The signatures are checked on the strictly parsed JSON, as `clearSign` checks them. Deleting a stored descriptor reads its template leniently (`readDescriptorTemplate`), so a row that a later version of the parser rejects can still be deleted. Its card shows the parse error and a Delete button.

"What you are signing" renders `operations`. Each operation shows its `intent` and its rows. When `complete` is false, the section warns "Parts of this transaction are not described. Review the transaction JSON before approving." Below the operations is a checkbox, "I have reviewed the raw transaction and want to approve it anyway". Approve is disabled until it is ticked. It is cleared whenever the description changes. The same page shows the decoded transaction.

When `clearSign` throws `HashMismatchError`, or the hasher throws, approval is disabled. The page says "The transaction shown does not match the hash that would be signed. Approval is disabled."

A root whose descriptor is `unverified` or `invalid` keeps the generic sentence. `complete` is false, so the page warns that parts of the transaction are not described, and Approve waits for the checkbox. The untrusted wording is not shown.

When the hash matches and a later read of the transaction throws, the section reports that the transaction could not be described, quotes the error, and tells the user to review the transaction JSON. Approve waits for the same checkbox.

Approve submits the hash `clearSign` accepted. That is the stored hash.

A preview on the same page is a description of pasted bytes, and approval stays disabled. A preview has no hash from a participant, so the page hashes the bytes under V3 and passes that digest to `clearSign`. The notice is "This is a preview, not a transaction to sign. Nothing is submitted."

### Signing

`TransactionService.sign` in `@canton-network/core-wallet-services` loads the stored transaction and recomputes the hash of the stored bytes under the gateway's `hashingScheme.version`. When that setting is omitted, the scheme is V3. Signing is refused in either of these cases:

- The recomputed digest differs from the stored hash. The error is `Prepared transaction hash of transaction '<id>' does not match its content; refusing to sign`.
- The request carries `preparedTransactionHash`, and it is not canonical base64 of the recomputed digest. The error is `The approved hash of transaction '<id>' does not match the transaction; refusing to sign`.

`preparedTransactionHash` is optional in the `sign` request, so a client written before it existed still signs, after the first check. Both approval pages send it.

When the checks pass, it logs `Transaction signing approved` with the transaction id, the prepared-transaction hash, `approvedBy` set to `user`, whether the client's hash was checked (`clientHashChecked`), the user id, the party id, the signing provider, and the time. It then asks the signing provider to sign the stored bytes and the stored hash.

### A service account

`TransactionService.signAndExecute` is the path with no approval page. When the transaction is already awaiting an external signature, it refreshes that attempt. Otherwise it checks the stored hash against the stored bytes, logs the same record with `approvedBy` set to `service account`, and signs. It then submits the signed transaction. There is no page-submitted hash, and `clearSign` is not called.

### The browser extension

The extension approval page, [wallet-gateway/extension/entrypoints/approve/index.ts](../../wallet-gateway/extension/entrypoints/approve/index.ts), loads the stored transaction and hashes the bytes on screen with `hashForReview` from `@canton-network/core-tx-visualizer`. That tries V3 and then V2, and the stored hash selects the scheme. When no scheme reproduces the stored hash, or the hasher throws, approval is refused with "The transaction shown does not match the hash that would be signed. It cannot be approved." The page submits the hash it computed from those bytes. It does not call `clearSign`. `TransactionService.sign` then applies the same two checks and writes the same log.

## How it works

[src/clear-sign.ts](src/clear-sign.ts) does the following, in order.

1. **Hash** the bytes, as Input describes. The implementation is [src/hash.ts](src/hash.ts).
2. **Decode** the same bytes to a `PreparedTransaction`, in [src/roots.ts](src/roots.ts). An unknown protobuf field throws here as well.
3. **Read the roots**, `transaction.roots` in order. A root id with no v1 node is kept, with `nodeType` `missing`. A fetch, a rollback, a query-by-key, and an unset node type are kept as `other`. The remaining roots are still described. A create, exercise, fetch, or query-by-key with no template ID throws, and nothing is returned.
4. **Index the contracts** an exercise can read. The index holds the v1 input contracts and every v1 create node in the transaction, root or child. A contract ID that occurs more than once is recorded and left out of the index. A later root can exercise a contract an earlier node created.
5. **Bind** each root template to its descriptor, as Input describes. The text is parsed strictly first. A descriptor that parses is verified, as `signatures` describes. [src/descriptor.ts](src/descriptor.ts) then checks the schema.
6. **Select the entry.** A create uses `display.create`. An exercise uses the `exercises` entry, selected as the descriptor document describes.
7. **Resolve** each field in [src/path.ts](src/path.ts) and **format** it in [src/format.ts](src/format.ts), using the paths and formats above. **Interpolate** the sentence in [src/intent.ts](src/intent.ts). When `interpolatedIntent` is absent, the sentence is `intent`, and the fields are still resolved.

### The exercised contract

A path that starts with `@.contract.` reads the create argument of the contract the exercise acts on. The contract is looked up by contract ID in the index from step 4.

The contract's package name, module and entity must equal the exercise's. Its package ID may differ, because an upgrade keeps the package name and changes the package ID. The descriptor's own binding is still the package ID of the root's template, together with the module and entity.

A missing contract, a repeated contract ID, or a different package name, module or entity makes that root `undescribable`. `reason` names the contract ID. The other roots are still described.

### Roots and children

A child node is a consequence of its root's choice, and the root's descriptor is what words that consequence. A `create` entry on a child's template applies when that create is submitted as its own root. A submitter who acts as every signatory of that template can prepare such a root.

A token-standard command names an interface. The root node carries the template of the contract it is exercised on, such as `ExternalPartyAmuletRules`, and carries the interface in `interface_id`. The descriptor binds to that template. The exercise entry names the interface, as the descriptor document describes.

The root creates that [src/splice-contracts.test.ts](src/splice-contracts.test.ts) describes include a governance lock, its transfer and substitution proposals, a vote request, a balance update, a wallet transfer offer, a featured app right, a transfer preapproval, and the external-party amulet rules.
