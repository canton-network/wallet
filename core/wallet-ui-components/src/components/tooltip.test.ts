// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import './tooltip.ts'
import type { WgTooltip } from './tooltip.ts'

function isShown(el: WgTooltip) {
    return el.shadowRoot!.querySelector('.bubble')!.matches(':popover-open')
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

        await userEvent.hover(el.querySelector('span')!)
        await waitUntil(() => isShown(el))
        // Not hidden by page styles, e.g. Bootstrap's own .tooltip class
        const bubble = el.shadowRoot!.querySelector('[role="tooltip"]')!
        await waitUntil(() => getComputedStyle(bubble).opacity === '1')
        expect(bubble.getBoundingClientRect().width).toBeGreaterThan(0)
        expect(bubble.textContent).toBe('Details')

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

    it('keeps only one tooltip open at a time', async () => {
        const el = await fixture<HTMLElement>(
            html`<div>
                <wg-tooltip text="First"><button>One</button></wg-tooltip>
                <wg-tooltip text="Second"><button>Two</button></wg-tooltip>
            </div>`
        )
        const [first, second] = Array.from(
            el.querySelectorAll<WgTooltip>('wg-tooltip')
        )

        first.querySelector('button')!.focus()
        await waitUntil(() => isShown(first))
        // e.g. hovering another tooltip while the first one has focus
        second.dispatchEvent(new FocusEvent('focusin'))
        await waitUntil(() => isShown(second))

        expect(isShown(first)).toBe(false)
    })

    it('opens on a click, for touch without hover, and closes on a click elsewhere', async () => {
        const el = await fixture<HTMLElement>(
            html`<div>
                <wg-tooltip text="Details"><span>Trigger</span></wg-tooltip>
                <p>Elsewhere</p>
            </div>`
        )
        const tooltip = el.querySelector<WgTooltip>('wg-tooltip')!

        tooltip.querySelector('span')!.click()
        expect(isShown(tooltip)).toBe(true)

        el.querySelector('p')!.dispatchEvent(
            new PointerEvent('pointerdown', { bubbles: true, composed: true })
        )
        expect(isShown(tooltip)).toBe(false)
    })

    it('drops the tooltip role for interactive content', async () => {
        const el = await fixture<WgTooltip>(
            html`<wg-tooltip interactive
                ><span>Trigger</span
                ><a slot="content" href="#">Link</a></wg-tooltip
            >`
        )

        expect(el.shadowRoot!.querySelector('[role="tooltip"]')).toBeNull()
        expect(el.shadowRoot!.querySelector('[role="group"]')).not.toBeNull()
    })

    it('with truncate, shows only when the content is cut off', async () => {
        const el = await fixture<WgTooltip>(
            html`<div style="width: 80px">
                <wg-tooltip truncate text="Full value"
                    ><span>Short</span></wg-tooltip
                >
                <wg-tooltip truncate text="Full value"
                    ><span>A value that doesn't fit</span></wg-tooltip
                >
            </div>`
        )
        const [fits, cutOff] = el.querySelectorAll<WgTooltip>('wg-tooltip')

        await userEvent.hover(fits!.querySelector('span')!)
        // Longer than the show delay
        await new Promise((resolve) => setTimeout(resolve, 300))
        expect(isShown(fits!)).toBe(false)

        await userEvent.hover(cutOff!.querySelector('span')!)
        await waitUntil(() => isShown(cutOff!))
    })
})
