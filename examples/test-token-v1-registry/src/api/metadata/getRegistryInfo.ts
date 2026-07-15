// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { admin } from '../../common/admin'
import { MetadataAPIHandler, supportedApis } from './common'

export const getRegistryInfo: MetadataAPIHandler<
    'getRegistryInfo'
> = async () => {
    return {
        payload: {
            adminId: admin.party,
            supportedApis,
        },
    }
}
