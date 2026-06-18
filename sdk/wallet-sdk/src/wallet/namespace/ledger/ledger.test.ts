// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as mock from '../../__test__/mocks'
import { LedgerNamespace } from './namespace'
import { PreparedTransaction } from '../transactions/prepared'

const { ctx, ledgerProvider } = mock

const { MockACSReader } = vi.hoisted(() => {
    class MockACSReader {}

    return {
        MockACSReader,
    }
})

vi.mock('@canton-network/core-acs-reader', () => {
    return {
        ACSReader: MockACSReader,
    }
})

describe('Ledger Namespace', () => {
    let ledger: LedgerNamespace

    beforeEach(() => {
        vi.clearAllMocks()

        ledger = new LedgerNamespace(ctx)
    })

    it('should expose interface', () => {
        expect(ledger.dar).toBeDefined()
        expect(ledger.internal).toBeDefined()
        expect(ledger.preparedTransaction).toBeDefined()
        expect(ledger.acsReader).toBeDefined()
    })

    it('should call for correct endpoint when retrieving the ledger end offset', async () => {
        ledgerProvider.request.mockResolvedValueOnce({
            offset: 150,
        })

        const result = await ledger.ledgerEnd()

        expect(ledgerProvider.request).toHaveBeenCalledExactlyOnceWith({
            method: 'ledgerApi',
            params: {
                resource: '/v2/state/ledger-end',
                requestMethod: 'get',
            },
        })
        expect(result).toBe(150)
    })

    it('should successfully create a prepared transaction instance', () => {
        const preparedTransaction = ledger.prepare({
            partyId: 'partyId',
            commands: [],
        })

        expect(preparedTransaction).toBeInstanceOf(PreparedTransaction)
    })
})
