// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'
import { siteApprovalPortName } from '@/shared/ports.ts'

import { holdSiteApproval, releaseSiteApproval } from './api.ts'

describe('holdSiteApproval', () => {
    let ports: FakePort[]
    const close = vi.fn()

    beforeEach(() => {
        ports = []
        vi.stubGlobal('window', { close })
        // The fake browser doesn't implement runtime.connect.
        vi.spyOn(fakeBrowser.runtime, 'connect').mockImplementation(((info: {
            name: string
        }) => {
            const port = fakePort(undefined, info.name)
            ports.push(port)
            return asPort(port)
        }) as typeof fakeBrowser.runtime.connect)
    })

    afterEach(() => {
        releaseSiteApproval()
        close.mockClear()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('keeps the port when the same request is held again', () => {
        holdSiteApproval('a')
        holdSiteApproval('a')

        expect(ports).toHaveLength(1)
        expect(ports[0]!.disconnect).not.toHaveBeenCalled()
    })

    it('moves to the new request when the id changes', () => {
        holdSiteApproval('a')
        holdSiteApproval('b')

        expect(ports.map((port) => port.name)).toEqual([
            siteApprovalPortName('a'),
            siteApprovalPortName('b'),
        ])
        expect(ports[0]!.disconnect).toHaveBeenCalled()
        expect(ports[1]!.disconnect).not.toHaveBeenCalled()
    })

    it('closes the page when the background cancels the request', () => {
        holdSiteApproval('a')

        ports[0]!.remoteDisconnect()

        expect(close).toHaveBeenCalled()
    })
})
