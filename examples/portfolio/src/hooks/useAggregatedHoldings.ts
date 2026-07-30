// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'
import { useInstruments } from '@hooks/useInstruments'
import {
    aggregateHoldings,
    enrichWithInstrumentInfo,
} from '../utils/aggregate-holdings'
import { holdingsQueryOptions } from './query-options'
import { useWalletSdk } from './useWalletSdk'

export const useAggregatedHoldings = (partyId: string | undefined) => {
    const instruments = useInstruments()
    const {
        sdk,
        isLoading: isWalletSdkLoading,
        error: walletSdkError,
    } = useWalletSdk()

    const holdingsQuery = useQuery({
        ...holdingsQueryOptions({ partyId, sdk }),
        select: (holdings) =>
            enrichWithInstrumentInfo(aggregateHoldings(holdings), instruments),
    })

    const error = walletSdkError
        ? new Error(walletSdkError)
        : holdingsQuery.error

    return {
        instruments: holdingsQuery.data ?? [],
        isLoading: isWalletSdkLoading || holdingsQuery.isLoading,
        isError: !!walletSdkError || holdingsQuery.isError,
        error,
        refetch: holdingsQuery.refetch,
    }
}
