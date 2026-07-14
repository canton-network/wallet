// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sdk from '../../sdk'
import { MetadataAPIHandler, supportedApis } from './common'

export const getRegistryInfo: MetadataAPIHandler<
    'getRegistryInfo'
> = async () => {
    let adminId
    let userList
    do {
        userList = await sdk.user.list()
        if (!userList.users) break
        // TODO: figure out a better way to find an admin
        const potentialAdmin = userList.users.find((user) =>
            user.id.includes('admin')
        )
        if (potentialAdmin) {
            adminId = potentialAdmin.id
            break
        }
    } while (userList.nextPageToken)
    if (!adminId) {
        return {
            status: 404,
            payload: {
                error: 'Admin Not Found',
            },
        }
    }
    return {
        payload: {
            adminId,
            supportedApis,
        },
    }
}
