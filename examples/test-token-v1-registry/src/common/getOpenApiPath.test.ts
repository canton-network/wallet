// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { availableOpenAPIPaths } from './getOpenApiPath'

describe('getOpenApiPath', () => {
    it('should include correct spec path', () => {
        Object.entries(availableOpenAPIPaths).forEach(([filename, path]) => {
            expect(path).toContain('api-specs/splice')
            expect(path).toContain(filename)
        })
    })
})
