// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Signs every example descriptor with the reference key. Run it from the wallet repository
// after changing a descriptor's wording:
//
//   pnpm exec tsx core/tx-clear-signing/examples/sign-descriptors.ts

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseJsonStrict } from '../src/strict-json.ts'
import { signWithReferenceKey } from '../src/testing/reference-key.ts'

const root = dirname(fileURLToPath(import.meta.url))
const directories = [
    join(root, 'descriptors'),
    join(root, 'descriptors', 'splice'),
]

for (const directory of directories) {
    const names = (await readdir(directory)).filter((name) =>
        name.endsWith('.json')
    )
    for (const name of names) {
        const path = join(directory, name)
        const parsed = parseJsonStrict(await readFile(path, 'utf8'))
        if (
            typeof parsed !== 'object' ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            throw new Error(`${path} is not a JSON object`)
        }
        const json = parsed as Record<string, unknown>
        delete json.signatures
        const signed = await signWithReferenceKey(json)
        await writeFile(path, `${JSON.stringify(signed, null, 4)}\n`)
    }
}
