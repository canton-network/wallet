// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, elementUpdated } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './custom-toast.js'
import { Toast } from './custom-toast'
describe('custom-toast', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        document.body.innerHTML = ''
    })

    it('auto-dismisses after the configured delay', async () => {
        const remove = vi.fn()
        const el = (await fixture(
            html`<custom-toast title="Title" message="Body"></custom-toast>`
        )) as Toast
        el.remove = remove

        vi.advanceTimersByTime(5000)
        await elementUpdated(el)
        expect(el.closing).toBe(true)

        vi.advanceTimersByTime(250)
        expect(remove).toHaveBeenCalled()
    })

    it('dismisses when the close button is clicked', async () => {
        const remove = vi.fn()
        const el = (await fixture(html`<custom-toast></custom-toast>`)) as Toast
        el.remove = remove

        el.shadowRoot!.querySelector<HTMLButtonElement>(
            '.toast-close-btn'
        )!.click()
        await elementUpdated(el)
        expect(el.closing).toBe(true)

        vi.advanceTimersByTime(250)
        expect(remove).toHaveBeenCalled()
    })

    it('uses assertive aria-live for error toasts', async () => {
        const el = await fixture(
            html`<custom-toast type="error"></custom-toast>`
        )

        const wrapper =
            el.shadowRoot!.querySelector<HTMLElement>('.toast-wrapper')!
        expect(wrapper.getAttribute('role')).toBe('alert')
        expect(wrapper.getAttribute('aria-live')).toBe('assertive')
    })
})
