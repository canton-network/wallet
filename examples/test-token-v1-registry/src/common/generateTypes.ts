// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import path, { basename } from 'node:path'
import { availableOpenAPIPaths } from './getOpenApiPath'

const outDir = path.join(import.meta.dirname, '../openapi-ts')

// Create dir if it doesn't exist
if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
}

for (const file of Object.values(availableOpenAPIPaths)) {
    const filename = basename(file).replace(/\.[^.]*$/, '.ts')
    const outputFile = `${outDir}/${filename}`

    const command = `openapi typegen --backend ${file} > ${outputFile}`

    console.log(`Running command: ${command}`)

    try {
        execSync(command)
        console.log(`✓ Generated ${outputFile}`)
    } catch (error) {
        console.error(`✗ Failed to generate for ${file}:`, error)
    }
}

console.log('Done!')
