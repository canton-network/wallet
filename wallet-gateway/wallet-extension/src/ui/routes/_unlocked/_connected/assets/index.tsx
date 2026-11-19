// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { holdingsQueryOptions } from '@canton-network/core-wallet-ui-components/react/token'
import { createFileRoute } from '@tanstack/react-router'
import {
    AssetsPage,
    tokenInstrumentsQuery,
    toTokenWallets,
} from '@/ui/features/assets'
import { walletsQuery } from '@/ui/features/parties'
import { getTokenClient } from '@/ui/lib/token-client'

export const Route = createFileRoute('/_unlocked/_connected/assets/')({
    loader: async ({ context: { queryClient } }) => {
        const client = getTokenClient()
        const wallets = await queryClient.ensureQueryData(walletsQuery())
        // prefetchQuery doesn't throw, so the page shows a failed fetch.
        await Promise.all([
            queryClient.prefetchQuery(tokenInstrumentsQuery()),
            ...toTokenWallets(wallets).map(({ partyId }) =>
                queryClient.prefetchQuery(
                    holdingsQueryOptions({ client, partyId })
                )
            ),
        ])
    },
    component: AssetsPage,
})
