// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { queryOptions, useMutation } from '@tanstack/react-query'
import { browser, type Browser } from 'wxt/browser'

import { siteApprovalPortName } from '@/shared/ports.ts'
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

let held: { id: string; port: Browser.runtime.Port } | undefined

/**
 * Holds a port for the request the page shows, so the page closes when the
 * background cancels it. Does nothing when it already holds this request's.
 */
export function holdSiteApproval(id: string): void {
    if (held?.id === id) return
    releaseSiteApproval()
    const port = browser.runtime.connect({ name: siteApprovalPortName(id) })
    port.onDisconnect.addListener(() => window.close())
    held = { id, port }
}

export function releaseSiteApproval(): void {
    held?.port.disconnect()
    held = undefined
}
