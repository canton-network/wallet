// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process'
import {
    mkdtempSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, it } from 'vitest'

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)))
const tsc = join(
    dirname(
        createRequire(import.meta.url).resolve(
            '@typescript/native/package.json'
        )
    ),
    'bin/tsc'
)
let fixture: string

describe('published declarations', () => {
    beforeAll(() => {
        fixture = mkdtempSync(join(tmpdir(), 'wallet-discovery-types-'))
        writeFileSync(
            join(fixture, 'package.json'),
            readFileSync(join(packageDir, 'package.json'))
        )
        symlinkSync(
            join(packageDir, 'node_modules'),
            join(fixture, 'node_modules'),
            'dir'
        )
        execFileSync(process.execPath, [
            tsc,
            '-p',
            join(packageDir, 'tsconfig.lib.json'),
            '--outDir',
            join(fixture, 'dist'),
        ])
        writeFileSync(
            join(fixture, 'consumer.ts'),
            `
import {
    DiscoveryClient, DiscoveryError, EventEmitter, NotConnectedError,
    SessionExpiredError, TimeoutError, UserRejectedError,
    WalletNotFoundError, WalletNotInstalledError,
    type ActiveSession, type DiscoveryClientConfig, type DiscoveryClientEventMap,
    type ProviderAdapter, type WalletInfo, type WalletPickerFn,
} from '@canton-network/core-wallet-discovery'

type IsAny<T> = 0 extends (1 & T) ? true : false
type AssertNotAny<T extends false> = T
type ClientCheck = AssertNotAny<IsAny<DiscoveryClient>>
type AdapterCheck = AssertNotAny<IsAny<ProviderAdapter>>
type EventCheck = AssertNotAny<IsAny<DiscoveryClientEventMap['discovery:error']>>

const config: DiscoveryClientConfig = {}
const client: Promise<DiscoveryClient> = DiscoveryClient.create(config)
client.then(c => {
    const session: ActiveSession | null = c.getActiveSession()
    const wallets: WalletInfo[] = c.listWallets()
    c.on('discovery:error', event => { const code: string = event.code })
    // @ts-expect-error unknown events must be rejected
    c.on('not-an-event', () => {})
    // @ts-expect-error nonexistent methods must be rejected
    c.nonexistent()
})
const picker: WalletPickerFn | undefined = config.walletPicker
void [DiscoveryError, EventEmitter, NotConnectedError, SessionExpiredError,
    TimeoutError, UserRejectedError, WalletNotFoundError, WalletNotInstalledError, picker]
`
        )
    })

    afterAll(() => {
        if (fixture) rmSync(fixture, { recursive: true, force: true })
    })

    for (const module of ['node16', 'nodenext', 'esnext']) {
        for (const skipLibCheck of [true, false]) {
            it(`resolves exports with ${module}, skipLibCheck=${skipLibCheck}`, () => {
                execFileSync(
                    process.execPath,
                    [
                        tsc,
                        '--noEmit',
                        '--strict',
                        '--skipLibCheck',
                        String(skipLibCheck),
                        '--module',
                        module,
                        '--moduleResolution',
                        module === 'esnext' ? 'bundler' : module,
                        join(fixture, 'consumer.ts'),
                    ],
                    { cwd: fixture, stdio: 'inherit' }
                )
            })
        }
    }
})
