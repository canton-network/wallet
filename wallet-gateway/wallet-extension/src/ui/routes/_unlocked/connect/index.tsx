// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from '@tanstack/react-router'
import { ConnectPage } from '@/ui/features/sessions'

export const Route = createFileRoute('/_unlocked/connect/')({
    // validateSearch: (
    //     search: Record<string, unknown>
    // ): { createPartyStatus?: string } =>
    //     typeof search.createPartyStatus === 'string'
    //         ? { createPartyStatus: search.createPartyStatus }
    //         : {},
    component: ConnectRoute,
})

function ConnectRoute() {
    // const { createPartyStatus } = Route.useSearch()
    return <ConnectPage />
}
