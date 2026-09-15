// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletEvent } from '@canton-network/core-types'

const mock = vi.hoisted(() => ({
    setCurrentOrigin: vi.fn(),
    openerPostMessage: vi.fn(),
}))

vi.mock('./state-manager', () => ({
    stateManager: {
        currentOrigin: {
            set: mock.setCurrentOrigin,
        },
    },
}))

describe('origin', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()

        Object.defineProperty(window, 'opener', {
            value: {
                postMessage: mock.openerPostMessage,
                origin: 'http://example.com',
            },
            writable: true,
            configurable: true,
        })
    })

    it('should initialize the origin manager', async () => {
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

        await import('./origin')

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'message',
            expect.any(Function)
        )
    })

    it('should set proper origin after successful handshake', async () => {
        await import('./origin')

        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN,
                    origin: 'http://example.com',
                },
                origin: 'http://example.com',
            })
        )

        expect(mock.setCurrentOrigin).toHaveBeenCalledExactlyOnceWith(
            'http://example.com'
        )
        expect(mock.openerPostMessage).toHaveBeenCalledExactlyOnceWith(
            {
                type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
                origin: window.location.origin,
            },
            'http://example.com'
        )
    })
})
