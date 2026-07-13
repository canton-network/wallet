// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LedgerApiValueEncoder } from './ledgerApiValueEncoder.js'
import * as mock from '../../../../../__test__/mocks.js'
import { Value } from '@canton-network/core-ledger-proto'
/* eslint-disable @typescript-eslint/no-explicit-any */

const { offlineCtx } = mock

describe('LedgerApiValueEncoder', () => {
    let encoder: LedgerApiValueEncoder

    beforeEach(() => {
        vi.resetAllMocks()
        encoder = new LedgerApiValueEncoder(offlineCtx)
    })

    it('should successfully encode structures below or equal to MAX_DEPTH (100)', () => {
        const generateNestedList = (depth: number): any => {
            if (depth === 1) {
                return { sum: { oneofKind: 'bool', bool: true } }
            }
            return {
                sum: {
                    oneofKind: 'list',
                    list: {
                        elements: [generateNestedList(depth - 1)],
                    },
                },
            }
        }

        const safePayload = generateNestedList(5)

        expect(() => encoder.value(safePayload)).not.toThrow()
    })

    it('should stop execution and throw error when nesting depth exceeds 100', () => {
        const generateDeeplyNestedList = (depth: number): any => {
            if (depth === 1) {
                return { sum: { oneofKind: 'bool', bool: true } }
            }
            return {
                sum: {
                    oneofKind: 'list',
                    list: {
                        elements: [generateDeeplyNestedList(depth - 1)],
                    },
                },
            }
        }

        const badPayload = generateDeeplyNestedList(101)

        expect(() => {
            encoder.value(badPayload)
        }).throws('Exceeded maximum object nesting depth of 100')
    })

    it('should reset currentDepth cleanly in the finally block for sequential calls', () => {
        const simplePayload = {
            sum: {
                oneofKind: 'bool',
                bool: true,
            } as const,
        } as unknown as Value

        encoder.value(simplePayload)
        encoder.value(simplePayload)

        expect((encoder as any).currentDepth).toBe(0)
    })
})
