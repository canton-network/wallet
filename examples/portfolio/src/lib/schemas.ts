// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

export const httpUrlSchema = z
    .url({
        message: 'Must be a valid HTTP or HTTPS URL',
        protocol: /^https?$/,
    })
    .transform((value) => new URL(value).toString())

const optionalStringSchema = () => z.string().trim().optional()

export const PARTY_ID_EXAMPLE = 'party-hint::fingerprint'
export const PARTY_ID_ERROR_MESSAGE = `Must be in the form ${PARTY_ID_EXAMPLE}`
export const PARTY_ID_PATTERN = /^[^:]+::[^:]+$/
export const partyIdSchema = z
    .string()
    .trim()
    .regex(PARTY_ID_PATTERN, PARTY_ID_ERROR_MESSAGE)

export const optionalPartyIdSchema = z
    .string()
    .trim()
    .refine(
        (value) => value === '' || PARTY_ID_PATTERN.test(value),
        PARTY_ID_ERROR_MESSAGE
    )
    .transform((value) => (value === '' ? undefined : value))
    .optional()

export const optionalPartyIdInputSchema = z
    .string()
    .trim()
    .refine(
        (value) => value === '' || partyIdSchema.safeParse(value).success,
        PARTY_ID_ERROR_MESSAGE
    )

export const registryConfigSchema = z
    .object({
        name: optionalStringSchema(),
        partyId: optionalPartyIdSchema,
        url: httpUrlSchema,
    })
    .strict()

export const portfolioConfigSchema = z
    .object({
        amulet: z
            .object({
                validatorUrl: httpUrlSchema,
                registry: httpUrlSchema,
            })
            .strict(),
        token: z
            .object({
                validatorUrl: httpUrlSchema,
                registries: z.array(registryConfigSchema),
            })
            .strict(),
    })
    .strict()

export const registryFormSchema = z.object({
    partyId: optionalPartyIdInputSchema,
    registryUrl: httpUrlSchema,
})

export type PortfolioRegistryConfig = z.infer<typeof registryConfigSchema>
export type PortfolioConfig = z.infer<typeof portfolioConfigSchema>
export type RegistryFormData = z.infer<typeof registryFormSchema>
