// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    default as UserApiClient,
    SignResult,
} from '@canton-network/core-wallet-user-rpc-client'
import { queryOptions, useMutation } from '@tanstack/react-query'
import { browser, type Browser } from 'wxt/browser'

import { txApprovalPortName } from '@/shared/ports.ts'
import { queryKeys } from '@/ui/lib/query/keys.ts'
import { getUserClient } from '@/ui/lib/user-client.ts'

type UserClient = Pick<UserApiClient, 'request'>

export const transactionQuery = (id: string) =>
    queryOptions({
        queryKey: queryKeys.transactions.detail(id),
        // Gone once the prompt ended without the user, see `tx-approval.ts`.
        queryFn: () =>
            getUserClient()
                .request({
                    method: 'getTransaction',
                    params: { transactionId: id },
                })
                .catch(() => null),
        staleTime: Infinity,
    })

/** The first acting party, which `prepareExecute` checked is the user's. */
export function actingParty(payload: string): string | undefined {
    try {
        const { actAs } = JSON.parse(payload) as { actAs?: unknown }
        return Array.isArray(actAs) && typeof actAs[0] === 'string'
            ? actAs[0]
            : undefined
    } catch {
        return undefined
    }
}

/**
 * Signs the transaction for `partyId`, unless it is signed, then executes
 * it. Resolves with the signing status when the signature isn't there yet,
 * which happens only with an external signing provider.
 */
export async function approveTransaction(
    client: UserClient,
    transactionId: string,
    partyId: string
): Promise<SignResult['status'] | 'executed'> {
    const { status } = await client.request({
        method: 'getTransaction',
        params: { transactionId },
    })
    if (status === 'pending') {
        const signed = await client.request({
            method: 'sign',
            params: { transactionId, partyId },
        })
        if (signed.status !== 'signed') return signed.status
    }
    await client.request({
        method: 'execute',
        params: { transactionId, partyId },
    })
    return 'executed'
}

export async function rejectTransaction(
    client: UserClient,
    transactionId: string
): Promise<void> {
    await client.request({
        method: 'deleteTransaction',
        params: { transactionId },
    })
}

export function useApproveTransaction(id: string, partyId: string) {
    return useMutation({
        mutationFn: () => approveTransaction(getUserClient(), id, partyId),
    })
}

export function useRejectTransaction(id: string) {
    return useMutation({
        mutationFn: () => rejectTransaction(getUserClient(), id),
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
