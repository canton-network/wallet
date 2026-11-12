// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Runs the given command once dev-libs (tsdown.dev.ts) has built all libraries,
// so dev servers started by `pnpm start:all` find them in dist/

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { setTimeout } from 'node:timers/promises'

const readyFile = new URL(
    '../../node_modules/.cache/dev-libs-ready',
    import.meta.url
)

if (!existsSync(readyFile)) console.log('Waiting for dev-libs to build...')
while (!existsSync(readyFile)) await setTimeout(200)

const [command, ...args] = process.argv.slice(2)
spawn(command, args, { stdio: 'inherit' }).on('exit', (code) =>
    process.exit(code ?? 1)
)
