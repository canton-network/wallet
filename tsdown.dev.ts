// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Builds and watches all libraries for `pnpm start:all`: ESM only, and dist/ is
// never cleaned, as dev servers importing it would crash (#2469).
// Can be dropped once dev servers import workspace libraries from src.

import { execFile } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { defineConfig, type Rolldown } from 'tsdown'

const run = promisify(execFile)
const tsc = resolve(import.meta.dirname, 'node_modules/.bin/tsc')

const tsdownPackages = ['core', 'sdk']
    .flatMap((dir) => readdirSync(dir).map((name) => resolve(dir, name)))
    .filter((dir) => existsSync(join(dir, 'tsdown.config.ts')))

const tsdownPackageByName = new Map(
    tsdownPackages.map((dir) => {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
        return [pkg.name as string, dir]
    })
)
const declarationsReady = new Map(
    tsdownPackages.map((dir) => [dir, Promise.withResolvers<void>()])
)

function dependenciesDeclared(pkg: Record<string, unknown> = {}) {
    const names = ['dependencies', 'devDependencies', 'peerDependencies']
        .flatMap((field) => Object.keys(pkg[field] ?? {}))
        .flatMap((name) => tsdownPackageByName.get(name) ?? [])
    return Promise.all(names.map((dir) => declarationsReady.get(dir)?.promise))
}

function aborted(signal: AbortSignal): Promise<void> {
    return new Promise((r) => signal.addEventListener('abort', () => r()))
}

let slots = availableParallelism()
const waiting: (() => void)[] = []
async function limited<T>(task: () => Promise<T>): Promise<T> {
    if (slots === 0) await new Promise<void>((r) => waiting.push(r))
    else slots--
    try {
        return await task()
    } finally {
        const next = waiting.shift()
        if (next) next()
        else slots++
    }
}

const changedOutDirs = new Set<string>()
const builtOutDirs = new Set<string>()

// Rewriting unchanged files would restart every dev server using them
const skipUnchanged: Rolldown.Plugin = {
    name: 'dev-skip-unchanged',
    generateBundle({ dir }, bundle) {
        const outDir = resolve(dir ?? '')
        for (const [fileName, output] of Object.entries(bundle)) {
            const file = join(outDir, fileName)
            if (!existsSync(file)) continue
            const next = output.type === 'chunk' ? output.code : output.source
            if (Buffer.from(next).equals(readFileSync(file))) {
                delete bundle[fileName]
            }
        }
        if (Object.keys(bundle).length > 0) changedOutDirs.add(outDir)
    },
}

export default defineConfig({
    workspace: { include: tsdownPackages },
    plugins: [
        {
            name: 'dev-overrides',
            // Runs after the package configs, so it wins over them
            tsdownConfig: () => ({ clean: false, format: ['esm'] }),
        },
        skipUnchanged,
    ],
    async onSuccess(config, signal) {
        const outDir = resolve(config.outDir)
        const initial = !builtOutDirs.has(outDir)
        builtOutDirs.add(outDir)
        try {
            if (config.dts) return
            // tsc always rewrites its output, which would restart the gateway
            if (initial && !changedOutDirs.has(outDir)) return
            if (initial) {
                // Aborted by the next rebuild, e.g. if a dependency failed
                await Promise.race([
                    dependenciesDeclared(config.pkg),
                    aborted(signal),
                ])
            }
            await limited(async () => {
                if (signal.aborted) return
                await run(tsc, ['-p', 'tsconfig.lib.json'], {
                    cwd: config.cwd,
                    signal,
                })
            }).catch((error: { stdout?: string; stderr?: string }) => {
                if (signal.aborted) return
                config.logger.error(
                    `${config.name}: tsc failed\n${error.stdout ?? ''}${error.stderr ?? ''}`
                )
            })
        } finally {
            if (initial) declarationsReady.get(resolve(config.cwd))?.resolve()
        }
    },
})
