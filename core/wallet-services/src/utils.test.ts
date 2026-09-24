// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi } from 'vitest'
import { ledgerPrepareParams, logDynamically } from './utils'

import type { Logger } from 'pino'

const mockLevelEnabled = vi.fn(() => false)

export const createTestLogger = (): Logger => {
    return {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        child: vi.fn(() => createTestLogger()),
        isLevelEnabled: mockLevelEnabled,
    } as unknown as Logger
}

describe('utils', () => {
    it('should call ledgerPrepareParams', () => {
        const result = ledgerPrepareParams({
            userId: 'alice',
            partyIds: ['alice'],
            synchronizerId: 'sync1',
            params: {
                disclosedContracts: [
                    {
                        templateId: 'mock-template-id',
                        contractId: 'mock-contract-id',
                        createdEventBlob: 'mock-created-event-blob',
                        synchronizerId: 'mock-synchronizer-id',
                    },
                ],
            },
            hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V2',
        })
        expect(result).toBeDefined()
    })

    it('logDynamically should log correctly', () => {
        const logger = createTestLogger()
        const msg = 'test message'
        const data = {
            info: { key: 'value' },
            debug: { debugKey: 'debugValue' },
        }

        mockLevelEnabled.mockReturnValueOnce(true)
        logDynamically(logger, msg, data)

        expect(logger.debug).toHaveBeenCalledWith(
            { ...data.info, ...data.debug },
            msg
        )

        logDynamically(logger, msg, data)

        expect(logger.info).toHaveBeenCalledWith(data.info, msg)
    })

    it('logDynamically without extra data info', () => {
        const logger = createTestLogger()
        const msg = 'test message'

        logDynamically(logger, msg, { debug: { key: 'value' } })

        expect(logger.info).toHaveBeenCalledWith(msg)
    })
})
