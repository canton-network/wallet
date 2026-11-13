// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Request, Response, NextFunction } from 'express'
import {
    IdpUnavailableError,
    type AuthService,
} from '@canton-network/core-wallet-auth'
import {
    providerErrors,
    rpcErrors,
    toHttpErrorCode,
} from '@canton-network/core-rpc-errors'
import { jsonRpcResponse } from '@canton-network/core-rpc-transport'
import type { Logger } from 'pino'
import { resolveSseTicket } from './sseTicket.js'

// Tickets are only for the dapp event stream. A copied ticket must not
// authenticate status, ticket minting, or any other route.
function isEventStream(req: Request): boolean {
    const path = req.path ?? ''
    return req.method === 'GET' && path.endsWith('/events')
}

export function jwtAuth(authService: AuthService, logger: Logger) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // If the request has been verified as an API key, skip JWT verification
        if (req.authContext?.isApiKey) {
            return next()
        }

        // EventSource cannot set a header. New clients send a short-lived
        // ticket. Older SDKs still put the session token in ?token=.
        const ticket =
            isEventStream(req) && typeof req.query.ticket === 'string'
                ? req.query.ticket
                : ''
        const ticketToken = ticket ? resolveSseTicket(ticket) : undefined
        const legacyToken =
            typeof req.query.token === 'string' && req.query.token
                ? `Bearer ${req.query.token}`
                : undefined
        const authHeader =
            req.headers.authorization ||
            (ticketToken ? `Bearer ${ticketToken}` : undefined) ||
            legacyToken

        try {
            const context = await authService.verifyToken(authHeader)
            req.authContext = context
            next()
        } catch (err) {
            // The token couldn't be checked, keep client session intact
            if (err instanceof IdpUnavailableError) {
                logger.error({ err }, 'Identity provider unavailable')
                const { code } = rpcErrors.resourceUnavailable()
                res.status(toHttpErrorCode(code)).json(
                    jsonRpcResponse(req.body?.id ?? null, {
                        error: {
                            code,
                            message:
                                'Unable to verify the token, identity provider unavailable',
                        },
                    })
                )
                return
            }

            // Reason stays in the logs, the client sees the token was rejected.
            logger.warn({ err }, 'JWT verification failed')
            res.status(401).json(
                jsonRpcResponse(req.body?.id ?? null, {
                    error: {
                        code: providerErrors.unauthorized().code,
                        message: 'Invalid or expired token',
                    },
                })
            )
        }
    }
}
