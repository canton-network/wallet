// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { operator } from '../../common/operator'
import { MetadataAPIHandler, supportedApis } from './common'

/**
 * @returns API payload with registry info for token metadata clients.
 */
export const getRegistryInfo: MetadataAPIHandler<
    'getRegistryInfo'
> = async () => {
    return {
        payload: {
            adminId: operator.party,
            supportedApis,
        },
    }
}
