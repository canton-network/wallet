// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    mkdir,
    mkdtemp,
    readdir,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCliRunner } from '@optique/testing/cli'
import { afterEach, beforeEach, expect, it } from 'vitest'

const cli = createCliRunner({
    entrypoint: new URL('./bin.ts', import.meta.url),
    runtimeArgs: ['--import', import.meta.resolve('tsx')],
})
let cwd: string

beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'canton-create-'))
})
afterEach(async () => {
    await rm(cwd, { recursive: true, force: true })
})

it.each([
    ['lit', 'src/components/connected.ts'],
    ['react', 'src/App.tsx'],
    ['vue', 'src/App.vue'],
])(
    'copies the %s starter into an empty directory relative to the caller',
    async (framework, app) => {
        const template = new URL(
            `./templates/dapp/${framework}/`,
            import.meta.url
        )
        const directory = 'my dapp'
        const target = join(cwd, directory)
        await mkdir(target)
        const result = await cli.invoke({
            cwd,
            args: [`dapp-${framework}`, directory],
        })
        expect(result.exitCode, result.stderr).toBe(0)
        for (const [source, output] of [
            ['_gitignore', '.gitignore'],
            ['package.json', 'package.json'],
            [app, app],
        ] as const) {
            expect(await readFile(join(target, output), 'utf8')).toBe(
                await readFile(new URL(source, template), 'utf8')
            )
        }
        const files = await readdir(target)
        for (const excluded of ['_gitignore', 'node_modules', 'dist']) {
            expect(files).not.toContain(excluded)
        }
    }
)

it.each(['dapp-lit', 'dapp-react', 'dapp-vue'])(
    '%s creates my-canton-app when no directory is given non-interactively',
    async (command) => {
        const result = await cli.invoke({ cwd, args: [command] })
        expect(result.exitCode, result.stderr).toBe(0)
        expect(await readdir(join(cwd, 'my-canton-app'))).toContain(
            'index.html'
        )
    }
)

it.each(['dapp-lit', 'dapp-react', 'dapp-vue'])(
    '%s refuses a non-empty destination without changing it',
    async (command) => {
        await writeFile(join(cwd, 'index.html'), 'existing')
        const result = await cli.invoke({ cwd, args: [command, '.'] })
        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('not empty')
        expect(await readdir(cwd)).toEqual(['index.html'])
        expect(await readFile(join(cwd, 'index.html'), 'utf8')).toBe('existing')
    }
)
