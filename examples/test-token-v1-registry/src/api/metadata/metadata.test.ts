// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRegistryInfo } from './getRegistryInfo.ts'
import { getInstrument } from './getInstrument.ts'
import { listInstruments } from './listInstruments.ts'
import { instruments, supportedApis } from './common.ts'
import { expressContext, type RequestType } from '../../__tests__/mocks.ts'
import { APIError } from '../common.ts'

const { req, res, next } = expressContext

vi.mock('../../common/state.ts', () => ({
    RegistryState: {
        instance: {
            operator: {
                party: 'admin',
            },
        },
    },
}))

describe('Metadata', () => {
    beforeEach(() => {})

    it('should get registry info', async () => {
        await getRegistryInfo(
            {} as RequestType<typeof getRegistryInfo>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith({
            adminId: 'admin',
            supportedApis,
        })
    })

    it('should list instruments', async () => {
        await listInstruments(
            {} as RequestType<typeof listInstruments>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith({
            instruments,
        })
    })

    it('should return error when trying to get non-existing instrument', () => {
        req.params = {
            instrumentId: 'id',
        }
        expect(() =>
            getInstrument(
                req as unknown as RequestType<typeof getInstrument>,
                res,
                next
            )
        ).toThrow(new APIError(404, 'Instrument not found'))
    })

    it('should get existing instrument', async () => {
        const instrument = instruments[0]
        if (!instrument) throw new Error('expected at least one instrument')
        req.params = {
            instrumentId: instrument.id,
        }
        await getInstrument(
            req as unknown as RequestType<typeof getInstrument>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(instrument)
    })
})
