// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRegistryInfo } from './getRegistryInfo'
import { getInstrument } from './getInstrument'
import { listInstruments } from './listInstruments'
import { Operations } from '../../openapi-ts/token-metadata-v1'
import { instruments, supportedApis } from './common'

const emptyCtx = {} as Operations[
    | 'getRegistryInfo'
    | 'listInstruments']['context']

vi.mock('../../common/admin', () => ({
    admin: {
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
        } as Operations['getInstrument']['context'])

        expect(result.status).toBe(404)
    })

    it('should get existing instrument', async () => {
        const result = await getInstrument({
            request: {
                params: {
                    instrumentId: instruments[0].id,
                },
            },
        } as Operations['getInstrument']['context'])

        expect(result).toStrictEqual({
            payload: instruments[0],
        })
    })
})
