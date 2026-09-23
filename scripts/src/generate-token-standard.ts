// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path'
import { getAllFilesWithExtension, getRepoRoot } from './lib/utils.js'
import { installDPM } from './install-dpm.js'
import {
    checkFileUpToDate,
    copyDamlFiles,
    DamlCodegenConfig,
    generateDamlJsBindings,
    mapDamlFiles,
} from './lib/daml-codegen.js'

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

async function syncSources(config: DamlCodegenConfig) {
    const { destDir, sourceDirs, packageName } = config
    const syncedSources = sourceDirs.map((dir) => ({
        dir,
        files: mapDamlFiles(dir, destDir),
    }))
    const missing = syncedSources
        .filter((p) => p.files.length === 0)
        .map((p) => p.dir)

    // in CI, for the generate:all step, build from what is already in the package because the distribution is not fetched
    if (missing.length === syncedSources.length) {
        if (getAllFilesWithExtension(destDir, '.daml').length === 0) {
            throw new Error(
                `${packageName} no distribution in ${tokenStandardSplicePath}. Fetch splice distribution first.`
            )
        }

        console.log(`${packageName} not found, using existing files`)

        return
    }

    if (missing.length > 0) {
        throw new Error(`Missing ${missing.join('\n')}`)
    }

    for (const { dir, files } of syncedSources) {
        if (checkFileUpToDate(files)) {
            console.log(
                `${packageName} ${path.basename(dir)} unchanged, skipping copy`
            )
            continue
        }

        await copyDamlFiles(dir, destDir)
    }
}

async function generate(config: DamlCodegenConfig) {
    await syncSources(config)
    await generateDamlJsBindings(config)
}

async function main(configs: DamlCodegenConfig[]) {
    await installDPM()

    for (const config of configs) {
        await generate(config)
    }
}

main([TOKEN_STANDARD_CONFIG_V1, TOKEN_STANDARD_CONFIG_V2]).catch((err) => {
    console.error(err)
    process.exit(1)
})
