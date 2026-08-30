// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WalletPickerEntry } from '@canton-network/core-types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeWalletPickerEntry } from '../components/fixtures.js'
import {
    notifyWalletPickerModalConnected,
    notifyWalletPickerModalError,
    pickWalletModal,
    setWalletPickerModalTheme,
    setWalletPickerModalWalletConnectUri,
    waitForWalletPickerModalBack,
    waitForWalletPickerModalRetrySelection,
} from './wallet-picker-modal.js'

const RECENT_KEY = 'splice_wallet_picker_recent'
const SUGGESTED_KEY = 'splice_wallet_picker_suggested_entries'

function modalHost(): HTMLElement {
    const host = document.querySelector(
        '[data-swk-wallet-picker-modal]'
    ) as HTMLElement | null
    if (!host) throw new Error('wallet picker modal host not found')
    return host
}

function shadow(): ShadowRoot {
    const root = modalHost().shadowRoot
    if (!root) throw new Error('wallet picker modal shadow root missing')
    return root
}

function titleText(): string {
    return shadow().querySelector('h2')?.textContent ?? ''
}

function walletTitles(): string[] {
    return Array.from(
        shadow().querySelectorAll('.wallet-picker-item-main h3')
    ).map((node) => node.textContent ?? '')
}

function clickWalletByExactName(name: string): void {
    const buttons = Array.from(
        shadow().querySelectorAll<HTMLButtonElement>('.wallet-picker-item-main')
    )
    const match = buttons.find(
        (btn) => btn.querySelector('h3')?.textContent === name
    )
    if (!match) throw new Error(`wallet button not found: ${name}`)
    match.click()
}

function clickClose(): void {
    const close = shadow().querySelector<HTMLButtonElement>(
        '[aria-label="Close modal"]'
    )
    if (!close) throw new Error('close button not found')
    close.click()
}

function clickBack(): void {
    const back = shadow().querySelector<HTMLButtonElement>(
        '[aria-label="Go back"]'
    )
    if (!back) throw new Error('back button not found')
    back.click()
}

function clickBackdrop(): void {
    const backdrop = shadow().querySelector<HTMLElement>(
        '.discovery-modal-backdrop'
    )
    if (!backdrop) throw new Error('backdrop not found')
    backdrop.click()
}

function forceRemoveHosts(): void {
    document
        .querySelectorAll('[data-swk-wallet-picker-modal]')
        .forEach((node) => node.remove())
}

async function settleOrTimeout<T>(
    promise: Promise<T>,
    ms = 50
): Promise<'settled' | 'timeout'> {
    return Promise.race([
        promise.then(
            () => 'settled' as const,
            () => 'settled' as const
        ),
        new Promise<'timeout'>((resolve) =>
            setTimeout(() => resolve('timeout'), ms)
        ),
    ])
}

