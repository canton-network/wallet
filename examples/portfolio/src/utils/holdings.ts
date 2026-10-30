// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HoldingView } from '@canton-network/core-token-standard'
import type {
    Account,
    HoldingView as HoldingViewV2,
} from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'
import type { PartyId } from '@canton-network/core-types'

export interface PortfolioHolding {
    contractId: string
    account: Account
    instrumentId: { admin: string; id: string }
    amount: string
    lock: HoldingView['lock'] | HoldingViewV2['lock'] | null
    meta: HoldingView['meta'] | HoldingViewV2['meta']
    createdAt: string
}

export const basicAccount = (owner: string): Account => ({
    owner,
    provider: 'null',
    id: '',
})

export const isBasicAccount = (account: Account) =>
    account.provider == null && account.id

export function mergeHoldings(
    v1: PrettyContract<HoldingView>[],
    v2: PrettyContract<HoldingViewV2>[]
): PortfolioHolding[] {
    const byCid = new Map<string, PortfolioHolding>()

    for (const contract of v1) {
        const view = contract.interfaceViewValue
        byCid.set(contract.contractId, {
            contractId: contract.contractId,
            account: basicAccount(view.owner),
            amount: view.amount,
            lock: view.lock ?? null,
            meta: view.meta,
            instrumentId: view.instrumentId,
            createdAt: contract.activeContract.createdEvent.createdAt,
        })
    }

    for (const contract of v2) {
        const view = contract.interfaceViewValue
        byCid.set(contract.contractId, {
            contractId: contract.contractId,
            account: view.account,
            amount: view.amount,
            lock: view.lock ?? null,
            meta: view.meta,
            instrumentId: view.instrumentId,
            createdAt: contract.activeContract.createdEvent.createdAt,
        })
    }

    return [...byCid.values()]
}

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

// export const toOwnedHoldings = (
//     contracts: PrettyContract<HoldingView>[],
//     partyId: PartyId
// ): PrettyContract<HoldingView>[] =>
//     contracts.filter(
//         (contract) => contract.interfaceViewValue.owner === partyId
// )

export const toOwnedHoldings = (
    holdings: PortfolioHolding[],
    partyId: PartyId
): PortfolioHolding[] =>
    holdings.filter((holding) => holding.account.owner === partyId)
