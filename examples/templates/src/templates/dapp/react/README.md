# Canton dApp (React)

A [React](https://react.dev/) + [Vite](https://vite.dev/) starter for the
[Canton dApp SDK](https://www.npmjs.com/package/@canton-network/dapp-sdk).

```bash
pnpm install
pnpm dev
```

Open the printed URL and select **Connect wallet**. The app shows the wallet,
network, and shared accounts. Select **Ping** to submit a Ping for the primary
account, then expand a transaction event to inspect its details. Reloading the
page restores the wallet session if one is available.

Edit [the app](./src/App.tsx) to change the wallet interactions. Run
`pnpm build` to type-check and create a production build, or `pnpm preview` to
serve that build locally.
