// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { object } from '@optique/core'
import { captureProgramRun } from '@optique/testing/discover'
import { parseArgs } from '@optique/testing/parser'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import commands from '.'
import { dappDirectory, dappTemplate } from './parser'

let cwd: string

beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'canton-create-cli-'))
    vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(async () => {
    vi.restoreAllMocks()
    await rm(cwd, { recursive: true, force: true })
})

it.each(['lit', 'react', 'vue'])(
    'dapp-%s copies the starter into the given directory',
    async (framework) => {
        const directory = join(cwd, 'app')
        const result = await captureProgramRun({
            commands,
            metadata: { name: 'create' },
            args: [`dapp-${framework}`, directory],
            colors: false,
            maxWidth: 80,
        })
        expect(result.exitCode, result.stderr).toBe(0)
        expect(await readdir(directory)).toContain('.gitignore')
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(directory)
        )
    }
)

it('parses the template option and directory argument', async () => {
    const result = await parseArgs(
        object({ template: dappTemplate, directory: dappDirectory() }),
        ['--template', 'vue', 'my-app']
    )
    expect(result).toMatchObject({
        success: true,
        value: { template: 'vue', directory: 'my-app' },
    })
})

it('defaults the directory when not running in a terminal', async () => {
    const result = await parseArgs(object({ directory: dappDirectory() }), [])
    expect(result).toMatchObject({
        success: true,
        value: { directory: 'my-canton-app' },
    })
})
