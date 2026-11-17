// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Server } from 'http'

import { TestToken } from '@canton-network/core-splice-codegen'
import cors from 'cors'
import express from 'express'
import type {
    ErrorRequestHandler,
    NextFunction,
    Request,
    Response,
} from 'express'

import allocationInstructionAPIRouter from './api/allocation-instruction/index.ts'
import allocationAPIRouter from './api/allocation/index.ts'
import { APIError } from './api/common.ts'
import metadataAPIRouter from './api/metadata/index.ts'
import transferInstructionAPIRouter from './api/transfer-instruction/index.ts'
import utilitiesAPIRouter from './api/utilities/index.ts'
import defaultSdk from './common/defaultSdk.ts'
import {
    type RegistryConfig,
    RegistryState,
    defaultConfig,
} from './common/state.ts'

export { RegistryState, defaultConfig, type RegistryConfig }

let server: Server

export const startRegistry = async (config?: Partial<RegistryConfig>) => {
    const app = express()

    await RegistryState.instantiate(config ?? {})

    /**
     * @customize The registry shouldn't be responsible for vetting daml files. We're doing this for development purposes only. Feel free to remove this when constructing your own token.
     */
    if (process.env.NODE_ENV === 'development')
        await TestToken.utils.vetDar(defaultSdk)

    const errorMiddleware: ErrorRequestHandler = (
        error: Error,
        _req: Request,
        res: Response,
        _next: NextFunction
    ) => {
        if (error instanceof APIError) {
            res.status(error.status).send({
                error: error.message,
            })
            return
        }
        res.status(500).send({
            name: error.name,
            message: error.message,
            stack: error.stack,
        })
    }

    return await new Promise<number>((resolve) => {
        server = app
            .use(cors())
            .use(express.json())
            .use(metadataAPIRouter)
            .use(transferInstructionAPIRouter)
            .use(allocationAPIRouter)
            .use(allocationInstructionAPIRouter)
            .use(utilitiesAPIRouter)
            .use(errorMiddleware)
            .listen(RegistryState.instance.port, () => {
                const serverAddress = server.address()
                if (
                    typeof serverAddress !== 'string' &&
                    serverAddress &&
                    'port' in serverAddress
                ) {
                    RegistryState.instance.port = serverAddress.port
                }
                console.info(
                    `api listening on port ${RegistryState.instance.port}`
                )
                resolve(RegistryState.instance.port)
            })
    })
}

export const stopRegistry = () => {
    if (!server) return
    RegistryState.instance.reset()
    server.close()
}

if (process.env.NODE_ENV === 'development') await startRegistry()
