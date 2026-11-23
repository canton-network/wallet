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
        queryClient.ensureQueryData(siteApprovalQuery(id)),
    // Router hooks rather than an effect: StrictMode runs effects twice, and
    // the first cleanup would disconnect the port, which rejects the request.
    onEnter: ({ search: { id } }) => holdSiteApproval(id),
    onLeave: () => releaseSiteApproval(),
    component: ApproveSiteRoute,
})

function ApproveSiteRoute() {
    const { id } = Route.useSearch()
    return <ApproveSitePage id={id} />
}
