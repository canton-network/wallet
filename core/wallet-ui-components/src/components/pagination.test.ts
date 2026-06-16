// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, elementUpdated } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './pagination.js'
import { PageChangeEvent, WgPagination } from './pagination.js'

describe('wg-pagination', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('shows 0-0 range when total is zero', async () => {
        const el = await fixture<WgPagination>(
            html`<wg-pagination
                .total=${0}
                .pageSize=${5}
                .page=${1}
            ></wg-pagination>`
        )

        expect(el.shadowRoot?.textContent).toContain('0-0 of 0')
    })

    it('sets page value to last one when prop page exceeds actual pages', async () => {
        const el = await fixture<WgPagination>(
            html`<wg-pagination
                .total=${10}
                .pageSize=${5}
                .page=${99}
            ></wg-pagination>`
        )

        expect(el.page).toBe(2)
    })

    it('emits PageChangeEvent when navigating to the next page', async () => {
        const el = await fixture<WgPagination>(
            html`<wg-pagination
                .total=${12}
                .pageSize=${5}
                .page=${1}
            ></wg-pagination>`
        )

        const listener = vi.fn()
        el.addEventListener('page-change', listener)

        const buttons = el.shadowRoot!.querySelectorAll('.page-btn')
        ;(buttons[1] as HTMLButtonElement).click() // 0 - prev, 1 - next
        await elementUpdated(el)

        expect(el.page).toBe(2)
        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(PageChangeEvent)
        expect((listener.mock.calls[0][0] as PageChangeEvent).page).toBe(2)
    })

    it('does not emit when already on the last page', async () => {
        const el = await fixture<WgPagination>(
            html`<wg-pagination
                .total=${5}
                .pageSize=${5}
                .page=${1}
            ></wg-pagination>`
        )

        const listener = vi.fn()
        el.addEventListener('page-change', listener)

        const buttons = el.shadowRoot!.querySelectorAll('.page-btn')
        ;(buttons[1] as HTMLButtonElement).click()

        expect(listener).not.toHaveBeenCalled()
    })

    it('disables the previous button on the first page', async () => {
        const el = await fixture<WgPagination>(
            html`<wg-pagination
                .total=${10}
                .pageSize=${5}
                .page=${1}
            ></wg-pagination>`
        )

        const buttons = el.shadowRoot!.querySelectorAll('.page-btn')
        expect((buttons[0] as HTMLButtonElement).disabled).toBe(true)
        expect((buttons[1] as HTMLButtonElement).disabled).toBe(false)
    })
})
