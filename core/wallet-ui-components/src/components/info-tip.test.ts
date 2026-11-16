// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { describe, expect, it } from 'vitest'
import './info-tip.js'
import type { WgInfoTip } from './info-tip.js'

function getContent(el: WgInfoTip) {
    return el.shadowRoot!.querySelector('[slot="content"]')!
}

describe('wg-info-tip', () => {
    it('describes the icon button with the text and a docs link', async () => {
        const el = await fixture<WgInfoTip>(
            html`<wg-info-tip
                text="What this is."
                docsUrl="https://docs.example.com/page"
            ></wg-info-tip>`
        )

        const button = el.shadowRoot!.querySelector('button')!
        const content = getContent(el)
        expect(button.getAttribute('aria-label')).toBe('More information')
        expect(button.getAttribute('aria-describedby')).toBe(content.id)
        expect(content.textContent?.replace(/\s+/g, ' ').trim()).toBe(
            'What this is. Learn more in the docs'
        )
        expect(content.querySelector('a')?.href).toBe(
            'https://docs.example.com/page'
        )
    })

    it('leaves out the docs link without a docs URL', async () => {
        const el = await fixture<WgInfoTip>(
            html`<wg-info-tip text="What this is."></wg-info-tip>`
        )

        expect(getContent(el).querySelector('a')).toBeNull()
    })
})
