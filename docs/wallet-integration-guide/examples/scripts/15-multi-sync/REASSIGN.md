# Running run-15 without the explicit reassignment step

## The question

`_token_allocation.ts` (Bob's TestToken allocation) used to call
`appProviderSdk.ledger.internal.reassign(...)` to move Bob's `Token` from the
**app-synchronizer** to the **global** synchronizer before allocating it for
leg-1. We expected the scenario to work via Canton's **automatic**
reassignment once that explicit step was commented out — but it fails:

```text
code: 'SUBMITTER_ALWAYS_STAKEHOLDER',
cause: 'The given contracts cannot be reassigned as no submitter is a stakeholder.'
errorCategory: 9
```

The failure happens at the allocation `prepare` (interactive-submission/prepare)
that targets the **global** synchronizer while Bob's `Token` still lives on the
**app-synchronizer**.

## Why it fails (mechanism)

The TestToken token-standard contracts have these signatories:

| Template     | Signatories (= stakeholders)               |
| ------------ | ------------------------------------------ |
| `Token`      | `holding.owner` **+** `instrumentId.admin` |
| `TokenRules` | `admin`                                    |

When the allocation command is prepared on the **global** synchronizer, Canton
must co-locate every input/used contract on that synchronizer, so it triggers an
**automatic reassignment**. Canton's rule is that **the submitter must always be
a stakeholder of every contract it reassigns** (`SUBMITTER_ALWAYS_STAKEHOLDER`).

The blocker is **not** Bob's own `Token`: Bob is the `owner`, hence a
stakeholder, and indeed the _explicit_ `reassign` submitted by Bob always
worked. The blocker is the **`TokenRules` factory**, whose only stakeholder is
`admin`. With a **separate `TokenAdmin` party**, the submitter (Bob) is **not** a
stakeholder of `TokenRules`, so Canton refuses to reassign it automatically.

## Experiments

| #        | Approach                                                                  | Result                                                  |
| -------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| Baseline | reassign commented out, separate `TokenAdmin`                             | ❌ `SUBMITTER_ALWAYS_STAKEHOLDER` at allocation prepare |
| **A**    | Bob self-transfers his `Token` to **global** first (no explicit reassign) | ❌ `PRESCRIBED_SYNCHRONIZER_ID_MISMATCH`                |
| **B**    | **Remove the separate `TokenAdmin` — Bob is his own token's admin**       | ✅ full end-to-end success, exit 0                      |
| **C**    | Registry-driven synchronizer selection (`_targetSynchronizerId`)          | ❌ does not help — see pincer below                     |

### Experiment A — Bob self-transfers to global (does NOT work)

Idea: instead of a raw reassign, do a token-standard self-transfer whose
`prepare` targets `global`, hoping Canton auto-reassigns the input on the way.

```text
code: 'PRESCRIBED_SYNCHRONIZER_ID_MISMATCH',
cause: 'The target synchronizer=global-domain::… specified in the command
        submission mismatches the synchronizer id=app-synchronizer::… of some
        attached disclosed contracts …'
errorCategory: 8
```

Root cause: the local TestToken **registry hard-wires the transfer factory to the
app-synchronizer `TokenRules`** (see `_registry/features/transfer/handlers.ts`),
while the allocation factory is wired to the **global** `TokenRules` (see
`_registry/features/allocation-instruction/handlers.ts`). A transfer can only be
prepared on the app-synchronizer, so you cannot use a transfer to push the
holding to global. ⇒ This route is a dead end with the current registry wiring.

### Experiment B — Remove TokenAdmin (WORKS) ✅

Make **Bob** the `admin`/issuer of his own `TestToken`. Now Bob is a stakeholder
of **both** his `Token` (owner) **and** the `TokenRules` factory (admin), which
is exactly the prerequisite for automatic reassignment.

Changes (all example-only; no SDK rebuild needed):

- **`_setup.ts`** — drop the separate `TokenAdmin` party; `const tokenAdmin = bob`.
- **`_token_setup.ts`** — Bob **self-mints** his `Token` directly
  (`owner == admin == Bob`); the `TransferFactory` offer→accept hand-off is no
  longer needed.
- **`_token_allocation.ts`** — explicit `reassign` stays **commented out**
  (relies on automatic reassignment).
- **`_token_transfer.ts`** — explicit `reassign` calls also removed in the
  step-11 self-transfers (automatic reassignment carries them too).

Result — `yarn workspace docs-wallet-integration-guide-examples run-15` exits `0`
with the expected final state:

```text
| Alice | Amulet | 1999900.0000000000 | … | global           |
| Alice | Token  | 20.0000000000      | … | app-synchronizer |
| Bob   | Amulet | 100.0000000000     | … | global           |
| Bob   | Token  | 480.0000000000     | … | app-synchronizer |
```

#### Required follow-on fix when removing TokenAdmin

Because `admin` is a **signatory of every `Token`**, once `admin == Bob`, Bob
becomes a stakeholder of **Alice's** holding too. `bobSelfTransferToApp` reads
the ACS with `parties: [bob]`, which now also returns Alice's `Token` and makes
the loop try to move a holding Bob doesn't own (→ `CONTRACT_NOT_FOUND`). Fix:
filter the holdings to the ones Bob actually owns before transferring:

```ts
const bobTokens = bobTokensRaw.filter(
    (t) => t.createArgument.holding.owner === bob.partyId
)
```

This holding-visibility leak is precisely **why a real deployment keeps the token
issuer as a separate party** from the holders.

### Experiment C — registry-driven synchronizer selection (does NOT help) ❌

An external expert suggested that, instead of an explicit reassign, the
**workflow should tell the registry which synchronizer the allocation factory
must live on**, by funnelling a top-level `_targetSynchronizerId` field through
the `choiceArguments` of the allocation-factory request and parsing it in the
`TestTokenV1` registry handlers. The reasoning: the `TokenRules` factory is
**un-reassignable** (signatory = `admin` only), so it must already reside on the
transaction's synchronizer; let the client choose that synchronizer.

This was implemented and tested:

- `_registry/.../allocation-instruction/handlers.ts` now reads
  `choiceArguments._targetSynchronizerId` and returns the `TokenRules` contract
  on that synchronizer (defaulting to global).
- `_token_allocation.ts` fetches the factory itself (passing
  `_targetSynchronizerId`) and prepares the allocation on the chosen
  synchronizer.

The two reachable choices form a **pincer** that proves the field alone cannot
rescue run-15:

1. **Target the app-synchronizer** (where Bob's holding already lives, to avoid
   reassigning anything):

    ```text
    code: 'INVALID_PRESCRIBED_SYNCHRONIZER_ID',
    cause: 'Not all informees are on the specified synchronizer:
            app-synchronizer::…, but on Set(global-domain::…)'
    errorCategory: 9
    ```

    The allocation transaction's **informees are all on global** — most notably
    the settlement executor **`TradingApp`, which is hosted on global only**. So
    the allocation simply **cannot be created on the app-synchronizer**.

2. **Target the global synchronizer** (where the informees actually are):

    ```text
    code: 'SUBMITTER_ALWAYS_STAKEHOLDER',
    cause: 'The given contracts cannot be reassigned as no submitter is a stakeholder.'
    errorCategory: 9
    ```

    This is the **baseline failure again**: Bob's input `Token` is on the
    app-synchronizer and must be auto-reassigned to global, but Bob (the sole
    interactive signer) is not a stakeholder of the un-reassignable factory.

In other words, the allocation transaction is **forced onto global** by its
informees, while Bob's input holding is **forced to start on the
app-synchronizer** by leg-1's design — so a cross-synchronizer move of Bob's
holding is unavoidable, and `_targetSynchronizerId` only lets you choose _which_
of the two errors you hit.

**The expert's mechanism is architecturally correct and useful in general** — a
registry that offers factories on multiple synchronizers does need the workflow
to pick the transaction synchronizer, and the un-reassignable reference data
must reside there. The decisive lever is the **companion point**: the client
must also pick an **input holding that already lives on the settlement
synchronizer** (global). In run-15 Bob has no global holding, so without one of
(a) an explicit reassign, (b) the issuer co-authorizing the move, or (c) minting
/ holding Bob's token on global up front, the single-signer automatic
reassignment cannot be authorized.

## Conclusion

- ✅ **You can run the scenario without the explicit reassign step** by removing
  the separate `TokenAdmin` so the holder (Bob) is also the token `admin`.
  Canton then performs the synchronizer reassignment automatically because the
  submitter is a stakeholder of the `TokenRules` factory it must move.
- ❌ A Bob self-transfer to `global` (Experiment A) cannot replace the reassign:
  the registry only exposes the transfer factory on the app-synchronizer.
- ❌ Registry-driven synchronizer selection (Experiment C, `_targetSynchronizerId`)
  cannot rescue run-15 on its own: the allocation is forced onto global by its
  informees (`TradingApp` is global-only), while Bob's input holding starts on
  the app-synchronizer, so the cross-synchronizer move is unavoidable and Bob
  alone cannot authorize it. The field is still the right primitive when the
  client can also supply an input holding already on the settlement synchronizer.
- ⚠️ Removing `TokenAdmin` is a **demo simplification**, not a production
  pattern: a real token issuer is a distinct party, and with a distinct issuer
  the holder must still trigger the reassignment (explicitly, or via a workflow
  where the issuer co-signs/initiates it) because the submitter has to be a
  stakeholder of the contracts being reassigned.