describe('windows/wallet-picker-modal', () => {
    beforeEach(() => {
        localStorage.clear()
        setWalletPickerModalTheme('auto')
        forceRemoveHosts()
    })

    afterEach(() => {
        // Teardown only — do not fake a successful connect.
        forceRemoveHosts()
        setWalletPickerModalTheme('auto')
        localStorage.clear()
    })

    it('pickWalletModal mounts an in-page dialog and lists entries', async () => {
        const entries: WalletPickerEntry[] = [
            makeWalletPickerEntry({
                providerId: 'ext:alpha',
                name: 'Alpha Wallet',
                type: 'browser',
            }),
        ]

        const pickPromise = pickWalletModal(entries)

        const host = modalHost()
        expect(host.isConnected).toBe(true)
        expect(host.shadowRoot).not.toBeNull()

        const dialog = shadow().querySelector('[role="dialog"]')
        expect(dialog?.getAttribute('aria-modal')).toBe('true')
        expect(titleText()).toBe('Connect Wallet')
        expect(walletTitles()).toContain('Alpha Wallet')
        expect(walletTitles()).toContain('Remote Wallet')
        expect(
            shadow().querySelector('.wallet-installed-badge')?.textContent
        ).toBe('Installed')

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('pickWalletModal resolves when a wallet is selected', async () => {
        const entries: WalletPickerEntry[] = [
            makeWalletPickerEntry({
                providerId: 'ext:selected',
                name: 'Selected Wallet',
                type: 'browser',
            }),
        ]

        const pickPromise = pickWalletModal(entries)
        clickWalletByExactName('Selected Wallet')

        await expect(pickPromise).resolves.toMatchObject({
            providerId: 'ext:selected',
            name: 'Selected Wallet',
            type: 'browser',
        })

        expect(titleText()).toBe('Connecting...')
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).not.toBeNull()

        notifyWalletPickerModalConnected()
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('pickWalletModal resolves remote entry shape including url flags', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'remote:https://gw.example/',
                name: 'Gateway',
                type: 'remote',
                url: 'https://gw.example/',
                reuseGlobalWalletPopup: true,
            }),
        ])
        clickWalletByExactName('Gateway')

        await expect(pickPromise).resolves.toEqual({
            providerId: 'remote:https://gw.example/',
            name: 'Gateway',
            type: 'remote',
            url: 'https://gw.example/',
            reuseGlobalWalletPopup: true,
        })

        notifyWalletPickerModalConnected()
    })

    it('pickWalletModal rejects when closed before selection', async () => {
        const pickPromise = pickWalletModal([makeWalletPickerEntry()])

        clickClose()

        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('backdrop click rejects like close; content click does not', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:backdrop',
                name: 'Backdrop Wallet',
                type: 'browser',
            }),
        ])

        shadow().querySelector<HTMLElement>('[role="dialog"]')?.click()
        expect(await settleOrTimeout(pickPromise, 30)).toBe('timeout')
        expect(modalHost().isConnected).toBe(true)

        clickBackdrop()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('re-opening pickWalletModal replaces the host and rejects the prior pick', async () => {
        const first = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:first',
                name: 'First',
                type: 'browser',
            }),
        ])
        const second = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:second',
                name: 'Second',
                type: 'browser',
            }),
        ])

        expect(
            document.querySelectorAll('[data-swk-wallet-picker-modal]')
        ).toHaveLength(1)
        expect(walletTitles()).toContain('Second')
        expect(walletTitles()).not.toContain('First')

        await expect(first).rejects.toThrow('User closed the wallet picker')

        clickWalletByExactName('Second')
        await expect(second).resolves.toMatchObject({
            providerId: 'ext:second',
            name: 'Second',
        })
        notifyWalletPickerModalConnected()
    })

    it('notifyWalletPickerModalConnected removes the modal', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:ok',
                name: 'OK Wallet',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('OK Wallet')
        await pickPromise

        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).not.toBeNull()

        notifyWalletPickerModalConnected()

        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('notifyWalletPickerModalError returns to the list with an alert', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:fail',
                name: 'Fail Wallet',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('Fail Wallet')
        await pickPromise

        notifyWalletPickerModalError('Something went wrong')

        expect(titleText()).toBe('Connect Wallet')
        const alert = shadow().querySelector(
            '.discovery-modal-error[role="alert"]'
        )
        expect(alert?.textContent).toBe('Something went wrong')

        clickClose()
        // No pending selection waiter after error — close only destroys.
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('error while WalletConnect connecting clears QR and returns to list', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'walletconnect',
                name: 'WalletConnect',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('WalletConnect')
        await pickPromise

        setWalletPickerModalWalletConnectUri(
            'wc:test-uri',
            'data:image/png;base64,abc'
        )
        expect(
            shadow().querySelector('img[alt="WalletConnect QR code"]')
        ).not.toBeNull()

        notifyWalletPickerModalError('WC failed')

        expect(titleText()).toBe('Connect Wallet')
        expect(
            shadow().querySelector('img[alt="WalletConnect QR code"]')
        ).toBeNull()
        expect(
            shadow().querySelector('.discovery-modal-error[role="alert"]')
                ?.textContent
        ).toBe('WC failed')

        clickWalletByExactName('WalletConnect')
        expect(titleText()).toBe('Scan with your phone')
        expect(
            shadow().querySelector('.walletconnect-qr-placeholder')
        ).not.toBeNull()

        notifyWalletPickerModalConnected()
    })

    it('waitForWalletPickerModalRetrySelection resolves on a new selection', async () => {
        const first = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:first',
                name: 'First',
                type: 'browser',
            }),
            makeWalletPickerEntry({
                providerId: 'ext:retry',
                name: 'Retry Wallet',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('First')
        await first

        notifyWalletPickerModalError('try again')

        const retryPromise = waitForWalletPickerModalRetrySelection()
        clickWalletByExactName('Retry Wallet')

        await expect(retryPromise).resolves.toMatchObject({
            providerId: 'ext:retry',
            name: 'Retry Wallet',
            type: 'browser',
        })
        expect(titleText()).toBe('Connecting...')
        expect(shadow().querySelector('[role="alert"]')).toBeNull()

        notifyWalletPickerModalConnected()
    })

    it('waitForWalletPickerModalRetrySelection rejects when closed during retry', async () => {
        const first = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:first',
                name: 'First',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('First')
        await first
        notifyWalletPickerModalError('try again')

        const retryPromise = waitForWalletPickerModalRetrySelection()
        clickClose()

        await expect(retryPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('waitForWalletPickerModalRetrySelection throws when no modal is open', async () => {
        await expect(waitForWalletPickerModalRetrySelection()).rejects.toThrow(
            'Wallet picker is not open'
        )
    })

    it('waitForWalletPickerModalBack resolves when back is clicked while connecting', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:back',
                name: 'Back Wallet',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('Back Wallet')
        await pickPromise

        const backPromise = waitForWalletPickerModalBack()
        clickBack()

        await expect(backPromise).resolves.toBeUndefined()
        expect(titleText()).toBe('Connect Wallet')

        clickClose()
    })

    it('back before waitForWalletPickerModalBack is latched for the next await', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:latch',
                name: 'Latch Wallet',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('Latch Wallet')
        await pickPromise

        clickBack()
        expect(titleText()).toBe('Connect Wallet')

        await expect(waitForWalletPickerModalBack()).resolves.toBeUndefined()

        clickClose()
    })

    it('close while connecting settles waitForWalletPickerModalBack', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:close-connect',
                name: 'Close Connect',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('Close Connect')
        await pickPromise

        const backPromise = waitForWalletPickerModalBack()
        clickClose()

        await expect(backPromise).resolves.toBeUndefined()
        expect(
            document.querySelector('[data-swk-wallet-picker-modal]')
        ).toBeNull()
    })

    it('waitForWalletPickerModalBack never settles when no modal is open', async () => {
        const backPromise = waitForWalletPickerModalBack()
        expect(await settleOrTimeout(backPromise, 50)).toBe('timeout')
    })

    it('setWalletPickerModalTheme applies data-swk-theme on the host', async () => {
        setWalletPickerModalTheme('dark')
        const pickPromise = pickWalletModal([makeWalletPickerEntry()])

        expect(modalHost().getAttribute('data-swk-theme')).toBe('dark')

        setWalletPickerModalTheme('light')
        expect(modalHost().getAttribute('data-swk-theme')).toBe('light')

        setWalletPickerModalTheme('auto')
        expect(modalHost().hasAttribute('data-swk-theme')).toBe(false)

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })

    it('WalletConnect connecting shows placeholder until URI/QR are set', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'walletconnect',
                name: 'WalletConnect',
                type: 'browser',
            }),
        ])
        clickWalletByExactName('WalletConnect')
        await pickPromise

        expect(titleText()).toBe('Scan with your phone')
        expect(
            shadow().querySelector('.walletconnect-qr-placeholder')
        ).not.toBeNull()
        const copy = shadow().querySelector<HTMLButtonElement>(
            '.walletconnect-copy-button'
        )
        expect(copy?.disabled).toBe(true)

        setWalletPickerModalWalletConnectUri('wc:test-uri')
        expect(
            shadow().querySelector('.walletconnect-qr-placeholder')
        ).not.toBeNull()
        expect(
            shadow().querySelector('img[alt="WalletConnect QR code"]')
        ).toBeNull()
        expect(
            shadow().querySelector<HTMLButtonElement>(
                '.walletconnect-copy-button'
            )?.disabled
        ).toBe(false)

        setWalletPickerModalWalletConnectUri(
            'wc:test-uri',
            'data:image/png;base64,abc'
        )
        const qr = shadow().querySelector<HTMLImageElement>(
            'img[alt="WalletConnect QR code"]'
        )
        expect(qr?.getAttribute('src')).toBe('data:image/png;base64,abc')

        notifyWalletPickerModalConnected()
    })

    it('custom Remote Wallet gateway normalizes URL and resolves selection', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:other',
                name: 'Other',
                type: 'browser',
            }),
        ])

        clickWalletByExactName('Remote Wallet')
        expect(titleText()).toBe('Remote Wallet')

        const input = shadow().querySelector<HTMLInputElement>(
            'input[aria-label="Remote Wallet URL"]'
        )
        const connect = shadow().querySelector<HTMLButtonElement>(
            '.gateway-connect-button'
        )
        expect(input).not.toBeNull()
        expect(connect?.disabled).toBe(true)

        input!.value = 'wallet.example.com'
        input!.dispatchEvent(new Event('input', { bubbles: true }))
        expect(connect?.disabled).toBe(false)

        connect!.click()

        const normalized = 'https://wallet.example.com/'
        await expect(pickPromise).resolves.toEqual({
            providerId: `custom:remote:${encodeURIComponent(normalized)}`,
            name: 'wallet.example.com',
            type: 'remote',
            url: normalized,
            reuseGlobalWalletPopup: false,
        })
        expect(titleText()).toBe('Connecting...')

        notifyWalletPickerModalConnected()
    })

    it('gateway back returns to list without settling the pick promise', async () => {
        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:gw-back',
                name: 'GW Back',
                type: 'browser',
            }),
        ])

        clickWalletByExactName('Remote Wallet')
        clickBack()
        expect(titleText()).toBe('Connect Wallet')
        expect(await settleOrTimeout(pickPromise, 30)).toBe('timeout')

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })

    it('loads recent gateways from localStorage and can remove them', async () => {
        localStorage.setItem(
            RECENT_KEY,
            JSON.stringify([
                { name: 'Recent GW', rpcUrl: 'https://recent.example/' },
            ])
        )

        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:browser',
                name: 'Browser Wallet',
                type: 'browser',
            }),
        ])

        const titles = walletTitles()
        expect(titles[0]).toBe('Recent GW')
        expect(titles).toContain('Browser Wallet')

        const remove = shadow().querySelector<HTMLButtonElement>(
            '[aria-label="Remove Recent GW"]'
        )
        expect(remove).not.toBeNull()
        remove!.click()

        expect(walletTitles()).not.toContain('Recent GW')
        expect(localStorage.getItem(RECENT_KEY)).toBeNull()
        expect(await settleOrTimeout(pickPromise, 30)).toBe('timeout')

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })

    it('dedupes recent gateways that already exist as remote entries', async () => {
        localStorage.setItem(
            RECENT_KEY,
            JSON.stringify([
                { name: 'Dup Recent', rpcUrl: 'https://gw.example/' },
            ])
        )

        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'remote:https://gw.example/',
                name: 'Registered GW',
                type: 'remote',
                url: 'https://gw.example/',
            }),
        ])

        expect(walletTitles().filter((t) => t === 'Dup Recent')).toHaveLength(0)
        expect(walletTitles()).toContain('Registered GW')
        expect(
            shadow().querySelector('[aria-label="Remove Dup Recent"]')
        ).toBeNull()

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })

    it('renders suggested wallets that are not already detected', async () => {
        localStorage.setItem(
            SUGGESTED_KEY,
            JSON.stringify([
                {
                    providerId: 'ext:already',
                    name: 'Already Installed',
                    installUrls: [
                        {
                            platform: 'chrome',
                            url: 'https://example.com/already',
                        },
                    ],
                },
                {
                    providerId: 'ext:suggested',
                    name: 'Suggested Wallet',
                    installUrls: [
                        {
                            platform: 'chrome',
                            url: 'https://example.com/suggested',
                        },
                    ],
                },
            ])
        )

        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:already',
                name: 'Already Installed',
                type: 'browser',
            }),
        ])

        expect(walletTitles()).toContain('Suggested Wallet')
        expect(
            walletTitles().filter((t) => t === 'Already Installed')
        ).toHaveLength(1)
        expect(
            shadow().querySelector('.wallet-get-badge')?.textContent
        ).toMatch(/^Get/)

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })

    it('survives corrupt recent/suggested localStorage', async () => {
        localStorage.setItem(RECENT_KEY, '{')
        localStorage.setItem(SUGGESTED_KEY, 'not-json')

        const pickPromise = pickWalletModal([
            makeWalletPickerEntry({
                providerId: 'ext:ok',
                name: 'OK',
                type: 'browser',
            }),
        ])

        expect(titleText()).toBe('Connect Wallet')
        expect(walletTitles()).toContain('OK')

        clickClose()
        await expect(pickPromise).rejects.toThrow(
            'User closed the wallet picker'
        )
    })
})
