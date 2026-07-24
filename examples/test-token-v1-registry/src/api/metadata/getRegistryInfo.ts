// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OffLedger } from '@canton-network/core-token-standard'
import { operator } from '../../common/operator'
import { APIHandler } from '../../types'
import { supportedApis } from './common'

/**
 * @returns API payload with registry info for token metadata clients.
 */
export const getRegistryInfo: APIHandler<
    OffLedger.MetadataV1.paths['/registry/metadata/v1/info']['get']
> = async () => {
    return {
        payload: {
            adminId: operator.party,
            supportedApis,
        },
    }
}
