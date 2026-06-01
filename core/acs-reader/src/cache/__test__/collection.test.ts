// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ACSCacheCollection } from '../collection'

const { mockCache, MockACSCache } = vi.hoisted(() => {
    const update = vi.fn()
    const calculateAt = vi.fn()

    const mockCache = {
        update,
        calculateAt,
    }

    const MockACSCache = vi.fn(
        class {
            update = update
            calculateAt = calculateAt
        }
    )

    return { mockCache, MockACSCache }
})

vi.mock('../cache', () => ({
    ACSCache: MockACSCache,
}))

const ledgerProvider = vi.hoisted(() => ({
    request: vi.fn(),
}))

describe('cache collection', () => {
    let collection: ACSCacheCollection

    beforeEach(() => {
        vi.clearAllMocks()
        mockCache.update.mockResolvedValue(undefined)
        mockCache.calculateAt.mockReturnValue([
            {
                workflowId: 'test-workflow',
                contractEntry: {
                    JsActiveContract: {
                        createdEvent: {
                            contractId: 'contract-1',
                            templateId: 'template1',
                        },
                        synchronizerId: 'sync1',
                        reassignmentCounter: 0,
                    },
                },
            },
        ])

        collection = new ACSCacheCollection(ledgerProvider)
    })

    it('should create cache collection with default options', () => {
        expect(collection).toBeDefined()
    })

    it('should create cache collection with custom options', () => {
        const customCollection = new ACSCacheCollection(ledgerProvider, {
            maxSize: 50,
            entryExpirationTimeInMS: 5 * 60 * 1000,
        })
        expect(customCollection).toBeDefined()
    })

    describe('readFromCache', () => {
        it('should read from cache with single party and template', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            const result = await collection.readFromCache(options)

            expect(MockACSCache).toHaveBeenCalledWith(ledgerProvider)
            expect(mockCache.update).toHaveBeenCalledWith(options)
            expect(mockCache.calculateAt).toHaveBeenCalledWith(100)
            expect(result).toHaveLength(1)
        })

        it('should read from cache with multiple parties and templates', async () => {
            const options = {
                offset: 100,
                parties: ['party1', 'party2'],
                templateIds: ['template1', 'template2'],
            }

            const result = await collection.readFromCache(options)

            // Should create 4 cache instances (2 parties × 2 templates)
            expect(MockACSCache).toHaveBeenCalledTimes(4)
            expect(mockCache.update).toHaveBeenCalledTimes(4)
            expect(mockCache.calculateAt).toHaveBeenCalledTimes(4)
            expect(result).toHaveLength(4)
        })

        it('should read from cache with parties and interfaces', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                interfaceIds: ['interface1', 'interface2'],
            }

            const result = await collection.readFromCache(options)

            // Should create 2 cache instances (1 party × 2 interfaces)
            expect(MockACSCache).toHaveBeenCalledTimes(2)
            expect(mockCache.update).toHaveBeenCalledTimes(2)
            expect(result).toHaveLength(2)
        })

        it('should read from cache with parties, templates, and interfaces', async () => {
            const options = {
                offset: 150,
                parties: ['party1'],
                templateIds: ['template1'],
                interfaceIds: ['interface1'],
            }

            const result = await collection.readFromCache(options)

            // Should create 2 cache instances (1 for interface, 1 for template)
            expect(MockACSCache).toHaveBeenCalledTimes(2)
            expect(mockCache.update).toHaveBeenCalledTimes(2)
            expect(mockCache.calculateAt).toHaveBeenCalledWith(150)
            expect(result).toHaveLength(2)
        })

        it('should reuse existing cache for same key', async () => {
            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            await collection.readFromCache(options)
            await collection.readFromCache(options)

            // Should only create cache once
            expect(MockACSCache).toHaveBeenCalledOnce()
            // But should update and calculate twice
            expect(mockCache.update).toHaveBeenCalledTimes(2)
            expect(mockCache.calculateAt).toHaveBeenCalledTimes(2)
        })

        it('should create different caches for different keys', async () => {
            await collection.readFromCache({
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            })

            await collection.readFromCache({
                offset: 100,
                parties: ['party2'],
                templateIds: ['template1'],
            })

            // Should create two different caches
            expect(MockACSCache).toHaveBeenCalledTimes(2)
        })

        it('should flatten results from multiple queries', async () => {
            mockCache.calculateAt.mockReturnValue([
                {
                    contractEntry: {
                        JsActiveContract: {
                            createdEvent: { contractId: 'c1' },
                        },
                    },
                },
                {
                    contractEntry: {
                        JsActiveContract: {
                            createdEvent: { contractId: 'c2' },
                        },
                    },
                },
            ])

            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1', 'template2'],
            }

            const result = await collection.readFromCache(options)

            // 2 templates × 2 contracts per template = 4 total contracts
            expect(result).toHaveLength(4)
        })

        it('should query all keys in parallel', async () => {
            const updatePromises: Array<() => void> = []
            mockCache.update.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        updatePromises.push(() => resolve(undefined))
                    })
            )

            const options = {
                offset: 100,
                parties: ['party1', 'party2'],
                templateIds: ['template1', 'template2'],
            }

            const resultPromise = collection.readFromCache(options)

            // Wait a bit to ensure all updates are called
            await new Promise((resolve) => setTimeout(resolve, 10))

            // All 4 updates should be called before any resolves
            expect(mockCache.update).toHaveBeenCalledTimes(4)
            expect(mockCache.calculateAt).not.toHaveBeenCalled()

            // Resolve all promises
            updatePromises.forEach((resolve) => resolve())

            await resultPromise

            expect(mockCache.calculateAt).toHaveBeenCalledTimes(4)
        })

        it('should handle cache update errors', async () => {
            mockCache.update.mockRejectedValue(new Error('Update failed'))

            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            await expect(collection.readFromCache(options)).rejects.toThrow(
                'Update failed'
            )
        })

        it('should handle calculateAt errors', async () => {
            mockCache.calculateAt.mockImplementation(() => {
                throw new Error('Calculate failed')
            })

            const options = {
                offset: 100,
                parties: ['party1'],
                templateIds: ['template1'],
            }

            await expect(collection.readFromCache(options)).rejects.toThrow(
                'Calculate failed'
            )
        })
    })
})
