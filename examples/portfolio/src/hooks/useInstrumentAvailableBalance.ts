// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { InstrumentId } from '@canton-network/core-token-standard'
import {
    aggregateHoldings,
    getInstrumentKey,
    type AggregatedAccountBalance,
} from '../utils/aggregate-holdings'
import { useMemo } from 'react'
import type { Account } from '@canton-network/core-token-standard-v2'
import { useWalletSdk } from './useWalletSdk'
import { holdingsQueryOptions } from './query-options'
import { useQuery } from '@tanstack/react-query'
import { basicAccount } from '@utils/holdings'

export const useInstrumentAvailableBalance = (
    partyId: string | undefined,
    instrumentId: InstrumentId | null,
    account?: Account
): AggregatedAccountBalance | null => {
    const { sdk } = useWalletSdk()
    const holdingsQuery = useQuery(holdingsQueryOptions({ partyId, sdk }))
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
