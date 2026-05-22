// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Decimal from 'decimal.js'

export const toDecimalOrNull = (value: Decimal.Value): Decimal | null => {
    try {
        return new Decimal(value)
    } catch {
        return null
    }
}
