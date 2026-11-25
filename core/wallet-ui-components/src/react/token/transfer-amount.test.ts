// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { transferAmountError } from './transfer-amount.ts'

const balance = { available: '10.5', decimals: 2 }

describe('transferAmountError', () => {
    it('refuses more decimals than the instrument has', () => {
        expect(transferAmountError('1.25', balance)).toBeUndefined()
        expect(transferAmountError('1.255', balance)).toBe(
            'Amount can have at most 2 decimals'
        )
    })

    it('refuses more than the available balance', () => {
        expect(transferAmountError('10.5', balance)).toBeUndefined()
        expect(transferAmountError('10.51', balance)).toBe(
            'Amount exceeds available balance of 10.5'
        )
    })

    it('refuses an amount that isn’t a plain decimal', () => {
        for (const amount of ['0x10', '1_0', '1e2', '-1']) {
            expect(
                transferAmountError(amount, { available: '1000', decimals: 2 })
            ).toBe('Amount must be digits, with an optional decimal point')
        }
    })
})
