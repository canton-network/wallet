// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * An arbitrary structure identifying a common interface for all method handlers.
 */
export type APIHandlerResponse<Payload = unknown> = {
    status?: number // default is 200
    payload: Payload
}

type ExtractOperationPayload<OperationReturn> =
    Awaited<OperationReturn> extends { _t?: infer ResponseBody }
        ? NonNullable<ResponseBody>
        : Awaited<OperationReturn>

/**
 * Generic type that is used for each API handler. Uses generated interfaces to ensure I/O strutures requirements are met.
 */
export type APIOperationHandler<OperationHandler> = OperationHandler extends (
    ...args: infer Args
) => infer OperationReturn
    ? (
          ...params: Args
      ) => Promise<APIHandlerResponse<ExtractOperationPayload<OperationReturn>>>
    : never
