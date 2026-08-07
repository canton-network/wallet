# @canton-network/core-splice-codegen

Typed wrappers around generated DAML JS packages used by Splice examples and SDK integrations.

This package currently exposes two modules:

- `TestToken` (from `@daml.js/test-token-v1`)
- `OTCTrade` (from `@daml.js/otc-trade`)

## Installation

```sh
pnpm install @canton-network/core-splice-codegen
```

## Requirements

This package requires a localnet instance that relies on Splice v0.6.12 or higher. Please ensure you have the latest localnet fetched.

## Exports

Top-level exports (from `src/index.ts`):

- `TestToken`
- `OTCTrade`

Each module has the same shape:

- `DAR`: typed template references, package ID, and selected type exports
- `commands`: typed create/exercise command builders
- `utils`: helper utilities (currently `vetDar`)

## Build

From repository root:

```sh
pnpm --filter @canton-network/core-splice-codegen build
```

Build outputs:

- ESM: `dist/index.js`
- CJS: `dist/index.cjs`
- Browser ESM: `dist/index.browser.js`
- Types: `dist/index.d.ts`

## Regenerating DAML Codegen Inputs

This package depends on generated DAML JS artifacts under
`damljs/test-token-v1`.

To refresh those artifacts, run:

```sh
pnpm generate:codegen
```

Then rebuild this package.

## Usage

```ts
import { TestToken, OTCTrade } from '@canton-network/core-splice-codegen'

// Template references
console.log(TestToken.DAR.TestTokenV1.TokenRules.templateId)
console.log(OTCTrade.DAR.TradingApp.OTCTradeProposal.templateId)

// Typed create command
const createRules = TestToken.commands.create.rules({
    admin: 'Alice::1220...',
})

// Typed exercise command
const settleTrade = OTCTrade.commands.exercise.otcTrade.settle({
    contractId: '00abc...',
    choiceArgument: {
        allocationsWithContext: {},
    },
})
```

## TestToken Module

`TestToken.DAR` includes:

- `packageId`
- `TestTokenV1`
- `TestTokenID`
- Types: `Token`, `TokenAllocation`, `TokenRules`, `TokenTransferOffer`

`TestToken.commands.create`:

- `transferOffer`
- `allocation`
- `rules`
- `token`

`TestToken.commands.exercise.transferOffer`:

- `accept`
- `reject`
- `withdraw`
- `update`

`TestToken.commands.exercise.allocation`:

- `executeTransfer`
- `cancel`
- `withdraw`

`TestToken.commands.exercise.rules.transfer`:

- `transfer`
- `publicFetch`

`TestToken.commands.exercise.rules.allocation`:

- `allocate`
- `publicFetch`

`TestToken.utils`:

- `vetDar(sdk, synchronizerId?)`

## OTCTrade Module

`OTCTrade.DAR` includes:

- `packageId`
- `TradingApp`
- Types: `OTCTrade`, `OTCTradeProposal`

`OTCTrade.commands.create`:

- `otcTrade`
- `otcTradeProposal`

`OTCTrade.commands.exercise.otcTrade`:

- `settle`
- `cancel`

`OTCTrade.commands.exercise.otcTradeProposal`:

- `accept`
- `reject`
- `initiateSettlement`

`OTCTrade.utils`:

- `vetDar(sdk, synchronizerId?)`

## DAR Vetting Utility

Both modules expose `utils.vetDar`, which loads a local DAR file and uploads it through the SDK:

```ts
import { TestToken } from '@canton-network/core-splice-codegen'

await TestToken.utils.vetDar(sdk)
await TestToken.utils.vetDar(sdk, 'global-synchronizer-id')
```

Notes:

- `vetDar` expects local DAR files to exist under `.localnet/dars/`.
- If those files are absent, DAR upload will fail at runtime.

## Relationship To Token Standard

`TestToken` command helpers are wired to choice names from `@canton-network/core-token-standard`:

- transfer-instruction choices
- allocation choices
- transfer/allocation factory choices

This keeps command generation aligned with Token Standard API semantics while staying strongly typed against DAML templates.

## License

Apache-2.0
