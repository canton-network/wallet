// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRegistryInfo } from './getRegistryInfo'
import { getInstrument } from './getInstrument'
import { listInstruments } from './listInstruments'
import { instruments, supportedApis } from './common'
import { Handler } from 'openapi-backend'

const emptyCtx = {} as Parameters<Handler>[0]

vi.mock('../../common/operator', () => ({
    operator: {
        party: 'admin',
    },
}))

describe('Metadata', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should get registry info', async () => {
        const result = await getRegistryInfo(emptyCtx)

        expect(result).toStrictEqual({
            payload: {
                adminId: 'admin',
                supportedApis,
            },
        })
    })

    it('should list instruments', async () => {
        const result = await listInstruments(emptyCtx)

        expect(result).toStrictEqual({
            payload: {
                instruments,
            },
        })
    })

    it('should return error when trying to get non-existing instrument', async () => {
        const result = await getInstrument({
            request: {
                params: {
                    instrumentId: 'id',
                },
            },
        } as Parameters<Handler>[0])

        expect(result.status).toBe(404)
    })

    it('should get existing instrument', async () => {
        const result = await getInstrument({
            request: {
                params: {
                    instrumentId: instruments[0].id,
                },
            },
        } as Parameters<Handler>[0])

        expect(result).toStrictEqual({
            payload: instruments[0],
        })
    })
})
