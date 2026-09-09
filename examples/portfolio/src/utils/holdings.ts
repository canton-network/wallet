// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HoldingView } from '@canton-network/core-token-standard'
import type { PrettyContract } from '@canton-network/core-tx-parser'

export const toUniquePortfolioHoldings = (
    contracts: PrettyContract<HoldingView>[]
): PrettyContract<HoldingView>[] => {
    const holdingsByContractId = new Map<string, PrettyContract<HoldingView>>()

    for (const contract of contracts) {
        if (!holdingsByContractId.has(contract.contractId)) {
            holdingsByContractId.set(contract.contractId, contract)
        }
    }

    return [...holdingsByContractId.values()]
}
