# Canton Wallet Browser Extension

The browser extension Wallet for Chrome and Firefox.

> **Disclaimer:** This extension is under heavy development and is not recommended for production use.

# Building

The extension's source code is written in TypeScript and built with `WXT`.

Run `pnpm build` to run the build once, or `pnpm dev` to keep WXT watching for changes. (Note that this runs automatically with `pnpm start:all` from the root script).

# Developing

## Chrome

- See the tutorial on [loading an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) for Google Chrome
- See the tutorial on [debugging techniques](https://developer.chrome.com/docs/extensions/get-started/tutorial/debug) in Google Chrome

## Firefox

Run `pnpm dev:firefox` to start an isolated FF instance with the extension loaded. To aid development, follow the debugging workflow:

1. Navigate to `about:debugging`
2. Click on "This Firefox"
3. Click on the "Inspect" button under the Splice Wallet Gateway
4. (Optional) open the three dot menu on the right, and click "Disable Popup Auto-Hide" to prevent the extension window from closing automatically when switching between the Dev Tools window and the main browser window
