// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { startContent } from '.'

describe('startContent', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    function pageWithOrigin(origin: string) {
        const page = { origin, addEventListener: vi.fn() }
        vi.stubGlobal('window', page)
        return page
    }

    it('starts the dApp bridge on a page with an origin', () => {
        const page = pageWithOrigin('https://dapp.example')

        startContent()

        expect(page.addEventListener).toHaveBeenCalledWith(
            'message',
            expect.any(Function)
        )
    })

    it('starts nothing on a page with an opaque origin', () => {
        const page = pageWithOrigin('null')

        startContent()

        expect(page.addEventListener).not.toHaveBeenCalled()
    })
})
