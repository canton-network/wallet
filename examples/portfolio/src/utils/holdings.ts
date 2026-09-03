// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Holding, PrettyContract } from '@canton-network/core-tx-parser'

export const toPortfolioHolding = (
    contract: PrettyContract<Holding>
): Holding => ({
    ...contract.interfaceViewValue,
    contractCreatedAt: contract.activeContract.createdEvent.createdAt,
    contractId: contract.contractId,
})

export const toUniquePortfolioHoldings = (
    contracts: PrettyContract<Holding>[]
): Holding[] => {
    const holdingsByContractId = new Map<string, Holding>()

    for (const contract of contracts) {
        if (!holdingsByContractId.has(contract.contractId)) {
            holdingsByContractId.set(
                contract.contractId,
                toPortfolioHolding(contract)
            )
        }
    }

    return [...holdingsByContractId.values()]
}
