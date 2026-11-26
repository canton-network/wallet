// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute, redirect } from '@tanstack/react-router'

// Every page opens at `/`. The `_unlocked` and `_connected` guards send the
// user to /unlock or /connect first when needed.
export const Route = createFileRoute('/')({
    beforeLoad: () => {
        throw redirect({ to: '/parties' })
    },
})
