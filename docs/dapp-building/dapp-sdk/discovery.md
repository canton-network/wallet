# Discovery & adapter registration

Adapters you register in `init()` determine what the SDK can discover and what the
user will see in the **wallet picker** opened by `connect()`. In other words:

- If an adapter is registered (and passes `detect()`), it can show up as an entry in the picker.
- Session restore can only happen for adapters that are registered.

## Option 1: Use the built-in default remote wallets

This registers the SDK’s default remote wallet list (from `gateways.json`) plus any wallets that announce via `canton:announceProvider`:

```typescript
await sdk.init()
```

By default, `init()` also loads the SDK’s bundled **verified wallet** list from `wallets.json` (see below).

## Verified wallets

The SDK ships curated wallet lists for the picker. There are two bundled files, serving different wallet types and roles:

| File                                                                                                 | Typical `type` values                    | Role                                                                                                                    |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`gateways.json`](https://github.com/canton-network/wallet/blob/main/sdk/dapp-sdk/src/gateways.json) | `remote`                                 | Pre-registered **remote** wallets (`RemoteAdapter` defaults) — connectable entries in the main picker list              |
| [`wallets.json`](https://github.com/canton-network/wallet/blob/main/sdk/dapp-sdk/src/wallets.json)   | `browser`, `desktop`, `mobile`, `remote` | **Verified** wallets not yet available to the user — install or setup prompts shown when no matching wallet is detected |

### Verified wallet list (`wallets.json`)

When a wallet from this list is not already detected (matched by `providerId`), the picker shows it under **Suggested Wallets** with links to install or set it up. Verified entries are **not** registered as adapters.

On `init()`, when `enableSuggestedWallets` is `true` (the default), the bundled `wallets.json` is passed to the picker UI.

**Example entry (browser extension):**

```json
{
    "name": "Example Wallet",
    "type": "browser",
    "providerId": "browser:ext:uniqueextensionid",
    "description": "Connect via a browser extension wallet",
    "icon": "https://example.com/favicon.svg",
    "installUrls": [
        {
            "platform": "chrome",
            "url": "https://chromewebstore.google.com/detail/..."
        }
    ]
}
```

| Field         | Description                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | Display name in the picker                                                                                                                                  |
| `type`        | Provider type: `browser`, `desktop`, `mobile`, or `remote`                                                                                                  |
| `providerId`  | Must match the wallet’s discovery id once installed (e.g. `browser:ext:<id>` for extensions, `remote:<rpcUrl>` for remote wallets)                          |
| `description` | Optional short description                                                                                                                                  |
| `icon`        | Optional icon URL                                                                                                                                           |
| `installUrls` | Setup or install links. For `browser` wallets, use `chrome` / `firefox` store URLs. For other types, link to download pages, app stores, or onboarding docs |

**Adding a wallet:** Wallet authors can open a PR that adds an entry to `wallets.json`. The `providerId` must match how the wallet appears once available — for extensions, this is typically what the wallet announces via `canton:announceProvider` (`browser:ext:<id>`).

**Disabling the verified list:** dApps that do not want the bundled list can opt out:

```typescript
await sdk.init({ enableSuggestedWallets: false })
```

### Default remote wallets (`gateways.json`)

Remote wallets in `gateways.json` are registered automatically as `RemoteAdapter` instances (see Option 1). Use this file for verified remote wallets that should appear as connectable picker entries out of the box, rather than as install/setup prompts.

## Option 2: Add adapters (recommended)

Use `additionalAdapters` to add extra wallets (custom remote wallets, WalletConnect, etc.) while keeping
the default remote wallets.

### Add WalletConnect

```typescript
import { WalletConnectAdapter } from '@canton-network/dapp-sdk'

const wc = WalletConnectAdapter.create({
    projectId: import.meta.env.VITE_WC_PROJECT_ID,
})

await sdk.init({ additionalAdapters: [wc] })
```

### Add a custom remote wallet URL

```typescript
import { RemoteAdapter } from '@canton-network/dapp-sdk'

await sdk.init({
    additionalAdapters: [
        new RemoteAdapter({
            name: 'My Gateway',
            rpcUrl: 'https://my-gateway.example/api/v0/dapp',
        }),
    ],
})
```

### Add a custom extension adapter (postMessage target)

```typescript
import { ExtensionAdapter } from '@canton-network/dapp-sdk'

await sdk.init({
    additionalAdapters: [
        new ExtensionAdapter({
            providerId: 'browser:ext:com.example.mywallet' as never,
            name: 'My Wallet',
            target: 'com.example.mywallet',
        }),
    ],
})
```

## Option 3: Replace the default remote wallets

If you want to _only_ offer specific remote wallets (and not the SDK defaults), provide `defaultAdapters`.

```typescript
import { RemoteAdapter } from '@canton-network/dapp-sdk'

await sdk.init({
    defaultAdapters: [
        new RemoteAdapter({
            name: 'Production Gateway',
            rpcUrl: 'https://gateway.example/api/v0/dapp',
        }),
    ],
})
```

## Option 4: Intentionally register no remote wallets

If you pass an empty list, you are explicitly choosing “none” (useful if your dApp only supports
announced extension wallets or adapters you add later).

```typescript
await sdk.init({ defaultAdapters: [] })
```
