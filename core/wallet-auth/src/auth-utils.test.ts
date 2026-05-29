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
import { TokenProviderConfig } from './auth-token-provider.js'
import { Logger } from '@canton-network/core-types'
import { SelfSignedTokenService } from './self-signed-token-service.js'

describe('Auth Utils', () => {
    const fetchMock = vi.fn()
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

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

    it('should verify components of a jwt token correctly', async () => {
        const token = await SelfSignedTokenService.fetchToken(
            mockLogger,
            tokenProviderConfig.credentials,
            tokenProviderConfig.issuer
        )

        const userId = jwtUserId(token)
        const optionalEmail = jwtUserEmail(token)
        const isExpired = jwtExpired(token)
        expect(userId).toBe('ledger-api-user')
        expect(optionalEmail).toBeUndefined()
        expect(isExpired).toBeFalsy()
    })
    it('should assert connected', async () => {
        const token = await SelfSignedTokenService.fetchToken(
            mockLogger,
            tokenProviderConfig.credentials,
            tokenProviderConfig.issuer
        )

        const authContext = {
            userId: 'user',
            accessToken: token,
        }
        expect(assertConnected(authContext)).toBe(authContext)
    })

    it('should fetch oidc user info if both the fetches return a correct config', async () => {
        const mockConfigResponse = { userinfo_endpoint: 'https://userinfo' }
        const mockUserInfoResponse = { userInfo: 'user-id' }

        const token = await SelfSignedTokenService.fetchToken(
            mockLogger,
            tokenProviderConfig.credentials,
            tokenProviderConfig.issuer
        )

        fetchMock.mockImplementation((url) => {
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

        const result = await fetchOidcUserInfo(configUrl, token)

        expect(result).toStrictEqual(mockUserInfoResponse)
    })

    it('should throw an error if fetch config fails', async () => {
        const token = await SelfSignedTokenService.fetchToken(
            mockLogger,
            tokenProviderConfig.credentials,
            tokenProviderConfig.issuer
        )

        fetchMock.mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                json: async () => '',
                status: 400,
                statusText: 'Bad request',
            })
        })

        await expect(fetchOidcUserInfo(configUrl, token)).rejects.toThrow(
            `Failed to fetch OIDC discovery document: 400 Bad request`
        )
    })

    it('should throw an error if fetch userinfo fails', async () => {
        const mockConfigResponse = { userinfo_endpoint: 'https://userinfo' }

        const token = await SelfSignedTokenService.fetchToken(
            mockLogger,
            tokenProviderConfig.credentials,
            tokenProviderConfig.issuer
        )

        fetchMock.mockImplementation((url) => {
            if (url.includes('openid-configuration')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConfigResponse,
                })
            }
            if (url.includes('userinfo')) {
                return Promise.resolve({
                    ok: false,
                    json: async () => '',
                    status: 400,
                    statusText: 'Bad request',
                })
            }

            return Promise.reject('')
        })

        await expect(fetchOidcUserInfo(configUrl, token)).rejects.toThrow(
            `Failed to fetch OIDC userinfo: 400 Bad request`
        )
    })
})
