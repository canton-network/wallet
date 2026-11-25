// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { reset } from '@logtape/logtape'
import { captureProgramRun } from '@optique/testing/discover'
import { afterEach, beforeEach, expect, it } from 'vitest'
import commands from '../..'
import { configureLogging } from '../../../logger'

let cwd: string

beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'wallet-cli-dapp-create-'))
})
afterEach(async () => {
    process.exitCode = undefined
    await reset()
    await rm(cwd, { recursive: true, force: true })
})

function run(...args: string[]) {
    return captureProgramRun({
        commands,
        metadata: { name: 'wallet' },
        args,
        colors: false,
        maxWidth: 80,
        hooks: { beforeEach: ({ value }) => configureLogging(value) },
    })
}

it('creates the chosen dApp template in the directory', async () => {
    const directory = join(cwd, 'app')
    const result = await run('dapp', 'create', '--template', 'lit', directory)
    expect(result.exitCode, result.stderr).toBe(0)
    expect(process.exitCode).toBeUndefined()
    expect(await readdir(directory)).toEqual(
        expect.arrayContaining(['.gitignore', 'index.html', 'package.json'])
    )
})

it('fails without touching a non-empty directory', async () => {
    await writeFile(join(cwd, 'existing.txt'), 'keep')
    const result = await run('dapp', 'create', '--template', 'vue', cwd)
    expect(result.exitCode).toBe(0)
    expect(process.exitCode).toBe(1)
    expect(await readdir(cwd)).toEqual(['existing.txt'])
})

it('rejects a command parser without logging options', async () => {
    await expect(configureLogging({})).rejects.toThrow(TypeError)
})
