// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SigningProvider } from '@canton-network/core-signing-lib'
import { StoreSql as SigningStoreSql } from '@canton-network/core-signing-store-sql'
import { Logger } from 'pino'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { signingProvidersConfigSchema } from './config/Config.js'
import type { SigningProvidersConfig } from './config/Config.js'
import { registerSigningProviders } from './signing-providers-registration.js'

const providerConstructors = vi.hoisted(() => ({
    bitgo: vi.fn(),
    blockdaemon: vi.fn(),
    dfns: vi.fn(),
    fireblocks: vi.fn(),
    securosys: vi.fn(),
}))

vi.mock('@canton-network/core-signing-bitgo', () => ({
    default: providerConstructors.bitgo,
}))
vi.mock('@canton-network/core-signing-blockdaemon', () => ({
    default: providerConstructors.blockdaemon,
}))
vi.mock('@canton-network/core-signing-dfns', () => ({
    default: providerConstructors.dfns,
}))
vi.mock('@canton-network/core-signing-fireblocks', () => ({
    default: providerConstructors.fireblocks,
}))
vi.mock('@canton-network/core-signing-securosys', () => ({
    default: providerConstructors.securosys,
}))

describe('registerSigningProviders', () => {
    const signingStore = {} as SigningStoreSql
    let providers: SigningProvidersConfig
    const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        child: vi.fn(),
    } as unknown as Logger

    beforeEach(() => {
        vi.clearAllMocks()
        providers = signingProvidersConfigSchema.parse({})
    })

    afterEach(() => vi.unstubAllEnvs())

    test('uses deprecated non-secret environment variables as fallbacks', () => {
        vi.stubEnv('FIREBLOCKS_API_KEY', 'fireblocks-key')
        vi.stubEnv('FIREBLOCKS_SECRET', 'fireblocks-secret')
        vi.stubEnv('FIREBLOCKS_API_PATH', 'https://fireblocks.env/v1')
        vi.stubEnv('BLOCKDAEMON_API_KEY', 'blockdaemon-key')
        vi.stubEnv('BLOCKDAEMON_API_URL', 'https://blockdaemon.env')
        vi.stubEnv('BLOCKDAEMON_CAIP2', 'canton:mainnet')
        vi.stubEnv('DFNS_ORG_ID', 'dfns-org')
        vi.stubEnv('DFNS_BASE_URL', 'https://dfns.env')
        vi.stubEnv('DFNS_CRED_ID', 'dfns-credential')
        vi.stubEnv('DFNS_PRIVATE_KEY', 'dfns-private-key')
        vi.stubEnv('DFNS_AUTH_TOKEN', 'dfns-token')
        vi.stubEnv('SECUROSYS_TSB_BASE_URL', 'https://securosys.env')
        vi.stubEnv('SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY', 'management-key')
        vi.stubEnv('SECUROSYS_TSB_KEY_OPERATION_API_KEY', 'operation-key')
        vi.stubEnv('SECUROSYS_TSB_MTLS_P12_PATH', '/env/client.p12')
        vi.stubEnv('SECUROSYS_TSB_SIGNATURE_ALGORITHM', 'SHA256_WITH_ECDSA')
        vi.stubEnv('BITGO_ACCESS_TOKEN', 'bitgo-token')
        vi.stubEnv('BITGO_API_URL', 'https://bitgo.env')
        vi.stubEnv('BITGO_ENTERPRISE_ID', 'bitgo-enterprise')
        vi.stubEnv('BITGO_COIN', 'tcanton')

        registerSigningProviders(providers, signingStore, logger)

        expect(providerConstructors.fireblocks).toHaveBeenCalledWith(
            expect.objectContaining({ apiPath: 'https://fireblocks.env/v1' })
        )
        expect(providerConstructors.blockdaemon).toHaveBeenCalledWith({
            baseUrl: 'https://blockdaemon.env',
            apiKey: 'blockdaemon-key',
            caip2: 'canton:mainnet',
        })
        expect(providerConstructors.dfns).toHaveBeenCalledWith(
            expect.objectContaining({
                orgId: 'dfns-org',
                baseUrl: 'https://dfns.env',
                credentials: expect.objectContaining({
                    credId: 'dfns-credential',
                }),
            })
        )
        expect(providerConstructors.securosys).toHaveBeenCalledWith(
            expect.objectContaining({
                baseUrl: 'https://securosys.env',
                mtlsP12Path: '/env/client.p12',
                signatureAlgorithm: 'SHA256_WITH_ECDSA',
            })
        )
        expect(providerConstructors.bitgo).toHaveBeenCalledWith({
            accessToken: 'bitgo-token',
            baseUrl: 'https://bitgo.env',
            enterpriseId: 'bitgo-enterprise',
            coin: 'tcanton',
        })

        const deprecatedVariables = [
            'FIREBLOCKS_API_PATH',
            'BLOCKDAEMON_API_URL',
            'BLOCKDAEMON_CAIP2',
            'DFNS_ORG_ID',
            'DFNS_BASE_URL',
            'DFNS_CRED_ID',
            'SECUROSYS_TSB_BASE_URL',
            'SECUROSYS_TSB_MTLS_P12_PATH',
            'SECUROSYS_TSB_SIGNATURE_ALGORITHM',
            'BITGO_API_URL',
            'BITGO_ENTERPRISE_ID',
            'BITGO_COIN',
        ]
        deprecatedVariables.forEach((variable) => {
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(`${variable} is deprecated`)
            )
        })
    })

    test('returns no drivers when every signing provider is disabled', () => {
        providers.walletKernel.enable = false
        providers.participant.enable = false
        providers.fireblocks.enable = false
        providers.blockdaemon.enable = false
        providers.dfns.enable = false
        providers.securosys.enable = false
        providers.bitgo.enable = false

        expect(
            registerSigningProviders(providers, signingStore, logger)
        ).toEqual({})
    })

    test('registers only participant when signingStore is unavailable and external providers are disabled', () => {
        providers.fireblocks.enable = false
        providers.blockdaemon.enable = false
        providers.dfns.enable = false
        providers.securosys.enable = false
        providers.bitgo.enable = false

        const drivers = registerSigningProviders(providers, undefined, logger)

        expect(Object.keys(drivers)).toEqual([SigningProvider.PARTICIPANT])
    })

    describe('Participant', () => {
        test('does not register when disabled', () => {
            providers.participant.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.PARTICIPANT]).toBeUndefined()
        })

        test('registers when provider config is omitted', () => {
            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.PARTICIPANT]).toBeDefined()
        })

        test('registers when enabled', () => {
            providers.participant.enable = true

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.PARTICIPANT]).toBeDefined()
        })
    })

    describe('Wallet Kernel', () => {
        test('does not register when disabled', () => {
            providers.walletKernel.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.WALLET_KERNEL]).toBeUndefined()
        })

        test('does not register when signingStore is unavailable', () => {
            const drivers = registerSigningProviders(
                providers,
                undefined,
                logger
            )

            expect(drivers[SigningProvider.WALLET_KERNEL]).toBeUndefined()
        })

        test('registers when signingStore is available', () => {
            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.WALLET_KERNEL]).toBeDefined()
        })
    })

    describe('Fireblocks', () => {
        beforeEach(() => {
            vi.stubEnv('FIREBLOCKS_API_KEY', 'api-key')
            vi.stubEnv('FIREBLOCKS_SECRET', 'api-secret')
        })

        test('does not register when disabled', () => {
            providers.fireblocks.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.FIREBLOCKS]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('FIREBLOCKS_SECRET', '')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.FIREBLOCKS]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            providers.fireblocks.apiPath = 'https://fireblocks.example/v1'
            vi.stubEnv('FIREBLOCKS_API_PATH', 'https://fireblocks.env/v1')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.FIREBLOCKS]).toBeDefined()
            expect(providerConstructors.fireblocks).toHaveBeenCalledWith(
                expect.objectContaining({
                    apiPath: 'https://fireblocks.example/v1',
                })
            )
            expect(logger.warn).toHaveBeenCalledWith(
                'FIREBLOCKS_API_PATH is deprecated. Configure signingProviders.fireblocks.apiPath instead'
            )
        })
    })

    describe('Blockdaemon', () => {
        beforeEach(() => {
            vi.stubEnv('BLOCKDAEMON_API_KEY', 'api-key')
            providers.blockdaemon.baseUrl = 'https://blockdaemon.example'
        })

        test('does not register when disabled', () => {
            providers.blockdaemon.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BLOCKDAEMON]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('BLOCKDAEMON_API_KEY', '')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BLOCKDAEMON]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            providers.blockdaemon.caip2 = 'canton:mainnet'

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BLOCKDAEMON]).toBeDefined()
            expect(providerConstructors.blockdaemon).toHaveBeenCalledWith({
                baseUrl: 'https://blockdaemon.example',
                apiKey: 'api-key',
                caip2: 'canton:mainnet',
            })
        })
    })

    describe('Securosys', () => {
        beforeEach(() => {
            providers.securosys.baseUrl = 'https://securosys.example'
            vi.stubEnv('SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY', 'management-key')
            vi.stubEnv('SECUROSYS_TSB_KEY_OPERATION_API_KEY', 'operation-key')
        })

        test('does not register when disabled', () => {
            providers.securosys.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.SECUROSYS]).toBeUndefined()
        })

        test('does not register when base URL is missing', () => {
            providers.securosys.baseUrl = undefined
            vi.stubEnv('SECUROSYS_TSB_BASE_URL', '')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.SECUROSYS]).toBeUndefined()
        })

        test('registers with API-key authentication', () => {
            providers.securosys.signatureAlgorithm = 'EDDSA'

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.SECUROSYS]).toBeDefined()
            expect(providerConstructors.securosys).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseUrl: 'https://securosys.example',
                    keyManagementApiKey: 'management-key',
                    keyOperationApiKey: 'operation-key',
                    signatureAlgorithm: 'EDDSA',
                })
            )
        })

        test('registers with bearer-token authentication without API keys', () => {
            vi.stubEnv('SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY', '')
            vi.stubEnv('SECUROSYS_TSB_KEY_OPERATION_API_KEY', '')
            vi.stubEnv('SECUROSYS_TSB_BEARER_TOKEN', 'bearer-token')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.SECUROSYS]).toBeDefined()
            expect(providerConstructors.securosys).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseUrl: 'https://securosys.example',
                    bearerToken: 'bearer-token',
                })
            )
        })

        test('registers with mTLS authentication without API keys', () => {
            vi.stubEnv('SECUROSYS_TSB_KEY_MANAGEMENT_API_KEY', '')
            vi.stubEnv('SECUROSYS_TSB_KEY_OPERATION_API_KEY', '')
            vi.stubEnv('SECUROSYS_TSB_MTLS_P12_PASSWORD', 'p12-password')
            providers.securosys.mtlsP12Path = '/secrets/client.p12'

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.SECUROSYS]).toBeDefined()
            expect(providerConstructors.securosys).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseUrl: 'https://securosys.example',
                    mtlsP12Path: '/secrets/client.p12',
                    mtlsP12Password: 'p12-password',
                })
            )
        })
    })

    describe('Dfns', () => {
        beforeEach(() => {
            providers.dfns.orgId = 'org-id'
            providers.dfns.credId = 'credential-id'
            vi.stubEnv('DFNS_PRIVATE_KEY', 'private-key')
            vi.stubEnv('DFNS_AUTH_TOKEN', 'auth-token')
        })

        test('does not register when disabled', () => {
            providers.dfns.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.DFNS]).toBeUndefined()
        })

        test('does not register when required environment variables are missing', () => {
            vi.stubEnv('DFNS_AUTH_TOKEN', '')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.DFNS]).toBeUndefined()
        })

        test('registers when required environment variables are set', () => {
            providers.dfns.baseUrl = 'https://dfns.example'

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.DFNS]).toBeDefined()
            expect(providerConstructors.dfns).toHaveBeenCalledWith({
                orgId: 'org-id',
                baseUrl: 'https://dfns.example',
                credentials: {
                    credId: 'credential-id',
                    privateKey: 'private-key',
                    authToken: 'auth-token',
                },
            })
        })
    })

    describe('BitGo', () => {
        beforeEach(() => {
            vi.stubEnv('BITGO_ACCESS_TOKEN', 'access-token')
        })

        test('does not register when disabled', () => {
            providers.bitgo.enable = false

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BITGO]).toBeUndefined()
        })

        test('does not register when access token is missing', () => {
            vi.stubEnv('BITGO_ACCESS_TOKEN', '')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BITGO]).toBeUndefined()
        })

        test('uses config before deprecated non-secret environment variables', () => {
            providers.bitgo.baseUrl = 'https://bitgo.example'
            providers.bitgo.enterpriseId = 'config-enterprise'
            providers.bitgo.coin = 'canton'
            vi.stubEnv('BITGO_API_URL', 'https://bitgo.env')
            vi.stubEnv('BITGO_ENTERPRISE_ID', 'env-enterprise')
            vi.stubEnv('BITGO_COIN', 'tcanton')

            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BITGO]).toBeDefined()
            expect(providerConstructors.bitgo).toHaveBeenCalledWith({
                accessToken: 'access-token',
                baseUrl: 'https://bitgo.example',
                enterpriseId: 'config-enterprise',
                coin: 'canton',
            })
            const deprecatedVariables = [
                'BITGO_API_URL',
                'BITGO_ENTERPRISE_ID',
                'BITGO_COIN',
            ]
            deprecatedVariables.forEach((variable) => {
                expect(logger.warn).toHaveBeenCalledWith(
                    expect.stringContaining(`${variable} is deprecated`)
                )
            })
        })

        test('registers without enterprise ID and warns about limited functionality', () => {
            const drivers = registerSigningProviders(
                providers,
                signingStore,
                logger
            )

            expect(drivers[SigningProvider.BITGO]).toBeDefined()
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining('BitGo enterprise ID is not set')
            )
        })
    })
})
