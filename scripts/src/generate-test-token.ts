// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getRepoRoot } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import { runDamlCodegen } from './lib/daml-codegen.js'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

const repoRoot = getRepoRoot()

async function main() {
    await installDPM()

    const localnetDir = path.join(repoRoot, '.localnet')
    const darsDir = path.join(localnetDir, 'dars')

    if (!existsSync(darsDir)) {
        execSync('yarn script:fetch:localnet', {
            cwd: repoRoot,
            stdio: 'inherit',
        })
    }

    await runDamlCodegen({
        workingDir: darsDir,
        darFileName: 'splice-test-token-v1-1.0.0.dar',
        outputDir: path.join(repoRoot, 'damljs/test-token-v1'),
    })
}

main()
