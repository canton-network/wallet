// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Shared Token Standard types for the TestToken registry server.
 *
 * The request/response data shapes are reused directly from the generated
 * OpenAPI clients in `@canton-network/core-token-standard`
 */

import type {
    metadataRegistryTypes,
    transferInstructionRegistryTypes,
} from '@canton-network/core-token-standard'

// ── Reused generated schema types ──────────────────────────────────────────

export type DisclosedContract =
    transferInstructionRegistryTypes['schemas']['DisclosedContract']

export type SupportedApis = metadataRegistryTypes['schemas']['SupportedApis']

export type GetRegistryInfoResponse =
    metadataRegistryTypes['schemas']['GetRegistryInfoResponse']

export type Instrument = metadataRegistryTypes['schemas']['Instrument']

export type ListInstrumentsResponse =
    metadataRegistryTypes['schemas']['ListInstrumentsResponse']

// ── Local context type ─────────────────────────────────────────────────────

export interface ChoiceContext {
    choiceContextData: { values: Record<string, unknown> }
    disclosedContracts: DisclosedContract[]
}

// ── transfer-instruction-v1 ────────────────────────────────────────────────

export interface TransferFactoryWithChoiceContext {
    factoryId: string
    transferKind: 'self' | 'direct' | 'offer'
    choiceContext: ChoiceContext
}

// ── allocation-instruction-v1 ──────────────────────────────────────────────

export interface FactoryWithChoiceContext {
    factoryId: string
    choiceContext: ChoiceContext
}
