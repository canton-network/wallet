// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
    Mock,
    beforeAll,
} from 'vitest'
import { ParentWindowOriginManager, ChildWindowOriginManager } from './manager'
import { OriginHandshakeMessage } from './types'

const exampleOrigin = 'http://example.com'
const falseOrigin = 'http://false.origin.com'

const { openerPostMessageSpy } = vi.hoisted(() => {
    // Mock window.opener with a postMessage method
    const mockOpener = { postMessage: vi.fn() }
    Object.defineProperty(window, 'opener', {
        value: mockOpener,
        writable: true,
        configurable: true,
    })

    return {
        openerPostMessageSpy: mockOpener.postMessage as Mock,
    }
})

describe('manager', () => {
    let eventListenerSpy: Mock<Window['addEventListener']>
    let postMessageSpy: Mock<Window['postMessage']>

    beforeAll(() => {
        vi.useFakeTimers()
    })

    beforeEach(() => {
        vi.resetAllMocks()
        eventListenerSpy = vi.spyOn(window, 'addEventListener')
        postMessageSpy = vi.spyOn(window, 'postMessage')
    })

    describe('ParentWindowOriginManager', () => {
        let parentWindowManager: ParentWindowOriginManager

        beforeEach(() => {
            parentWindowManager = new ParentWindowOriginManager()
        })

        afterEach(() => {
            parentWindowManager.removeListener()
        })

        it('should add event listener upon instantiation', () => {
            expect(eventListenerSpy).toHaveBeenCalledTimes(1)
        })

        it('should remove event listener', () => {
            const removeEventSpy = vi.spyOn(window, 'removeEventListener')

            parentWindowManager.removeListener()

            expect(removeEventSpy).toHaveBeenCalledOnce()
        })

        it('should poll message until response is received', () => {
            parentWindowManager.poll(exampleOrigin)

            expect(postMessageSpy).not.toHaveBeenCalled()

            vi.advanceTimersToNextTimer()

            expect(postMessageSpy).toHaveBeenCalledOnce()

            vi.advanceTimersToNextTimer()

            expect(postMessageSpy).toHaveBeenCalledTimes(2)

            window.dispatchEvent(
                new MessageEvent('message', {
                    data: {
                        message:
                            OriginHandshakeMessage.enum
                                .SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            vi.advanceTimersToNextTimer()
            expect(postMessageSpy).toHaveBeenCalledTimes(2)

            expect(parentWindowManager.assert(exampleOrigin)).toBe(true)
        })

        it("should return false when asking for origin where a handshake wasn't established with", () => {
            expect(parentWindowManager.assert(falseOrigin)).toBe(false)
        })

        it('should send postMessage when origin is allowed', () => {
            const testMessage = { test: 'data' }

            window.dispatchEvent(
                new MessageEvent('message', {
                    data: {
                        message:
                            OriginHandshakeMessage.enum
                                .SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            vi.clearAllMocks()
            postMessageSpy = vi.spyOn(window, 'postMessage')

            parentWindowManager.postMessage(testMessage, exampleOrigin)

            expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith(
                testMessage,
                exampleOrigin
            )
        })

        it('should not send postMessage when origin is not allowed', () => {
            const testMessage = { test: 'data' }

            parentWindowManager.postMessage(testMessage, falseOrigin)

            expect(postMessageSpy).not.toHaveBeenCalled()
        })
    })

    describe('ChildWindowOriginManager', () => {
        let childWindowManager: ChildWindowOriginManager

        beforeEach(() => {
            childWindowManager = new ChildWindowOriginManager()
        })

        afterEach(() => {
            childWindowManager.removeListener()
        })

        it('should add event listener upon instantiation', () => {
            expect(eventListenerSpy).toHaveBeenCalledTimes(1)
        })

        it('should remove event listener', () => {
            const removeEventSpy = vi.spyOn(window, 'removeEventListener')

            childWindowManager.removeListener()

            expect(removeEventSpy).toHaveBeenCalledOnce()
        })

        it("should return false when asking for origin where a handshake wasn't established with", () => {
            expect(childWindowManager.assert(falseOrigin)).toBe(false)
        })

        it('should properly facilitate a handshake by responding to a message', () => {
            window.dispatchEvent(
                new MessageEvent('message', {
                    data: {
                        message:
                            OriginHandshakeMessage.enum
                                .SPLICE_WALLET_BROADCAST_ORIGIN,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            expect(openerPostMessageSpy).toHaveBeenCalledExactlyOnceWith(
                {
                    message:
                        OriginHandshakeMessage.enum
                            .SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
                    origin: window.location.origin,
                },
                exampleOrigin
            )
        })

        it('should send postMessage when origin is allowed', () => {
            const testMessage = { test: 'data' }

            window.dispatchEvent(
                new MessageEvent('message', {
                    data: {
                        message:
                            OriginHandshakeMessage.enum
                                .SPLICE_WALLET_BROADCAST_ORIGIN,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            vi.clearAllMocks()

            childWindowManager.postMessage(testMessage, exampleOrigin)

            expect(openerPostMessageSpy).toHaveBeenCalledExactlyOnceWith(
                testMessage,
                exampleOrigin
            )
        })

        it('should not send postMessage when origin is not allowed', () => {
            const testMessage = { test: 'data' }

            childWindowManager.postMessage(testMessage, falseOrigin)

            expect(openerPostMessageSpy).not.toHaveBeenCalled()
        })
    })
})
