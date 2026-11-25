// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { createKeepAlive, KEEP_ALIVE_MS } from './keep-alive.ts'

describe('createKeepAlive', () => {
    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('pings while a tab holds a prompt, until the last tab releases', () => {
        vi.useFakeTimers()
        // The fake browser doesn't implement getPlatformInfo.
        const ping = vi
            .spyOn(fakeBrowser.runtime, 'getPlatformInfo')
            .mockResolvedValue({} as never)
        const onHeld = createKeepAlive()

        onHeld(7, true)
        onHeld(9, true)
        vi.advanceTimersByTime(KEEP_ALIVE_MS)
        expect(ping).toHaveBeenCalledTimes(1)

        onHeld(7, false)
        vi.advanceTimersByTime(KEEP_ALIVE_MS)
        expect(ping).toHaveBeenCalledTimes(2)

        onHeld(9, false)
        vi.advanceTimersByTime(2 * KEEP_ALIVE_MS)
        expect(ping).toHaveBeenCalledTimes(2)
    })
})
