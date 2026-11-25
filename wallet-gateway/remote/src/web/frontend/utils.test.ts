// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import '@canton-network/core-wallet-ui-components'

import { fetchDappApiUrl, showChangeToast, showToast } from './utils.ts'

describe('showToast', () => {
    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
    })

    it('appends a toast element to the document body', () => {
        showToast('Title', 'Message body', 'success')

        const toast = document.body.querySelector('custom-toast')
        expect(toast).not.toBeNull()
        expect((toast as HTMLElement & { title: string }).title).toBe('Title')
        expect((toast as HTMLElement & { message: string }).message).toBe(
            'Message body'
        )
        expect((toast as HTMLElement & { type: string }).type).toBe('success')
    })
})

describe('showChangeToast', () => {
    const toasts = {
        added: { title: 'Added', message: 'It was added.', type: 'success' },
        saved: { title: 'Saved', message: 'It was saved.', type: 'success' },
        deleted: {
            title: 'Deleted',
            message: 'It was deleted.',
            type: 'success',
        },
    } as const

    afterEach(() => {
        document.body.innerHTML = ''
        history.replaceState({}, '', '/')
    })

    it('shows the toast for the status and removes it from the URL', () => {
        history.replaceState({}, '', '/networks/?status=saved&page=2')

        showChangeToast(toasts)

        const toast = document.body.querySelector('custom-toast') as
            | (HTMLElement & { title: string })
            | null
        expect(toast?.title).toBe('Saved')
        // A reload doesn't show it again, other parameters stay
        expect(window.location.search).toBe('?page=2')
    })

    it('ignores an unknown status', () => {
        history.replaceState({}, '', '/networks/?status=unknown')

        showChangeToast(toasts)

        expect(document.body.querySelector('custom-toast')).toBeNull()
    })
})

describe('fetchDappApiUrl', () => {
    const originalFetch = globalThis.fetch

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    it('returns dappApiUrl from the well-known gateway config', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    userPath: 'http://localhost:3030/api/v0/user',
                    dappApiUrl: 'http://localhost:3030/api/v0/dapp',
                }),
                { status: 200 }
            )
        )

        await expect(fetchDappApiUrl()).resolves.toBe(
            'http://localhost:3030/api/v0/dapp'
        )
    })

    it('falls back to the default dapp path when config fetch fails', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error'))

        await expect(fetchDappApiUrl()).resolves.toBe(
            `${window.location.origin}/api/v0/dapp`
        )
    })
})
