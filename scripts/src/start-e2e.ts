// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Builds and starts the e2e services of ecosystem.ci.config.js: the Wallet
// Gateway, the mock OAuth server and the given example dApps (all of them if
// none are given), so e.g. the ping e2e tests don't build the other examples.

import { execFileSync } from 'node:child_process'
import path from 'node:path'

import { Command } from '@commander-js/extra-typings'

import { repoRoot } from './lib/utils.ts'

type App = { name: string; script: string }

const ecosystem = path.join(repoRoot, 'ecosystem.ci.config.js')
const { apps } = (await import(ecosystem)) as { apps: App[] }
const isExample = (app: App) => app.name.startsWith('example-')
const examples = apps.filter(isExample).map((app) => app.name)

const program = new Command()
    .argument(
        '[examples...]',
        `example dApps to start (${examples.join(', ')})`
    )
    .parse()

const selected = program.processedArgs[0]
const unknown = selected.filter((name) => !examples.includes(name))
if (unknown.length > 0) {
    program.error(`Unknown example dApps: ${unknown.join(', ')}`)
}
const started = apps.filter(
    (app) =>
        !isExample(app) || selected.length === 0 || selected.includes(app.name)
)

const projects = started.map((app) => {
    const project = /--filter (\S+)/.exec(app.script)?.[1]
    if (!project) throw new Error(`No --filter in the script of ${app.name}`)
    return project
})

const run = (command: string, args: string[]) =>
    execFileSync(command, args, { cwd: repoRoot, stdio: 'inherit' })

run('pnpm', ['nx', 'run-many', '-t', 'build', '-p', ...projects])
run('pnpm', [
    'exec',
    'pm2',
    'start',
    ecosystem,
    '--only',
    started.map((app) => app.name).join(','),
])
