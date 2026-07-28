// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, vi, expect, afterEach } from 'vitest'
import { mock } from '../__test__/mocks'

vi.mock('./sdk', () => ({
    default: mock.sdk,
}))

const { initOperatorParty, operator } = await import('./operator')

describe('Admin', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call for keys generation', () => {
        expect(mock.sdk.keys.generate).toHaveBeenCalledOnce()

        expect(operator.keys).toStrictEqual(mock.sdk.keys.generate())
    })

    it('should init admin party', async () => {
        mock.execute.mockResolvedValueOnce({
            partyId: 'id',
        })
        await initOperatorParty()

        expect(mock.create).toHaveBeenCalledOnce()
        expect(mock.sign).toHaveBeenCalledOnce()
        expect(mock.execute).toHaveBeenCalledOnce()

        expect(operator.party).toBe('id')
    })
})
