// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    ClearSigningError,
    ClearSigningErrorCode,
} from '@canton-network/core-tx-clear-signing-lib'

/**
 * The error `clearSign` rejects with. `cause` is the error of the layer that failed, when there is
 * one, so a caller can still see the hasher's own code.
 */
export class ClearSignError extends Error implements ClearSigningError {
    readonly code: ClearSigningErrorCode

    constructor(code: ClearSigningErrorCode, message: string, cause?: unknown) {
        super(message, cause === undefined ? undefined : { cause })
        this.name = 'ClearSignError'
        this.code = code
    }
}

export function causeMessage(cause: unknown): string {
    return cause instanceof Error ? cause.message : String(cause)
}
