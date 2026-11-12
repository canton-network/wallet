// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute, redirect } from '@tanstack/react-router'
import { ConnectPage, connectionStatusQuery } from '@/ui/features/sessions'

export const Route = createFileRoute('/_unlocked/connect/')({
    beforeLoad: async ({ context }) => {
        const status = await context.queryClient.fetchQuery(
            connectionStatusQuery()
        )
        if (status === 'connected') {
            throw redirect({ to: '/' })
        }
    },
    component: ConnectPage,
})
