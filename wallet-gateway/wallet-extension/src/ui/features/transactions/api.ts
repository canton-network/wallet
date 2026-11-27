// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions, useMutation } from '@tanstack/react-query'
import { browser, type Browser } from 'wxt/browser'

import { txApprovalPortName } from '@/shared/ports.ts'
import { queryKeys } from '@/ui/lib/query/keys.ts'
import { getTxApprovalClient } from '@/ui/lib/tx-approval-client.ts'

export const transactionQuery = (id: string) =>
    queryOptions({
        queryKey: queryKeys.transactions.detail(id),
        // Null once the transaction no longer waits for the user.
        queryFn: () => getTxApprovalClient().get(id),
        staleTime: Infinity,
    })

export function useDecideTransaction(id: string) {
    return useMutation({
        mutationFn: (approved: boolean) =>
            getTxApprovalClient().decide(id, approved),
    })
}

let held: { id: string; port: Browser.runtime.Port } | undefined

/**
 * Holds a port for the transaction the page shows, so the page closes when
 * the background ends its prompt. Does nothing when it already holds it.
 */
export function holdTransactionApproval(id: string): void {
    if (held?.id === id) return
    releaseTransactionApproval()
    const port = browser.runtime.connect({ name: txApprovalPortName(id) })
    port.onDisconnect.addListener(() => window.close())
    held = { id, port }
}

export function releaseTransactionApproval(): void {
    held?.port.disconnect()
    held = undefined
}
