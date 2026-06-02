// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getRepoRoot, info } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import { buildDamlPackage, generateDamlJsBindings } from './lib/daml-codegen.js'

const repoRoot = getRepoRoot()

// V2 API packages — built in dependency order, no JS codegen needed (used as data-deps only)
const V2_BUILD_ONLY_DIRS = [
    'splice-api-token-holding-v2',
    'splice-api-token-allocation-v2',
    'splice-api-token-transfer-events-v2',
    'splice-api-token-transfer-instruction-v2',
    'splice-api-token-allocation-instruction-v2',
    'splice-api-token-allocation-request-v2',
    'splice-token-standard-utils',
]

const SPLICE_TEST_TOKEN_V1_CONFIG = {
    destDir: path.join(repoRoot, 'damljs/splice-test-token-v1'),
    packageName: 'splice-test-token-v1',
    version: '1.0.0',
}

async function main() {
    await installDPM()

    for (const pkg of V2_BUILD_ONLY_DIRS) {
        console.log(info(`\n=== Building ${pkg} ===\n`))
        buildDamlPackage(path.join(repoRoot, 'damljs', pkg))
    }

    console.log(info('\n=== Generating splice-test-token-v1 bindings ===\n'))
    await generateDamlJsBindings(SPLICE_TEST_TOKEN_V1_CONFIG)

    console.log(info('\n=== All Daml JS bindings generated successfully ===\n'))
}

main()
