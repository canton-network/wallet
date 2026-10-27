// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Decimal } from 'decimal.js'
import type { Numeric } from '@canton-network/core-types'

/**
 * Client-side mirror of the pricing arithmetic in
 * `damljs/traffic-purchase-models/daml/Tea/TrafficPurchase.daml`.
 *
 * The registry needs the exact amount before the ledger calculates it.
 * `TrafficPurchaser_PurchaseCredits` calculates the cost of the requested
 * traffic and passes that amount to `TransferFactory_Transfer`. The registry's
 * choice context must therefore be fetched for a transfer of that same amount.
 * Even a one-unit difference would make the context inconsistent with the
 * transfer.
 */

/** A Daml `Decimal` carries exactly 10 decimal places. */
const DAML_DECIMAL_PLACES = 10

/** A Daml `Decimal` is bounded at 38 significant digits. */
const DamlDecimal = Decimal.clone({
    precision: 38,
    toExpNeg: -40,
    toExpPos: 40,
})

function parseAsDamlDecimal(value: Numeric, fieldName: string): Decimal {
    if (!/^-?\d+(\.\d+)?$/.test(value)) {
        throw new Error(
            `Expected ${fieldName} to be a decimal number, got "${value}"`
        )
    }
    return new DamlDecimal(value)
}

function assertPositiveRate(rate: Numeric): Decimal {
    const conversionRate = parseAsDamlDecimal(rate, 'conversion rate')
    if (conversionRate.lessThanOrEqualTo(0)) {
        throw new Error(
            `Expected the conversion rate to be positive, got "${rate}"`
        )
    }
    return conversionRate
}

/**
 * Traffic is measured in whole bytes, so fractional amounts are rounded down.
 * The model accepts only whole numbers; rounding up could grant unpaid traffic.
 */
export function wholeBytes(amount: Numeric): Numeric {
    return parseAsDamlDecimal(amount, 'the traffic amount').floor().toFixed()
}

/**
 * Calculates the asset amount needed for `traffic` bytes at `rate` bytes per unit.
 * Matches Daml's 10-decimal, half-even rounding.
 */
export function assetNeededFor(traffic: Numeric, rate: Numeric): Numeric {
    return parseAsDamlDecimal(traffic, 'traffic amount')
        .dividedBy(assertPositiveRate(rate))
        .toDecimalPlaces(DAML_DECIMAL_PLACES, Decimal.ROUND_HALF_EVEN)
        .toFixed()
}

/**
 * Checks that a figure is a Daml `Decimal`, and returns it as the ledger spells
 * one.
 *
 * For a figure that arrived from somewhere this code does not control -- a
 * paymaster's off-ledger API, say -- and is about to be fed into the arithmetic
 * above. `assetNeededFor` would turn `'1e6'` or `'1,048,576'` into an asset
 * amount nobody asked for, and that amount is then sent to a registry as a real
 * transfer request, so it has to be refused here rather than reinterpreted.
 */
export function damlDecimal(value: Numeric, field: string): Numeric {
    return parseAsDamlDecimal(value, field).toFixed()
}

/** Sums holding amounts the way `ConversionRate_ValidateAssets` does. */
export function sumAmounts(amounts: Numeric[]): Numeric {
    return amounts
        .reduce(
            (total, amount) => total.plus(parseAsDamlDecimal(amount, 'amount')),
            new DamlDecimal(0)
        )
        .toFixed()
}
