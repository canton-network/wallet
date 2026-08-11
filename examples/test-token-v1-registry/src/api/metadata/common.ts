// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OffLedger } from '@canton-network/core-token-standard'

export const supportedApisV1: OffLedger.MetadataV1.components['schemas']['SupportedApis'] =
    {
        'splice-api-token-metadata-v1': 1,
        'splice-api-token-transfer-instruction-v1': 1,
        'splice-api-token-allocation-v1': 1,
        'splice-api-token-allocation-instruction-v1': 1,
    }

/** CIP-0112 dual-version advertisement for instruments that support V1 + V2. */
export const supportedApisDual: OffLedger.MetadataV1.components['schemas']['SupportedApis'] =
    {
        ...supportedApisV1,
        'splice-api-token-holding-v2': 1,
        'splice-api-token-transfer-instruction-v2': 1,
        'splice-api-token-allocation-v2': 1,
        'splice-api-token-allocation-instruction-v2': 1,
        'splice-api-token-allocation-request-v2': 1,
        'splice-api-token-transfer-events-v2': 1,
    }

/** @deprecated use supportedApisV1 or supportedApisDual */
export const supportedApis = supportedApisV1

/**
 * @customize link data with a database
 */
export const instruments: OffLedger.MetadataV1.components['schemas']['Instrument'][] =
    [
        {
            id: 'test-token-v1',
            name: 'TestTokenV1',
            symbol: 'tt',
            totalSupply: '1_000_000_000',
            totalSupplyAsOf: '2026-07-13T09:49:23.104Z',
            decimals: 2,
            supportedApis: supportedApisV1,
            paused: false,
            showAccountInputFields: false,
        },
        {
            id: 'test-token-v2',
            name: 'TestTokenV2',
            symbol: 'tt2',
            totalSupply: '1_000_000_000',
            totalSupplyAsOf: '2026-07-13T09:49:23.104Z',
            decimals: 2,
            supportedApis: supportedApisDual,
            paused: false,
            showAccountInputFields: false,
        },
        {
            id: 'test-token-paused',
            name: 'TestTokenPaused',
            symbol: 'ttp',
            totalSupply: '0',
            totalSupplyAsOf: '2026-07-13T09:49:23.104Z',
            decimals: 2,
            supportedApis: supportedApisDual,
            paused: true,
            pauseInfo: {
                reason: 'CIP-0112 solvency fixture',
                until: '2099-01-01T00:00:00.000Z',
            },
            showAccountInputFields: false,
        },
    ]
