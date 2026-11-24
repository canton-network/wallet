// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { asPort, fakePort } from '@/__tests__/fake-port.ts'
import { PAGE_PRESENCE_PORT_NAME } from '@/shared/ports.ts'

import { createPagePresence, type PagePresence } from './page-presence.ts'

describe('createPagePresence', () => {
    let connectListeners: ((port: Browser.runtime.Port) => void)[]
    let presence: PagePresence

    /** Opens a content script's presence port. */
    const connect = (
        tabId: number,
        frameId: number,
        documentId = `document-${tabId}-${frameId}`
    ) => {
        const port = fakePort(undefined, PAGE_PRESENCE_PORT_NAME)
        port.sender = {
            ...port.sender,
            tab: { id: tabId, windowId: 3 } as Browser.tabs.Tab,
            documentId,
            frameId,
        }
        connectListeners.forEach((listener) => listener(asPort(port)))
        return port
    }

    beforeEach(() => {
        fakeBrowser.reset()
        connectListeners = []
        // The fake browser doesn't implement runtime.onConnect.
        vi.spyOn(
            fakeBrowser.runtime.onConnect,
            'addListener'
        ).mockImplementation((listener) => void connectListeners.push(listener))
        presence = createPagePresence()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("tells a tab's pages to send a heartbeat while it holds a prompt", () => {
        const top = connect(7, 0)
        const otherTab = connect(9, 0)

        presence.heartbeat(7, true)
        const frame = connect(7, 1)

        expect(top.postMessage.mock.calls).toEqual([[{ heartbeat: true }]])
        expect(frame.postMessage.mock.calls).toEqual([[{ heartbeat: true }]])
        expect(otherTab.postMessage).not.toHaveBeenCalled()

        presence.heartbeat(7, false)
        const later = connect(7, 2)

        expect(top.postMessage).toHaveBeenLastCalledWith({ heartbeat: false })
        expect(frame.postMessage).toHaveBeenLastCalledWith({ heartbeat: false })
        expect(later.postMessage).not.toHaveBeenCalled()
    })

    it('stops the heartbeat of a page another one in its frame replaced', () => {
        const old = connect(7, 0)
        presence.heartbeat(7, true)

        const next = connect(7, 0, 'document-next')

        expect(old.postMessage).toHaveBeenLastCalledWith({ heartbeat: false })
        expect(next.postMessage).toHaveBeenLastCalledWith({ heartbeat: true })
    })
})
