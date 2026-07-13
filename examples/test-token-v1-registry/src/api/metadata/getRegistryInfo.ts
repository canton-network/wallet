// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { OperationHandler } from '../../openapi-ts/token-metadata-v1'
import sdk from '../../sdk'
import { supportedApis } from './common'

export const getRegistryInfo: OperationHandler<
    'getRegistryInfo'
> = async () => {
    let adminId = ''
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
    return {
        adminId,
        supportedApis,
    }
}
