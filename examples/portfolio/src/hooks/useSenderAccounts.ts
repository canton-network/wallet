// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Account } from '@canton-network/core-token-standard-v2'
import {
    aggregateHoldings,
    getSenderAccounts,
} from '../utils/aggregate-holdings'
import { holdingsQueryOptions } from './query-options'
import { useWalletSdk } from './useWalletSdk'

export const useSenderAccounts = (partyId: string | undefined): Account[] => {
    const { sdk } = useWalletSdk()
    const { data: holdings } = useQuery(holdingsQueryOptions({ partyId, sdk }))

    return useMemo(
        () =>
            holdings
                ? getSenderAccounts(aggregateHoldings(holdings).values())
                : [],
        [holdings]
    )
}
