// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { error, getRepoRoot, success, warn } from './lib/utils.js'

const ex = promisify(exec)
const repoRoot = getRepoRoot()

/**
 * SDK packages that publish TypeDoc markdown into `docs/`.
 *
 * This script (and the CI `check SDK reference docs` step) iterates every
 * entry: regenerate → Prettier-normalize → fail if the checked-in file drifted.
 *
 * To add another SDK reference:
 * 1. In the SDK package: `docs` script + `tsconfig.docs.json` (markdown +
 *    frontmatter plugins), same pattern as `@canton-network/dapp-sdk`.
 * 2. Point `output` at the page under `docs/` that TypeDoc writes
 *    (typically via `typedocOptions.out` / `entryFileName`).
 * 3. Append an entry below with a stable `name`, the yarn `workspace`, and
 *    that repo-relative `output` path.
 */
const SDK_REFERENCES: ReadonlyArray<{
    /** Human-readable label used in log / CI failure messages */
    name: string
    /** Yarn workspace package that owns the `docs` (TypeDoc) script */
    workspace: string
    /** Repo-relative path of the generated markdown file */
    output: string
}> = [
    {
        name: 'dApp SDK',
        workspace: '@canton-network/dapp-sdk',
        output: 'docs/dapp-sdk/reference/sdk-methods.md',
    },
]

async function updateReference(ref: (typeof SDK_REFERENCES)[number]): Promise<{
    name: string
    outdated: boolean
}> {
    const outputPath = path.join(repoRoot, ref.output)
    const existing = await readFile(outputPath, { encoding: 'utf-8' })

    await ex(`yarn workspace ${ref.workspace} docs`, { cwd: repoRoot })

    // TypeDoc markdown is not Prettier-clean; normalize so CI matches commits.
    await ex(`yarn prettier --write ${JSON.stringify(outputPath)}`, {
        cwd: repoRoot,
    })

    const updated = await readFile(outputPath, { encoding: 'utf-8' })
    return { name: ref.name, outdated: existing !== updated }
}

async function main() {
    const results = []
    for (const ref of SDK_REFERENCES) {
        results.push(await updateReference(ref))
    }

    const outdated = results.filter((result) => result.outdated)
    if (outdated.length > 0) {
        const names = outdated.map((result) => result.name).join(', ')
        console.warn(
            warn(
                `SDK reference docs were outdated (${names}). If you see this in CI, run \`yarn docs:update-sdk-reference\` and commit the results`
            )
        )
        process.exit(1)
    }

    console.log(success('SDK reference docs are up to date.'))
}

main().catch((err) => {
    console.error(error(String(err)))
    process.exit(1)
})
