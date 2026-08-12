// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getRepoRoot, info, warn } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import { runDamlCodegen } from './lib/daml-codegen.js'
import {
    existsSync,
    rmSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from 'fs'
import { execSync } from 'child_process'

const repoRoot = getRepoRoot()
const darFileName = 'splice-test-token-v2-1.0.0.dar'
const outputDir = path.join(repoRoot, 'damljs/test-token-v2')
const v1Dir = path.join(repoRoot, 'damljs/test-token-v1')
const mainPackageName = 'splice-test-token-v2-1.0.0'
const mainGeneratedPackageDir = path.join(outputDir, mainPackageName)

function pruneDuplicatePackages(): void {
    if (!existsSync(outputDir) || !existsSync(v1Dir)) return

    for (const name of readdirSync(outputDir)) {
        if (name === mainPackageName) continue
        if (!existsSync(path.join(v1Dir, name))) continue
        rmSync(path.join(outputDir, name), { recursive: true, force: true })
    }

    const pkgJsonPath = path.join(mainGeneratedPackageDir, 'package.json')
    if (!existsSync(pkgJsonPath)) return

    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
        dependencies?: Record<string, string>
    }
    if (!pkg.dependencies) return

    let changed = false
    for (const [dep, spec] of Object.entries(pkg.dependencies)) {
        if (!spec.startsWith('file:../')) continue
        const sibling = spec.slice('file:../'.length)
        if (sibling === mainPackageName) continue
        if (!existsSync(path.join(v1Dir, sibling))) continue
        pkg.dependencies[dep] = `file:../../test-token-v1/${sibling}`
        changed = true
    }
    if (changed) {
        writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)
    }
}

async function main() {
    const isCi = process.env.CI === 'true'
    const forceCodegen = process.env.FORCE_TEST_TOKEN_CODEGEN === 'true'

    if (isCi && !forceCodegen && existsSync(mainGeneratedPackageDir)) {
        console.log(
            info(
                `CI detected and generated test-token-v2 artifacts already exist at ${outputDir}. Skipping DPM install and codegen.`
            )
        )
        pruneDuplicatePackages()
        return
    }

    if (isCi && !forceCodegen) {
        console.log(
            warn(
                `CI detected but ${mainGeneratedPackageDir} is missing; proceeding with DPM install and codegen.`
            )
        )
    }

    await installDPM()

    const darsDir = path.join(repoRoot, '.localnet/dars')

    if (!existsSync(darsDir)) {
        execSync('yarn script:fetch:localnet', {
            cwd: repoRoot,
            stdio: 'inherit',
        })
    }

    if (!existsSync(path.join(darsDir, darFileName))) {
        throw new Error(
            `Missing ${darFileName} under ${darsDir}. Run yarn script:fetch:localnet.`
        )
    }

    if (existsSync(outputDir)) {
        rmSync(outputDir, { recursive: true, force: true })
    }

    await runDamlCodegen({
        workingDir: darsDir,
        darFileName,
        outputDir,
    })

    pruneDuplicatePackages()
}

main()
