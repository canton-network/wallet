// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SigningProvider } from '@canton-network/core-signing-lib'
import { StoreSql as SigningStoreSql } from '@canton-network/core-signing-store-sql'
import { Logger } from 'pino'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { registerSigningProviders } from './signing-providers-registration.js'

describe('registerSigningProviders', () => {
    const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        child: vi.fn(),
    } as unknown as Logger

    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubEnv('WALLET_KERNEL_SIGNING_DISABLED', '')
        vi.stubEnv('PARTICIPANT_SIGNING_DISABLED', 'true')
        vi.stubEnv('FIREBLOCKS_SIGNING_DISABLED', 'true')
        vi.stubEnv('BLOCKDAEMON_SIGNING_DISABLED', 'true')
        vi.stubEnv('DFNS_SIGNING_DISABLED', 'true')
        vi.stubEnv('SECUROSYS_SIGNING_DISABLED', 'true')
    })

    afterEach(() => vi.unstubAllEnvs())

    test('does not register Wallet Kernel when signingStore is unavailable', () => {
        const drivers = registerSigningProviders(undefined, logger)

        expect(drivers[SigningProvider.WALLET_KERNEL]).toBeUndefined()
        expect(logger.info).toHaveBeenCalledWith(
            'Wallet Kernel signing provider is unavailable because signingStore is not configured'
        )
    })

    test('registers Wallet Kernel when signingStore is available', () => {
        const signingStore = {} as SigningStoreSql

        const drivers = registerSigningProviders(signingStore, logger)

        expect(drivers[SigningProvider.WALLET_KERNEL]).toBeDefined()
    })
})
