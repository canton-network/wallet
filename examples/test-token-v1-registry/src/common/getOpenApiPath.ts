// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import versionConfig from '../../../../scripts/src/lib/version-config.json' with { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

type Network = 'mainnet' | 'devnet'

export const availableOpenAPIs = [
    'allocation-instruction-v1.yaml',
    'allocation-v1.yaml',
    'token-metadata-v1.yaml',
    'transfer-instruction-v1.yaml',
] as const

function getOpenAPIPath(
    specName: (typeof availableOpenAPIs)[number],
    network: Network = 'devnet'
) {
    const spliceVersion =
        versionConfig.SUPPORTED_VERSIONS[network].splice.version
    return join(
        __dirname,
        `../../../../api-specs/splice/${spliceVersion}/${specName}`
    )
}

export const availableOpenAPIPaths = Object.fromEntries(
    availableOpenAPIs.map((apiFileName) => [
        apiFileName,
        getOpenAPIPath(apiFileName),
    ])
) as Record<
    (typeof availableOpenAPIs)[number],
    ReturnType<typeof getOpenAPIPath>
>
