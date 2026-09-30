// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    expectRejection,
    networkSchema,
    NO_NETWORK_CODES,
    requireCondition,
} from './helpers.ts'
import type { Case } from './types.ts'

export const cases: Case[] = [
    {
        id: 'getActiveNetwork',
        name: 'The active network agrees with the one status reports',
        category: 'Network',
        run: async (runtime) => {
            await runtime.ensureConnected()
            const status = await runtime.request({ method: 'status' })
            const request = runtime.request({ method: 'getActiveNetwork' })
            if (status.connection.isNetworkConnected) {
                const network = networkSchema.parse(await request)
                requireCondition(
                    status.network === undefined ||
                        status.network.networkId === network.networkId,
                    `getActiveNetwork reports ${network.networkId}, but status reports ${status.network?.networkId}`
                )
            } else {
                await expectRejection(request, NO_NETWORK_CODES)
            }
        },
    },
]
