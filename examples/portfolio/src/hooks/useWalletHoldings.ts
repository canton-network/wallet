// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Holding } from '@canton-network/core-tx-parser'
import { useInstruments } from '@hooks/useInstruments'
import {
    aggregateHoldings,
    enrichWithInstrumentInfo,
    type AggregatedHolding,
} from '../utils/aggregate-holdings'
import { holdingsQueryOptions } from './query-options'
import { useWalletSdk } from './useWalletSdk'

export interface WalletHoldingsResult {
    instruments: AggregatedHolding[]
    holdings: Holding[]
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => void
}

export const useWalletHoldings = (
    partyId: string | undefined
): WalletHoldingsResult => {
    const registryInstruments = useInstruments()
    const {
        sdk,
        isLoading: isWalletSdkLoading,
        error: walletSdkError,
    } = useWalletSdk()
    const holdingsQuery = useQuery(holdingsQueryOptions({ partyId, sdk }))

    const aggregatedInstruments = useMemo(() => {
        if (!holdingsQuery.data) return []
        return enrichWithInstrumentInfo(
            aggregateHoldings(holdingsQuery.data),
            registryInstruments
        )
    }, [holdingsQuery.data, registryInstruments])

    const error = walletSdkError
        ? new Error(walletSdkError)
        : holdingsQuery.error

    return {
        instruments: aggregatedInstruments,
        holdings: holdingsQuery.data ?? [],
        isLoading: isWalletSdkLoading || holdingsQuery.isLoading,
        isError: !!walletSdkError || holdingsQuery.isError,
        error,
        refetch: holdingsQuery.refetch,
    }
}
