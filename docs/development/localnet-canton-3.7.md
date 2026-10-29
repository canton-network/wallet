<!--
Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Running LocalNet, the traffic test and the paymaster UI against Canton 3.7

This guide explains how to run the repo against a LocalNet that runs **Canton 3.7**
(instead of the 3.6 line the published Splice releases ship), so that both:

- `sdk/wallet-sdk/src/wallet/namespace/traffic/purchase.integration.test.ts`, and
- the `examples/traffic-paymaster` UI and its backend scripts

work end to end.

## Why a local Splice build is required

LocalNet does **not** take its Canton version from `version-config.json`. It pulls the
`ghcr.io/digital-asset/decentralized-canton-sync/docker/<image>:${IMAGE_TAG}` images, where
`IMAGE_TAG` is the **Splice** version. Each Splice release bundles one Canton version:

| Splice release         | Canton bundled                    |
| ---------------------- | --------------------------------- |
| `0.9.4` (latest)       | `3.6.4`                           |
| `0.9.0`                | `3.6.1`                           |
| `0.8.4` (repo default) | `3.5.19` runtime / `3.6` JSON API |

No published Splice release bundles Canton 3.7. Canton 3.7 exists only on Splice `main`
(Splice version `0.10.0`), whose images are **not** published to the public registry — Splice CI
builds them locally. So to get Canton 3.7 into LocalNet you must build the Splice `main` images
yourself.

The newest Canton 3.7 snapshot at the time of writing (read from Splice `main`'s
`nix/canton-sources.json`) is:

```
3.7.0-snapshot.20261027.20812.0.v1af931f4
```

## What changed in this repo (already committed)

- `scripts/src/lib/version-config.json` — devnet `canton.version` bumped to the Canton 3.7 snapshot
  (and its hash). This drives `fetch-canton` and the generated JSON Ledger API clients.
- `api-specs/ledger-api/3.7.0/` + `core/ledger-client-types/src/generated-clients/*-3.7.0*` — the
  regenerated Canton 3.7 ledger-API OpenAPI/AsyncAPI specs and clients (the 3.6 ones are removed).
- `core/ledger-client-types/src/index.ts`, `core/tx-parser/src/parser.test.ts` — repointed from the
  `3.6` client to the `3.7` client.
- `scripts/src/start-localnet.ts` — new env overrides so LocalNet can use a locally-built Splice:
  `LOCALNET_COMPOSE_DIR`, `SPLICE_IMAGE_TAG`, `SPLICE_IMAGE_REPO`.
