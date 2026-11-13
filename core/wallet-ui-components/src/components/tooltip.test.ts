// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import './tooltip.js'
import type { WgTooltip } from './tooltip.js'

function isShown(el: WgTooltip) {
    return el.shadowRoot!.querySelector('.bubble')!.classList.contains('open')
}

describe('wg-tooltip', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('shows the text while the trigger is hovered', async () => {
        const el = await fixture<WgTooltip>(
            html`<wg-tooltip text="Details"><span>Trigger</span></wg-tooltip>`
        )
        expect(isShown(el)).toBe(false)
        expect(
            el.shadowRoot!.querySelector('[role="tooltip"]')!.textContent
        ).toBe('Details')

        await userEvent.hover(el.querySelector('span')!)
        await waitUntil(() => isShown(el))
        // Not hidden by page styles, e.g. Bootstrap's own .tooltip class
        const bubble = el.shadowRoot!.querySelector('[role="tooltip"]')!
        await waitUntil(() => getComputedStyle(bubble).opacity === '1')
        expect(bubble.getBoundingClientRect().width).toBeGreaterThan(0)

        await userEvent.unhover(el.querySelector('span')!)
        await waitUntil(() => !isShown(el))
    })

    it('shows while the trigger has focus and hides on Escape', async () => {
        const el = await fixture<WgTooltip>(
            html`<wg-tooltip text="Details"
                ><button>Trigger</button></wg-tooltip
            >`
        )

        el.querySelector('button')!.focus()
        await el.updateComplete
        expect(isShown(el)).toBe(true)

        el.querySelector('button')!.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        )
        await el.updateComplete
        expect(isShown(el)).toBe(false)
    })
})
