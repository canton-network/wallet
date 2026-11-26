// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execSync } from 'child_process'
import * as fs from 'fs'
import os from 'os'
import * as path from 'path'

import { FlatPack } from './lib/flat-pack.ts'
import { error, success, repoRoot } from './lib/utils.ts'

// The SDKs external consumers depend on, each with a smoke test importing it.
// dapp-sdk defines custom elements on import, so it is only typechecked.
const sdks = [
    {
        dir: 'sdk/wallet-sdk',
        test: 'scripts/wallet-sdk-package-test.txt',
        runInNode: true,
    },
    {
        dir: 'sdk/dapp-sdk',
        test: 'scripts/dapp-sdk-package-test.txt',
        runInNode: false,
    },
]

// TypeScript versions consumers may use: the oldest our declarations support
// (generic Uint8Array needs 5.7) and the latest release of each major
const typescriptVersions = ['~5.7.0', '^5', '^6', '^7']

function run(cmd: string, opts: { cwd?: string } = {}) {
    console.log(`$ ${cmd}`)
    execSync(cmd, { stdio: 'inherit', ...opts })
}

function verify(sdkDir: string, testFile: string, runInNode: boolean) {
    // Create a temp dir for both the test and the tgz
    const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), `${path.basename(sdkDir)}-test-`)
    )
    const flatpacker = new FlatPack(sdkDir, tmpDir)

    // Prepare a npm-based project in the tmp dir
    try {
        flatpacker.postInit(() => {
            fs.copyFileSync(
                path.join(repoRoot, testFile),
                path.join(tmpDir, 'test-import.ts')
            )

            // Typecheck like a strict ESM consumer, including the published declarations.
            // No ambient @types: the SDKs must work in browsers and Node.js alike.
            fs.writeFileSync(
                path.join(tmpDir, 'tsconfig.json'),
                JSON.stringify(
                    {
                        compilerOptions: {
                            target: 'esnext',
                            lib: ['esnext', 'dom'],
                            types: [],
                            module: 'nodenext',
                            moduleResolution: 'nodenext',
                            strict: true,
                            skipLibCheck: false,
                            noEmit: true,
                        },
                        files: ['test-import.ts'],
                    },
                    null,
                    2
                )
            )

            run('npm pkg set type=module', { cwd: tmpDir })
            const typescripts = typescriptVersions.map(
                (version, i) => `typescript-${i}@npm:typescript@${version}`
            )
            run(`npm install --save-dev tsx ${typescripts.join(' ')}`, {
                cwd: tmpDir,
            })
        })
        flatpacker.pack()
        run('npm install', { cwd: tmpDir })

        console.log('Running package tests...')

        typescriptVersions.forEach((_, i) => {
            const tsc = `node node_modules/typescript-${i}/bin/tsc -p .`
            run(`${tsc} --version`, { cwd: tmpDir })
            run(tsc, { cwd: tmpDir })
            run(`${tsc} --module esnext --moduleResolution bundler`, {
                cwd: tmpDir,
            })
        })
        if (runInNode) run('npx tsx test-import.ts', { cwd: tmpDir })
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    }
}

async function main() {
    for (const { dir, test, runInNode } of sdks) verify(dir, test, runInNode)
    console.log(success('Package and import tests completed successfully'))
}

main().catch((err) => {
    console.error(error(err.message || err))
    process.exit(1)
})
