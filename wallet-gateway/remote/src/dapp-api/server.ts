// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type express from 'express'
import cors from 'cors'
import { dappController, type DappControllerOptions } from './controller.js'
import { jsonRpcHandler } from '../middleware/jsonRpcHandler.js'
import type { Methods } from './rpc-gen/index.js'
import { paramSchemas } from './rpc-gen/schemas.js'
import type { Store } from '@canton-network/core-wallet-store'
import type { AuthAware } from '@canton-network/core-wallet-auth'
import type { Server } from 'http'
import type { ServerConfig } from '../config/Config.js'
import { subscribeNotifications } from '@canton-network/core-wallet-services'
import { SseNotificationSink } from './sse-sink.js'

export interface DappApiOptions extends Omit<
    DappControllerOptions,
    'store' | 'origin' | 'context'
> {
    route: string
    app: express.Express
    server: Server
    serverConfig: ServerConfig
    store: Store & AuthAware<Store>
}

export const dapp = ({
    route,
    app,
    server,
    serverConfig,
    store,
    logger,
    notificationService,
    ...controllerOptions
}: DappApiOptions) => {
    app.use(
        cors({
            origin: serverConfig.allowedOrigins,
        })
    )

    // SSE endpoint for real-time notifications (must be registered before the JSON-RPC route)
    app.get(`${route}/events`, async (req, res) => {
        const context = req.authContext
        if (!context) {
            res.status(401).json({ error: 'Unauthenticated' })
            return
        }

        const newStore = store.withAuthContext(context)
        const session = await newStore.getSession(context.accessToken)

        const sessionId = session?.id

        if (!sessionId) {
            res.status(401).json({ error: 'No session' })
            return
        }

        logger.debug(
            `SSE connected for user: ${context.userId} with session ID: ${sessionId}`
        )

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')
        res.flushHeaders?.()

        const subscriber = { sessionId, userId: context.userId }
        const unsubscribe = subscribeNotifications(
            notificationService,
            subscriber,
            new SseNotificationSink(res, logger, subscriber)
        )

        const cleanup = () => {
            logger.debug('SSE client disconnected')
            unsubscribe()
        }

        req.on('close', cleanup)
        req.on('error', cleanup)
    })

    app.use(route, (req, res, next) => {
        const origin: string | null = req.headers.origin ?? null

        jsonRpcHandler<Methods>({
            controller: dappController({
                ...controllerOptions,
                logger,
                notificationService,
                store: store.withAuthContext(req.authContext),
                origin,
                context: req.authContext,
            }),
            logger,
            paramSchemas,
        })(req, res, next)
    })

    return server
}
