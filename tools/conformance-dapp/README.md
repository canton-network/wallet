# CIP-103 Conformance dApp

`@canton-network/tool-conformance-dapp` contains the React interface, SDK-facing
test suite, provider discovery, result hashing, and browser signing. The suite
uses `@canton-network/core-provider-conformance` for action hooks and shared
request orchestration. It does not contain the CLI or Playwright harness.

## Run

For a published installation, use the [CLI](../conformance-cli/README.md), which
depends on this package and serves its assets:

```sh
npm install @canton-network/tool-conformance-cli
npx conformance-cli serve
```

For workspace development:

```sh
pnpm exec nx run @canton-network/tool-conformance-dapp:build
pnpm --filter @canton-network/tool-conformance-dapp dev
```

Vite defaults to port 8082. Run the suite against a disposable test wallet, then
download the CTRF report. The results panel displays the report's SHA-256 hash
and supports signing it with an independently selected CIP-103 wallet; select
**Download signature** to save the resulting detached `.sig` file alongside the
report. Private-key signing is also supported. See the
[integration guide](../conformance-cli/README.md#signed-ctrf) for the signature
format, provider configuration, test selection, and automation.

## Noninteractive Error Checks

With an existing wallet and network connection, disable every test except the
five connected error cases (under **Request handling**, **Sign message**, and
**Prepare & execute** in the Tests picker, or via `disabledTests` in the run
config):

```json
{
    "disabledTests": [
        "connect.reject",
        "connect.statusWhileDisconnected",
        "connect.unauthorized",
        "connect.approve",
        "isConnected",
        "status",
        "listAccounts",
        "getPrimaryAccount",
        "getActiveNetwork",
        "signMessage.reject",
        "signMessage.approve",
        "prepareExecute.reject",
        "prepareExecute.approve",
        "disconnect"
    ]
}
```

These cases never call approval/rejection hooks or request a new connection:

- Unknown method: `UnsupportedMethod` (4200), `MethodNotFound` (-32601), or
  `MethodNotSupported` (-32004).
- `signMessage`: missing parameters and a non-string message must return
  `InvalidParams` (-32602) or `InvalidInput` (-32000).
- `prepareExecute`: missing parameters and non-array commands must return
  `InvalidParams` (-32602) or `InvalidInput` (-32000).

Every rejection must also carry the descriptive `message` member EIP-1193
requires alongside the code.

Successful responses, wrong codes, and string-valued codes fail. A missing
connection fails the precondition without prompting. Unanswered requests time
out using the same `timeoutMs` budget as every other case
(see [Test Selection](../conformance-cli/README.md#test-selection)).

## Error Code Coverage

CIP-103 adopts sixteen codes; the
[reference](../../docs/dapp-sdk/reference/errors.md) lists the full table.
Where the spec offers more than one code for the same cause, the suite accepts
any of them.

| Cause          | Accepted codes             | Covered by                                                      |
| -------------- | -------------------------- | --------------------------------------------------------------- |
| User declined  | `4001`                     | `connect.reject`, `signMessage.reject`, `prepareExecute.reject` |
| No session     | `4100`, `4900`             | `connect.unauthorized`                                          |
| Unknown method | `4200`, `-32601`, `-32004` | `request.unknownMethod`                                         |
| Bad parameters | `-32602`, `-32000`         | the `signMessage` and `prepareExecute` parameter cases          |

The remaining codes are outside this boundary rather than merely untested:

- `-32700` Parse error and `-32600` Invalid Request describe a malformed
  envelope, which this boundary cannot produce: the SDK builds and serializes
  every request, so reaching them needs a transport-level harness instead of an
  SDK-facing one.
- `4901` Chain Disconnected needs a wallet connected to no network, a state the
  suite cannot induce. `getActiveNetwork` accepts it when the wallet reports
  `isNetworkConnected: false` of its own accord, but nothing forces that.
- `-32603` Internal error reports a provider defect; forcing one would exercise
  the harness rather than the wallet.
- `-32001`, `-32002`, `-32003` and `-32005` describe resource and limit
  conditions with no interoperable way to trigger them.

## Running a Single Test

Select the play icon next to a case in the Tests picker, or the rerun icon on
an existing result, to run just that one case — every other case is skipped
for that run without changing which tests are enabled for **Run suite**.
Useful for iterating on one case, or for retrying a case that failed for
reasons unrelated to the wallet (a stale connection, a flaky network).

## Failing a Test Early

A request the wallet leaves outstanding for more than three seconds opens a
**Waiting for `<method>` to respond** dialog. When the wallet will clearly not
answer — it errored out, closed, or never showed the request — select **Mark as
failed** there, or in the manual interaction dialog, instead of waiting out the
`timeoutMs` budget. The case is recorded as failed and the suite continues with
the next one, exactly as a timeout would, including the session recreation that
follows. Both dialogs also offer **Cancel run** to stop the whole run, and the
rerun icon on the result retries the case once the wallet is healthy again.

## View a Report

Choose **Import report** in the Test run toolbar to open a saved CTRF JSON file.
Importing never connects to a wallet or runs tests. Invalid JSON leaves the
current report in place.

Signatures are detached (see the CLI's
[Signed CTRF](../conformance-cli/README.md#signed-ctrf) docs): a report file
never carries its own hash or signature, so importing one always starts out
unsigned in this viewer, regardless of whether a `.sig` exists for it
elsewhere. The browser performs basic report and count checks, not full CTRF
schema validation or signature verification; use the CLI's `verify`
command for that, against the report and its `.sig` file, including with an
embedded or supplied public key. Hashing and signing use the same shared
implementation in the browser and CLI, without launching a browser for CLI
validation.

## Results and Logs

A report records which wallet it is about in `extra.provider.wallet`, copied
from what `status` reports about itself — `id`, plus `version`, `providerType`
and `url` when the wallet supplies them — next to the provider `type` the
run config carried. With the `picker` provider type, the choice is re-prompted
on every new session (including after a halted case's automatic reconnect),
so a report can name more than one wallet if the tester picks differently
across sessions. **Sign with wallet** opens the picker again on purpose: the
signer is independent of the wallet under test.

Skipped tests stay visible and are neutral for success. A run passes when at
least one test passed and none failed, remained pending, or returned another
status. Runs with skips display **Passed (partial)**; empty and all-skipped runs
remain incomplete.

Expand **Logs** beneath a test to inspect its redacted requests, responses, and
events. The toolbar offers two report downloads:

- **Report**: results and provenance, without the diagnostic log block. This
  is the default CLI output and sharing format, and the exact bytes a
  signature (see **Sign with wallet**/**Download signature**) always covers.
- **Report + diagnostics**: the same report plus per-test logs. Import it
  again for analysis.

Both variants hash and verify identically against the same signature: a
signature is produced once, over the report without diagnostics, regardless of
which variant you later download. Logs live in `extra.diagnostics`, outside the
signed payload, so a valid signature does not authenticate them, and
`sha256sum` on a **Report + diagnostics** download will not match the `.sig`'s
digest. Those downloads can still contain sensitive transaction data despite
redaction. Dropping diagnostics removes our log block, not arbitrary fields or
sensitive text within test results. Review reports before sharing publicly.

Reports without logs remain supported, but cannot recover diagnostics that were
not saved. The manual interaction dialog supports Tab navigation and Escape to
cancel the run; **Action completed** advances to the wallet's actual response,
and **Mark as failed** ends the case without waiting for its timeout.

## Custom Harnesses

Drive the same controls as a person using the app. The CLI uses Playwright UI
interactions too; no global JavaScript control API is required.

Given a Playwright `page`, the dApp URL, and your suite configuration, upload
it through the same (hidden) file input the UI's own Import button uses:

```ts
await page.goto(url)
await writeFile(configPath, JSON.stringify(config))
await page.getByTestId('config-file').setInputFiles(configPath)
await page.getByTestId('run-suite').click()

const download = page.getByTestId('download-report')
const error = page.getByTestId('run-error')
await download.and(page.locator(':enabled')).or(error).first().waitFor({
    state: 'visible',
    timeout: 180_000,
})
if (await error.isVisible()) throw new Error(await error.innerText())

const downloading = page.waitForEvent('download')
await download.click()
await (await downloading).saveAs('report.json')
```

An enabled download means the run finished, not that all tests passed. Inspect
the downloaded report's results to decide your harness's exit status. Increase
the timeout for longer suites or manual interaction.

Other controls available through `getByTestId`:

| Test ID                       | Action                                                |
| ----------------------------- | ----------------------------------------------------- |
| `cancel-run`                  | Cancel an active run                                  |
| `download-report-diagnostics` | Download results with diagnostic logs                 |
| `download-signature`          | Download the current detached `.sig` file             |
| `report-file`                 | Import a report with `setInputFiles`                  |
| `run-case-<id>`               | Run only the given case, from the Tests picker        |
| `rerun-<id>`                  | Rerun the given case, from its result row             |
| `interaction-dialog`          | Wait for a manual action prompt                       |
| `complete-interaction`        | Acknowledge an action already performed in the wallet |
| `cancel-interaction`          | Cancel the run from the prompt                        |
| `fail-interaction`            | Fail the running case from the prompt                 |
| `waiting-dialog`              | Wait for the unanswered-request dialog                |
| `fail-waiting`                | Fail the running case from that dialog                |
| `cancel-waiting`              | Cancel the run from that dialog                       |

Wallet approval is separate from driving these controls. Use window events or
webhooks for unattended automation; manual mode requires a person to act in
the wallet. See [Automating a Wallet](../conformance-cli/README.md#automating-a-wallet)
for wiring up an extension or remote wallet to drive those decisions.

## Package Boundaries

The root package export is a browser-safe library entrypoint. Importing it does
not load React or access `window`, so the CLI can reuse report helpers in Node:

```ts
import {
    ConfigSchema,
    reportHash,
    SignatureSchema,
    type Report,
} from '@canton-network/tool-conformance-dapp'
```

The `./app` export identifies the compiled HTML entrypoint for static serving:

```ts
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(
    fileURLToPath(
        import.meta.resolve('@canton-network/tool-conformance-dapp/app')
    )
)
```

Serve that directory, including its `assets` subdirectory. The HTML export is an
asset path, not an executable JavaScript module.

## Build and Tests

```sh
pnpm --filter @canton-network/tool-conformance-dapp typecheck
pnpm --filter @canton-network/tool-conformance-dapp test
pnpm exec nx run @canton-network/tool-conformance-cli:test
```

Suite/report unit tests live here. Browser and CLI integration tests live in
`tools/conformance-cli` and exercise the packaged dApp assets.
