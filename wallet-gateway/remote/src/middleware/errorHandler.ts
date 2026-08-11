// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { NextFunction, Request, Response } from 'express'
import { Logger } from 'pino'
import {
    JsonRpcError,
    rpcErrors,
    toHttpErrorCode,
} from '@canton-network/core-rpc-errors'
import { jsonRpcResponse } from '@canton-network/core-rpc-transport'

// Catches unhandled errors and prevents internal details like stack trace from reaching end user
export function errorHandler(
    logger: Logger,
    isApiPath: (path: string) => boolean
) {
    return (
        err: unknown,
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        // Full error with stack goes to logs only.
        logger.error({ err }, 'Unhandled request error')

        if (res.headersSent) {
            next(err)
            return
        }

        // jsonRpcHandler already maps controllers errors via handleRpcError.
        // This only runs for errors that escape earlier middlewares (e.g. auth/session checks).
        if (isApiPath(req.path)) {
            const id = req.body?.id ?? null

            if (err instanceof JsonRpcError) {
                res.status(toHttpErrorCode(err.code)).json(
                    jsonRpcResponse(id, {
                        error: { code: err.code, message: err.message },
                    })
                )
                return
            }

            res.status(500).json(
                jsonRpcResponse(id, {
                    error: {
                        code: rpcErrors.internal().code,
                        message: 'Something went wrong',
                    },
                })
            )
            return
        }

        res.status(500).json({ error: 'Internal Server Error' })
    }
}
