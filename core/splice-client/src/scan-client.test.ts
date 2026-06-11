// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScanClient } from './scan-client.js'
import {
    createAccessTokenProvider,
    getRequestHeaders,
    getRequestMethod,
    jsonResponse,
    mockLogger,
} from './test-utils.js'

const BASE_URL = new URL('https://scan.example/')

describe('ScanClient', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('sends Authorization header on GET when access token is available', async () => {
        const accessTokenProvider = createAccessTokenProvider('scan-token')
        fetchMock.mockResolvedValue(jsonResponse({ dso: 'DSO::abc' }))

        const client = new ScanClient(BASE_URL, mockLogger, accessTokenProvider)
        await client.get('/v0/dso-party-id')

        expect(accessTokenProvider.getAccessToken).toHaveBeenCalledOnce()
        const headers = getRequestHeaders(fetchMock, '/v0/dso-party-id')
        expect(headers.authorization).toBe('Bearer scan-token')
        expect(headers['content-type']).toBe('application/json')
    })

    it('omits Authorization header on GET when access token is unavailable', async () => {
        const accessTokenProvider = createAccessTokenProvider(undefined)
        fetchMock.mockResolvedValue(jsonResponse({ dso: 'DSO::abc' }))

        const client = new ScanClient(BASE_URL, mockLogger, accessTokenProvider)
        await client.get('/v0/dso-party-id')

        const headers = getRequestHeaders(fetchMock, '/v0/dso-party-id')
        expect(headers.authorization).toBeUndefined()
        expect(headers['content-type']).toBe('application/json')
    })

    it('returns parsed GET response data', async () => {
        const responseBody = { dso_party_id: 'DSO::party' }
        fetchMock.mockResolvedValue(jsonResponse(responseBody))

        const client = new ScanClient(
            BASE_URL,
            mockLogger,
            createAccessTokenProvider()
        )
        const result = await client.get('/v0/dso-party-id')

        expect(result).toEqual(responseBody)
    })

    it('returns parsed POST response data', async () => {
        const responseBody = { updates: [] }
        fetchMock.mockResolvedValue(jsonResponse(responseBody))

        const client = new ScanClient(
            BASE_URL,
            mockLogger,
            createAccessTokenProvider()
        )
        const result = await client.post('/v2/updates', { page_size: 200 })

        expect(result).toEqual(responseBody)
        expect(getRequestMethod(fetchMock, '/v2/updates')).toBe('POST')
    })

    it('rejects when the API returns an error response', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ message: 'not found' }, 404))

        const client = new ScanClient(
            BASE_URL,
            mockLogger,
            createAccessTokenProvider()
        )

        await expect(client.get('/v0/dso-party-id')).rejects.toBeDefined()
    })

    it('returns initial active synchronizer when no future values exist', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({
                amulet_rules: {
                    contract: {
                        payload: {
                            configSchedule: {
                                initialValue: {
                                    decentralizedSynchronizer: {
                                        activeSynchronizer: 'sync-init',
                                    },
                                },
                                futureValues: [],
                            },
                        },
                    },
                },
            })
        )

        const client = new ScanClient(
            BASE_URL,
            mockLogger,
            createAccessTokenProvider()
        )

        await expect(client.getAmuletSynchronizerId()).resolves.toBe(
            'sync-init'
        )
    })

    it('returns last future active synchronizer when future values exist', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse({
                amulet_rules: {
                    contract: {
                        payload: {
                            configSchedule: {
                                initialValue: {
                                    decentralizedSynchronizer: {
                                        activeSynchronizer: 'sync-init',
                                    },
                                },
                                futureValues: [
                                    {
                                        decentralizedSynchronizer: {
                                            activeSynchronizer: 'sync-future-1',
                                        },
                                    },
                                    {
                                        decentralizedSynchronizer: {
                                            activeSynchronizer: 'sync-future-2',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            })
        )

        const client = new ScanClient(
            BASE_URL,
            mockLogger,
            createAccessTokenProvider()
        )

        await expect(client.getAmuletSynchronizerId()).resolves.toBe(
            'sync-future-2'
        )
    })
})
