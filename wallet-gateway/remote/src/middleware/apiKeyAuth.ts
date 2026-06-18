// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Request, Response, NextFunction } from 'express'
import { AuthAware, AuthContext } from '@canton-network/core-wallet-auth'
import { Logger } from 'pino'
import { Store } from '@canton-network/core-wallet-store/dist/Store'
import crypto from 'crypto'
import { v4 } from 'uuid'

export function apiKeyAuth(store: Store & AuthAware<Store>, logger: Logger) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization

        // skip if no Authorization header or if it doesn't start with "ApiKey"
        if (!authHeader?.startsWith('ApiKey')) {
            return next()
        }

        const apiKey = authHeader.slice('ApiKey'.length).trim()
        const hashedApiKey = crypto
            .createHash('sha256')
            .update(apiKey)
            .digest('hex')

        const apiKeys = await store.listApiKeys({ all: true })
        const matchingKey = apiKeys.find((key) => key.digest === hashedApiKey)

        if (matchingKey) {
            logger.info(
                { apiKeyId: matchingKey.id, userId: matchingKey.userId },
                'API Key authentication successful'
            )

            const context: AuthContext = {
                isApiKey: true,
                userId: matchingKey.userId,
                accessToken: apiKey,
                email: matchingKey.email || undefined,
            }

            // automatically initiate a session for the API key user
            store.withAuthContext(context).setSession({
                id: v4(),
                network: matchingKey.networkId,
                accessToken: apiKey,
            })

            req.authContext = context
            return next()
        } else {
            logger.warn(
                { apiKey: apiKey.slice(0, 4) + '*****' },
                'Rejecting invalid API Key'
            )

            return res.status(401).json({
                error: 'Invalid API Key provided',
            })
        }
    }
}
