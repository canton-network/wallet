// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    HttpUrl,
    PartyId,
    PARTY_ID_ERROR_MESSAGE,
} from '@canton-network/core-types'
import { z } from 'zod'

const optionalStringSchema = () => z.string().trim().optional()

export const optionalPartyIdSchema = z
    .string()
    .trim()
    .refine(
        (value) => value === '' || PartyId.safeParse(value).success,
        PARTY_ID_ERROR_MESSAGE
    )
    .transform((value) => (value === '' ? undefined : value))
    .optional()

export const optionalPartyIdInputSchema = z
    .string()
    .trim()
    .refine(
        (value) => value === '' || PartyId.safeParse(value).success,
        PARTY_ID_ERROR_MESSAGE
    )

export const registryConfigSchema = z.strictObject({
    name: optionalStringSchema(),
    partyId: optionalPartyIdSchema,
    url: HttpUrl,
})

export const portfolioConfigSchema = z.strictObject({
    amulet: z.strictObject({
        validatorUrl: HttpUrl,
        registry: HttpUrl,
    }),
    token: z.strictObject({
        validatorUrl: HttpUrl,
        registries: z.array(registryConfigSchema),
    }),
})

export const registryFormSchema = z.object({
    partyId: optionalPartyIdInputSchema,
    registryUrl: HttpUrl,
})

export type PortfolioRegistryConfig = z.infer<typeof registryConfigSchema>
export type PortfolioConfig = z.infer<typeof portfolioConfigSchema>
export type RegistryFormData = z.infer<typeof registryFormSchema>
