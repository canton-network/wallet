// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { elementUpdated, fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './custom-toast.js'
import './wallets-sync.js'
import { WgWalletsSync } from './wallets-sync.js'

const { mockRequest, handleErrorToast } = vi.hoisted(() => ({
    mockRequest: vi.fn(),
    handleErrorToast: vi.fn(),
}))

vi.mock('../handle-errors.js', () => ({
    handleErrorToast,
}))

function createMockClient() {
    return { request: mockRequest }
}

function getSyncButton(el: WgWalletsSync) {
    return el.shadowRoot!.querySelector<HTMLButtonElement>('.sync-button')!
}

type ToastElement = HTMLElement & {
    title: string
    message: string
    type: string
}

describe('wg-wallets-sync', () => {
    beforeEach(() => {
        mockRequest.mockReset()
        handleErrorToast.mockReset()
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    it('mounts without error', async () => {
        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync></wg-wallets-sync>`
        )

        expect(el).toBeInstanceOf(WgWalletsSync)
    })

    it('disables the sync button when no client is provided', async () => {
        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync></wg-wallets-sync>`
        )

        expect(getSyncButton(el).disabled).toBe(true)
    })

    it('marks the button as out-of-sync when wallet sync is needed', async () => {
        mockRequest.mockResolvedValue({ walletSyncNeeded: true })

        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync
                .client=${createMockClient()}
            ></wg-wallets-sync>`
        )

        await waitUntil(() =>
            getSyncButton(el).classList.contains('out-of-sync')
        )

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'isWalletSyncNeeded',
        })
        expect(getSyncButton(el).getAttribute('title')).toBe(
            'Refresh parties (changes available)'
        )
    })

    it('does not mark the button as out-of-sync when wallets are up to date', async () => {
        mockRequest.mockResolvedValue({ walletSyncNeeded: false })

        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync
                .client=${createMockClient()}
            ></wg-wallets-sync>`
        )

        await waitUntil(() => mockRequest.mock.calls.length > 0)
        await elementUpdated(el)

        expect(getSyncButton(el).classList.contains('out-of-sync')).toBe(false)
        expect(getSyncButton(el).getAttribute('title')).toBe('Refresh parties')
    })

    it('marks the button as out-of-sync when the sync check fails', async () => {
        mockRequest.mockRejectedValue(new Error('check failed'))

        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync
                .client=${createMockClient()}
            ></wg-wallets-sync>`
        )

        await waitUntil(() =>
            getSyncButton(el).classList.contains('out-of-sync')
        )

        expect(getSyncButton(el).getAttribute('title')).toBe(
            'Refresh parties (changes available)'
        )
    })

    it('syncs wallets, shows a success toast, and emits sync-success', async () => {
        mockRequest
            .mockResolvedValueOnce({ walletSyncNeeded: true })
            .mockResolvedValueOnce({
                added: [{ partyId: 'alice::ns' }],
                updated: [{ partyId: 'bob::ns' }],
                disabled: [{ partyId: 'carol::ns' }],
            })
            .mockResolvedValueOnce({ walletSyncNeeded: false })

        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync
                .client=${createMockClient()}
            ></wg-wallets-sync>`
        )
        await waitUntil(() =>
            getSyncButton(el).classList.contains('out-of-sync')
        )

        const listener = vi.fn()
        el.addEventListener('sync-success', listener)

        getSyncButton(el).click()
        await waitUntil(() => listener.mock.calls.length === 1)

        expect(mockRequest).toHaveBeenCalledWith({ method: 'syncWallets' })

        const toast = document.body.querySelector(
            'custom-toast'
        ) as ToastElement
        expect(toast).not.toBeNull()
        expect(toast.title).toBe('Wallet Sync Complete')
        expect(toast.message).toBe('Added: 1, Updated: 1, Disabled: 1.')
        expect(toast.type).toBe('success')
        expect(listener).toHaveBeenCalledOnce()
        expect(getSyncButton(el).classList.contains('out-of-sync')).toBe(false)
    })

    it('shows error toast when sync fails', async () => {
        mockRequest
            .mockResolvedValueOnce({ walletSyncNeeded: true })
            .mockRejectedValueOnce(new Error('sync failed'))

        const el = await fixture<WgWalletsSync>(
            html`<wg-wallets-sync
                .client=${createMockClient()}
            ></wg-wallets-sync>`
        )
        await waitUntil(() =>
            getSyncButton(el).classList.contains('out-of-sync')
        )

        getSyncButton(el).click()
        await waitUntil(() => handleErrorToast.mock.calls.length === 1)

        expect(handleErrorToast).toHaveBeenCalledWith(expect.any(Error))
    })
})
