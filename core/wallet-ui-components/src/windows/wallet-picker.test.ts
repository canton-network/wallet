// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WalletPickerEntry } from '@canton-network/core-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeWalletPickerEntry } from '../components/fixtures.js'
import { popup } from './popup.js'
import {
    notifyWalletPickerConnected,
    notifyWalletPickerError,
    pickWallet,
    waitForWalletPickerRetrySelection,
} from './wallet-picker.js'

const ENTRIES_KEY = 'splice_wallet_picker_entries'

function createMockPopupWindow() {
    const listeners = new Map<string, Set<EventListener>>()
    const win = {
        closed: false,
        location: { origin: window.location.origin, href: '' },
        focus: vi.fn(),
        postMessage: vi.fn(),
        close: vi.fn(() => {
            win.closed = true
        }),
        addEventListener: vi.fn((type: string, listener: EventListener) => {
            if (!listeners.has(type)) listeners.set(type, new Set())
            listeners.get(type)!.add(listener)
        }),
        removeEventListener: vi.fn((type: string, listener: EventListener) => {
            listeners.get(type)?.delete(listener)
        }),
        dispatchEvent: (event: Event) => {
            listeners.get(event.type)?.forEach((listener) => listener(event))
            return true
        },
    }
    return win
}

describe('windows/wallet-picker', () => {
    beforeEach(() => {
        localStorage.clear()
        popup.close()
        vi.spyOn(popup, 'open')
    })

    afterEach(() => {
        popup.close()
        vi.restoreAllMocks()
    })

    it('pickWallet stores entries and resolves on selection message', async () => {
        const mockWin = createMockPopupWindow()
        vi.mocked(popup.open).mockReturnValue(mockWin as unknown as Window)

        const entries: WalletPickerEntry[] = [
            makeWalletPickerEntry({
                providerId: 'ext:selected',
                name: 'Selected Wallet',
            }),
        ]

        const pickPromise = pickWallet(entries)

        expect(JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? '[]')).toEqual(
            entries
        )
        expect(popup.open).toHaveBeenCalled()

        window.dispatchEvent(
            new MessageEvent('message', {
                origin: window.location.origin,
                data: {
                    messageType: 'SPLICE_WALLET_PICKER_RESULT',
                    providerId: 'ext:selected',
                    name: 'Selected Wallet',
                    walletType: 'browser',
                },
            })
        )

        await expect(pickPromise).resolves.toEqual({
            providerId: 'ext:selected',
            name: 'Selected Wallet',
            type: 'browser',
        })
    })

    it('pickWallet rejects when popup is closed before selection', async () => {
        const mockWin = createMockPopupWindow()
        vi.mocked(popup.open).mockReturnValue(mockWin as unknown as Window)

        const pickPromise = pickWallet([makeWalletPickerEntry()])

        mockWin.dispatchEvent(new Event('beforeunload'))

        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })

    it('notifyWalletPickerConnected posts status and closes popup', async () => {
        const mockWin = createMockPopupWindow()
        vi.mocked(popup.open).mockReturnValue(mockWin as unknown as Window)

        void pickWallet([makeWalletPickerEntry()])
        notifyWalletPickerConnected()

        expect(mockWin.postMessage).toHaveBeenCalledWith(
            {
                messageType: 'SPLICE_WALLET_PICKER_CONNECT_STATUS',
                status: 'connected',
            },
            window.location.origin
        )

        await Promise.resolve()
        expect(mockWin.close).toHaveBeenCalled()
    })

    it('notifyWalletPickerConnected keeps popup open when reuseGlobalWalletPopup is set', async () => {
        const mockWin = createMockPopupWindow()
        vi.mocked(popup.open).mockReturnValue(mockWin as unknown as Window)

        void pickWallet([makeWalletPickerEntry()])
        notifyWalletPickerConnected(true)

        expect(mockWin.postMessage).toHaveBeenCalled()
        await Promise.resolve()
        expect(mockWin.close).not.toHaveBeenCalled()
    })

    it('notifyWalletPickerError posts error status', () => {
        const mockWin = createMockPopupWindow()
        vi.mocked(popup.open).mockReturnValue(mockWin as unknown as Window)

        void pickWallet([makeWalletPickerEntry()])
        notifyWalletPickerError('Something went wrong')

        expect(mockWin.postMessage).toHaveBeenCalledWith(
            {
                messageType: 'SPLICE_WALLET_PICKER_CONNECT_STATUS',
                status: 'error',
                message: 'Something went wrong',
            },
            window.location.origin
        )
    })

    it('waitForWalletPickerRetrySelection resolves on a new selection', async () => {
        const mockWin = createMockPopupWindow()
        vi.mocked(popup.open).mockReturnValue(mockWin as unknown as Window)

        const entries = [makeWalletPickerEntry()]
        const pickPromise = pickWallet(entries)

        window.dispatchEvent(
            new MessageEvent('message', {
                origin: window.location.origin,
                data: {
                    messageType: 'SPLICE_WALLET_PICKER_RESULT',
                    providerId: 'ext:first',
                    name: 'First',
                    walletType: 'browser',
                },
            })
        )
        await pickPromise

        const retryPromise = waitForWalletPickerRetrySelection()

        window.dispatchEvent(
            new MessageEvent('message', {
                origin: window.location.origin,
                data: {
                    messageType: 'SPLICE_WALLET_PICKER_RESULT',
                    providerId: 'remote:http://retry',
                    name: 'Retry GW',
                    walletType: 'remote',
                    url: 'http://retry',
                },
            })
        )

        await expect(retryPromise).resolves.toEqual({
            providerId: 'remote:http://retry',
            name: 'Retry GW',
            type: 'remote',
            url: 'http://retry',
        })
    })
})
