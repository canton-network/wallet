// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

export const networkConnectionAuthSchema = z.discriminatedUnion('authMethod', [
    z.object({
        authMethod: z.literal('self_issued'),
        payload: z.discriminatedUnion('state', [
            z.object({
                state: z.literal('pending'),
                scopes: z.array(z.string()),
                signingMessageId: z.string().optional(),
            }),
            z.object({
                state: z.literal('ready'),
                scopes: z.array(z.string()),
            }),
        ]),
    }),
])

export type NetworkConnectionInput = z.infer<
    typeof networkConnectionAuthSchema
> & {
    expiresAt?: Date
}

export type NetworkConnection = NetworkConnectionInput & {
    id: string
    sessionId: string
    userId: string
    createdAt: Date
}
