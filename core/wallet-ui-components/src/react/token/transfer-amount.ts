// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Decimal } from 'decimal.js'

const toDecimalOrNull = (value: Decimal.Value): Decimal | null => {
    try {
        return new Decimal(value)
    } catch {
        return null
    }
}

/**
 * Why `amount` can't be sent from a balance of `available` of an instrument
 * with `decimals` decimals, or undefined when it can.
 */
export function transferAmountError(
    amount: string,
    { available, decimals }: { available: string; decimals: number }
): string | undefined {
    if (amount.trim() === '') return 'Amount is required'
    const requested = toDecimalOrNull(amount.trim())
    if (!requested?.isPositive() || requested.isZero()) {
        return 'Amount must be a positive number'
    }
    if (requested.decimalPlaces() > decimals) {
        return `Amount can have at most ${decimals} decimals`
    }
    const balance = toDecimalOrNull(available)
    if (!balance || requested.gt(balance)) {
        return `Amount exceeds available balance of ${available}`
    }
    return undefined
}
