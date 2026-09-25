// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

export const ConfigSchema = z.strictObject({
    provider: z.discriminatedUnion('type', [
        z.strictObject({
            type: z.literal('picker'),
        }),
        z.strictObject({
            type: z.literal('remote'),
            url: z.url(),
        }),
        z.strictObject({
            type: z.literal('extension'),
            target: z.string().min(1),
        }),
    ]),
    wrapper: z.discriminatedUnion('type', [
        z.strictObject({ type: z.literal('manual') }),
        z.strictObject({ type: z.literal('window') }),
        z.strictObject({ type: z.literal('webhook'), url: z.url() }),
    ]),
    /** Test-case ids (see `./tests`) to skip. Unknown ids are simply never matched. */
    disabledTests: z.array(z.string()).default([]),
    timeoutMs: z.number().int().min(100).max(600000).default(120000),
})

export type Config = z.infer<typeof ConfigSchema>

export const defaultConfig: Config = {
    provider: { type: 'picker' },
    wrapper: { type: 'manual' },
    disabledTests: [],
    timeoutMs: 120000,
}
