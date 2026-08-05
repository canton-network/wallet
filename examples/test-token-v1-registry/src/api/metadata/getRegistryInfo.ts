// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { operator } from '../../common/operator'
import { supportedApis } from './common'
import { OffLedger } from '@canton-network/core-token-standard'
import { TExpressOpenApiRequestHandler } from 'openapi-ts-router/express'

/**
 * @returns API payload with registry info for token metadata clients.
 */
export const getRegistryInfo: TExpressOpenApiRequestHandler<
    OffLedger.MetadataV1.paths['/registry/metadata/v1/info']['get']
> = (_req, res) => {
    res.json({
        adminId: operator.party,
        supportedApis,
    })
}
