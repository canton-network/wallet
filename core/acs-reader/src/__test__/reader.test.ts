// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ACSReader } from '../reader'

const { mockCacheCollection, MockACSCacheCollection } = vi.hoisted(() => {
    const readFromCache = vi.fn()

    const mockCacheCollection = {
        readFromCache,
    }

    const MockACSCacheCollection = vi.fn(
        class {
            readFromCache = readFromCache
        }
    )

    return { mockCacheCollection, MockACSCacheCollection }
})

const { mockService, MockAcsService } = vi.hoisted(() => {
    const getActiveContracts = vi.fn()

    const mockService = {
        getActiveContracts,
    }

    const MockAcsService = vi.fn(
        class {
            getActiveContracts = getActiveContracts
        }
    )

    return { mockService, MockAcsService }
})

vi.mock('../cache/collection', () => ({
    ACSCacheCollection: MockACSCacheCollection,
}))

vi.mock('../service', () => ({
    AcsService: MockAcsService,
}))

const ledgerProvider = vi.hoisted(() => ({
    request: vi.fn(),
}))

describe('reader', () => {
    let reader: ACSReader

    const mockActiveContracts = [
        {
            workflowId: 'wf1',
            contractEntry: {
                JsActiveContract: {
                    createdEvent: {
                        contractId: 'contract-1',
                        templateId: 'template1',
                        contractKey: null,
                        createArguments: {},
                        createdAt: '2024-01-01T00:00:00Z',
                        signatories: ['party1'],
                        observers: [],
                    },
                    synchronizerId: 'sync1',
                    reassignmentCounter: 0,
                },
            },
        },
        {
            workflowId: 'wf2',
            contractEntry: {
                JsActiveContract: {
                    createdEvent: {
                        contractId: 'contract-2',
                        templateId: 'template2',
                        contractKey: null,
                        createArguments: {},
                        createdAt: '2024-01-01T00:00:00Z',
                        signatories: ['party2'],
                        observers: [],
                    },
                    synchronizerId: 'sync2',
                    reassignmentCounter: 0,
                },
            },
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        mockService.getActiveContracts.mockResolvedValue(mockActiveContracts)
        mockCacheCollection.readFromCache.mockResolvedValue(mockActiveContracts)
        ledgerProvider.request.mockResolvedValue({ offset: 1000 })

        reader = new ACSReader(ledgerProvider)
    })

    it('should initialize cache collection and service', () => {
        expect(MockACSCacheCollection).toHaveBeenCalledWith(
            ledgerProvider,
            undefined
        )
        expect(MockAcsService).toHaveBeenCalledWith(ledgerProvider)
    })

    it('should initialize with custom cache options', () => {
        const cacheOptions = {
            maxSize: 50,
            entryExpirationTimeInMS: 5 * 60 * 1000,
        }

        new ACSReader(ledgerProvider, cacheOptions)

        expect(MockACSCacheCollection).toHaveBeenCalledWith(
            ledgerProvider,
            cacheOptions
        )
    })

    describe('raw.read', () => {
        it('should read active contracts directly without cache', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            const result = await reader.raw.read(options)

            expect(mockService.getActiveContracts).toHaveBeenCalledWith(options)
            expect(result).toEqual(mockActiveContracts)
            expect(mockCacheCollection.readFromCache).not.toHaveBeenCalled()
        })

        it('should resolve offset when not provided', async () => {
            ledgerProvider.request.mockResolvedValue({ offset: 500 })

            const options = {
                parties: ['party1'],
                templateIds: ['template1'],
            }

            await reader.raw.read(options)

            expect(ledgerProvider.request).toHaveBeenCalledWith({
                method: 'ledgerApi',
                params: {
                    resource: '/v2/state/ledger-end',
                    requestMethod: 'get',
                },
            })

            expect(mockService.getActiveContracts).toHaveBeenCalledWith({
                ...options,
                offset: 500,
            })
        })

        it('should handle empty results', async () => {
            mockService.getActiveContracts.mockResolvedValue([])

            const result = await reader.raw.read({
                offset: 100,
                parties: ['party1'],
            })

            expect(result).toEqual([])
        })
    })

    describe('raw.readJsContracts', () => {
        it('should read and transform to JS contracts', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            const result = await reader.raw.readJsContracts(options)

            expect(mockService.getActiveContracts).toHaveBeenCalledWith(options)
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                contractId: 'contract-1',
                templateId: 'template1',
                contractKey: null,
                createArguments: {},
                createdAt: '2024-01-01T00:00:00Z',
                signatories: ['party1'],
                observers: [],
                synchronizerId: 'sync1',
            })
        })

        it('should filter out contracts without JsActiveContract', async () => {
            const mixedContracts = [
                ...mockActiveContracts,
                {
                    workflowId: 'wf3',
                    contractEntry: null,
                },
                {
                    workflowId: 'wf4',
                    contractEntry: {
                        OtherType: {},
                    },
                },
            ]

            mockService.getActiveContracts.mockResolvedValue(mixedContracts)

            const result = await reader.raw.readJsContracts({
                offset: 100,
                parties: ['party1'],
            })

            expect(result).toHaveLength(2)
        })

        it('should return empty array when no contracts', async () => {
            mockService.getActiveContracts.mockResolvedValue([])

            const result = await reader.raw.readJsContracts({
                offset: 100,
                parties: ['party1'],
            })

            expect(result).toEqual([])
        })
    })

    describe('read', () => {
        it('should read active contracts from cache', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            const result = await reader.read(options)

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith(
                options
            )
            expect(result).toEqual(mockActiveContracts)
            expect(mockService.getActiveContracts).not.toHaveBeenCalled()
        })

        it('should resolve offset when not provided', async () => {
            ledgerProvider.request.mockResolvedValue({ offset: 750 })

            const options = {
                parties: ['party1'],
                templateIds: ['template1'],
            }

            await reader.read(options)

            expect(ledgerProvider.request).toHaveBeenCalledWith({
                method: 'ledgerApi',
                params: {
                    resource: '/v2/state/ledger-end',
                    requestMethod: 'get',
                },
            })

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith({
                ...options,
                offset: 750,
            })
        })

        it('should handle empty cache results', async () => {
            mockCacheCollection.readFromCache.mockResolvedValue([])

            const result = await reader.read({
                offset: 100,
                parties: ['party1'],
            })

            expect(result).toEqual([])
        })

        it('should work with multiple parties and templates', async () => {
            const options = {
                offset: 200,
                parties: ['party1', 'party2'],
                templateIds: ['template1', 'template2'],
            }

            await reader.read(options)

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith(
                options
            )
        })

        it('should work with interface IDs', async () => {
            const options = {
                offset: 200,
                parties: ['party1'],
                interfaceIds: ['interface1'],
            }

            await reader.read(options)

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith(
                options
            )
        })
    })

    describe('readJsContracts', () => {
        it('should read from cache and transform to JS contracts', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            const result = await reader.readJsContracts(options)

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith(
                options
            )
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                contractId: 'contract-1',
                templateId: 'template1',
                contractKey: null,
                createArguments: {},
                createdAt: '2024-01-01T00:00:00Z',
                signatories: ['party1'],
                observers: [],
                synchronizerId: 'sync1',
            })
            expect(result[1]).toEqual({
                contractId: 'contract-2',
                templateId: 'template2',
                contractKey: null,
                createArguments: {},
                createdAt: '2024-01-01T00:00:00Z',
                signatories: ['party2'],
                observers: [],
                synchronizerId: 'sync2',
            })
        })

        it('should filter out contracts without JsActiveContract', async () => {
            const mixedContracts = [
                mockActiveContracts[0],
                {
                    workflowId: 'wf3',
                    contractEntry: null,
                },
                mockActiveContracts[1],
                {
                    workflowId: 'wf4',
                    contractEntry: {
                        OtherType: {},
                    },
                },
            ]

            mockCacheCollection.readFromCache.mockResolvedValue(mixedContracts)

            const result = await reader.readJsContracts({
                offset: 100,
                parties: ['party1'],
            })

            expect(result).toHaveLength(2)
            expect(result[0].contractId).toBe('contract-1')
            expect(result[1].contractId).toBe('contract-2')
        })

        it('should return empty array when cache is empty', async () => {
            mockCacheCollection.readFromCache.mockResolvedValue([])

            const result = await reader.readJsContracts({
                offset: 100,
                parties: ['party1'],
            })

            expect(result).toEqual([])
        })

        it('should preserve synchronizerId in output', async () => {
            const result = await reader.readJsContracts({
                offset: 100,
                parties: ['party1'],
            })

            expect(result[0].synchronizerId).toBe('sync1')
            expect(result[1].synchronizerId).toBe('sync2')
        })

        it('should resolve offset before reading from cache', async () => {
            ledgerProvider.request.mockResolvedValue({ offset: 999 })

            await reader.readJsContracts({
                parties: ['party1'],
                templateIds: ['template1'],
            })

            expect(ledgerProvider.request).toHaveBeenCalledWith({
                method: 'ledgerApi',
                params: {
                    resource: '/v2/state/ledger-end',
                    requestMethod: 'get',
                },
            })

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith({
                parties: ['party1'],
                templateIds: ['template1'],
                offset: 999,
            })
        })
    })

    describe('error handling', () => {
        it('should propagate errors from service', async () => {
            const error = new Error('Service error')
            mockService.getActiveContracts.mockRejectedValue(error)

            await expect(
                reader.raw.read({ offset: 100, parties: ['party1'] })
            ).rejects.toThrow('Service error')
        })

        it('should propagate errors from cache', async () => {
            const error = new Error('Cache error')
            mockCacheCollection.readFromCache.mockRejectedValue(error)

            await expect(
                reader.read({ offset: 100, parties: ['party1'] })
            ).rejects.toThrow('Cache error')
        })

        it('should propagate errors from ledger-end request', async () => {
            const error = new Error('Ledger error')
            ledgerProvider.request.mockRejectedValue(error)

            await expect(reader.read({ parties: ['party1'] })).rejects.toThrow(
                'Ledger error'
            )
        })

        it('should handle null offset from ledger-end gracefully', async () => {
            ledgerProvider.request.mockResolvedValue({ offset: null })

            await reader.read({ parties: ['party1'] })

            expect(mockCacheCollection.readFromCache).toHaveBeenCalledWith({
                parties: ['party1'],
                offset: null,
            })
        })
    })
})
