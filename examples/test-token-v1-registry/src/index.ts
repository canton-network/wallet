// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import allocationInstructionAPIRouter from './api/allocation-instruction/index.js'
import allocationAPIRouter from './api/allocation/index.js'
import { APIError } from './api/common'
import metadataAPIRouter from './api/metadata/index.js'
import transferInstructionAPIRouter from './api/transfer-instruction/index.js'
import { initOperatorParty, operator } from './common/operator'
import express, { ErrorRequestHandler, Request, Response } from 'express'
import { TestToken } from '@canton-network/core-splice-codegen'
import sdk from './common/sdk'
import { Server } from 'http'
import {
    assignSynchronizerIds,
    resetSynchronizerIds,
} from './common/synchronizer.js'

let server: Server

export const startRegistry = async (
    options?: Partial<{
        operator: typeof operator
        synchronizerIds: {
            transferInstruction: string
            allocationInstruction: string
        }
    }>
) => {
    const app = express()

    await initOperatorParty(options?.operator)
    if (options?.synchronizerIds) {
        assignSynchronizerIds(options.synchronizerIds)
    }

    /**
     * @customize The registry shouldn't be responsible for vetting daml files. We're doing this for development purposes only. Feel free to remove this when constructing your own token.
     */
    if (process.env.NODE_ENV === 'development')
        await TestToken.utils.vetDar(sdk)

    const errorMiddleware: ErrorRequestHandler = (
        error: Error,
        _req: Request,
        res: Response
    ) => {
        if (error instanceof APIError) {
            res.status(error.status).send({
                error: error.message,
            })
            return
        }
        res.status(500).send({ error: error.message })
    }

    server = app
        .use(express.json())
        .use(metadataAPIRouter)
        .use(transferInstructionAPIRouter)
        .use(allocationAPIRouter)
        .use(allocationInstructionAPIRouter)
        .use(errorMiddleware)
        .listen(5634, () =>
            console.info('api listening on http://localhost:5634')
        )
}

export const stopRegistry = () => {
    if (!server) return
    resetSynchronizerIds()
    server.close()
}
