// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    createBlockdaemonMockProvider,
    startSigningProviderMockServer,
} from '@canton-network/core-wallet-test-utils'

const configuredUrl = process.env.BLOCKDAEMON_API_URL ?? 'http://localhost:3031/blockdaemon'
const parsedUrl = new URL(configuredUrl)

if (!parsedUrl.port) {
    throw new Error(
        `BLOCKDAEMON_API_URL must include a port, got: ${configuredUrl}`
    )
}

const pathPrefix =
    parsedUrl.pathname === '/' || parsedUrl.pathname.length === 0
        ? ''
        : parsedUrl.pathname.replace(/\/+$/, '')

const server = await startSigningProviderMockServer({
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    providers: [
        {
            pathPrefix: '',
            routes: [
                {
                    method: 'GET',
                    path: '/_healthz',
                    handler: () => ({
                        body: { ok: true },
                    }),
                },
            ],
        },
        createBlockdaemonMockProvider({ pathPrefix }),
    ],
})

console.log(
    `[signing-mocks] listening on ${server.baseUrl} with blockdaemon prefix "${pathPrefix || '/'}"`
)

let shuttingDown = false
const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`[signing-mocks] received ${signal}, shutting down`)
    await server.close()
    process.exit(0)
}

process.on('SIGINT', () => {
    void shutdown('SIGINT')
})
process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
})
