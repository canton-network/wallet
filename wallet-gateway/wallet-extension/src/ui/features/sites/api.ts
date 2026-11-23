// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions, useMutation } from '@tanstack/react-query'

import { queryKeys } from '@/ui/lib/query/keys.ts'
import { getSiteApprovalClient } from '@/ui/lib/site-approval-client.ts'

export const siteApprovalQuery = (id: string) =>
    queryOptions({
        queryKey: queryKeys.siteApprovals.detail(id),
        queryFn: () => getSiteApprovalClient().get(id),
        // A request is settled once. Refetching would only show it as gone.
        staleTime: Infinity,
    })

export function useDecideSiteApproval(id: string) {
    return useMutation({
        mutationFn: (approved: boolean) =>
            getSiteApprovalClient().decide(id, approved),
    })
}
