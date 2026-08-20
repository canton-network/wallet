// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DETECT_CURRENT_ORIGIN_TIMEOUT_MS } from './constants.js'
import { stateManager } from './state-manager.js'
import { detectCurrentOrigin } from './listeners.js'

const openerOrigin = 'http://opener.example'

describe('detectCurrentOrigin', () => {
    beforeEach(() => {
        stateManager.currentOrigin.clear()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
        stateManager.currentOrigin.clear()
    })

    it('resolves immediately with window.origin when there is no opener', async () => {
        vi.stubGlobal('opener', null)

        await expect(detectCurrentOrigin()).resolves.toBe(window.origin)
        expect(stateManager.currentOrigin.get()).toBe(window.origin)
    })

    it('resolves once the origin-broadcast message sets currentOrigin', async () => {
        vi.stubGlobal('opener', { closed: false, postMessage: vi.fn() })

        const promise = detectCurrentOrigin()
        stateManager.currentOrigin.set(openerOrigin)

        await expect(promise).resolves.toBe(openerOrigin)
    })

    it('rejects if the origin-broadcast message is never received', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        vi.stubGlobal('opener', { closed: false, postMessage: vi.fn() })

        const promise = detectCurrentOrigin()
        const assertion = expect(promise).rejects.toThrow(
            `Timed out after ${DETECT_CURRENT_ORIGIN_TIMEOUT_MS}ms waiting for the origin-broadcast message from the opener window`
        )

        await vi.advanceTimersByTimeAsync(DETECT_CURRENT_ORIGIN_TIMEOUT_MS)

        await assertion
    })
})
