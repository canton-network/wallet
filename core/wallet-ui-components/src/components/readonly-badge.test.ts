// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { describe, expect, it } from 'vitest'
import './readonly-badge.js'
import type { WgReadonlyBadge } from './readonly-badge.js'

describe('wg-readonly-badge', () => {
    it('explains which config file section defines the entry', async () => {
        const el = await fixture<WgReadonlyBadge>(
            html`<wg-readonly-badge section="networks"></wg-readonly-badge>`
        )

        const badge = el.shadowRoot!.querySelector('.badge')!
        const tooltip = el.shadowRoot!.querySelector('[slot="content"]')!
        expect(badge.textContent).toBe('READ-ONLY')
        expect(badge.getAttribute('aria-describedby')).toBe(tooltip.id)
        expect(tooltip.textContent?.replace(/\s+/g, ' ').trim()).toBe(
            'Comes from the networks section of the config file. Edit it there and restart the Wallet Gateway.'
        )
    })
})
