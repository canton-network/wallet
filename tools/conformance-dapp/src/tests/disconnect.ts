// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { requireCondition } from './helpers.ts'
import type { Case } from './types.ts'

export const cases: Case[] = [
    {
        id: 'disconnect',
        name: 'Disconnect ends the session',
        category: 'Disconnect',
        run: async (runtime) => {
            await runtime.ensureConnected()
            const result = await runtime.request({ method: 'disconnect' })
            requireCondition(result === null, 'disconnect must return null')
            const status = await runtime.request({ method: 'status' })
            requireCondition(
                !status.connection.isConnected,
                'Status still reports a session after disconnect'
            )
            const connection = await runtime.request({ method: 'isConnected' })
            requireCondition(
                !connection.isConnected,
                'isConnected still reports a session after disconnect'
            )
        },
    },
]
