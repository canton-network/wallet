// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthAware } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import type express from 'express'
import { jsonRpcHandler } from '../middleware/jsonRpcHandler.js'
import { userController, type UserControllerOptions } from './controller.js'
import type { Methods } from './rpc-gen/index.js'
import { paramSchemas } from './rpc-gen/schemas.js'

export interface UserApiOptions extends Omit<
    UserControllerOptions,
    'store' | 'authContext'
> {
    route: string
    app: express.Express
    store: Store & AuthAware<Store>
}

export const user = ({
    route,
    app,
    store,
    logger,
    ...controllerOptions
}: UserApiOptions) => {
    app.use(route, (req, res, next) =>
        jsonRpcHandler<Methods>({
            controller: userController({
                ...controllerOptions,
                logger,
                store: store.withAuthContext(req.authContext),
                authContext: req.authContext,
            }),
            logger,
            paramSchemas,
        })(req, res, next)
    )

    return app
}
