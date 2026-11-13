// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BaseElement } from '../internal/base-element.ts'
import { cardStyles } from '../styles/card.ts'
import './tooltip.ts'

/**
 * A "READ-ONLY" badge for entries that come from the Wallet Gateway config
 * file. Hovering or focusing it explains where the entry is defined.
 */
export
@customElement('wg-readonly-badge')
class WgReadonlyBadge extends BaseElement {
    /** The config file section that defines the entry */
    @property() accessor section: 'networks' | 'idps' = 'networks'

    static styles = [
        BaseElement.styles,
        cardStyles,
        css`
            :host {
                display: inline-flex;
                background: transparent;
            }

            .badge-readonly {
                background: var(--wg-badge-bg);
                color: var(--wg-text-secondary);
            }
        `,
    ]

    render() {
        const details = `Comes from the ${this.section} section of the config file. Edit it there and restart the Wallet Gateway.`
        return html`
            <wg-tooltip .text=${details}>
                <span
                    class="wg-badge badge-readonly"
                    tabindex="0"
                    aria-description=${details}
                    >READ-ONLY</span
                >
            </wg-tooltip>
        `
    }
}
