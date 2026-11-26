// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { holdingsQueryOptions } from '@canton-network/core-wallet-ui-components/react/token'
import { createFileRoute } from '@tanstack/react-router'

import {
    AssetsPage,
    tokenInstrumentsQuery,
    toTokenWallets,
} from '@/ui/features/assets/index.ts'
import { walletsQuery } from '@/ui/features/parties/index.ts'
import { getTokenClient } from '@/ui/lib/token-client.ts'

export const Route = createFileRoute('/_unlocked/_connected/assets/')({
    loader: async ({ context: { queryClient } }) => {
        const client = getTokenClient()
        const wallets = await queryClient.query({
            ...walletsQuery(),
            staleTime: 'static',
        })
        // Let the page show errors from queries warmed by the loader.
        await Promise.allSettled([
            queryClient.query(tokenInstrumentsQuery()),
            ...toTokenWallets(wallets).map(({ partyId }) =>
                queryClient.query(holdingsQueryOptions({ client, partyId }))
            ),
        ])
    },
    component: AssetsPage,
})
