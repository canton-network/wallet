# Wallet extension

A browser extension wallet built with [WXT](https://wxt.dev), React, MUI, TanStack Router and TanStack Query.

```sh
pnpm --filter @canton-network/wallet-extension dev   # Chrome, with hot reload
pnpm nx run-many -t typecheck lint test build -p @canton-network/wallet-extension
```

## Layout

The top-level folders in `src/` follow the runtime the code runs in. The service worker, content script and extension pages don't share memory, so each gets its own folder.

```
src/
├── entrypoints/      WXT entry files for background.ts, content.ts, popup/ and app/ (the full-page tab)
├── background/       service worker code, without DOM or React
│   ├── controllers/
│   │   ├── dapp/     dApp API: controller.ts, the dispatch.ts entry point and rpc-gen/
│   │   └── user/     user API: one module per area (sessions.ts, wallets.ts, …) and rpc-gen/
│   ├── vault/        the encrypted vault: crypto, envelope format, the lock/unlock coordinator and requireUnlocked
│   ├── store/        the wallet store: the holder that keeps it in the vault, the snapshot format, the default config, the registries item and the approved sites item
│   ├── token/        the token service: sdk.ts builds the wallet SDK, service.ts is what the pages call
│   ├── vault-service.ts  vault messages for the extension pages
│   ├── trusted-service.ts  isTrustedSender and registerTrustedService, for services only the extension pages may call
│   ├── dapp-service.ts  registerDappService, which takes each dApp request's origin from the browser
│   ├── site-approval.ts  the pending site approvals that a dApp's connect waits on
│   ├── tx-approval.ts  the transactions a dApp asked for that wait for the user's approval
│   ├── unlock-request.ts  the tabs whose locked connect shows the unlock page
│   ├── tab-icon.ts   what each tab's toolbar icon opens, for the three above
│   ├── page-presence.ts  the content scripts' presence ports, which tell when a dApp page unloads
│   ├── auth-context.ts, session-check.ts, status.ts, notifications.ts, open-ui.ts
│   └── index.ts      startBackground()
├── content/          content script code: startContent(), the JSON-RPC proxy and the notification relay
├── shared/           code that more than one runtime imports: service keys, ports, storage items, logger
├── __tests__/        test helpers such as fake-port.ts
└── ui/               React code for the extension pages
    ├── app/          mount, providers, router, query client and devtools
    ├── routes/       TanStack Router file routes and the generated routeTree.gen.ts
    ├── features/     one folder per product area, such as parties/ and vault/
    ├── components/   UI that several features use, such as AppShell
    ├── lib/query/    keys.ts with the query key factory
    └── theme/        MUI theme, tokens and fonts
```

## Conventions

### Entrypoints

Entry files only call into `src/`. `entrypoints/background.ts` calls `startBackground()` from `background/`, `entrypoints/content.ts` calls `startContent()` from `content/`, and the popup and app pages call `mountApp()` from `ui/app/mount`.

### Background

Chrome stops an idle service worker and starts it again for the next message or port connect. That event is lost if its listener isn't there yet, so `startBackground()` adds every listener (`registerService`, `registerTrustedService`, `runtime.onConnect`, `runtime.onMessage`) before its first `await`. Code that needs the wallet store takes a `getStore()` callback, which waits for the store to load.

### Vault

`background/vault/` keeps data encrypted in `local:vault`. The key comes from the user's password through PBKDF2-SHA-256, and the data is encrypted with AES-256-GCM. While the vault is unlocked, the decrypted data is in the background's memory and the key is cached in `session:vaultSession`. After a service worker restart, `startBackground()` restores the vault from that cached key without the password. Closing the browser, reloading the extension or pressing Lock clears it. Store secrets with `vault.defineItem(key, { fallback })`, which has the same shape as a WXT storage item.

The vault holds the wallet store (item `walletStore`, see [Wallet store](#wallet-store)), the auth context (item `authContext`), which is the signed-in user's access token and user ID, the signing keys and signing transactions of the wallet-kernel driver (item `signingStore`), the token standard registry URLs by network ID (item `registries`, see [Token service](#token-service)), and the sites each user approved for the dApp API (item `approvedSites`, see [Site approval](#site-approval)). `createAuthContextStore(vault)` in `background/auth-context.ts` reads and writes the auth context, and its methods reject with `VaultLockedError` while the vault is locked. A lock doesn't sign the user out, so after an unlock the same user is signed in again. A reset deletes the token with everything else.

The pages send `vault.getStatus`, `vault.create`, `vault.unlock` and `vault.lock` through `vaultMessenger` (`shared/vault-protocol.ts`). `vault-service.ts` answers them only from `popup.html` and `app.html`. Errors arrive as plain `Error`s, so compare `error.name` with `VaultErrorName`. While the vault isn't unlocked, every user API method rejects with `VaultLockedError`. The dApp dispatcher answers `status`, `isConnected` and `connect` with a not-connected result whose reason is `Locked`, and every other method with error 4100. Its `connect` also shows the unlock page on the site's tab (see [Site approval](#site-approval)).

The pages connect to a network through `authMessenger` (`shared/auth-protocol.ts`), which `auth-service.ts` answers only from `popup.html` and `app.html`. `auth.getStatus` says whether the pages are connected: a signed-in user whose token hasn't expired, with a session for `EXTENSION_ORIGIN`. `auth.connect` signs in to the network's IdP, stores the token as the auth context and adds that session, so the token never reaches the pages. Two flows are supported so far:

- `authorization_code` runs in `browser.identity.launchWebAuthFlow` with PKCE (`oauth.ts`), so the IdP must allow `browser.identity.getRedirectURL()` (`https://<extension-id>.chromiumapp.org/` in Chrome) as a redirect URI for the network's client.
- `self_signed` is for development ledgers that accept HS256 tokens. The connect page asks for a client ID and secret and sends them with `auth.connect`. The background checks the secret against the network's `auth.clientSecret`, rejects a wrong one with `InvalidCredentialsError`, and signs the token itself, with the entered client ID as the user ID.

The pages and the content script call the background through [`@webext-core/proxy-service`](https://webext-core.aklinker1.dev/proxy-service/installation). `shared/service-keys.ts` defines the keys:

- `USER_RPC_KEY` is the user API, for the extension pages.
- `TOKEN_RPC_KEY` is the token service, for the extension pages. See [Token service](#token-service).
- `SITE_APPROVAL_RPC_KEY` is for the site approval page. See [Site approval](#site-approval).
- `TX_APPROVAL_RPC_KEY` is for the transaction approval page. See [Transaction approval](#transaction-approval).
- `DAPP_RPC_KEY` is the dApp dispatcher, for the content script. `registerDappService` (`background/dapp-service.ts`) answers it, because proxy-service's `registerService` drops the sender. The content script calls `request(request)`, and the background takes the origin from the message sender (`sender.origin`, or the origin of `sender.url` in Firefox). It refuses a sender without an http or https origin, which includes `file:` pages and the extension's own pages. The content script starts nothing on a page whose own origin is opaque (`window.origin` is `'null'`), such as a CSP-sandboxed page, because in Firefox the background only sees the page's URL. The dispatcher builds the dApp controller for that origin, calls only the controller's own methods (`Object.hasOwn`) and always resolves to a JSON-RPC response. Thrown errors become JSON-RPC errors that keep their code.

`registerService` ignores the sender, so the user API and the token service use `registerTrustedService` (`background/trusted-service.ts`) instead. It answers the same `createProxyService` messages, but only from `popup.html` and `app.html`, and it calls only the service's own methods (`Object.hasOwn` at every step of the path), so paths such as `token.constructor` are refused. Both services also sit behind `requireUnlocked` (`background/vault/`), which wraps every method, nested ones included, so it rejects with `VaultLockedError` while the vault isn't unlocked.

The content script answers every dApp request that has an id. When the background can't be reached, for example after an extension reload, it replies with a JSON-RPC error.

### Wallet store

The wallet store holds the networks, IdPs, parties, sessions and transactions. It lives in the vault item `walletStore` as one versioned snapshot, and every store write replaces that snapshot. `createWalletStore(vault)` in `background/store/` builds the store on the first `getStore()` after unlock and drops it on lock. While the vault is locked, `getStore()` rejects with `VaultLockedError`. A new vault starts from `default-config.ts`, so editing that file doesn't change existing installs until their vault is reset. It seeds two networks:

- `canton:local-oauth` is the Canton participant on `http://127.0.0.1:5003`, with the mock OAuth IdP on `http://127.0.0.1:8889`.
- `canton:localnet` is the Splice LocalNet ledger on `http://localhost:2975`. It signs in with `self_signed` tokens and the secret `unsafe`. A vault created before this network was added doesn't have it until it's reset.

### Token service

The background builds the wallet SDK (`@canton-network/wallet-sdk`) for the signed-in user and the current network, and the pages call it through `TOKEN_RPC_KEY`, so the access token never leaves the background. The service has the SDK's nesting but only a few read methods: `token.assets()`, `token.v1.utxos.list()` and `token.v2.utxos.list()`. It never hands out the SDK itself, which also has the ledger, party and keys APIs. Every method needs a signed-in user, and a method that takes a `partyId` rejects a party that isn't one of the user's wallets.

- `token/sdk.ts` builds the SDK for every call, from the current network, access token and registry URLs. A network without a `synchronizerId` defaults to the connected synchronizer with the alias `global`, or the first one.
- The SDK is built with `registryAuth: 'none'`. Without it the SDK sends the user's ledger token to every registry.
- Registry URLs come from the vault item `registries` (`store/registries.ts`). A new vault starts with `http://scan.localhost:4000` for `canton:localnet`.
- Results have to survive runtime messaging, which turns a `URL` into a string and a `Date` into an ISO string. `token.assets()` returns `registryUrl` as a string.

### Site approval

A site can use the dApp API only after the signed-in user approves it. Approvals are kept per user and site in the vault (`store/approved-sites.ts`).

- `connect` from a new site shows an approval prompt in the toolbar popup of that site's tab, with a badge on the icon. No window opens. A locked `connect` shows the unlock page the same way.
- Before approval, only `connect`, `isConnected`, `disconnect` and a `status` without the token or user work. Other methods return 4100.
- Each site is kept separate: the origin comes from the browser, events and the token go only to that site, and `disconnect` forgets only that site.
- Approved sites can call `ledgerApi`, which forwards to the current network's ledger with the user's token.
- An approved site keeps the token it was given until it expires, even after it disconnects.

### Transaction approval

A transaction a site asks for appears on the toolbar icon of that site's tab, where the user approves or rejects it (`background/tx-approval.ts`, `ui/features/transactions/`).

- `prepareExecuteAndWait` also returns the outcome: the executed transaction, or the error the prompt ended with.
- A prompt ends after 4 minutes, or when the vault locks, the user signs out or the page goes away.
- Its events go only to the site that asked.

### Controllers

`core/rpc-generator` writes the `rpc-gen/` folders from the OpenRPC specs in `api-specs/`. Don't edit them by hand. After a spec change, regenerate them from the repository root:

```sh
pnpm generate:user && pnpm generate:dapp
pnpm exec oxfmt wallet-gateway/wallet-extension/src/background/controllers
```

The user controller is split by area. Each module in `controllers/user/` returns a `Pick<Methods, …>` with the methods of its area, and `index.ts` spreads them into `buildController`. The generated `buildController` requires every method, so `tsc` fails when one is missing. Add a method to the module of its area. Methods the extension doesn't support go in `unsupported.ts`.

### Logging

Import `logger` (LogTape) from `shared/logger.ts`. Importing it configures a LogTape console sink for that context, which also receives the core libraries' records. A record's properties are appended to the message as an object. Don't log request or response payloads, notification arguments or tokens. Tests run with logging disabled.

### Naming

`shared/brand.ts` exports `WALLET_NAME`. The manifest name and the provider name announced to dApps come from it. It is "Wallet Extension" so that the old extension can stay installed next to this one.

### Routes

A route file contains the path, `validateSearch`, `beforeLoad`, `loader` and a page component imported from a feature. The page itself lives in the feature folder. `autoCodeSplitting` still gives each page its own chunk.

Pages that need an unlocked vault go under the pathless `_unlocked` layout, which renders them inside `AppShell`. Its `beforeLoad` sends the user to `/onboarding/password` before a vault exists and to `/unlock` while it's locked. `/onboarding` and `/unlock` sit outside it.

A route that loads data looks like this:

```tsx
// src/ui/routes/_unlocked/parties/index.tsx
import { PartiesPage, walletsQuery } from '@/ui/features/parties'

export const Route = createFileRoute('/_unlocked/parties/')({
    loader: ({ context }) => context.queryClient.ensureQueryData(walletsQuery(...)),
    component: PartiesPage,
})
```

### Features

A feature folder holds the pages for one product area, an `api.ts` with its `queryOptions` factories and mutation hooks, and a `components/` folder for UI that only this feature uses. Its `index.ts` exports what the rest of the app may use, and other code imports from `@/ui/features/<name>` instead of files inside the folder.

Create a feature folder when you port its first page. UI that several features use goes in `ui/components/`. Presentational components that the remote web UI could also use go in `core/wallet-ui-components/src/react`, which has Storybook.

### State

- TanStack Query holds server state. Build query keys with `queryKeys` from `ui/lib/query/keys.ts`. After a mutation, invalidate with the key's `all` prefix.
- WXT storage items hold persisted state. Define them with `storage.defineItem` in `shared/storage.ts`, and keep the storage keys stable, since existing installs read them. To follow writes from another context, subscribe with the item's `watch()`. For example, `watchVaultStatus()` (in `features/vault/`) watches `session:vaultStatus` from `mountApp`, so every open page clears its query cache and re-runs its route guards when the vault locks.
- React state holds everything else. Don't add a global store library.

### Imports

Oxlint (`.oxlintrc.json`) blocks these imports:

| Code in                          | May not import                                       |
| -------------------------------- | ---------------------------------------------------- |
| `ui/`, popup and app entrypoints | values from `background/` or `content/`              |
| `background/`                    | anything from `ui/`, or values from `content/`       |
| `content/`                       | anything from `ui/`, or values from `background/`    |
| `shared/`                        | anything from `ui/`, or values from other runtimes   |
| any file                         | the `@mui/material` or `@mui/icons-material` root    |
| any file                         | the `@canton-network/core-wallet-ui-components` root |

`import type` across runtimes is allowed. Import MUI by path, for example `@mui/material/Button`. Import the shared UI from the subpaths of `@canton-network/core-wallet-ui-components`, because the package root loads Lit and Bootstrap CSS:

- `/react` has the native React components, as well as the React wrappers for the Lit components that the remote UI uses. For the wrappers, props go to the element as properties, so don't pass `undefined` for a prop that has a default (`signingProviders={data ?? []}`): the wrapper assigns it and replaces the default. Events are camelCase props that receive the event, such as `onWalletAllocate={(event) => event.wallet}`.
- `/logic` has the framework-agnostic logic that both UIs share, such as the parties toasts and wallet loading. It has no UI imports.

The Lit components take their colours from `--wg-theme-*` CSS variables, which inherit through shadow roots. `ui/theme/lit-bridge.ts` sets them on the root element from this app's colour schemes, so they follow the MUI theme and dark mode, nested components included.

Use the `@/` alias to import across top-level folders. The lint rule doesn't check dynamic `import()`.

## Tests

Unit tests live next to the code as `*.test.ts` files. They run in Node with `WxtVitest`, which replaces `wxt/browser` and the global `chrome` with an in-memory fake browser. Call `fakeBrowser.reset()` in `beforeEach`. The fake browser doesn't implement every API, for example `runtime.onConnect`. Stub those with `vi.spyOn`. Shared test helpers live in `src/__tests__/`, and coverage skips that folder and the generated `rpc-gen/` folders. Nx infers the `test` target from `vitest.config.ts`.

```sh
pnpm nx test @canton-network/wallet-extension
```

## Devtools

`pnpm dev` shows the TanStack devtools with Router and Query panels. The root route only imports them when `import.meta.env.DEV` is true, so production builds leave them out.
