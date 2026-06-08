// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getRepoRoot, info } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import { generateDamlJsBindings } from './lib/daml-codegen.js'

const repoRoot = getRepoRoot()

const SPLICE_TEST_TOKEN_V1_CONFIG = {
    destDir: path.join(repoRoot, 'damljs/splice-test-token-v1'),
    packageName: 'splice-test-token-v1',
    version: '1.0.0',
}

async function main() {
    await installDPM()

    console.log(info('\n=== Generating splice-test-token-v1 bindings ===\n'))
    await generateDamlJsBindings(SPLICE_TEST_TOKEN_V1_CONFIG)

    console.log(info('\n=== All Daml JS bindings generated successfully ===\n'))
}

main()
