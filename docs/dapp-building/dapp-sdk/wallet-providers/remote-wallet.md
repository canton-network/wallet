---
title: "Remote Wallet"
description: "Expose a remote (server-side) wallet to Canton dApps via a CIP-103 RPC endpoint."
---

Remote wallets are server-side wallets. They are not injected into the page; instead they
expose a CIP-103 RPC endpoint over HTTP/SSE, and dApps register that endpoint with a
`RemoteAdapter`. Remote wallets implement the asynchronous
[dApp API](/sdks-tools/sdks/dapp-sdk/reference/provider-api#sync-and-async-apis), where
actions that need user interaction are completed through a `userUrl` redirect.

## Expose a CIP-103 endpoint

Your service must expose a public RPC URL that implements the CIP-103 request methods and
event stream. The SDK ships with a default list of remote wallets; additional ones are
added by dApps at runtime.

## Getting dApps to list your wallet

DApps add your endpoint to their wallet picker with a `RemoteAdapter` pointed at your public
RPC URL. Share that URL and a display name with integrating dApps. The dApp-side
registration steps are covered in
[Wallet discovery](/sdks-tools/sdks/dapp-sdk/guides/wallet-discovery).

## Requirements

- Serve the CIP-103 RPC methods and event stream at a stable, public URL.
- Configure CORS to allow the origins of the dApps that will connect.
- Manage user sessions and issue the session token (JWT) the endpoint expects.
- Handle authorization and signing on your side; never expose keys to the dApp.

## Next steps

<Card title="CIP-103 Specification" href="https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md">
  The methods and events your endpoint must implement.
</Card>
