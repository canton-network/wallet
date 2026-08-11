// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getRepoRoot, info, warn } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import { runDamlCodegen } from './lib/daml-codegen.js'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

const repoRoot = getRepoRoot()
const darFileName = 'splice-test-token-v2-1.0.0.dar'
const outputDir = path.join(repoRoot, 'damljs/test-token-v2')
const mainGeneratedPackageDir = path.join(
    outputDir,
    'splice-test-token-v2-1.0.0'
)

/**
 * Installs DPM, ensures localnet DAR artifacts exist, and runs DAML codegen
 * for the CIP-0112 test-token V2 package into damljs/test-token-v2.
 */
async function main() {
    const isCi = process.env.CI === 'true'
    const forceCodegen = process.env.FORCE_TEST_TOKEN_CODEGEN === 'true'

    if (isCi && !forceCodegen && existsSync(mainGeneratedPackageDir)) {
        console.log(
            info(
                `CI detected and generated test-token-v2 artifacts already exist at ${outputDir}. Skipping DPM install and codegen.`
            )
        )
        console.log(
            info(
                'Set FORCE_TEST_TOKEN_CODEGEN=true to force regeneration in CI.'
            )
        )
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

    await runDamlCodegen({
        workingDir: darsDir,
        darFileName,
        outputDir,
    })
}

main()
