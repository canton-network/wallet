// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { formatDateTime, formatUtcDateTime } from '../date-time.ts'
import { BaseElement } from '../internal/base-element.ts'
import './tooltip.ts'

/**
 * A timestamp in the viewer's time zone that shows the exact time in UTC in
 * a tooltip.
 */
export
@customElement('wg-timestamp')
class WgTimestamp extends BaseElement {
    @property({ attribute: false }) accessor value:
        | string
        | number
        | Date
        | null
        | undefined = undefined

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: inline;
                /* Blend into the surrounding text */
                background: transparent;
                color: inherit;
                font: inherit;
                line-height: inherit;
            }
        `,
    ]

    render() {
        const formatted = formatDateTime(this.value)
        const utc = formatUtcDateTime(this.value)
        return utc
            ? html`<wg-tooltip .text=${utc}
                  ><span tabindex="0">${formatted}</span></wg-tooltip
              >`
            : formatted
    }
}
