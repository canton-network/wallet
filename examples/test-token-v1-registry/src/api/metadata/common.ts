// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Instrument,
    OperationHandler,
    Operations,
    SupportedApis,
} from '../../openapi-ts/token-metadata-v1'
import { APIOperationHandler } from '../../types'

export type MetadataAPIHandler<operationId extends keyof Operations> =
    APIOperationHandler<OperationHandler<operationId>>

export const supportedApis: SupportedApis = {
    'splice-api-token-metadata-v1': 1,
    'splice-api-token-transfer-instruction-v1': 1,
    'splice-api-token-allocation-v1': 1,
    'splice-api-token-allocation-instruction-v1': 1,
}

/**
 * @customize link data with a database
 */
export const instruments: Instrument[] = [
    {
        id: 'test-token-v1',
        name: 'TestTokenV1',
        symbol: 'tt',
        totalSupply: '1_000_000_000',
        totalSupplyAsOf: '2026-07-13T09:49:23.104Z',
        decimals: 2,
        supportedApis,
    },
]
