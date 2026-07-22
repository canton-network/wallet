# @canton-network/core-test-token

TypeScript wrapper package for the Test Token DAML codegen.

## Exports

From [src/index.ts](src/index.ts):

- `TestTokenV1`: shortcut to `Splice.Testing.Tokens.TestTokenV1`
- `packageId`: re-export from `@daml.js/test-token-v1`
- `commands`: command builders for Test Token templates and choices

## Build

From the repo root:

```sh
yarn workspace @canton-network/core-test-token build
```

The build produces:

- ESM: `dist/index.js`
- CJS: `dist/index.cjs`
- Browser ESM: `dist/index.browser.js`
- Types: `dist/index.d.ts`

## Regenerating DAML Codegen Inputs

This package depends on generated DAML JS artifacts under
`damljs/test-token-v1`.

To refresh those artifacts, run:

```sh
yarn script:generate:test-token
```

Then rebuild this package.

## Usage

```ts
import {
    TestTokenV1,
    packageId,
    commands,
} from '@canton-network/core-test-token'

const template = TestTokenV1
console.log(packageId)

// Build a create command for TokenRules
const createRules = commands.create.rules({ admin: 'Alice::1220...' })

// Build an exercise command for TokenTransferOffer.Accept
const acceptTransfer = commands.exercise.transferOffer.accept({
    contractId: '00a1b2c3d4...',
    choiceArgument: {},
})
```

## Command Helpers

The `commands` export provides typed helpers that return
`WrappedCommand<'CreateCommand'>` and `WrappedCommand<'ExerciseCommand'>`.

Available builders:

- `commands.create.transferOffer`
- `commands.create.allocation`
- `commands.create.rules`
- `commands.exercise.transferOffer.accept`
- `commands.exercise.transferOffer.reject`
- `commands.exercise.transferOffer.withdraw`
- `commands.exercise.transferOffer.update`
- `commands.exercise.allocation.executeTransfer`
- `commands.exercise.allocation.cancel`
- `commands.exercise.allocation.withdraw`
- `commands.exercise.rules.transfer.transfer`
- `commands.exercise.rules.transfer.publicFetch`
- `commands.exercise.rules.allocation.allocate`
- `commands.exercise.rules.allocation.publicFetch`

Example:

```ts
import { commands } from '@canton-network/core-test-token'

const createAllocation = commands.create.allocation({
    allocation: {
        // Fill with your AllocationSpecification payload
    },
})

const executeTransfer = commands.exercise.allocation.executeTransfer({
    contractId: '00f00d...',
    choiceArgument: {
        // Fill with Allocation_ExecuteTransfer choice argument
    },
})
```

## License

Apache-2.0
