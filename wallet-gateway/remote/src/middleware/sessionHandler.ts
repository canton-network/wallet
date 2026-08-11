// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Request, Response, NextFunction } from 'express'
import { AuthAware } from '@canton-network/core-wallet-auth'
import { providerErrors } from '@canton-network/core-rpc-errors'
import { jsonRpcResponse } from '@canton-network/core-rpc-transport'
import { Logger } from 'pino'
import { Store } from '@canton-network/core-wallet-store'

/**
 * Middleware to handle session validation based on user sessions.
 * @param store needs to be AuthAware
 * @param allowedPaths a record of path -> list of methods which do not require authentication
 * @param logger
 * @returns
 */
export function sessionHandler(
    store: Store & AuthAware<Store>,
    allowedPaths: Record<string, string[]>,
    logger: Logger
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const context = req.authContext
        const allowedMethods = allowedPaths[req.baseUrl as string]

        if (req.method !== 'POST') {
            logger.debug(
                `Skipping authentication for ${req.method} request to ${req.baseUrl}`
            )
            return next()
        }

        if (
            allowedMethods &&
            (allowedMethods.includes(req.body.method) ||
                allowedMethods.includes('*'))
        ) {
            logger.debug(
                `Allowing unauthenticated access to ${req.baseUrl} for method ${req.body.method}`
            )
            return next()
        }

        const reqId = req.body?.id ?? null

        if (!context?.accessToken) {
            logger.debug('No access token provided for protected method')
            return res.status(401).json(
                jsonRpcResponse(reqId, {
                    error: providerErrors.unauthorized({
                        message: 'No active session found',
                    }),
                })
            )
        }

        logger.debug('Checking for active session for ' + context.userId)
        const session = await store
            .withAuthContext(context)
            .getSession(context.accessToken)
        if (!session) {
            logger.debug('No active session found for ' + context.userId)
            return res.status(401).json(
                jsonRpcResponse(reqId, {
                    error: providerErrors.unauthorized({
                        message: 'No active session found',
                    }),
                })
            )
        }

        next()
    }
}
