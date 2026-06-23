// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { authSchema, idpSchema } from '@canton-network/core-wallet-auth'
import { z } from 'zod'

export const ledgerApiSchema = z.object({
    baseUrl: z.string().url(),
})

export const networkSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    synchronizerId: z.string().includes('::').min(10).optional(),
    identityProviderId: z.string(),
    ledgerApi: ledgerApiSchema,
    auth: authSchema,
    adminAuth: authSchema.optional(),
    serviceAccountAuth: authSchema.optional(),
})

export const storeConfigSchema = z.object({
    connection: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('memory'),
        }),
        z.object({
            type: z.literal('sqlite'),
            database: z.string(),
        }),
        // Add validation for some of the most important properties of the postgres driver,
        // but allow for any additional properties to be passed in (e.g. `ssl` for TLS).
        z.looseObject({
            type: z.literal('postgres'),
            host: z.string(),
            port: z.number(),
            user: z.string(),
            password: z.string(),
            database: z.string(),
        }),
    ]),
})

export const bootstrapConfigSchema = z.object({
    idps: z.array(idpSchema),
    networks: z.array(networkSchema),
})

export type StoreConfig = z.infer<typeof storeConfigSchema>
export type BootstrapConfig = z.infer<typeof bootstrapConfigSchema>
export type Network = z.infer<typeof networkSchema>
export type LedgerApi = z.infer<typeof ledgerApiSchema>
