// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { toHttpErrorCode, rpcErrors, providerErrors } from './index'

describe('core/rpc-errors', () => {
    it('should map the correct codes', () => {
        expect(toHttpErrorCode(rpcErrors.parse().code)).toBe(400)
        expect(toHttpErrorCode(rpcErrors.invalidRequest().code)).toBe(400)
        expect(toHttpErrorCode(rpcErrors.methodNotFound().code)).toBe(404)
        expect(toHttpErrorCode(rpcErrors.invalidParams().code)).toBe(400)
        expect(toHttpErrorCode(rpcErrors.invalidInput().code)).toBe(400)
        expect(toHttpErrorCode(providerErrors.unauthorized().code)).toBe(401)
        expect(toHttpErrorCode(rpcErrors.internal().code)).toBe(500)
        expect(toHttpErrorCode(9999)).toBe(500) // Unmapped code should default to 500
    })
})
