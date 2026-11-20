// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export { errorCodes, JsonRpcError } from '@canton-network/core-rpc-errors'

/** @deprecated No longer emitted; errors are `JsonRpcError`s with a code from `errorCodes`. */
export enum ErrorCode {
    ProviderNotFound,
    UserCancelled,
    Timeout,
    TransactionFailed,
    Other,
}
