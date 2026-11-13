// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { customElement, property } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { css, html } from 'lit'

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
                position: relative;
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

            .tooltip {
                position: absolute;
                top: calc(100% + 6px);
                left: 0;
                z-index: 20;
                width: max-content;
                max-width: min(320px, 80vw);
                padding: 8px 10px;
                border-radius: 10px;
                background: var(--wg-primary);
                color: var(--wg-primary-text);
                box-shadow: 0 10px 24px rgba(var(--wg-shade-rgb), 0.22);
                font-size: var(--wg-font-size-xs);
                font-weight: 500;
                line-height: 1.4;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.12s ease;
            }

            :host(:hover) .tooltip,
            .badge:focus-visible + .tooltip {
                opacity: 1;
                visibility: visible;
            }

            code {
                color: inherit;
            }
        `,
    ]

    render() {
        return html`
            <span class="badge" tabindex="0" aria-describedby="tooltip"
                >READ-ONLY</span
            >
            <span class="tooltip" id="tooltip" role="tooltip">
                Defined in the <code>${this.section}</code> section of the
                Wallet Gateway config file. To change it, edit the config file
                and restart the Wallet Gateway.
            </span>
        `
    }
}
