// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { InstrumentId } from '@canton-network/core-token-standard'
import type { Account } from '@canton-network/core-token-standard-v2'
import {
    aggregateHoldings,
    getInstrumentKey,
    type AggregatedAccountBalance,
} from './aggregate-holdings'
import { basicAccount } from './holdings'
import { holdingsQueryOptions } from './query-options'
import { useTokenContext } from './TokenProvider'

export const useInstrumentAvailableBalance = (
    partyId: string | undefined,
    instrumentId: InstrumentId | null,
    account?: Account
): AggregatedAccountBalance | null => {
    const { client } = useTokenContext()
    const holdingsQuery = useQuery(holdingsQueryOptions({ partyId, client }))
    const holdings = holdingsQuery.data

    return useMemo(() => {
        if (!instrumentId || !partyId || !holdings) {
            return null
        }
        const sender = account ?? basicAccount(partyId)

        const asset = aggregateHoldings(holdings).get(
            getInstrumentKey(instrumentId)
        )

        return (
            asset?.accountBalances.find((balance) =>
                sameAccount(balance.account, sender)
            ) ?? null
        )
    }, [partyId, instrumentId, holdings, account])
}

function sameAccount(a: Account, b: Account): boolean {
    return a.owner === b.owner && a.provider === b.provider && a.id === b.id
}
