# CIP-103 Conformance CLI

Test your wallet's CIP-103 behavior through a browser interface or CLI and export
a structured CTRF report, optionally signed with your own key. Remote wallets and
browser extensions run the same SDK-facing tests. Start with manual wallet
approvals, then add automation through a Test Provider wrapper.

The current suite covers the connection lifecycle, account and network
lookups, request error handling, message signing, and transaction
approval/rejection. A passing run is not exhaustive CIP-103 certification; see
[Error Code Coverage](../conformance-dapp/README.md#error-code-coverage) for
what the suite checks and what its boundary puts out of reach.

## Quick Start

Requires Node 24 or newer. The package bundles the browser assets, so no
repository checkout or frontend build is needed:

```sh
npm install @canton-network/tool-conformance-cli
npx conformance-cli serve
```

Open the printed URL (default `http://127.0.0.1:8082`), choose your provider and
wrapper, and select **Run suite**. With the manual wrapper, perform each requested
action in your wallet, then select **Action completed**. Download the CTRF report
when the run finishes. For extension wallets, open the app in a browser where the
extension is installed.

Use disposable test wallets, accounts and credentials. Approving the transaction
case creates a real Ping contract, so the ledger must have
`#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping` available.

### Run From the CLI

To run the same tests in an isolated Playwright browser, set `run.suite`,
`run.headed: true` (needed for manual interaction) and `run.out` in a
[config file](#shared-cli-file), then:

```sh
npx playwright install chromium
npx conformance-cli run --config conformance.config.json
```

Set `run.extension` to load an unpacked extension. Failed or incomplete runs exit
with code 1. Use `npx conformance-cli --help` for all commands.

## Configuration

### Shared CLI File

Commands are configured only through the optional `--config` JSON file; without
it, defaults are used. Each command reads its own section: `serve`, `run`,
`sign`, or `verify`. The whole file is validated on every command, so unknown
keys or invalid values in any section are rejected.

```json
{
    "serve": {
        "host": "127.0.0.1",
        "port": 8082
    },
    "run": {
        "suite": {
            "provider": {
                "type": "remote",
                "url": "http://localhost:3030/api/v0/dapp"
            },
            "wrapper": { "type": "manual" }
        },
        "headed": true,
        "out": "./result.json",
        "signingKey": "./tester.pem"
    },
    "sign": {
        "artifact": "./result.json",
        "signingKey": "./tester.pem",
        "out": "./result.json.sig"
    },
    "verify": {
        "artifact": "./result.json",
        "artifactSignature": "./result.json.sig",
        "publicKey": "./tester.pub.pem"
    }
}
```

Relative paths resolve from the config file's directory. Only `serve` works
without a config; `run` requires `run.suite`, `sign` requires `artifact` and
`signingKey`, and `verify` requires `artifact`.

`serve` defaults to `127.0.0.1:8082`; use `port: 0` for any free port.
`host: "0.0.0.0"` allows network access, but
non-loopback clients need HTTPS since the suite relies on secure-context Web
Crypto APIs. `run` always starts its own loopback server, independent of `serve`.

### Suite Settings

The following examples go in the browser app's configuration editor or in
`run.suite` in the shared CLI file. Browser imports/exports contain only these
suite settings, not CLI command sections. `serve` configures the HTTP server,
not the browser's selected provider.

### Provider Types

`provider.type` is one of `picker` (the default: shows the SDK's own interactive
wallet-picker UI — not deterministic enough for headless/CI use), `remote` (a
fixed dApp API `url`), or `extension` (a fixed browser extension `target`).
See the TSDoc on `ConfigSchema` in
[`tools/conformance-dapp/src/config.ts`](../conformance-dapp/src/config.ts) for
exactly how each is resolved, and `src/session.ts#createSession` for the SDK wiring.

```json
{
    "provider": {
        "type": "remote",
        "url": "http://localhost:3030/api/v0/dapp"
    },
    "wrapper": { "type": "manual" },
    "disabledTests": [],
    "timeoutMs": 120000
}
```

With `picker`, choosing a wallet re-prompts on every new session — including
after a halted case's automatic reconnect — since the choice is not
remembered across sessions. Use `remote` or `extension` for a deterministic,
unattended target instead.

Reports name that wallet under `extra.provider.wallet`, taken from what
`status` reports about itself (`id`, and `version`, `providerType` and `url`
when the wallet supplies them), alongside the provider `type` the tester
configured.

Complete the initial wallet login/approval before the suite starts; setup is not
counted as a conformance test. Use `manual`, `window`, or `webhook` to drive
approval/rejection decisions — see [Automating a Wallet](#automating-a-wallet).
SDK adapters handle remote HTTP/SSE and extension messaging.

### API Variants

CIP-103 defines synchronous and asynchronous dApp API variants, differing in
how a provider handles operations that need user interaction — see
[Asynchronous dApp API](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md#asynchronous-dapp-api).
This suite tests only the SDK-facing contract: the SDK's remote adapter
handles the async variant's `userUrl`/event handoffs internally, so no variant
selection is needed here, and extension providers must expose that same
SDK-facing contract rather than a raw async provider instance.

The SDK doesn't normalize every outcome — remote rejection errors aren't
consistently mapped to RPC code `4001`, which the rejection tests still
assert — so passing this suite doesn't prove every raw CIP-103 response or
event is correct.

### Test Selection

Test cases live under `tools/conformance-dapp/src/tests/`, grouped by category;
the UI's Tests panel mirrors that grouping. To disable specific cases from a
run config directly, list their ids in `disabledTests` (e.g.
`["connect.reject", "signMessage.reject"]`) — unknown ids are simply never
matched. Connection setup may require approval even when the selected test
expects a later operation to be rejected.

Tests run sequentially. Skipped tests stay skipped and are neutral for the exit
status: at least one test must pass, with no failed, pending, or other results.
A timeout, or an interaction failure without a numeric RPC error code, fails
that test and triggers a session recreation before the next one — see the
TSDoc on `runSuite`'s `reconnect` option in
[`tools/conformance-dapp/src/suite.ts`](../conformance-dapp/src/suite.ts).
Cancellation cannot cancel a request inside the wallet; dismiss outstanding
wallet prompts before another run.

Every case uses the same `timeoutMs` budget (120000 ms by default), including
any connection setup and wallet decisions within that case. The browser UI
offers **Mark as failed** on an unanswered request, which ends the running case
with that same outcome right away — see
[Failing a Test Early](../conformance-dapp/README.md#failing-a-test-early).
The browser UI also offers a play icon per case in the Tests picker, and a
rerun icon on each result, to run just that one case without changing
`disabledTests` — see [Running a Single Test](../conformance-dapp/README.md#running-a-single-test).

## Automating a Wallet

There is no test-only provider injection point (no `window.cip103TestProvider`,
no `registered` provider type, no `dedicated` wrapper): a wallet under CI
automation is discovered the same way a production wallet is, through
`extension` (announce yourself per
[Browser Extension](../../docs/dapp-sdk/wallet-providers/browser-extension.md))
or `remote`. Approval/rejection decisions are driven through one of the
`manual`, `window`, or `webhook` wrapper transports, documented along with the
`TestProvider`/`WrappingTestProvider` contract in
[`@canton-network/core-provider-conformance`](../../core/provider-conformance/README.md).
Import them from that package, not this tool.

```json
{
    "provider": {
        "type": "extension",
        "target": "com.example.mywallet"
    },
    "wrapper": { "type": "window" }
}
```

`run.extension: "path/to/unpacked-extension"` loads the wallet extension under
test. For unattended `window` runs, the extension must answer
`cip103:test:interaction` events with `cip103:test:ack` from the page. The
`manual` wrapper opens a dialog for the tester to perform the action and
requires `run.headed: true`; `window` and `webhook` are the wrapper transports
suited to unattended runs.

CLI browser security stays enabled by default. `run.disableWebSecurity: true` is an
explicit CORS-bypass opt-in, always using a temporary isolated profile. Never
use that profile for production wallets or unrelated browsing.

## Signed CTRF

Reports use CTRF spec 0.0.0 with suite/provider/filter metadata in `extra`.
CLI export validates against the official CTRF schema and checks summary counts.
The browser viewer performs basic report checks instead of full schema validation
or signature verification; hashing and signing are shared by both entrypoints
using Web Crypto, but verification is a CLI-only capability (`verify`).
CLI validation does not need Chromium. A valid report/signature does not mean its
conformance tests passed.

Signatures are **detached**: a report file never contains a hash or signature
field, so it is exactly the CTRF content and nothing else. Signing instead
produces a separate `.sig` file (by default `<report>.sig`) alongside it:

```json
{
    "algorithm": "Ed25519",
    "sha256": "<64 lowercase hex characters>",
    "value": "<Base64 Ed25519 signature>"
}
```

`sha256` is the plain SHA-256 digest of the report file's own bytes — the same
digest `sha256sum <report-file>` prints, with no RFC 8785 canonicalization or
other transform. Both key-file and wallet signatures sign only the UTF-8 bytes
of that 64-character hex digest, not the raw digest bytes or the JSON report
itself. The whole report is hashed, not just `results`, so it includes the
report's own `reportId` (a UUID minted per run) — replaying an old signed
report under a claim of being a fresh run is detectable by that reused id.

CLI runs export reports without diagnostics by default. In the
[browser viewer](../conformance-dapp/README.md#results-and-logs), **Report**
omits diagnostic logs while **Report + diagnostics** includes
`extra.diagnostics` for re-import and per-test analysis. The hash and signature
always cover the **Report** variant's exact bytes: `sha256sum` on a
**Report + diagnostics** download will not match `sha256` in the `.sig`, since
it carries extra diagnostic bytes the signature never covered in the first
place. Diagnostics are unsigned and may contain sensitive data even after
redaction.

Provider labels are not signed. Verify with a trusted key; do not treat those
labels as authenticated identity.

```sh
openssl genpkey -algorithm ED25519 -out tester.pem
openssl pkey -in tester.pem -pubout -out tester.pub.pem
```

Add `run.signingKey: "./tester.pem"` to auto-sign the report as part of the
`run` command (or use the separate `sign` command with its own
`sign.signingKey` to sign an existing report), and
`publicKey: "./tester.pub.pem"` to the `verify` section, then:

```sh
npx conformance-cli run --config conformance.config.json
npx conformance-cli verify --config conformance.config.json
```

The `run` command above writes `result.json.sig` alongside `result.json`;
`verify` reads it from that default path, or from `verify.artifactSignature`
if named explicitly. Paths resolve relative to the config file. The CLI keeps
the key in Node and never passes it to the browser. In the UI, file paths cannot be opened automatically:
import the key through the file picker. Existing reports can be signed with
the `sign` command, which writes only the `.sig` file — it never rewrites the
report.

After a run, select **Sign with wallet** to choose a signing wallet through the
SDK picker, including discovered extensions or a remote wallet URL. This selection
is independent of the wallet under test. The signer is assumed compliant; no test
hooks are invoked. Its `signMessage` request contains only the displayed digest.
The returned signature has `algorithm: "Ed25519"` and the
primary account's `partyId`, `networkId`, and unchanged `publicKey` from
`sdk.listAccounts()`. Wallet and key-file signatures use the same `.sig` schema, with
optional `partyId`, `networkId`, and `publicKey` metadata. Signing
requires exactly one primary account. Select **Download signature** to save
the current signature; a successful signature replaces the previous one shown
in the UI (the report itself is never touched), and a rejected wallet attempt
leaves it unchanged.

Wallet signatures are assumed to be Base64-encoded Ed25519 signatures of the
UTF-8 digest string, without additional prefixes or hashing. The CLI's
`verify.publicKey` field verifies both wallet and key-file signatures using a supplied
trusted Ed25519 public key in PEM format, overriding any embedded key.
Without that field, an embedded `publicKey` is used automatically. Supported
embedded encodings are raw 32-byte hexadecimal or Base64 Ed25519 keys and public-key PEMs.
Other encodings fail explicitly. Wallets using other signing conventions will
not verify with this verifier.

A party ID is not a public key: embedded-key verification only checks
signature consistency, and the CLI reports that signer identity is not
trusted. Supply a separately trusted key to establish who actually signed;
party and network metadata are descriptive and outside the signed hash.

Browser signing requires Web Crypto Ed25519 support and a secure origin
(localhost qualifies) when importing a private key. Hashing requires Web Crypto
SHA-256 in a secure context. Imported keys are held in memory, not persisted or
exported with configuration.

`verify` always requires successful cryptographic verification of
`verify.artifactSignature` (default `<artifact>.sig`) using either the supplied
or embedded key. A missing signature file, missing key or invalid signature
fails validation. Set `artifactSignature: null` to validate only the report
structure.

### Verifying Without This CLI

Because the hash is a plain digest of the report file and the signature is a
detached `.sig`, both can be checked with generic tools instead of
`verify`:

```sh
sha256sum report.json                                    # compare to "sha256" in report.json.sig
value=$(node -pe "JSON.parse(require('fs').readFileSync('report.json.sig')).value")
printf '%s' "$(sha256sum report.json | cut -d' ' -f1)" > digest.txt
openssl base64 -d -A -in <(printf '%s' "$value") -out signature.bin
openssl pkeyutl -verify -pubin -inkey public.pem -rawin -in digest.txt -sigfile signature.bin
```

The `sha256sum` line is a sanity check, not a substitute for the signature
check: it confirms the report matches what was hashed, while the `openssl
pkeyutl` line (OpenSSL 3.x; Ed25519 needs no `-digest` option, since it hashes
internally) is what actually proves the named key signed it. Anyone with
`sha256sum`, `openssl`, and a way to read one JSON field can verify a report
independently of this package.

## Development

See [`docs/CONTRIBUTING.md`](../../docs/CONTRIBUTING.md) for environment setup.

```sh
pnpm exec nx run @canton-network/tool-conformance-cli:build
pnpm --filter @canton-network/tool-conformance-cli exec playwright install chromium
pnpm --filter @canton-network/tool-conformance-cli typecheck
pnpm exec nx run @canton-network/tool-conformance-cli:test
```

Nx builds `core-provider-conformance` and `tool-conformance-dapp` first; running
`node src/cli.ts ...` directly does not, so build those yourself if you skip Nx.
