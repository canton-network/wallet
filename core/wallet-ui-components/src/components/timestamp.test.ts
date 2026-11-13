// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { describe, expect, it } from 'vitest'
import { formatDateTime } from '../date-time.js'
import './timestamp.js'
import type { WgTimestamp } from './timestamp.js'
import type { WgTooltip } from './tooltip.js'

describe('wg-timestamp', () => {
    it('shows the local time with the UTC time in a tooltip', async () => {
        const value = '2025-06-01T12:34:56Z'
        const el = await fixture<WgTimestamp>(
            html`<wg-timestamp .value=${value}></wg-timestamp>`
        )

        const tooltip = el.shadowRoot!.querySelector<WgTooltip>('wg-tooltip')!
        expect(tooltip.text).toBe('2025-06-01 12:34:56 UTC')
        expect(tooltip.textContent).toBe(formatDateTime(value))
    })

    it('shows N/A without a tooltip for a missing value', async () => {
        const el = await fixture<WgTimestamp>(
            html`<wg-timestamp .value=${null}></wg-timestamp>`
        )

        expect(el.shadowRoot!.querySelector('wg-tooltip')).toBeNull()
        expect(el.shadowRoot!.textContent).toContain('N/A')
    })
})
