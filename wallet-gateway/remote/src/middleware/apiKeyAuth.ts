// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Request, Response, NextFunction } from 'express'
import {
    AuthAware,
    AuthContext,
    AuthTokenProvider,
} from '@canton-network/core-wallet-auth'
import { Logger } from 'pino'
import { Store } from '@canton-network/core-wallet-store'
import crypto from 'crypto'
import { v4 } from 'uuid'
import { rpcErrors } from '@canton-network/core-rpc-errors'
import { jsonRpcResponse } from '@canton-network/core-rpc-transport'

export function apiKeyAuth(
    store: Store & AuthAware<Store>,
    dappApiPath: string,
    logger: Logger
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization

        // skip if no Authorization header or if it doesn't start with "ApiKey"
        if (!authHeader?.startsWith('ApiKey')) {
            logger.trace('No API Key provided, skipping API Key authentication')
            return next()
        }

        const path = req.baseUrl + req.path
        const reqId = req.body?.id ?? null

        logger.trace(
            { baseUrl: req.baseUrl, path: req.path },
            'Received request with API Key authentication'
        )

        // reject if the path is not in the allowed list
        if (!path.includes(dappApiPath)) {
            logger.debug(
                `Path ${path} is not in the allowed list, rejecting API Key authentication`
            )

            return res.status(401).json(
                jsonRpcResponse(reqId, {
                    error: {
                        code: rpcErrors.invalidRequest().code,
                        message: `Requested path '${path}' cannot be called with API Key authentication`,
                    },
                })
            )
        }

        const apiKey = authHeader.slice('ApiKey'.length).trim()
        const hashedApiKey = crypto
            .createHash('sha256')
            .update(apiKey)
            .digest('hex')

        const matchingKey = await store.getApiKey(hashedApiKey)

        if (matchingKey) {
            logger.debug(
                { apiKeyId: matchingKey.id, userId: matchingKey.userId },
                'API Key authentication successful'
            )

            // temporary auth context to access the store with the API key user
            const authStore = store.withAuthContext({
                userId: matchingKey.userId,
                accessToken: 'unused',
            })

            // automatically initiate a session for the API key user
            await authStore.setSession({
                id: v4(),
                network: matchingKey.networkId,
                accessToken: 'unused',
            })

            const network = await authStore.getNetwork(matchingKey.networkId)
            const idp = await authStore.getIdp(network.identityProviderId)

            if (!network.serviceAccountAuth) {
                return res.status(401).json(
                    jsonRpcResponse(reqId, {
                        error: {
                            code: rpcErrors.invalidRequest().code,
                            message: `Network '${network.id}' does not have a service account configured`,
                        },
                    })
                )
            }

            if (network.serviceAccountAuth.method !== 'client_credentials') {
                return res.status(401).json(
                    jsonRpcResponse(reqId, {
                        error: {
                            code: rpcErrors.invalidRequest().code,
                            message: `Network '${network.id}' does not have a service account configured with client_credentials method`,
                        },
                    })
                )
            }

            const accessTokenProvider = AuthTokenProvider.fromGatewayConfig(
                idp,
                network.serviceAccountAuth,
                logger
            )

            const serviceAccountCtx = await accessTokenProvider.getAuthContext()

            const context: AuthContext = {
                isApiKey: true,
                userId: matchingKey.userId,
                ledgerUserId: serviceAccountCtx.userId,
                accessToken: serviceAccountCtx.accessToken,
                email: matchingKey.email || undefined,
            }

            req.authContext = context
            return next()
        } else {
            logger.warn(
                { apiKey: apiKey.slice(0, 4) + '*****' },
                'Rejecting invalid API Key'
            )

            return res.status(401).json(
                jsonRpcResponse(reqId, {
                    error: {
                        code: rpcErrors.invalidRequest().code,
                        message: 'API Key is invalid',
                    },
                })
            )
        }
    }
}
