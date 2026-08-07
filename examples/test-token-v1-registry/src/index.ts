// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import allocationInstructionAPIRouter from './api/allocation-instruction/index.js'
import allocationAPIRouter from './api/allocation/index.js'
import { APIError } from './api/common'
import metadataAPIRouter from './api/metadata/index.js'
import transferInstructionAPIRouter from './api/transfer-instruction/index.js'
import { initOperatorParty } from './common/operator'
import express, { ErrorRequestHandler, Request, Response } from 'express'
import { vetDaml } from '@canton-network/core-test-token'
import sdk from './common/sdk'

const app = express()

await initOperatorParty()

/**
 * @customize The registry shouldn't be responsible for vetting daml files. We're doing this for development purposes only. Feel free to remove this when constructing your own token.
 */
if (process.env.NODE_ENV === 'development') await vetDaml(sdk)

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

app.use(express.json())
    .use(metadataAPIRouter)
    .use(transferInstructionAPIRouter)
    .use(allocationAPIRouter)
    .use(allocationInstructionAPIRouter)
    .use(errorMiddleware)
    .listen(5634, () => console.info('api listening on http://localhost:5634'))
