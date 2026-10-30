// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from 'vitest'
import type { TxHashingErrorCode } from '../../errors.js'

/** Expected bytes as the tests write them, in hex with spaces between groups */
export const hx = (s: string) => s.replace(/\s+/g, '')

/** A TxHashingError with `code`, and with `path` and `message` where given */
export const rejection = (
    code: TxHashingErrorCode,
    path?: string,
    message?: string
) =>
    expect.objectContaining({
        name: 'TxHashingError',
        code,
        ...(path === undefined ? {} : { path }),
        ...(message === undefined ? {} : { message }),
    })
