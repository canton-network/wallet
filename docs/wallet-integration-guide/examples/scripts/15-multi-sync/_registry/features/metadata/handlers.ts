// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TestToken implementation of the token-metadata-v1 API.
 *
 * Provides static metadata about the TestToken instrument and the registry's
 * supported Token Standard APIs (api-specs/splice/0.6.1/token-metadata-v1.yaml).
 */

import type {
    GetRegistryInfoResponse,
    Instrument,
    ListInstrumentsResponse,
    MetadataHandlers,
} from '../../types.js'

export interface MetadataHandlerContext {
    tokenAdminPartyId: string
    supportedApis: Record<string, number>
    instrumentId: string
}

export function createMetadataHandlers(
    ctx: MetadataHandlerContext
): MetadataHandlers {
    const instrument: Instrument = {
        id: ctx.instrumentId,
        name: 'TestToken',
        symbol: 'TT',
        decimals: 10,
        supportedApis: ctx.supportedApis,
    }

    return {
        getRegistryInfo: (): GetRegistryInfoResponse => ({
            adminId: ctx.tokenAdminPartyId,
            supportedApis: ctx.supportedApis,
        }),

        listInstruments: (): ListInstrumentsResponse => ({
            instruments: [instrument],
        }),

        getInstrument: ({ instrumentId }): Instrument | null =>
            instrumentId === ctx.instrumentId ? instrument : null,
    }
}
