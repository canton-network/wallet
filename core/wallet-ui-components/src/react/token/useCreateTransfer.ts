// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TokenStandardVersion } from './client.ts'
import { tokenQueryKeys } from './query-keys.ts'
import { useTokenContext } from './useTokenContext.ts'

export interface CreateTransferArgs {
    sender: string
    receiver: string
    instrumentId: { admin: PartyId; id: string }
    amount: string
    expiry: Date
    tokenStandardVersion: TokenStandardVersion
    memo?: string
}

export const useCreateTransfer = () => {
    const { client } = useTokenContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ expiry, ...args }: CreateTransferArgs) => {
            if (!client) {
                throw new Error('The token client is not ready')
            }
            if (!client.token.transfer.create) {
                throw new Error('The token client does not create transfers')
            }
            await client.token.transfer.create({
                ...args,
                expiry: expiry.toISOString(),
            })
        },
        onSuccess: () => {
            // Refetch in the background so broad holdings refreshes do not
            // keep the completed transfer mutation pending.
            void queryClient.invalidateQueries({
                queryKey: tokenQueryKeys.pendingTransfers.all,
            })
            void queryClient.invalidateQueries({
                queryKey: tokenQueryKeys.holdings.all,
            })
        },
    })
}
