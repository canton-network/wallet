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

For example, `pnpm create @canton-network dapp-lit my-dapp`.

In a terminal, a missing `TEMPLATE` or `DIRECTORY` is prompted for. Otherwise
(for example in CI) `TEMPLATE` is required and `DIRECTORY` defaults to
`my-canton-app`. The target directory must be new or empty. Next steps are
printed in the syntax of the package manager that ran the command.

With npm, flags need a `--` separator: `npm create @canton-network -- --help`.

## Adding a template

1. Add the template directory under `src/templates/`, e.g. `src/templates/dapp/lit`.
   Name dotfiles that npm strips on publish with an underscore (`_gitignore`,
   `_npmrc`, `_yarnrc.yml`); they are renamed when the template is copied.
2. Register it in `createConfig.templates` in `package.json`:

    ```json
    {
        "name": "dapp-lit",
        "description": "Lit dApp",
        "template": "./src/templates/dapp/lit"
    }
    ```

Templates are copied as-is, without variable substitution, for both the
package-manager and Vite+ entry points. Only bundled `./` templates work with
the package-manager entry point.
