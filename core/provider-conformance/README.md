# Conformance Test Provider

`@canton-network/core-provider-conformance` supplies typed test-provider
contracts and interaction wrappers for SDK-facing wallet conformance tests.
It does not discover wallets, register providers, run a suite, or generate reports.
For those workflows, use the [conformance dApp](../../tools/conformance-dapp/README.md)
and [CLI](../../tools/conformance-cli/README.md).

```sh
pnpm add @canton-network/core-provider-conformance
```

## Create a Provider

`createProvider(request)` creates an SDK-compatible provider without requiring a
class. Supply a typed request handler; the factory provides local `on`, `emit`,
and `removeListener` methods and returns the provider directly.

```ts
import {
    createProvider,
    type Provider,
} from '@canton-network/core-provider-conformance'

export function connectTransport(request: Provider['request']) {
    const provider = createProvider(request)
    const onMessageSignature = (signature: string) => {
        provider.emit('messageSignature', { signature })
    }
    return { provider, onMessageSignature }
}
```

Wire incoming wallet events to `provider.emit`. Subscriptions belong to each
provider instance; `on` and `removeListener` return that provider for chaining.
`emit` returns whether any listeners were registered and dispatches to a snapshot
of those listeners. Request results and errors are forwarded unchanged. The
factory does not open a connection, validate responses, or add approval hooks.

## Dedicated Providers

`TestProvider` combines the SDK provider contract (`request`, `on`, `emit`,
`removeListener`) with `TestMethods`. Wallet authors implement all six methods:

- `test_approveConnect()` / `test_rejectConnect()`
- `test_approveSignMessage(params)` / `test_rejectSignMessage(params)`
- `test_approvePrepareExecute(params)` / `test_rejectPrepareExecute(params)`

Parameters derive from the corresponding `DappClient` methods. Every hook returns
`Promise<void>` and only performs the approval or rejection action for an already
pending request. Hooks must not start an RPC or return a wallet result.
Rejection hooks resolve after rejecting in the wallet; they throw only if the
action itself cannot be performed. The wallet's RPC promise supplies the actual
result or rejection. Do not synthesize outcomes.
No class inheritance is required. For example, compose wallet-specific hooks
with an existing provider:

```ts
import type {
    Provider,
    TestMethods,
    TestProvider,
} from '@canton-network/core-provider-conformance'

export function createWalletTestProvider(
    provider: Provider,
    hooks: TestMethods
): TestProvider {
    return {
        request: (args) => provider.request(args),
        on: (event, listener) => provider.on(event, listener),
        emit: (event, ...args) => provider.emit(event, ...args),
        removeListener: (event, listener) =>
            provider.removeListener(event, listener),
        test_approveConnect: () => hooks.test_approveConnect(),
        test_rejectConnect: () => hooks.test_rejectConnect(),
        test_approveSignMessage: (params) =>
            hooks.test_approveSignMessage(params),
        test_rejectSignMessage: (params) =>
            hooks.test_rejectSignMessage(params),
        test_approvePrepareExecute: (params) =>
            hooks.test_approvePrepareExecute(params),
        test_rejectPrepareExecute: (params) =>
            hooks.test_rejectPrepareExecute(params),
    }
}
```

`testMethodNames` lists these six hook names for runtime capability checks.
Wiring a dedicated provider's hooks up to a wrapper transport so the CLI can
drive it in CI is a separate, test-only
[tool integration](../../tools/conformance-cli/README.md#automating-a-wallet), not a
side effect of importing this library.

## Running an Interaction

Use the shared `performInteraction` utility for both dedicated providers and
wrappers. It starts exactly one RPC, invokes the matching `test_*` hook, then
returns the RPC result or throws its error. All conformance suite interactions,
including setup reconnects, use this utility.

```ts
import {
    performInteraction,
    type TestProvider,
} from '@canton-network/core-provider-conformance'

export async function approveMessage(
    provider: TestProvider,
    signal: AbortSignal
) {
    return performInteraction(provider, 'approve', signal, {
        method: 'signMessage',
        params: { message: 'Conformance test' },
    })
}
```

After the hook resolves, the RPC has five seconds to settle. The native timeout
reason is propagated unchanged. Early RPC rejections are handled while waiting
for the hook, so they do not become unhandled rejections.

## Wrappers

Use `TestProvider` or its `UserInteractionWrapper` subclass when the wallet
already exposes a provider and you only need to automate the user action:

```ts
import {
    UserInteractionWrapper,
    type InteractionHandler,
    type Provider,
} from '@canton-network/core-provider-conformance'

export function wrapWallet(
    provider: Provider,
    performWalletAction: InteractionHandler,
    signal: AbortSignal
) {
    return new UserInteractionWrapper(provider, performWalletAction, signal)
}
```

The handler receives `{ id, method, decision, params }` and an abort signal.
Resolve only after completing the action; reject if the action cannot be
performed. `UserInteractionWrapper` does not render a dialog itself. The caller
supplies manual UI or automation through the handler.

Wrapper hooks only invoke the handler and resolve when its action completes.
They do not dispatch wallet requests or enforce a request-settlement timeout;
`performInteraction` owns that orchestration for every provider implementation.

Supply the same cancellation signal to the wrapper constructor and
`performInteraction`, not individual test methods. Handlers must honor it;
dedicated providers must arrange cancellation of their own action work.
The utility checks cancellation before dispatch and after the hook, and stops
waiting for the wallet result when cancelled. The caller must bound how long the
action itself may take. Cancellation cannot guarantee cancellation inside the wallet.
The exported `abortable` helper similarly stops waiting on a promise without
cancelling its underlying operation.

### Window Events

`new WindowEventWrapper(provider, target, signal)` dispatches
`cip103:test:interaction` with the interaction as its event detail. Perform the
action, then dispatch `cip103:test:ack` on the same target with
`{ id, completed: true }`, or `{ id, error: "Failure description" }` on handler
failure. Both transports use this same acknowledgement contract: IDs must match,
exactly one outcome is required, and extra fields are rejected. Malformed or
unrelated window replies are ignored. An acknowledgement does not replace the
wallet's response.

The target defaults to browser `window`. Pass an explicit `EventTarget` outside
the browser. Importing the package itself does not access `window`. Any bridge
between extension and page contexts is the wallet author's responsibility.

### Webhooks

`new WebhookWrapper(provider, endpoint, signal)` POSTs the interaction as JSON.
The service must complete the action before responding with HTTP 2xx and
`{ "id": "<interaction-id>", "completed": true }`, or report handler failure with
`{ "id": "<interaction-id>", "error": "Failure description" }`. A valid error
reply rejects the interaction with that message; malformed replies also fail.
Redirects and credentials are disabled. In browsers, the endpoint must allow CORS.

Payloads can contain sensitive transaction data. Use a trusted endpoint, HTTPS
outside loopback, and test data.

## Runtime and Dependencies

The package publishes ESM, CommonJS, and TypeScript declarations. It uses modern
Web APIs including `AbortSignal.any`, `AbortSignal.timeout`, `crypto.randomUUID`,
`EventTarget`, and `fetch`; use a modern browser or Node.js 24 or later.

The SDK is imported only for types but remains an installed dependency because
the declarations reference it. The only runtime dependency is Zod.
This package does not directly depend on the conformance tool, React,
Playwright, or CTRF; transitive SDK dependencies are still installed.

## Development

```sh
pnpm --filter @canton-network/core-provider-conformance build
pnpm --filter @canton-network/core-provider-conformance test
pnpm --filter @canton-network/core-provider-conformance typecheck
```
