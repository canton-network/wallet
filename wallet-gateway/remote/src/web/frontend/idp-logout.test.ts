// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    closeAfterIdpLogout,
    closeIfReturningFromIdpLogout,
} from './idp-logout.js'

describe('closeIfReturningFromIdpLogout', () => {
    afterEach(() => {
        sessionStorage.clear()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('does nothing without a pending IDP logout', () => {
        const close = vi.spyOn(window, 'close').mockImplementation(() => {})
        vi.stubGlobal('opener', { closed: false })

        expect(closeIfReturningFromIdpLogout()).toBe(false)
        expect(close).not.toHaveBeenCalled()
    })

    it('closes the popup once after an IDP logout', () => {
        const close = vi.spyOn(window, 'close').mockImplementation(() => {})
        vi.stubGlobal('opener', { closed: false })
        closeAfterIdpLogout()

        expect(closeIfReturningFromIdpLogout()).toBe(true)
        expect(close).toHaveBeenCalledOnce()
        expect(closeIfReturningFromIdpLogout()).toBe(false)
    })

    it('stays open when the opener is gone', () => {
        const close = vi.spyOn(window, 'close').mockImplementation(() => {})
        vi.stubGlobal('opener', null)
        closeAfterIdpLogout()

        expect(closeIfReturningFromIdpLogout()).toBe(false)
        expect(close).not.toHaveBeenCalled()
        expect(sessionStorage.getItem('closeAfterIdpLogout')).toBeNull()
    })
})
