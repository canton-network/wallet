// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Handler } from 'openapi-backend'

/**
 * An arbitrary structure identifying a common interface for all method handlers.
 */
export type APIHandlerResponse<Payload = unknown> = {
    status?: number // default is 200
    payload: Payload
}

export type APIHandler<Operation> = (...params: Parameters<Handler>) => Promise<
    Operation extends {
        responses: {
            [K in number]: {
                content: {
                    'application/json': infer Payload
                }
            }
        }
    }
        ? APIHandlerResponse<Payload>
        : never
>
