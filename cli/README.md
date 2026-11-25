# Wallet CLI

**`@canton-network/wallet-cli`** — command-line tools for building on the
[Canton Network](https://www.canton.network/). The `wallet` command creates dApp
starter projects that connect to Canton wallets through the
[dApp SDK](https://github.com/canton-network/wallet/tree/main/sdk/dapp-sdk#readme).

## Requirements

- [Node.js](https://nodejs.org/) 24 or later (check with `node --version`)

## Installation

```bash
npm install -g @canton-network/wallet-cli
```

This adds the `wallet` command to your `PATH`. Check that it works:

```bash
wallet --help
```

With pnpm, run `pnpm add -g @canton-network/wallet-cli` instead. If pnpm reports
that no global bin directory is set, run `pnpm setup` once and open a new
terminal.

### Run without installing

```bash
npx @canton-network/wallet-cli dapp create
pnpx @canton-network/wallet-cli dapp create
```

## Updating

Install the latest release over the current one:

```bash
npm install -g @canton-network/wallet-cli@latest
```

With pnpm:

```bash
pnpm add -g @canton-network/wallet-cli@latest
```

To compare the installed version with the latest release:

```bash
npm ls -g @canton-network/wallet-cli         # installed version
npm view @canton-network/wallet-cli version  # latest release
```

With `npx` or `pnpx`, add `@latest` to always run the newest release, e.g.
`npx @canton-network/wallet-cli@latest dapp create`.

To remove the CLI, run `npm uninstall -g @canton-network/wallet-cli`.

## Usage

```bash
wallet --help               # list commands
wallet dapp create --help   # show the options of one command
```

`wallet help dapp create` shows the same help as `--help`.

### Create a dApp

```bash
wallet dapp create
```

In a terminal, the command asks for a template and a target directory. Pass
both to skip the prompts, then start the dApp:

```bash
wallet dapp create --template lit my-dapp
cd my-dapp
npm install
npm run dev
```

| Argument / option     | Description                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `--template TEMPLATE` | Starter template (see below). Prompted for when omitted.                                     |
| `DIRECTORY`           | A new or empty directory. Prompted for in a terminal; otherwise defaults to `my-canton-app`. |

| Template | Starter                                             |
| -------- | --------------------------------------------------- |
| `lit`    | [Lit](https://lit.dev/) + [Vite](https://vite.dev/) |
| `react`  | [React](https://react.dev/) + Vite                  |
| `vue`    | [Vue](https://vuejs.org/) + Vite                    |

Each starter connects to a Canton wallet with the dApp SDK and lists the
accounts the wallet shares.

The command never overwrites files. If the directory is not empty, it logs an
error, leaves the directory untouched, and exits with status 1. In scripts and
CI, pass `--template` so the command does not wait for input.

### Logging

Logging options belong to each command, so put them after the command name, e.g.
`wallet dapp create --debug`:

| Option                | Description                                         |
| --------------------- | --------------------------------------------------- |
| `-d`, `--debug`       | Show debug messages.                                |
| `--log-format FORMAT` | Log format: `plain`, `color`, `logfmt`, or `jsonl`. |

Logs are written to stderr.

### Shell completion

```bash
# Bash: add to ~/.bashrc
eval "$(wallet completion bash)"

# zsh: add to ~/.zshrc
eval "$(wallet completion zsh)"
```

Run `wallet completion --help` for fish, PowerShell, and Nushell.

## Development

The CLI lives in the [wallet monorepo](https://github.com/canton-network/wallet).
Set up the repository as described in the
[Contributing Guide](https://github.com/canton-network/wallet/blob/main/docs/CONTRIBUTING.md).

The build bundles `src/` into the executable `dist/wallet` with
[tsdown](https://tsdown.dev/). Dependencies stay external and are installed
with the package.

To rebuild on every change, run `pnpm dev` in `cli/`. It does not rebuild
`@canton-network/create`, so rebuild that package after changing it.

### Tests

```bash
pnpm nx test @canton-network/wallet-cli
pnpm nx test @canton-network/wallet-cli -c coverage   # report in cli/coverage
```

Tests run commands in process with `captureProgramRun()` from
[`@optique/testing`](https://optique.dev/concepts/testing). `src/index.ts`
starts the program when imported, so it is excluded from coverage.

### Adding a command

The CLI is built with [Optique](https://optique.dev/). Each command is a module
that default-exports a `defineCommand()` definition.

1. Create the module under `src/commands/`, following the command path, e.g.
   `src/commands/dapp/example/index.ts` for `wallet dapp example`:

    ```ts
    import { merge, message, object, option, string } from '@optique/core'
    import { defineCommand } from '@optique/discover'
    import { logger, loggingParser } from '../../../logger'

    export default defineCommand({
        path: ['dapp', 'example'],
        parser: merge(
            object({ name: option('--name', string()) }),
            loggingParser
        ),
        metadata: {
            brief: message`Describe what the command does.`,
        },
        async handler({ name }) {
            logger.info(`Hello, ${name}`)
        },
    })
    ```

2. Add it to the list in `src/commands/index.ts`:

    ```ts
    import dappCreate from './dapp/create'
    import dappExample from './dapp/example'

    export default [dappCreate, dappExample]
    ```

3. Add tests next to the command in `index.test.ts`.

Every command must merge `loggingParser` into its parser. The CLI configures
logging before each command runs and fails if the logging options are missing.

Commands are imported in `src/commands/index.ts` instead of being discovered
from the file system, so tsdown bundles them into `dist/wallet`.

### Project structure

```
cli/
├── src/
│   ├── index.ts         # Entry point: runs the `wallet` program
│   ├── logger.ts        # Shared logging options and LogTape setup
│   └── commands/
│       ├── index.ts     # List of registered commands
│       └── dapp/
│           └── create/  # wallet dapp create
├── tsdown.config.ts     # Builds src/index.ts into dist/wallet
└── vitest.config.ts
```

## Related

- [`@canton-network/create`](https://github.com/canton-network/wallet/tree/main/examples/templates#readme) —
  the starter templates and the parsers that `wallet dapp create` reuses. Add
  new templates there.
- [dApp SDK](https://github.com/canton-network/wallet/tree/main/sdk/dapp-sdk#readme)
- [dApp Building Guide](https://github.com/canton-network/wallet/tree/main/docs/dapp-building)
- [Optique documentation](https://optique.dev/)

## License

[Apache-2.0](https://github.com/canton-network/wallet/blob/main/LICENSE)