- `sdk/wallet-sdk/src/wallet/namespace/traffic/test-support/traffic-scan.ts` — the test's stand-in
  TEA now matches the `PublishCredit` interface by its **module-qualified name**. Canton 3.7 reports
  an exercised event's `interfaceId` package-**id** qualified (`<hash>:Canton.Traffic.Credit:…`)
  rather than package-**name** qualified (`#canton-traffic-credit:…`), which the old exact-string
  match missed. (The paymaster example's `scan-topup.ts` already matched this way.)

## Step 1 — Build the Splice `main` images (Canton 3.7)

Prerequisites: `nix`, `direnv`, Docker, and ~15 GB free disk. The `canton` image is cheap (it layers
a config file onto the public `canton-base` image); the `splice-app` + web-UI images come from one
`sbt bundle` (~5 min of Scala/UI build) plus docker builds.

```bash
# Clone Splice main next to the wallet repo
cd <workspace>
git clone --depth 1 https://github.com/hyperledger-labs/splice.git splice-src
cd splice-src
direnv allow .          # loads the nix dev shell + SPLICE_ROOT, CANTON_VERSION, etc.

# Build the release bundle (splice-node.tar.gz) and the localnet images
direnv exec . bash -c 'sbt bundle'
direnv exec . bash -c 'make -j1 \
  cluster/images/canton/docker-build \
  cluster/images/splice-app/docker-build \
  cluster/images/splice-web-ui/docker-build \
  cluster/images/wallet-web-ui/docker-build \
  cluster/images/scan-web-ui/docker-build \
  cluster/images/sv-web-ui/docker-build \
  cluster/images/ans-web-ui/docker-build'
```

The images are tagged `<image>:0.10.0-<user>-dirty` (`get-snapshot-version`). Retag them under the
registry prefix LocalNet's compose expects, so the default `IMAGE_REPO` resolves to them locally
(Docker uses a locally-present tag and does not pull):

```bash
PREFIX=ghcr.io/digital-asset/decentralized-canton-sync/docker
TAG=0.10.0-$(whoami)-dirty
for img in canton splice-app splice-web-ui wallet-web-ui scan-web-ui sv-web-ui ans-web-ui; do
  docker tag "$img:$TAG" "$PREFIX/$img:$TAG"
done
```

Confirm the canton image is really 3.7:

```bash
docker run --rm "$PREFIX/canton:$TAG" --version   # Canton: 3.7.0-snapshot.20261027...
```

## Step 2 — Generate the Canton 3.7 clients and build the SDK

(Already committed, but to regenerate from scratch:)

```bash
cd <workspace>/wallet
pnpm install
pnpm nx run @canton-network/scripts:... # or:
npx tsx scripts/src/fetch-canton.ts --network=devnet --updateHash
npx tsx scripts/src/generate-openapi-clients.ts --network=devnet
npx tsx scripts/src/generate-asyncapi-clients.ts --network=devnet
# then repoint core/ledger-client-types/src/index.ts from 3.6 -> 3.7 (done in this branch)

pnpm build:all
pnpm generate:traffic-purchase   # builds the traffic-purchase-models DAR the test uploads
```

## Step 3 — Start LocalNet on Canton 3.7

Point `start-localnet` at the Splice `main` compose and the locally-built image tag. Multi-sync is
not needed for the traffic flow, so start without it:

```bash
cd <workspace>/wallet
export LOCALNET_COMPOSE_DIR=<workspace>/splice-src/cluster/compose/localnet
export SPLICE_IMAGE_TAG=0.10.0-$(whoami)-dirty
npx tsx scripts/src/start-localnet.ts start --no-multi-sync
```

If you previously ran a different LocalNet, clear its volumes first
(`docker compose ... down -v`) so an older Postgres data dir doesn't block startup.

Verify the running Canton version:

```bash
curl -s http://localhost:2975/v2/version | head -c 80
# {"version":"3.7.0-snapshot.20261027.20812.0.v1af931f4", ...
```

## Step 4 — Run the integration test

```bash
cd <workspace>/wallet/sdk/wallet-sdk
pnpm test:integration src/wallet/namespace/traffic/purchase.integration.test.ts
```

Expected: **1 passed**. The flow buys traffic for an external party against Canton 3.7 and the
stand-in scan tops the balance up.

> Note: a freshly-started LocalNet occasionally rejects the Amulet tap with
> `OpenMiningRound active at current moment not found` — a Splice amulet mining-round timing quirk,
> not a Canton 3.7 issue. Re-run once a round is active (rounds advance roughly every 10 min).

## Step 5 — Run the paymaster UI

```bash
cd <workspace>/wallet/examples/traffic-paymaster
pnpm initialize          # allocates the paymaster, prices traffic, pre-approves it
pnpm serve-paymaster     # terminal 1 — the off-ledger paymaster API the UI reads
pnpm scan-topup          # terminal 2 — watches the ledger and credits purchases
pnpm dev                 # terminal 3 — http://localhost:8081
```

`initialize`, `serve-paymaster` and `scan-topup` all run against Canton 3.7, and the UI builds
(`pnpm build`) against the updated SDK. Connect a wallet (`pnpm start:all` from the repo root),
fund the party with `pnpm tap-amulet <partyId>`, then buy traffic in the UI; `scan-topup` applies
the credit and the balance updates.

## Teardown

```bash
cd <workspace>/wallet
export LOCALNET_COMPOSE_DIR=<workspace>/splice-src/cluster/compose/localnet
export SPLICE_IMAGE_TAG=0.10.0-$(whoami)-dirty
npx tsx scripts/src/start-localnet.ts stop --no-multi-sync
```
