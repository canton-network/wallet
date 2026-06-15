// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type MockEventSourceInstance = {
    close: ReturnType<typeof vi.fn>
    addEventListener: (
        event: string,
        handler: (event: MessageEvent) => void
    ) => void
    onmessage: ((event: MessageEvent) => void) | null
    onerror: (() => void) | null
}

let eventSourceCtor: ReturnType<typeof vi.fn>
let eventSourceInstance: MockEventSourceInstance
let sseHandlers: Record<string, (event: MessageEvent) => void>
let sessionToken: string
let tokenCounter = 0

import { DappAsyncProvider } from './DappAsyncProvider'
import { WalletEvent } from '@canton-network/core-types'

function emitSseEvent(eventName: string, data: unknown) {
    const handler = sseHandlers[eventName]
    if (!handler) throw new Error(`No SSE handler registered for ${eventName}`)

    handler({ data: JSON.stringify(data) } as MessageEvent)
}

describe('DappAsyncProvider', () => {
    beforeEach(async () => {
        sseHandlers = {}
        tokenCounter += 1
        // Token needs to be unique per test to ensure new connections and event listeners are created.
        sessionToken = `authtoken-${tokenCounter}`

        eventSourceInstance = {
            close: vi.fn(),
            addEventListener: (event, handler) => {
                sseHandlers[event] = handler
            },
            onmessage: null,
            onerror: null,
        }

        eventSourceCtor = vi.fn(function () {
            return eventSourceInstance as unknown as EventSource
        })

        vi.stubGlobal('EventSource', eventSourceCtor)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
    })

    it('opens an EventSource with auth token query parameter', () => {
        new DappAsyncProvider('http://example.com', sessionToken)

        expect(eventSourceCtor).toHaveBeenCalledTimes(1)
        expect(eventSourceCtor).toHaveBeenCalledWith(
            `http://example.com/events?token=${sessionToken}`
        )

        expect(sseHandlers.accountsChanged).toEqual(expect.any(Function))
    })

    it('can mock an SSE event payload and forward it to provider listeners', () => {
        const provider = new DappAsyncProvider(
            'http://example.com',
            sessionToken
        )
        const accountsChangedListener = vi.fn()

        provider.on('accountsChanged', accountsChangedListener)

        emitSseEvent('accountsChanged', ['acc-1', 'acc-2'])

        expect(accountsChangedListener).toHaveBeenCalledTimes(1)
        expect(accountsChangedListener).toHaveBeenCalledWith('acc-1', 'acc-2')
    })

    it('can send a request and receive a response', async () => {
        const provider = new DappAsyncProvider(
            'http://example.com',
            sessionToken
        )

        provider.request = vi.fn().mockResolvedValue('response-value')

        const response = await provider.request({
            method: 'prepareExecute',
            params: { commands: [] },
        })

        expect(provider.request).toHaveBeenCalledTimes(1)
        expect(response).toBe('response-value')
    })

    it('closes and resets the connection on EventSource error', () => {
        new DappAsyncProvider('http://example.com', sessionToken)

        expect(eventSourceCtor).toHaveBeenCalledTimes(1)

        eventSourceInstance.onerror?.()

        expect(eventSourceInstance.close).toHaveBeenCalledTimes(1)

        new DappAsyncProvider('http://example.com', sessionToken)

        // The prior error should have nulled shared connection, so this creates a new SSE.
        expect(eventSourceCtor).toHaveBeenCalledTimes(2)
    })

    it('processes an auth success event', async () => {
        const provider = new DappAsyncProvider(
            'http://example.com',
            sessionToken
        )

        const statusPayload = {
            session: {
                id: 'session-1',
            },
        }
        provider.request = vi.fn().mockResolvedValue(statusPayload)

        const statusListener = vi.fn()
        provider.on('statusChanged', statusListener)

        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type: WalletEvent.SPLICE_WALLET_IDP_AUTH_SUCCESS,
                    token: sessionToken,
                    sessionId: 'session-1',
                },
            })
        )

        await vi.waitFor(() => {
            expect(provider.request).toHaveBeenCalledWith({ method: 'status' })
            expect(statusListener).toHaveBeenCalledTimes(1)
            expect(statusListener).toHaveBeenCalledWith(statusPayload)
        })
    })
})
