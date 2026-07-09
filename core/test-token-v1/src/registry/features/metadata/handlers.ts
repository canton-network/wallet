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
    SupportedApis,
} from '../../types.js'
import type { metadataApiOperations } from '@canton-network/core-token-standard'
import type { OperationHandlers } from '../../http/openapi-router.js'

// Token Standard APIs implemented by this registry (api-specs/splice/0.6.1/).
const SUPPORTED_APIS: SupportedApis = {
    'splice-api-token-metadata-v1': 1,
    'splice-api-token-transfer-instruction-v1': 1,
    'splice-api-token-allocation-instruction-v1': 1,
    'splice-api-token-allocation-v1': 1,
}

export interface MetadataHandlerContext {
    adminPartyId: string
    instrumentId: string
}

export function createMetadataHandlers(
    ctx: MetadataHandlerContext
): OperationHandlers<metadataApiOperations> {
    const instrument: Instrument = {
        id: ctx.instrumentId,
        name: 'TestToken',
        symbol: 'TT',
        decimals: 10,
        supportedApis: SUPPORTED_APIS,
    }

    return {
        getRegistryInfo: (): GetRegistryInfoResponse => ({
            adminId: ctx.adminPartyId,
            supportedApis: SUPPORTED_APIS,
        }),

        listInstruments: (): ListInstrumentsResponse => ({
            instruments: [instrument],
        }),

        getInstrument: ({ params }): Instrument | null =>
            params.instrumentId === ctx.instrumentId ? instrument : null,
    }
}
