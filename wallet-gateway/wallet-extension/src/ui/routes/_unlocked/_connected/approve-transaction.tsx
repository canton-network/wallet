// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from '@tanstack/react-router'

import {
    ApproveTransactionPage,
    holdTransactionApproval,
    releaseTransactionApproval,
    transactionQuery,
} from '@/ui/features/transactions/index.ts'

export const Route = createFileRoute(
    '/_unlocked/_connected/approve-transaction'
)({
    validateSearch: (search: Record<string, unknown>): { id: string } => ({
        id: typeof search.id === 'string' ? search.id : '',
    }),
    loaderDeps: ({ search: { id } }) => ({ id }),
    loader: ({ context: { queryClient }, deps: { id } }) =>
        queryClient.query({ ...transactionQuery(id), staleTime: 'static' }),
    // A change of `id` alone runs onStay, not onLeave and onEnter.
    onEnter: ({ search: { id } }) => holdTransactionApproval(id),
    onStay: ({ search: { id } }) => holdTransactionApproval(id),
    onLeave: () => releaseTransactionApproval(),
    component: ApproveTransactionRoute,
})

function ApproveTransactionRoute() {
    const { id } = Route.useSearch()
    return <ApproveTransactionPage id={id} />
}
