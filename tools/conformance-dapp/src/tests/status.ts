// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { statusEventSchema } from './helpers.ts'
import type { Case } from './types.ts'

export const cases: Case[] = [
    {
        id: 'status',
        name: 'Status has provider and connection information',
        category: 'Status',
        run: async (runtime) => {
            statusEventSchema.parse(await runtime.request({ method: 'status' }))
        },
    },
]
