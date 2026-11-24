// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'

import { asPort, type FakePort, fakePort } from '@/__tests__/fake-port.ts'
import {
    PAGE_PRESENCE_PORT_NAME,
    PRESENCE_HEARTBEAT_MS,
} from '@/shared/ports.ts'

import { createPagePresence } from './page-presence.ts'

describe('createPagePresence', () => {
    function setup() {
        const ports: FakePort[] = []
        const connect = vi.fn(() => {
            const port = fakePort(undefined, PAGE_PRESENCE_PORT_NAME)
            ports.push(port)
            return asPort(port)
        })
        return { ports, connect, presence: createPagePresence(connect) }
    }

    afterEach(() => {
        vi.useRealTimers()
    })

    it('opens one port for the page', () => {
        const { connect, presence: page } = setup()

        page.open()
        page.open()

        expect(connect).toHaveBeenCalledTimes(1)
    })

    it('opens it again after the service worker restarted', () => {
        const { ports, connect, presence: page } = setup()
        page.open()

        ports[0]!.remoteDisconnect()
        page.open()

        expect(connect).toHaveBeenCalledTimes(2)
    })

    it('sends a heartbeat while the background holds a prompt, until it stops or disconnects', () => {
        vi.useFakeTimers()
        const { ports, presence: page } = setup()
        page.open()
        const port = ports[0]!
        const heartbeats = () => port.postMessage.mock.calls.length

        vi.advanceTimersByTime(PRESENCE_HEARTBEAT_MS)
        expect(heartbeats()).toBe(0)

        port.receive({ heartbeat: true })
        port.receive({ heartbeat: true })
        vi.advanceTimersByTime(2 * PRESENCE_HEARTBEAT_MS)
        expect(port.postMessage.mock.calls).toEqual([
            ['heartbeat'],
            ['heartbeat'],
        ])

        port.receive({ heartbeat: false })
        vi.advanceTimersByTime(PRESENCE_HEARTBEAT_MS)
        expect(heartbeats()).toBe(2)

        port.receive({ heartbeat: true })
        port.remoteDisconnect()
        vi.advanceTimersByTime(PRESENCE_HEARTBEAT_MS)
        expect(heartbeats()).toBe(2)
    })

    it('tries again when the extension cannot be reached', () => {
        const { connect, presence: page } = setup()
        connect.mockImplementationOnce(() => {
            throw new Error('Extension context invalidated.')
        })

        page.open()
        page.open()

        expect(connect).toHaveBeenCalledTimes(2)
    })
})
