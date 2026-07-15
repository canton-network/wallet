# @canton-network/core-test-token

TypeScript wrapper package for the Test Token DAML codegen.

This package exposes a stable import surface for selected symbols from
`@daml.js/test-token-v1`, including:

- `TestTokenV1`
- `packageId`

## Exports

From [src/index.ts](src/index.ts):

- `TestTokenV1`: shortcut to `Splice.Testing.Tokens.TestTokenV1`
- `packageId`: re-export from `@daml.js/test-token-v1`

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
import { TestTokenV1, packageId } from '@canton-network/core-test-token'

const template = TestTokenV1
console.log(packageId)
```

## License

Apache-2.0
