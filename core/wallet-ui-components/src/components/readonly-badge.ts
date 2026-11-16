// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { customElement, property } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { css, html } from 'lit'
import './tooltip.js'

/**
 * A "READ-ONLY" badge for entries that come from the Wallet Gateway config
 * file. Hovering or focusing it explains where the entry is defined.
 */
export
@customElement('wg-readonly-badge')
class WgReadonlyBadge extends BaseElement {
    /** The config file section that defines the entry, e.g. `networks` */
    @property() accessor section = ''

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: inline-flex;
            }

            .badge {
                display: inline-flex;
                align-items: center;
                border-radius: var(--wg-radius-full);
                padding: 0.15rem 0.55rem;
                font-size: var(--wg-font-size-xs);
                font-weight: var(--wg-font-weight-semibold);
                letter-spacing: 0.04em;
                background: var(--wg-badge-bg);
                color: var(--wg-text-secondary);
                cursor: help;
            }

            .badge:focus-visible {
                outline: 2px solid var(--wg-accent);
                outline-offset: 2px;
            }

            code {
                color: inherit;
            }
        `,
    ]

    render() {
        return html`
            <wg-tooltip>
                <span class="badge" tabindex="0" aria-describedby="details"
                    >READ-ONLY</span
                >
                <span slot="content" id="details">
                    Comes from the <code>${this.section}</code> section of the
                    config file. Edit it there and restart the Wallet Gateway.
                </span>
            </wg-tooltip>
        `
    }
}
