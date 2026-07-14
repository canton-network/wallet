// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type APIHandlerResponse = {
    status?: number // default is 200
    payload: unknown
}

export type APIOperationHandler<OperationHandler> = OperationHandler extends (
    ...args: infer P
) => unknown
    ? (...params: P) => Promise<APIHandlerResponse>
    : never
