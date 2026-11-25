// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cp, mkdir, readdir } from 'node:fs/promises'
import { findPackageJSON } from 'node:module'
import { basename, dirname, join } from 'node:path'

const ignored = new Set(['node_modules', 'dist', '.DS_Store'])

const filesToHide = ['gitignore'] as const

export async function copyTemplate(templatePath: string, directory: string) {
    const manifest = findPackageJSON(import.meta.url)
    if (!manifest)
        throw new Error('Cannot locate the starter templates package.')
    const template = join(dirname(manifest), 'src/templates', templatePath)
    await mkdir(directory, { recursive: true })
    if ((await readdir(directory)).length > 0) {
        throw new Error(`Destination is not empty: ${directory}`)
    }

    for (const name of await readdir(template)) {
        const hiddenName = filesToHide.find(
            (filename) => name === `_${filename}`
        )
        const output = hiddenName ? `.${hiddenName}` : name
        await cp(join(template, name), join(directory, output), {
            recursive: true,
            force: false,
            errorOnExist: true,
            filter: (source) => !ignored.has(basename(source)),
        })
    }
}
