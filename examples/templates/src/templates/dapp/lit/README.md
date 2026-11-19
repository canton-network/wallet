# Canton dApp (Lit)

A minimal [Lit](https://lit.dev/) + [Vite](https://vite.dev/) dApp that connects
to a Canton wallet with
[`@canton-network/dapp-sdk`](https://www.npmjs.com/package/@canton-network/dapp-sdk)
and lists the accounts the wallet shares.

## Getting started

```bash
pnpm install
pnpm dev
```

Open the printed URL and select **Connect wallet** to pick a wallet from the
SDK's wallet picker.

## Scripts

| Script         | Description                             |
| -------------- | --------------------------------------- |
| `pnpm dev`     | Start the Vite dev server               |
| `pnpm build`   | Type-check and build to `dist/`         |
| `pnpm preview` | Serve the production build from `dist/` |

## Next steps

Edit `src/canton-app.ts`. The SDK also submits transactions
(`prepareExecute`), signs messages and proxies Ledger API requests; see the
[dApp SDK documentation](https://github.com/canton-network/wallet/tree/main/sdk/dapp-sdk#readme).
