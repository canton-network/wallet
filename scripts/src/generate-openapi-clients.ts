// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    downloadAndUnpackTarball,
    downloadToFile,
    ensureDir,
    getRepoRoot,
    info,
    Network,
    getNetworkArg,
    SPLICE_SPEC_PATH,
    success,
    SUPPORTED_VERSIONS,
    setSpliceHash,
    hasFlag,
} from './lib/utils.js'
import * as fs from 'fs'
import generateSchema, { astToString } from 'openapi-typescript'
import * as path from 'path'
import crypto from 'crypto'
import { generateLedgerProviderTypes } from './lib/ledger-provider-type-generator.js'
import { load as loadYaml } from 'js-yaml'

/**
 * OpenAPI specification details.
 * @property input - The path, relative to the repo root, of the OpenAPI specification file.
 * @property output - The path, relative to the repo root, where the generated TypeScript client should be saved.
 */
interface OpenApiFileSpec {
    input: string
    output: string
    includeProviderTypes?: boolean
    generatePaths?: boolean
}

/**
 * OpenAPI specification details for URL input.
 * @property input - The URL of the OpenAPI specification file.
 * @property output - The path, relative to the repo root, where the generated TypeScript client should be saved.
 * @property specdir - The directory, relative to the repo root, where the OpenAPI yaml file should be saved.
 */
interface OpenApiUrlSpec {
    input: URL
    output: string
    specdir: string
    includeProviderTypes?: boolean
    hash?: string
    generatePaths?: boolean
}

interface MinimalParsedSpec {
    paths?: Record<string, Record<string, unknown>>
}

type OpenApiSpec = OpenApiFileSpec | OpenApiUrlSpec

const root = getRepoRoot()

async function fetchSpliceSpecs(
    updateHash: boolean,
    network: Network
): Promise<void> {
    const spliceVersion = SUPPORTED_VERSIONS[network].splice.version
    const spliceSpecHash = SUPPORTED_VERSIONS[network].splice.hashes.spliceSpec
    const archiveUrl = `https://github.com/digital-asset/decentralized-canton-sync/releases/download/v${spliceVersion}/${spliceVersion}_openapi.tar.gz`
    const tarfile = path.join(SPLICE_SPEC_PATH, `${spliceVersion}.tar.gz`)
    const unpackDir = path.join(root, 'api-specs/splice', spliceVersion)

    await downloadAndUnpackTarball(archiveUrl, tarfile, unpackDir, {
        hash: spliceSpecHash,
        strip: 0,
        updateHash,
    })

    if (updateHash || !SUPPORTED_VERSIONS[network].splice.hashes.localnet) {
        const newHash = crypto
            .createHash('sha256')
            .update(fs.readFileSync(tarfile))
            .digest('hex')
        setSpliceHash(network, 'spliceSpec', newHash)
    }
}

/**
 * Generate a TypeScript OpenAPI client from an input spec and place  .
 * @param spec OpenApiSpec
 */
async function generateOpenApiClient(spec: OpenApiSpec) {
    const { input, output, includeProviderTypes, generatePaths } = spec
    const message =
        spec.input instanceof URL
            ? 'Generating OpenAPI client from url'
            : 'Generating OpenAPI client from file'

    console.log(`${message}:\n  ${info(input.toString())}\n`)

    try {
        let specs = ''
        let filePath = ''
        if ('specdir' in spec) {
            // Try a fetch first, because openapi-fetch silently fails if the URL is a 404
            await downloadToFile(
                input,
                path.join(root, spec.specdir),
                spec.hash
            )
            filePath = path.join(root, spec.specdir)
            specs = fs.readFileSync(filePath, 'utf8')
        } else {
            filePath = path.join(root, input.toString())
            specs = fs.readFileSync(filePath, 'utf8')
        }

        if (generatePaths) {
            const parsedSpec = loadYaml(specs) as MinimalParsedSpec | undefined
            const apiPaths = parsedSpec?.paths || {}
            const getRoutes = Object.keys(apiPaths).filter(
                (p) => apiPaths[p] && 'get' in apiPaths[p]
            )
            const postRoutes = Object.keys(apiPaths).filter(
                (p) => apiPaths[p] && 'post' in apiPaths[p]
            )

            const pathsFileContent = [
                `// Generated automatically from OpenAPI spec. Do not edit manually.`,
                `export const getPaths = ${JSON.stringify(getRoutes, null, 4)} as const;`,
                `export const postPaths = ${JSON.stringify(postRoutes, null, 4)} as const`,
            ].join('\n\n')

            const pathsTsOtuput = output.replace('.ts', '-paths.ts')
            fs.writeFileSync(path.join(root, pathsTsOtuput), pathsFileContent)
        }

        console.log(filePath)
        console.log(path.dirname(filePath))
        const nodes = await generateSchema(specs, {
            cwd: path.dirname(filePath),
        })
        const schema = astToString(nodes)

        await ensureDir(path.join(root, path.dirname(output)))

        if (includeProviderTypes) {
            await generateLedgerProviderTypes(
                filePath,
                output.replace('.ts', '-provider-types.ts')
            )
        }

        fs.writeFileSync(path.join(root, output), schema)
    } catch (err: unknown) {
        console.error(err)
        process.exit(1)
    }
}

const getSpecs = (
    spliceVersion: string,
    cantonVersion: string
): OpenApiSpec[] => [
    // Canton JSON Ledger API
    {
        input: `api-specs/ledger-api/${cantonVersion}/openapi.yaml`,
        output: `core/ledger-client-types/src/generated-clients/openapi-${cantonVersion}.ts`,
        includeProviderTypes: true,
        generatePaths: true,
    },
    // Splice Scan API
    {
        input: `api-specs/splice/${spliceVersion}/scan.yaml`,
        output: 'core/splice-client/src/generated-clients/scan.ts',
    },
    {
        input: `api-specs/splice/${spliceVersion}/scan-proxy.yaml`,
        output: 'core/splice-client/src/generated-clients/scan-proxy.ts',
    },
    {
        input: `api-specs/splice/${spliceVersion}/validator-internal.yaml`,
        output: 'core/splice-client/src/generated-clients/validator-internal.ts',
    },
    // Token standards
    {
        input: `api-specs/splice/${spliceVersion}/allocation-instruction-v1.yaml`,
        output: 'core/token-standard/src/generated-clients/splice-api-token-allocation-instruction-v1/allocation-instruction-v1.ts',
    },
    {
        input: `api-specs/splice/${spliceVersion}/allocation-v1.yaml`,
        output: 'core/token-standard/src/generated-clients/splice-api-token-allocation-v1/allocation-v1.ts',
    },
    {
        input: `api-specs/splice/${spliceVersion}/token-metadata-v1.yaml`,
        output: 'core/token-standard/src/generated-clients/splice-api-token-metadata-v1/token-metadata-v1.ts',
    },
    {
        input: `api-specs/splice/${spliceVersion}/transfer-instruction-v1.yaml`,
        output: 'core/token-standard/src/generated-clients/splice-api-token-transfer-instruction-v1/transfer-instruction-v1.ts',
    },
]

async function main(network: Network = 'devnet') {
    const updateHash = hasFlag('updateHash')

    await fetchSpliceSpecs(updateHash, network)
    Promise.all(
        getSpecs(
            SUPPORTED_VERSIONS[network].splice.version,
            SUPPORTED_VERSIONS[network].canton.version.split('-')[0]
        ).map(generateOpenApiClient)
    ).then(() => {
        console.log(
            success('Generated fresh TypeScript clients for all OpenAPI specs')
        )
    })
}

main(getNetworkArg())
