// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'
import {
    aggregateHoldings,
    enrichWithInstrumentInfo,
} from './aggregate-holdings'
import { holdingsQueryOptions } from './query-options'
import { useTokenContext } from './TokenProvider'

export const useAggregatedHoldings = (partyId: string | undefined) => {
    const {
        client,
        instruments,
        isLoading: isClientLoading,
        error: clientError,
    } = useTokenContext()

    const holdingsQuery = useQuery({
        ...holdingsQueryOptions({ partyId, client }),
        select: (holdings) =>
            enrichWithInstrumentInfo(aggregateHoldings(holdings), instruments),
    })

    return {
        instruments: holdingsQuery.data ?? [],
        isLoading: isClientLoading || holdingsQuery.isLoading,
        isError: !!clientError || holdingsQuery.isError,
        error: clientError ?? holdingsQuery.error,
        refetch: holdingsQuery.refetch,
    }
}
