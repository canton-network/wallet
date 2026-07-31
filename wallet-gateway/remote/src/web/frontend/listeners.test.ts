// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletEvent } from '@canton-network/core-types'
import { stateManager } from './state-manager.js'
import { detectCurrentOrigin } from './listeners.js'

describe('detectCurrentOrigin', () => {
    beforeEach(() => {
        stateManager.currentOrigin.clear()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: null,
        })
        stateManager.currentOrigin.clear()
    })

    it('uses window.origin when there is no opener', async () => {
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: null,
        })

        await expect(detectCurrentOrigin()).resolves.toBe(window.origin)
        expect(stateManager.currentOrigin.get()).toBe(window.origin)
    })

    it('returns a previously stored origin without waiting', async () => {
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: window,
        })
        stateManager.currentOrigin.set('https://dapp.example')

        await expect(detectCurrentOrigin()).resolves.toBe(
            'https://dapp.example'
        )
    })

    it('resolves when the parent broadcasts an origin', async () => {
        // MessageEvent.source must be an EventTarget; use window as both
        // opener and source so the production identity check still passes.
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: window,
        })
        const ackSpy = vi.spyOn(window, 'postMessage')

        const pending = detectCurrentOrigin()
        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN,
                    origin: 'https://dapp.example',
                },
                origin: 'https://dapp.example',
                source: window,
            })
        )

        await vi.advanceTimersByTimeAsync(100)
        await expect(pending).resolves.toBe('https://dapp.example')
        expect(ackSpy).toHaveBeenCalledWith(
            { type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK },
            'https://dapp.example'
        )
        ackSpy.mockRestore()
    })

    it('rejects after the timeout when no origin arrives', async () => {
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: window,
        })

        const pending = detectCurrentOrigin(1_000)
        const expectation = expect(pending).rejects.toThrow(
            /Timed out after 1000ms/
        )
        await vi.advanceTimersByTimeAsync(1_000)
        await expectation
    })
})
