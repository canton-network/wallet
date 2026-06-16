// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    ErrorPageBackEvent,
    ErrorPageRefreshEvent,
    WgErrorPage,
} from './error-page.js'

describe('wg-error-page', () => {
    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    it('mounts without error', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page></wg-error-page>`
        )

        expect(el).toBeInstanceOf(WgErrorPage)
    })

    it('renders the default title and message', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page></wg-error-page>`
        )

        expect(el.shadowRoot?.textContent).toContain('Something went wrong')
        expect(el.shadowRoot?.textContent).toContain(
            'An unexpected error occurred while loading this page.'
        )
    })

    it('renders custom title and message', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page
                title="Load failed"
                message="Could not fetch wallets."
            ></wg-error-page>`
        )

        expect(el.shadowRoot?.textContent).toContain('Load failed')
        expect(el.shadowRoot?.textContent).toContain('Could not fetch wallets.')
    })

    it('shows a back button in back mode', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page mode="back"></wg-error-page>`
        )

        expect(
            el.shadowRoot?.querySelector('.action-btn')?.textContent?.trim()
        ).toBe('Back')
    })

    it('shows a refresh button in refresh mode', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page mode="refresh"></wg-error-page>`
        )

        expect(
            el.shadowRoot?.querySelector('.action-btn')?.textContent?.trim()
        ).toBe('Refresh')
    })

    it('emits ErrorPageBackEvent when the back button is clicked', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page .performDefaultAction=${false}></wg-error-page>`
        )
        const listener = vi.fn()
        el.addEventListener('error-back', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>('.action-btn')!.click()

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(ErrorPageBackEvent)
    })

    it('emits ErrorPageRefreshEvent when the refresh button is clicked', async () => {
        const el = await fixture<WgErrorPage>(
            html`<wg-error-page
                mode="refresh"
                .performDefaultAction=${false}
            ></wg-error-page>`
        )
        const listener = vi.fn()
        el.addEventListener('error-refresh', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>('.action-btn')!.click()

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(ErrorPageRefreshEvent)
    })
})
