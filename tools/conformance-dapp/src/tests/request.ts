// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expectRejection, UNKNOWN_METHOD_CODES } from './helpers.ts'
import type { Case, RequestArgs } from './types.ts'

export const cases: Case[] = [
    {
        id: 'request.unknownMethod',
        name: 'Unknown method returns an unsupported/missing method error',
        category: 'Request handling',
        run: async (runtime) => {
            await runtime.ensureConnected()
            await expectRejection(
                runtime.request({
                    method: 'conformance_unknownMethod',
                } as unknown as RequestArgs),
                UNKNOWN_METHOD_CODES
            )
        },
    },
]
