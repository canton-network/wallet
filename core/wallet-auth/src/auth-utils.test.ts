// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    MockedObject,
    afterEach,
} from 'vitest'
import {
    jwtUserEmail,
    jwtUserId,
    assertConnected,
    fetchOidcUserInfo,
    jwtExpired,
} from './auth-utils.js'
import {
    AuthTokenProvider,
    TokenProviderConfig,
} from './auth-token-provider.js'
import { Logger } from '@canton-network/core-types'
import { Auth, Idp } from './config/schema.js'
import { clientCredentialsService } from './client-credentials-service.js'

vi.mock('./client-credentials-service.js', () => {
    return {
        clientCredentialsService: vi.fn(() => ({
            fetchToken: vi.fn(),
        })),
    }
})

describe('AuthUtils', () => {
    beforeEach(() => {
        const fetchMock = vi.fn()

        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    const jwtToken =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsZWRnZXItYXBpLXVzZXIiLCJhdWQiOiJodHRwczovL2NhbnRvbi5uZXR3b3JrLmdsb2JhbCIsInNjb3BlIjoiIiwiaWF0IjoxNzc5ODg1MTE1LCJleHAiOjE3Nzk4ODg3MTUsImlzcyI6InVuc2FmZS1hdXRoIn0.J81f_WAkogp3jbrbFcNcVMsehoE8y7jQfvAlmPQdQr0'
    const configUrl = 'http://idp/.well-known/openid-configuration'
    const tokenProviderConfig: TokenProviderConfig = {
        method: 'self_signed',
        issuer: 'unsafe-auth',
        credentials: {
            clientId: 'ledger-api-user',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        },
    }
    const mockLogger: MockedObject<Logger> = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    } as MockedObject<Logger>

    it('should test an auth token provider initialization from TokenProviderConfig', async () => {
        const authProvider = new AuthTokenProvider(
            tokenProviderConfig,
            mockLogger
        )

        const authContext = await authProvider.getAuthContext()
        expect(assertConnected(authContext)).toBe(authContext)
        expect(jwtExpired(authContext.accessToken)).toBeFalsy()
    })

    it('should test an auth token provider initialization with fromToken', async () => {
        const authProvider = new AuthTokenProvider(
            tokenProviderConfig,
            mockLogger
        )

        const token = await authProvider.getAccessToken()

        const authProviderFromToken = AuthTokenProvider.fromToken(
            token,
            mockLogger
        )
        const authContext = await authProviderFromToken.getAuthContext()
        expect(assertConnected(authContext)).toBe(authContext)
    })

    it('should test an auth token provider initialization with fromGatewayConfig', async () => {
        const idp: Idp = {
            id: 'test1',
            type: 'self_signed',
            issuer: 'unsafe-auth',
        }

        const auth: Auth = {
            method: 'self_signed',
            issuer: 'unsafe-auth',
            clientId: 'ledger-api-user',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        }

        const authProviderFromGateway = AuthTokenProvider.fromGatewayConfig(
            idp,
            auth,
            mockLogger
        )

        const authContext = await authProviderFromGateway.getAuthContext()
        expect(assertConnected(authContext)).toBe(authContext)
    })

    it('should test an auth token provider initialization with fromGatewayConfig with oauth', async () => {
        const authProvider = new AuthTokenProvider(
            tokenProviderConfig,
            mockLogger
        )

        const token = await authProvider.getAccessToken()

        const idp: Idp = {
            id: 'test1',
            type: 'oauth',
            issuer: 'unsafe-auth',
            configUrl,
        }

        const auth: Auth = {
            method: 'client_credentials',
            clientId: 'ledger-api-user',
            clientSecret: 'unsafe',
            audience: 'https://canton.network.global',
            scope: '',
        }

        const mockedServiceFactory = vi.mocked(clientCredentialsService)

        const mockFetchToken = vi.fn().mockResolvedValue(token)

        mockedServiceFactory.mockReturnValue({ fetchToken: mockFetchToken })

        const authProviderFromGateway = AuthTokenProvider.fromGatewayConfig(
            idp,
            auth,
            mockLogger
        )

        const authContext = await authProviderFromGateway.getAuthContext()
        expect(assertConnected(authContext)).toBe(authContext)
    })

    it('should verify components of a jwt token correct', () => {
        const userId = jwtUserId(jwtToken)
        const optionalEmail = jwtUserEmail(jwtToken)
        const isExpired = jwtExpired(jwtToken)
        expect(userId).toBe('ledger-api-user')
        expect(optionalEmail).toBeUndefined()
        expect(isExpired).toBeTruthy()
    })
    it('should assert connected', () => {
        const authContext = {
            userId: 'user',
            accessToken: jwtToken,
        }
        expect(assertConnected(authContext)).toBe(authContext)

        //TODO: fix this
        // expect(assertConnected(undefined)).rejects.toThrow(providerErrors.unauthorized({
        //     message: 'User is not connected',
        // }))
    })

    it('should fetch oidc user info if both the fetches return a correct config', async () => {
        const mockConfigResponse = { userinfo_endpoint: 'https://userinfo' }
        const mockUserInfoResponse = { userInfo: 'user-id' }

        if (typeof global === 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).global = window
        }

        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('openid-configuration')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConfigResponse,
                })
            }
            if (url.includes('userinfo')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockUserInfoResponse,
                })
            }

            return Promise.reject('')
        })

        const result = await fetchOidcUserInfo(configUrl, jwtToken)

        expect(result).toStrictEqual(mockUserInfoResponse)
        vi.resetAllMocks()
    })

    it('should throw an error if fetch config fails', async () => {
        const mockResponse = { data: 'fake response' }

        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: async () => mockResponse,
        } as Response)

        await expect(fetchOidcUserInfo(configUrl, jwtToken)).rejects.toThrow(
            `Failed to fetch OIDC discovery document: undefined undefined`
        )
    })

    it('should throw an error if fetch userinfo fails', async () => {
        const mockConfigResponse = { userinfo_endpoint: 'https://userinfo' }
        const mockUserInfoResponse = {
            status: 'failed',
            statusText: 'bad request',
        }

        if (typeof global === 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).global = window
        }

        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('openid-configuration')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConfigResponse,
                })
            }
            if (url.includes('userinfo')) {
                return Promise.resolve({
                    ok: false,
                    json: async () => mockUserInfoResponse,
                })
            }

            return Promise.reject('')
        })

        await expect(fetchOidcUserInfo(configUrl, jwtToken)).rejects.toThrow(
            `Failed to fetch OIDC userinfo: undefined undefined`
        )
        vi.resetAllMocks()
    })
})
