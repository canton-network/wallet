// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type CreateTransferParams,
    tokenQueryKeys,
} from '@canton-network/core-wallet-ui-components/react/token'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getTokenClient } from '@/ui/lib/token-client.ts'

export function usePrepareTransfer() {
    return useMutation({
        mutationFn: (params: CreateTransferParams) =>
            getTokenClient().token.transfer.prepare(params),
    })
}

export function useSubmitTransfer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (transactionId: string) =>
            getTokenClient().token.transfer.submit(transactionId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tokenQueryKeys.pendingTransfers.all,
            })
            void queryClient.invalidateQueries({
                queryKey: tokenQueryKeys.holdings.all,
            })
        },
    })
}

/** Best effort: a review left open expires in the background anyway. */
export function discardTransfer(transactionId: string): void {
    getTokenClient()
        .token.transfer.discard(transactionId)
        .catch(() => undefined)
}
