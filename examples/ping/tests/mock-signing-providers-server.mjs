// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    createBlockdaemonMockProvider,
    createDfnsMockProvider,
    startSigningProviderMockServer,
} from '@canton-network/core-wallet-test-utils'

function parseProviderUrl(envVar, fallback) {
    const configuredUrl = process.env[envVar] ?? fallback
    const parsedUrl = new URL(configuredUrl)
    if (!parsedUrl.port) {
        throw new Error(`${envVar} must include a port, got: ${configuredUrl}`)
    }

    return {
        configuredUrl,
        hostname: parsedUrl.hostname,
        port: Number(parsedUrl.port),
    }
}

function createHealthRoutes() {
    return [
        {
            method: 'GET',
            path: '/_healthz',
            handler: () => ({
                body: { ok: true },
            }),
        },
    ]
}

async function startBlockdaemonMockServer() {
    const blockdaemon = parseProviderUrl(
        'BLOCKDAEMON_API_URL',
        'http://localhost:3031'
    )

    const server = await startSigningProviderMockServer({
        host: blockdaemon.hostname,
        port: blockdaemon.port,
        logger: (message) =>
            console.log(`[signing-mocks:blockdaemon] ${message}`),
        routes: [
            ...createHealthRoutes(),
            ...createBlockdaemonMockProvider(),
        ],
    })

    console.log(
        `[signing-mocks] blockdaemon listening on ${server.baseUrl}`
    )
    return server
}

async function startDfnsMockServer() {
    const dfns = parseProviderUrl('DFNS_BASE_URL', 'http://localhost:3032')

    const server = await startSigningProviderMockServer({
        host: dfns.hostname,
        port: dfns.port,
        logger: (message) => console.log(`[signing-mocks:dfns] ${message}`),
        routes: [...createHealthRoutes(), ...createDfnsMockProvider()],
    })

    console.log(`[signing-mocks] dfns listening on ${server.baseUrl}`)
    return server
}

const mode = process.argv[2] ?? 'all'
const servers = []

if (mode === 'all' || mode === 'blockdaemon') {
    servers.push(await startBlockdaemonMockServer())
}
if (mode === 'all' || mode === 'dfns') {
    servers.push(await startDfnsMockServer())
}
if (servers.length === 0) {
    throw new Error(
        `Unknown mock signing provider mode "${mode}". Expected all, blockdaemon, or dfns.`
    )
}

let shuttingDown = false
const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`[signing-mocks] received ${signal}, shutting down`)
    await Promise.all(servers.map((server) => server.close()))
    process.exit(0)
}

process.on('SIGINT', () => {
    void shutdown('SIGINT')
})
process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
})
