// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    WalletPickerEntry,
    WalletPickerResult,
} from '../components/wallet-picker.js'
import { WalletPicker } from '../components/wallet-picker.js'
import { popup } from './popup.js'

let activeWalletPickerWindow: WindowProxy | undefined

type WalletPickerConnectStatus = {
    messageType: 'SPLICE_WALLET_PICKER_CONNECT_STATUS'
    status: 'connected' | 'error'
    message?: string
}

const postWalletPickerStatus = (payload: WalletPickerConnectStatus): void => {
    const win = activeWalletPickerWindow
    if (!win || win.closed) return

    try {
        if (win.location.origin !== window.location.origin) {
            return
        }
        win.postMessage(payload, window.location.origin)
    } catch {
        // best-effort UI notification
    }
}

export const notifyWalletPickerConnected = (
    reuseGlobalWalletPopup?: boolean
): void => {
    postWalletPickerStatus({
        messageType: 'SPLICE_WALLET_PICKER_CONNECT_STATUS',
        status: 'connected',
    })

    if (reuseGlobalWalletPopup) return

    queueMicrotask(() => {
        const win = activeWalletPickerWindow
        if (!win || win.closed) return
        try {
            win.close()
        } catch {
            // ignore
        }
        activeWalletPickerWindow = undefined
    })
}

export const notifyWalletPickerError = (message: string): void => {
    postWalletPickerStatus({
        messageType: 'SPLICE_WALLET_PICKER_CONNECT_STATUS',
        status: 'error',
        message,
    })
}

const awaitWalletPickerSelection = (
    win: WindowProxy
): Promise<WalletPickerResult> => {
    return new Promise<WalletPickerResult>((resolve, reject) => {
        let settled = false

        const cleanup = (): void => {
            win.removeEventListener('beforeunload', onBeforeUnload)
            window.removeEventListener('message', onMessage)
        }

        const onBeforeUnload = (): void => {
            if (settled) return
            settled = true
            cleanup()
            reject(new Error('User closed the wallet picker'))
        }

        const onMessage = (event: MessageEvent): void => {
            if (
                event.origin !== window.location.origin ||
                event.data?.messageType !== 'SPLICE_WALLET_PICKER_RESULT'
            ) {
                return
            }

            settled = true
            cleanup()
            resolve({
                providerId: event.data.providerId,
                name: event.data.name,
                type: event.data.walletType,
                url: event.data.url,
                reuseGlobalWalletPopup: event.data.reuseGlobalWalletPopup,
            })
        }

        win.addEventListener('beforeunload', onBeforeUnload)
        window.addEventListener('message', onMessage)
    })
}

export const waitForWalletPickerRetrySelection =
    async (): Promise<WalletPickerResult> => {
        const win = activeWalletPickerWindow
        if (!win || win.closed) {
            throw new Error('Wallet picker is not open')
        }

        return await awaitWalletPickerSelection(win)
    }

export type PickWalletOptions = {
    /**
     * Extra CSS applied to the wallet picker popup, e.g. to override the
     * `--wg-theme-*` custom properties for a custom theme. See
     * PopupOptions.stylesheet for details.
     */
    stylesheet?: string
}

/**
 * Opens a wallet picker popup and resolves with the user's selection.
 *
 * Wallet entries are passed via localStorage and the user's choice is
 * communicated back via postMessage.
 */
export async function pickWallet(
    entries: WalletPickerEntry[],
    options?: PickWalletOptions
): Promise<WalletPickerResult> {
    localStorage.setItem(
        'splice_wallet_picker_entries',
        JSON.stringify(entries)
    )

    const win = popup.open(WalletPicker, {
        title: 'Connect a wallet',
        ...(options?.stylesheet !== undefined
            ? { stylesheet: options.stylesheet }
            : {}),
    })
    activeWalletPickerWindow = win

    return await awaitWalletPickerSelection(win)
}
