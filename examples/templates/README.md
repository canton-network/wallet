# @canton-network/create

Starter templates for Canton Network projects.

## Usage

```bash
pnpm create @canton-network [TEMPLATE] [DIRECTORY]
npm create @canton-network [TEMPLATE] [DIRECTORY]
yarn create @canton-network [TEMPLATE] [DIRECTORY]
bun create @canton-network [TEMPLATE] [DIRECTORY]

# Vite+ reads the same manifest without running this package's bin
vp create @canton-network:TEMPLATE --directory DIRECTORY
pnpm create vite-plus @canton-network:TEMPLATE --directory DIRECTORY
```

For example, to copy the Lit starter and run it:

```bash
pnpm create @canton-network dapp-lit my-dapp
cd my-dapp
pnpm install
pnpm dev
```

Use `dapp-react` or `dapp-vue` instead of `dapp-lit` for the same wallet example
in React or Vue. All three starters prompt for the directory if omitted in a terminal. In
non-interactive use, they default to `my-canton-app`. The target directory must
be new or empty.

With npm, flags need a `--` separator: `npm create @canton-network -- --help`.

## Reusing the CLI in other tools

The package also exports its [Optique](https://optique.dev/) parsers and the
copy step, so other CLIs offer the same arguments and prompts. The Wallet CLI
(`wallet dapp create`) is built this way:

```ts
import { createDapp, dappDirectory, dappTemplate } from '@canton-network/create'
import { object } from '@optique/core'

const parser = object({ template: dappTemplate, directory: dappDirectory() })
// ...
await createDapp(value.template, value.directory)
```

## Adding a template

1. Add the template directory under `src/templates/`, e.g. `src/templates/dapp/lit`.
   Name the starter's `.gitignore` file `_gitignore` so npm includes it when
   publishing. The CLI restores its name when copying.
2. Register it in `createConfig.templates` in `package.json`:

    ```json
    {
        "name": "dapp-lit",
        "description": "Lit dApp",
        "template": "./src/templates/dapp/lit"
    }
    ```

3. For a dApp starter, add its directory name to `dappTemplates` in
   `src/dapp.ts`. This adds the `dapp-<name>` command and the
   `wallet dapp create --template <name>` choice. Wire any other kind of
   template as a command in `src/cli/`. Vite+ reads `createConfig.templates`
   directly.

The starters are copied without variable substitution. Build output and
installed dependencies are not copied.
