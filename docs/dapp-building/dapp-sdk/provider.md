# Wallet providers

This guide is for **wallet and browser-extension authors** who want their product to show up in the **wallet discovery / picker** that the dApp SDK opens on `connect()`.
End-user dApps pull in adapters automatically; wallets choose one or more of the integration paths below.

Discovery runs in the browser (or any environment where `window` exists).
The SDK **merges** these sources, **deduplicates** by `providerId` where applicable, and then passes the list to the wallet picker UI.

## What the SDK registers by default on `connect()`

1. **`RemoteAdapter` entries** — Built-in and configured Wallet Gateway URLs (HTTP/SSE CIP-103 bridge).
2. **Announced extensions** — See [Announcement events (EIP-6963-style)](#announcement-events-eip-6963-style). Each announcement becomes an `ExtensionAdapter` with a **distinct** `providerId` and optional `target`; **`detect()`** must succeed (extension visible and handshake OK).

Additionally, the host dApp may pass **`additionalAdapters`** (or configure `DiscoveryClient` directly) to register more `ExtensionAdapter`, `RemoteAdapter`, or custom adapters.

> **Note:** The SDK does **not** scan `window` for injected providers (for example `window.canton` or `window.canton.<brand>`). Browser wallets must use the announce protocol or be registered explicitly via `additionalAdapters`.

## Remote Wallets (`RemoteAdapter`)

Server-side wallets (such as the Wallet Gateway) are **not** injected into the page; they are listed as remote entries with an RPC URL.
Bundled defaults come from the SDK’s remote wallet list; dApps can add more by calling `init({ additionalAdapters: [...] })` before `connect()`, or by constructing `DiscoveryClient` with extra `RemoteAdapter` instances.

## Browser extension wallets (`ExtensionAdapter`)

Browser extensions communicate with the dApp over **`postMessage`** (CIP-103 sync API). To appear in the picker, an extension must either [**announce**](#announcement-events-eip-6963-style) itself or be registered by the host dApp via **`additionalAdapters`**.

Wallets may still expose a provider on `window.canton` for dApps that integrate directly, but the SDK does not discover wallets by scanning that global. `ExtensionAdapter.detect()` treats `window.canton` as a positive signal when checking whether an announced extension is present.

## Announcement events (EIP-6963-style)

Ethereum’s [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) uses a request/announce event pair so each wallet can identify itself without fighting over one global. The dApp SDK uses the same **pattern** with Canton-specific event names:

| Direction      | Event name                | Payload (`detail`)                                                                                     |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| dApp → wallets | `canton:requestProvider`  | Optional; may be `{}`                                                                                  |
| Wallet → dApp  | `canton:announceProvider` | **`id`** (string, required), **`name`** (string, required), optional **`icon`**, optional **`target`** |

**Behavior:**

- After the dApp dispatches `canton:requestProvider`, wallets should **`dispatchEvent(new CustomEvent('canton:announceProvider', { detail: { ... } }))`** on `window`.
- The SDK collects announcements for a short window (~300 ms by default), then registers one **`ExtensionAdapter` per `id`** with `providerId` `browser:ext:<id>`, display `name`, and routing `target` defaulting to `id` when omitted.
- The extension must still **pass `detect()`**: ready/ack or `window.canton` as implemented in `ExtensionAdapter`, and if you use **`target`**, the content script should only handle `SPLICE_WALLET_*` / RPC traffic whose **`target`** matches (so the correct extension answers).

## Explicit registration by the dApp (`additionalAdapters`)

A wallet can ship instructions for dApps to register a dedicated adapter:

```typescript
import * as sdk from '@canton-network/dapp-sdk'
import { ExtensionAdapter } from '@canton-network/dapp-sdk'

await sdk.init({
    additionalAdapters: [
        new ExtensionAdapter({
            providerId: 'browser:com.example.mywallet', // must be unique in the picker (typed as ProviderId in app code)
            name: 'My Wallet',
            target: chrome.runtime.id, // postMessage routing key; must match your extension
        }),
    ],
})

await sdk.connect()
```

Use a **stable, unique** `providerId` string and the same **`target`** your extension filters on for `WindowTransport` / splice messages.

## Summary: choose your integration

| Goal                                   | Recommended approach                                                       |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Browser extension (default)            | **`canton:announceProvider`** with optional **`target`** for `postMessage` |
| Extension not yet in announce registry | Host dApp registers **`ExtensionAdapter`** via **`additionalAdapters`**    |
| Remote wallet                          | **`RemoteAdapter`** with public RPC URL                                    |
| Mobile / QR wallet                     | **`WalletConnectAdapter`** via **`additionalAdapters`**                    |

Implementing [CIP-103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) RPC and events on the resulting provider is **separate** from picker visibility: discovery only decides **that** a connection option exists; runtime behavior still must honor the spec for dApps to work correctly.
