// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    aggregateHoldings,
    enrichWithInstrumentInfo,
    type AggregatedHolding,
} from './aggregate-holdings'
import type { PortfolioHolding } from './holdings'
import { holdingsQueryOptions } from './query-options'
import { useTokenContext } from './useTokenContext'

export interface WalletHoldingsResult {
    instruments: AggregatedHolding[]
    holdings: PortfolioHolding[]
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => void
}

export const useWalletHoldings = (
    partyId: string | undefined
): WalletHoldingsResult => {
    const {
        client,
        instruments: registryInstruments,
        isLoading: isClientLoading,
        error: clientError,
    } = useTokenContext()
    const holdingsQuery = useQuery(holdingsQueryOptions({ partyId, client }))

    const aggregatedInstruments = useMemo(() => {
        if (!holdingsQuery.data) return []
        return enrichWithInstrumentInfo(
            aggregateHoldings(holdingsQuery.data),
            registryInstruments
        )
    }, [holdingsQuery.data, registryInstruments])

    return {
        instruments: aggregatedInstruments,
        holdings: holdingsQuery.data ?? [],
        isLoading: isClientLoading || holdingsQuery.isLoading,
        isError: !!clientError || holdingsQuery.isError,
        error: clientError ?? holdingsQuery.error,
        refetch: holdingsQuery.refetch,
    }
}
