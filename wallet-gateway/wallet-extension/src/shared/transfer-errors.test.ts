// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { rpcErrors } from '@canton-network/core-rpc-errors'
import { describe, expect, it } from 'vitest'

import { isNotSubmitted, notSubmittedError } from './transfer-errors.ts'

describe('isNotSubmitted', () => {
    it('allows a retry only after an error marked as not submitted', () => {
        expect(isNotSubmitted(notSubmittedError('signer unavailable'))).toBe(
            true
        )
        // A closed message channel rejects with an uncoded Error.
        expect(
            isNotSubmitted(
                new Error('The message port closed before a response')
            )
        ).toBe(false)
        expect(
            isNotSubmitted(rpcErrors.internal({ message: 'unknown outcome' }))
        ).toBe(false)
        expect(
            isNotSubmitted(rpcErrors.transactionRejected({ message: 'x' }))
        ).toBe(false)
        expect(isNotSubmitted(undefined)).toBe(false)
    })
})
