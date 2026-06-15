// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest'
import { EXTENDED_SDK_OPTION_KEYS, SDKPlugin } from '../'
import { mock } from '../../__test__/mocks'

describe('plugin', () => {
    const TestPlugin = class extends SDKPlugin {}

    beforeEach(() => {})

    EXTENDED_SDK_OPTION_KEYS.forEach((key) => {
        it(`should throw error if ${key} is used as a name`, () => {
            expect(() => new TestPlugin(key, mock.ctx)).toThrow()
        })
    })
})
