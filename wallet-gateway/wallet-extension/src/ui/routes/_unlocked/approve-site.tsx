// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from '@tanstack/react-router'

import {
    ApproveSitePage,
    holdSiteApproval,
    releaseSiteApproval,
    siteApprovalQuery,
} from '@/ui/features/sites/index.ts'

export const Route = createFileRoute('/_unlocked/approve-site')({
    validateSearch: (search: Record<string, unknown>): { id: string } => ({
        id: typeof search.id === 'string' ? search.id : '',
    }),
    loaderDeps: ({ search: { id } }) => ({ id }),
    loader: ({ context: { queryClient }, deps: { id } }) =>
        queryClient.query({ ...siteApprovalQuery(id), staleTime: 'static' }),
    // A change of `id` alone runs onStay, not onLeave and onEnter.
    onEnter: ({ search: { id } }) => holdSiteApproval(id),
    onStay: ({ search: { id } }) => holdSiteApproval(id),
    onLeave: () => releaseSiteApproval(),
    component: ApproveSiteRoute,
})

function ApproveSiteRoute() {
    const { id } = Route.useSearch()
    return <ApproveSitePage id={id} />
}
