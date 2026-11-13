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

        if (typeof window === 'undefined') {
            vi.stubGlobal('window', new EventTarget())
        }
        vi.stubGlobal('EventSource', eventSourceCtor)
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: true,
                json: async () => ({ ticket: 'sse-ticket' }),
            }))
        )
    })

    async function waitForSocket() {
        await vi.waitFor(() => {
            expect(eventSourceCtor).toHaveBeenCalled()
        })
    }

    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
    })

    it('opens an EventSource with a short-lived ticket, not the session token', async () => {
        new DappAsyncProvider('http://example.com', sessionToken)
        await waitForSocket()

        expect(eventSourceCtor).toHaveBeenCalledTimes(1)
        expect(eventSourceCtor).toHaveBeenCalledWith(
            'http://example.com/events?ticket=sse-ticket'
        )
        const fetchMock = vi.mocked(fetch)
        expect(fetchMock).toHaveBeenCalledWith(
            new URL('http://example.com/events/ticket'),
            {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${sessionToken}`,
                    'content-type': 'application/json',
                },
                body: '{}',
            }
        )

        expect(sseHandlers.accountsChanged).toEqual(expect.any(Function))
    })

    it('can mock an SSE event payload and forward it to provider listeners', async () => {
        const provider = new DappAsyncProvider(
            'http://example.com',
            sessionToken
        )
        await waitForSocket()
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

    it('closes and resets the connection on EventSource error', async () => {
        new DappAsyncProvider('http://example.com', sessionToken)
        await waitForSocket()

        expect(eventSourceCtor).toHaveBeenCalledTimes(1)

        eventSourceInstance.onerror?.()

        expect(eventSourceInstance.close).toHaveBeenCalledTimes(1)

        // The error cleared the shared connection, so this opens another one.
        new DappAsyncProvider('http://example.com', sessionToken)
        await vi.waitFor(() => {
            expect(eventSourceCtor).toHaveBeenCalledTimes(2)
        })
    })

    it('keeps the open stream when another provider uses the same session', async () => {
        new DappAsyncProvider('http://example.com', sessionToken)
        await waitForSocket()
        const second = new DappAsyncProvider('http://example.com', sessionToken)

        expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
        expect(eventSourceCtor).toHaveBeenCalledTimes(1)

        const accountsChangedListener = vi.fn()
        second.on('accountsChanged', accountsChangedListener)
        emitSseEvent('accountsChanged', ['acc-1'])

        expect(accountsChangedListener).toHaveBeenCalledWith('acc-1')
    })

    it('drops a ticket response after the session has changed', async () => {
        const gateway = 'http://ticket-race.example'
        const pending: Array<{
            authorization: string
            resolve: (value: {
                ok: boolean
                json: () => Promise<{ ticket: string }>
            }) => void
        }> = []
        vi.stubGlobal(
            'fetch',
            vi.fn((url: URL | string, init?: RequestInit) => {
                const href = String(url)
                if (!href.startsWith(`${gateway}/events/ticket`)) {
                    return Promise.resolve(new Response('{}', { status: 401 }))
                }
                const headers = init?.headers as
                    | { authorization?: string }
                    | undefined
                return new Promise((resolve) => {
                    pending.push({
                        authorization: headers?.authorization ?? '',
                        resolve,
                    })
                })
            })
        )

        const provider = new DappAsyncProvider(gateway, 'token-a')
        provider.request = vi.fn().mockResolvedValue({ session: { id: 's' } })
        await vi.waitFor(() => expect(pending).toHaveLength(1))

        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type: WalletEvent.SPLICE_WALLET_IDP_AUTH_SUCCESS,
                    token: 'token-b',
                    sessionId: 'session-b',
                },
            })
        )
        await vi.waitFor(() => expect(pending).toHaveLength(2))

        pending[1]?.resolve({
            ok: true,
            json: async () => ({ ticket: 'ticket-b' }),
        })
        await vi.waitFor(() => expect(eventSourceCtor).toHaveBeenCalledTimes(1))
        expect(eventSourceCtor).toHaveBeenCalledWith(
            'http://ticket-race.example/events?ticket=ticket-b'
        )

        let lateTicketRead = false
        pending[0]?.resolve({
            ok: true,
            json: async () => {
                lateTicketRead = true
                return { ticket: 'ticket-a' }
            },
        })
        await vi.waitFor(() => expect(lateTicketRead).toBe(true))
        await Promise.resolve()

        expect(eventSourceCtor).toHaveBeenCalledTimes(1)
        expect(pending[0]?.authorization).toBe('Bearer token-a')
        expect(pending[1]?.authorization).toBe('Bearer token-b')
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
