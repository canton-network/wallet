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

/** Request body for getTransferFactory and getAllocationFactory. */
export type GetFactoryRequest =
    transferInstructionRegistryTypes['schemas']['GetFactoryRequest']

/** Request body for the transfer-instruction and allocation choice-context endpoints. */
export type GetChoiceContextRequest =
    transferInstructionRegistryTypes['schemas']['GetChoiceContextRequest']

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

// ── token-metadata-v1 ──────────────────────────────────────────────────────

export interface MetadataHandlers {
    getRegistryInfo():
        | GetRegistryInfoResponse
        | Promise<GetRegistryInfoResponse>
    listInstruments(query?: {
        pageSize?: number
        pageToken?: string
    }): ListInstrumentsResponse | Promise<ListInstrumentsResponse>
    getInstrument(path: {
        instrumentId: string
    }): Instrument | null | Promise<Instrument | null>
}

// ── transfer-instruction-v1 ────────────────────────────────────────────────

export interface TransferFactoryWithChoiceContext {
    factoryId: string
    transferKind: 'self' | 'direct' | 'offer'
    choiceContext: ChoiceContext
}

export interface TransferHandlers {
    getTransferFactory(
        body: GetFactoryRequest
    ):
        | TransferFactoryWithChoiceContext
        | null
        | Promise<TransferFactoryWithChoiceContext | null>
    getTransferInstructionAcceptContext(
        path: { transferInstructionId: string },
        body: GetChoiceContextRequest
    ): ChoiceContext | Promise<ChoiceContext>
    getTransferInstructionRejectContext(
        path: { transferInstructionId: string },
        body: GetChoiceContextRequest
    ): ChoiceContext | Promise<ChoiceContext>
    getTransferInstructionWithdrawContext(
        path: { transferInstructionId: string },
        body: GetChoiceContextRequest
    ): ChoiceContext | Promise<ChoiceContext>
}

// ── allocation-instruction-v1 ──────────────────────────────────────────────

export interface FactoryWithChoiceContext {
    factoryId: string
    choiceContext: ChoiceContext
}

export interface AllocationInstructionHandlers {
    getAllocationFactory(
        body: GetFactoryRequest
    ):
        | FactoryWithChoiceContext
        | null
        | Promise<FactoryWithChoiceContext | null>
}

// ── allocation-v1 ──────────────────────────────────────────────────────────

export interface AllocationHandlers {
    getAllocationTransferContext(
        path: { allocationId: string },
        body: GetChoiceContextRequest
    ): ChoiceContext | Promise<ChoiceContext>
    getAllocationWithdrawContext(
        path: { allocationId: string },
        body: GetChoiceContextRequest
    ): ChoiceContext | Promise<ChoiceContext>
    getAllocationCancelContext(
        path: { allocationId: string },
        body: GetChoiceContextRequest
    ): ChoiceContext | Promise<ChoiceContext>
}
