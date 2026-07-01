// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQueries, useQueryClient } from '@tanstack/react-query'
import { preapprovalStatusQueryOptions } from './query-options'
import type { useWalletSdk } from './useWalletSdk'
import type { PreapprovalRow } from '../types/preapprovals'

type WalletSdk = ReturnType<typeof useWalletSdk>['sdk'] | undefined

type UsePreapprovalStatusesArgs = {
    rows: PreapprovalRow[]
    primaryParty: string | undefined
    sdk: WalletSdk
}

export function usePreapprovalStatuses({
    rows,
    primaryParty,
    sdk,
}: UsePreapprovalStatusesArgs) {
    const queryClient = useQueryClient()

    // TODO: https://github.com/canton-network/wallet/issues/2062
    // collapse N per-row status queries into one query per party.
    return useQueries({
        queries: rows.map((row) =>
            preapprovalStatusQueryOptions({
                row,
                party: primaryParty,
                sdk,
                queryClient,
            })
        ),
    })
}
