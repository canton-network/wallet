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
import { WalletEvent } from '@canton-network/core-types'

const { postMessage, exampleOrigin, falseOrigin, userHandshakeCallback } =
    vi.hoisted(() => {
        const exampleOrigin = 'http://example.com'
        const falseOrigin = 'http://false.origin.com'

        // Mock window.opener with a postMessage method
        const postMessage = vi.fn()
        const windowOpener = {
            postMessage,
            origin: exampleOrigin,
        }
        Object.defineProperty(window, 'opener', {
            value: windowOpener,
            writable: true,
            configurable: true,
        })

        const userHandshakeCallback = vi.fn()

        return {
            postMessage,
            exampleOrigin,
            falseOrigin,
            userHandshakeCallback,
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
            parentWindowManager = new ParentWindowOriginManager({
                userHandshakeCallback,
            })
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

        it('should poll message when calling postMessage for the first time', () => {
            parentWindowManager.postMessage('some message', exampleOrigin)

            expect(eventListenerSpy).toHaveBeenCalledTimes(2)

            vi.advanceTimersToNextTimer()

            expect(postMessageSpy).toHaveBeenCalledTimes(1)

            window.dispatchEvent(
                new MessageEvent('message', {
                    data: {
                        type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            vi.advanceTimersToNextTimer()
            expect(postMessageSpy).toHaveBeenNthCalledWith(
                1,
                {
                    type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN,
                    origin: window.location.origin,
                },
                exampleOrigin
            )

            expect(userHandshakeCallback).toHaveBeenCalledOnce()
            expect(parentWindowManager.assert(exampleOrigin)).toBe(true)
        })

        it("should return false when asking for origin where a handshake wasn't established with", () => {
            expect(parentWindowManager.assert(falseOrigin)).toBe(false)
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
            childWindowManager = new ChildWindowOriginManager({
                userHandshakeCallback,
            })
        })

        afterEach(() => {
            childWindowManager.removeListener()
        })

        it('should add event listener upon instantiation', () => {
            expect(eventListenerSpy).toHaveBeenCalledOnce()
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
                        type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            expect(postMessage).toHaveBeenCalledExactlyOnceWith(
                {
                    type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
                    origin: window.location.origin,
                },
                exampleOrigin
            )
            expect(userHandshakeCallback).toHaveBeenCalledOnce()
        })

        it('should not send postMessage when origin is not allowed', () => {
            const testMessage = { test: 'data' }

            childWindowManager.postMessage(testMessage)

            expect(postMessage).not.toHaveBeenCalled()
        })

        it('should use provided parent window', () => {
            const parentWindow = {
                postMessage: vi.fn(),
                origin: exampleOrigin,
            } as unknown as Window
            const childWindowOriginManagerWithParentWindow =
                new ChildWindowOriginManager({ parentWindow })

            window.dispatchEvent(
                new MessageEvent('message', {
                    data: {
                        type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN,
                        origin: exampleOrigin,
                    },
                    origin: exampleOrigin,
                })
            )

            childWindowOriginManagerWithParentWindow.postMessage('some message')

            expect(parentWindow.postMessage).toHaveBeenCalled()
        })
    })
})
