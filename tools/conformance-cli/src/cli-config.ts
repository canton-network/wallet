// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { cliConfigSchema, type CliConfig } from './config.ts'

async function loadConfig(configPath?: string): Promise<CliConfig> {
    if (configPath === undefined) return cliConfigSchema().parse({})
    if (!configPath.trim()) throw new Error('Invalid config path')
    const path = resolve(configPath)
    return cliConfigSchema(dirname(path)).parse(
        JSON.parse(await readFile(path, 'utf8'))
    )
}

export async function loadCommandOptions<const Name extends keyof CliConfig>(
    name: Name,
    configPath?: string
): Promise<NonNullable<CliConfig[Name]>> {
    const options = (await loadConfig(configPath))[name]
    if (!options) throw new Error(`Missing "${name}" section in config`)
    return options
}
