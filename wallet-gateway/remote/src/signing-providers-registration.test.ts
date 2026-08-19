// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SigningProvider } from '@canton-network/core-signing-lib'
import { StoreSql as SigningStoreSql } from '@canton-network/core-signing-store-sql'
import { Logger } from 'pino'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { registerSigningProviders } from './signing-providers-registration.js'

vi.mock('@canton-network/core-signing-blockdaemon', () => ({
    default: class BlockdaemonSigningProvider {},
}))
vi.mock('@canton-network/core-signing-dfns', () => ({
    default: class DfnsSigningProvider {},
}))
vi.mock('@canton-network/core-signing-fireblocks', () => ({
    default: class FireblocksSigningProvider {},
}))
vi.mock('@canton-network/core-signing-securosys', () => ({
    default: class SecurosysSigningProvider {},
}))

describe('registerSigningProviders', () => {
    const signingStore = {} as SigningStoreSql
    const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        child: vi.fn(),
    } as unknown as Logger

    beforeEach(() => {
        vi.stubEnv('WALLET_KERNEL_SIGNING_DISABLED', 'true')
        vi.stubEnv('PARTICIPANT_SIGNING_DISABLED', 'true')
        vi.stubEnv('FIREBLOCKS_SIGNING_DISABLED', 'true')
        vi.stubEnv('BLOCKDAEMON_SIGNING_DISABLED', 'true')
        vi.stubEnv('DFNS_SIGNING_DISABLED', 'true')
        vi.stubEnv('SECUROSYS_SIGNING_DISABLED', 'true')
    })

    afterEach(() => vi.unstubAllEnvs())

    describe('Participant', () => {
        test('does not register when disabled', () => {
            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.PARTICIPANT]).toBeUndefined()
        })

        test('registers when enabled', () => {
            vi.stubEnv('PARTICIPANT_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.PARTICIPANT]).toBeDefined()
        })
    })

    describe('Wallet Kernel', () => {
        test('does not register when disabled', () => {
            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.WALLET_KERNEL]).toBeUndefined()
        })

        test('does not register when signingStore is unavailable', () => {
            vi.stubEnv('WALLET_KERNEL_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(undefined, logger)

            expect(drivers[SigningProvider.WALLET_KERNEL]).toBeUndefined()
        })

        test('registers when signingStore is available', () => {
            vi.stubEnv('WALLET_KERNEL_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.WALLET_KERNEL]).toBeDefined()
        })
    })

    describe('Fireblocks', () => {
        beforeEach(() => {
            vi.stubEnv('FIREBLOCKS_API_KEY', 'api-key')
            vi.stubEnv('FIREBLOCKS_SECRET', 'api-secret')
        })

        test('does not register when disabled', () => {
            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.FIREBLOCKS]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('FIREBLOCKS_SIGNING_DISABLED', '')
            vi.stubEnv('FIREBLOCKS_SECRET', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.FIREBLOCKS]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            vi.stubEnv('FIREBLOCKS_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.FIREBLOCKS]).toBeDefined()
        })
    })

    describe('Blockdaemon', () => {
        beforeEach(() => {
            vi.stubEnv('BLOCKDAEMON_API_URL', 'https://blockdaemon.example')
            vi.stubEnv('BLOCKDAEMON_API_KEY', 'api-key')
        })

        test('does not register when disabled', () => {
            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.BLOCKDAEMON]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('BLOCKDAEMON_SIGNING_DISABLED', '')
            vi.stubEnv('BLOCKDAEMON_API_KEY', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.BLOCKDAEMON]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            vi.stubEnv('BLOCKDAEMON_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.BLOCKDAEMON]).toBeDefined()
        })
    })

    describe('Securosys', () => {
        beforeEach(() => {
            vi.stubEnv('SECUROSYS_TSB_BASE_URL', 'https://securosys.example')
            vi.stubEnv('SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY', 'management-key')
            vi.stubEnv('SECUROSYS_TSB_KEY_OPERATION_API_KEY', 'operation-key')
        })

        test('does not register when disabled', () => {
            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.SECUROSYS]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('SECUROSYS_SIGNING_DISABLED', '')
            vi.stubEnv('SECUROSYS_TSB_KEY_OPERATION_API_KEY', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.SECUROSYS]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            vi.stubEnv('SECUROSYS_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.SECUROSYS]).toBeDefined()
        })
    })

    describe('Dfns', () => {
        beforeEach(() => {
            vi.stubEnv('DFNS_ORG_ID', 'org-id')
            vi.stubEnv('DFNS_CRED_ID', 'credential-id')
            vi.stubEnv('DFNS_PRIVATE_KEY', 'private-key')
            vi.stubEnv('DFNS_AUTH_TOKEN', 'auth-token')
        })

        test('does not register when disabled', () => {
            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.DFNS]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('DFNS_SIGNING_DISABLED', '')
            vi.stubEnv('DFNS_AUTH_TOKEN', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.DFNS]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            vi.stubEnv('DFNS_SIGNING_DISABLED', '')

            const drivers = registerSigningProviders(signingStore, logger)

            expect(drivers[SigningProvider.DFNS]).toBeDefined()
        })
    })
})
