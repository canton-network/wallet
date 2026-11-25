// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    mkdir,
    mkdtemp,
    readFile,
    readdir,
    rm,
    writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const { findPackageJSONMock } = vi.hoisted(() => ({
    findPackageJSONMock: vi.fn(),
}))

vi.mock('node:module', async (importOriginal) => ({
    ...(await importOriginal<typeof import('node:module')>()),
    findPackageJSON: findPackageJSONMock,
}))

import { copyTemplate } from './copy-template'

let root: string
let packageDirectory: string
let templateDirectory: string
let destination: string

beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'copy-template-'))
    packageDirectory = join(root, 'package')
    templateDirectory = join(packageDirectory, 'src/templates/fixture')
    destination = join(root, 'output')
    await mkdir(join(templateDirectory, 'nested'), { recursive: true })
    await mkdir(join(templateDirectory, 'dist'), { recursive: true })
    await mkdir(join(templateDirectory, 'node_modules/dependency'), {
        recursive: true,
    })
    await writeFile(join(packageDirectory, 'package.json'), '{}')
    await writeFile(join(templateDirectory, '_gitignore'), 'node_modules\n')
    await writeFile(join(templateDirectory, 'README.md'), 'starter')
    await writeFile(join(templateDirectory, '.DS_Store'), 'ignored')
    await writeFile(join(templateDirectory, 'nested', 'file.txt'), 'nested')
    await writeFile(join(templateDirectory, 'nested', '.DS_Store'), 'ignored')
    await writeFile(join(templateDirectory, 'dist', 'build.js'), 'ignored')
    await writeFile(
        join(templateDirectory, 'node_modules/dependency/index.js'),
        'ignored'
    )
    findPackageJSONMock.mockReturnValue(join(packageDirectory, 'package.json'))
})

afterEach(async () => {
    await rm(root, { recursive: true, force: true })
    vi.clearAllMocks()
})

it('copies a template, renames _gitignore, and excludes generated files', async () => {
    await copyTemplate('fixture', destination)

    expect(await readFile(join(destination, '.gitignore'), 'utf8')).toBe(
        'node_modules\n'
    )
    expect(await readFile(join(destination, 'README.md'), 'utf8')).toBe(
        'starter'
    )
    expect(await readFile(join(destination, 'nested/file.txt'), 'utf8')).toBe(
        'nested'
    )
    const files = await readdir(destination)
    expect(files).toEqual(
        expect.arrayContaining(['.gitignore', 'README.md', 'nested'])
    )
    for (const excluded of [
        '_gitignore',
        '.DS_Store',
        'dist',
        'node_modules',
    ]) {
        expect(files).not.toContain(excluded)
    }
    expect(await readdir(join(destination, 'nested'))).toEqual(['file.txt'])
})

it('refuses to copy into a non-empty destination without changing it', async () => {
    await mkdir(destination)
    await writeFile(join(destination, 'existing.txt'), 'preserve')

    await expect(copyTemplate('fixture', destination)).rejects.toThrow(
        `Destination is not empty: ${destination}`
    )

    expect(await readdir(destination)).toEqual(['existing.txt'])
    expect(await readFile(join(destination, 'existing.txt'), 'utf8')).toBe(
        'preserve'
    )
})

it('reports when the package manifest cannot be located', async () => {
    findPackageJSONMock.mockReturnValueOnce(undefined)

    await expect(copyTemplate('fixture', destination)).rejects.toThrow(
        'Cannot locate the starter templates package.'
    )
})

it('rejects a missing template directory', async () => {
    await expect(copyTemplate('missing', destination)).rejects.toThrow()
})
