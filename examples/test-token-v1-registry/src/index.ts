// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import allocationInstructionAPIRouter from './api/allocation-instruction/index.js'
import allocationAPIRouter from './api/allocation/index.js'
import { APIError } from './api/common'
import metadataAPIRouter from './api/metadata/index.js'
import transferInstructionAPIRouter from './api/transfer-instruction/index.js'
import { initOperatorParty } from './common/operator'
import vetDaml from './common/vetDaml'
import express, { ErrorRequestHandler, Request, Response } from 'express'

const app = express()

await initOperatorParty()

/**
 * @customize see {@link ./common/vetDaml.ts}
 */
if (process.env.NODE_ENV === 'development') await vetDaml()

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
