// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process'
import { mkdir, readdir } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream } from 'node:stream/web'

const REPOSITORY = 'canton-network/wallet'
const REF = 'main'
const TEMPLATE_DIR = 'examples/ping'

async function ensureEmptyDir(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true })
    if ((await readdir(dir)).length > 0) {
        throw new Error(`Output directory is not empty: ${dir}`)
    }
}

export async function downloadTemplate(outDir: string): Promise<void> {
    await ensureEmptyDir(outDir)

    const url = `https://api.github.com/${REPOSITORY}/tar.gz/refs/heads/${REF}`
    const response = await fetch(url)
    if (!response.ok || response.body === null) {
        throw new Error(
            `Failed to download ${url}: ${response.status} ${response.statusText}`
        )
    }

    // GitHub archives wrap the repository in a "<repo>-<ref>/" directory.
    const archivePath = `${REPOSITORY.split('/')[1]}-${REF}/${TEMPLATE_DIR}`
    const tar = spawn(
        'tar',
        [
            '-xz',
            '-C',
            outDir,
            `--strip-components=${archivePath.split('/').length}`,
            archivePath,
        ],
        { stdio: ['pipe', 'inherit', 'inherit'] }
    )
    const exitCode = new Promise<number | null>((resolve, reject) => {
        tar.on('error', reject)
        tar.on('close', resolve)
    })

    const [, code] = await Promise.all([
        pipeline(Readable.fromWeb(response.body as ReadableStream), tar.stdin),
        exitCode,
    ])
    if (code !== 0) {
        throw new Error(`tar exited with code ${code}`)
    }
}
