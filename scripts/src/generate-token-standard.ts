// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getRepoRoot } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import {
    copyDamlFiles,
    DamlCodegenConfig,
    generateDamlJsBindings,
} from './lib/daml-codegen.js'
import * as fs from 'fs'

const repoRoot = getRepoRoot()

const tokenStandardSplicePath = path.join(repoRoot, '.splice/token-standard')

const sourceDirsV2 = [
    path.join(
        tokenStandardSplicePath,
        'splice-api-token-allocation-instruction-v2'
    ),
    path.join(
        tokenStandardSplicePath,
        'splice-api-token-allocation-request-v2'
    ),

    path.join(tokenStandardSplicePath, 'splice-api-token-allocation-v2'),
    path.join(tokenStandardSplicePath, 'splice-api-token-holding-v2'),
    path.join(tokenStandardSplicePath, 'splice-api-token-transfer-events-v2'),
    path.join(
        tokenStandardSplicePath,
        'splice-api-token-transfer-instruction-v2'
    ),
    path.join(tokenStandardSplicePath, 'splice-api-token-metadata-v1'),
]

const sourceDirsV1 = [
    path.join(
        tokenStandardSplicePath,
        'splice-api-token-allocation-instruction-v1'
    ),
    path.join(
        tokenStandardSplicePath,
        'splice-api-token-allocation-request-v1'
    ),

    path.join(tokenStandardSplicePath, 'splice-api-token-allocation-v1'),
    path.join(tokenStandardSplicePath, 'splice-api-token-holding-v1'),
    path.join(
        tokenStandardSplicePath,
        'splice-api-token-transfer-instruction-v1'
    ),
    path.join(tokenStandardSplicePath, 'splice-api-token-metadata-v1'),
]

const TOKEN_STANDARD_CONFIG_V1 = {
    sourceDirs: sourceDirsV1,
    destDir: path.join(repoRoot, 'damljs/token-standard-models'),
    packageName: 'token-standard-models',
    version: '1.0.0',
}

const TOKEN_STANDARD_CONFIG_V2 = {
    sourceDirs: sourceDirsV2,
    destDir: path.join(repoRoot, 'damljs/token-standard-models-v2'),
    packageName: 'token-standard-models-v2',
    version: '1.0.0',
}

async function copyFiles(destDir: string, sourceDirs: string[]) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
    }

    sourceDirs.map(async (dir) => {
        await copyDamlFiles(dir, destDir)
    })
}

async function generate(config: DamlCodegenConfig) {
    await copyFiles(config.destDir, config.sourceDirs)
    await generateDamlJsBindings(config)
}

async function main(configs: DamlCodegenConfig[]) {
    await installDPM()

    configs.map((config) => generate(config))
}

main([TOKEN_STANDARD_CONFIG_V1, TOKEN_STANDARD_CONFIG_V2])
