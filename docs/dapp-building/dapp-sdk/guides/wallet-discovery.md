---
title: "Wallet Discovery"
description: "Customize the wallet picker, add WalletConnect, and register custom remote wallets."
---

By default, `sdk.init()` makes the wallet picker list every CIP-103 wallet the SDK can
discover: browser wallets that announce themselves, plus the SDK's built-in list of remote
wallets. Registering adapters lets you add more wallets (such as WalletConnect or a custom
remote wallet) or restrict the list.

The adapters you register in `init()` determine what the SDK can discover and what the
user sees in the **wallet picker** opened by `connect()`.

- If an adapter is registered (and passes `detect()`), it can appear as an entry in the picker.
- Session restore only works for adapters that are registered.

## Use the built-in remote wallets

Registering with no options uses the SDK's default list of remote wallets plus any browser
wallets that announce themselves.

```typescript
await sdk.init()
```

## Add adapters

Use `additionalAdapters` to add wallets while keeping the default remote wallets.

### Add WalletConnect

```typescript
import * as sdk from '@canton-network/dapp-sdk'
import { WalletConnectAdapter } from '@canton-network/dapp-sdk'

const wc = WalletConnectAdapter.create({
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
})

await sdk.init({ additionalAdapters: [wc] })
```

<Warning>
Treat your WalletConnect `projectId` as configuration, not a secret to hardcode. Inject it
through an environment variable as shown above.
</Warning>

### Add a custom remote wallet

```typescript
import { RemoteAdapter } from '@canton-network/dapp-sdk'

await sdk.init({
  additionalAdapters: [
    new RemoteAdapter({
      name: 'My Remote Wallet',
      rpcUrl: 'https://my-wallet.example/api/v0/dapp',
    }),
  ],
})
```

### Add a custom extension adapter

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

## Replace the default remote wallets

To offer only specific remote wallets (and not the SDK defaults), pass `defaultAdapters`.

```typescript
import { RemoteAdapter } from '@canton-network/dapp-sdk'

await sdk.init({
  defaultAdapters: [
    new RemoteAdapter({
      name: 'Production Wallet',
      rpcUrl: 'https://wallet.example/api/v0/dapp',
    }),
  ],
})
```

## Register no remote wallets

Pass an empty list to explicitly choose "none". This is useful if your dApp only supports
injected or announced wallets, or only adapters you add yourself.

```typescript
await sdk.init({ defaultAdapters: [] })
```

## Restrict to approved wallets

Combining `defaultAdapters` with a fixed list lets you constrain the picker to a set of
remote wallets you have vetted, which is a common production requirement.

```typescript
await sdk.init({
  defaultAdapters: [
    new RemoteAdapter({ name: 'Approved Wallet', rpcUrl: 'https://approved.example/api/v0/dapp' }),
  ],
})
```

## Next steps

<CardGroup cols={2}>
  <Card title="Wallet Providers" href="/sdks-tools/sdks/dapp-sdk/wallet-providers/integration-overview">
    How wallets make themselves discoverable.
  </Card>
  <Card title="Adapters Reference" href="/sdks-tools/sdks/dapp-sdk/reference/sdk-methods">
    Adapter constructors and options.
  </Card>
</CardGroup>
