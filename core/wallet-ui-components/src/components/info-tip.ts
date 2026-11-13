// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { customElement, property } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { css, html } from 'lit'
import type { TooltipPlacement } from './tooltip.js'
import './tooltip.js'

const infoIcon = html`<svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="16" y2="12" />
    <line x1="12" x2="12.01" y1="8" y2="8" />
</svg>`

/**
 * An info icon that explains something on hover or focus, optionally with a
 * link to the docs for details.
 */
export
@customElement('wg-info-tip')
class WgInfoTip extends BaseElement {
    @property() accessor text = ''
    @property() accessor docsUrl = ''
    /** Accessible name of the icon button */
    @property() accessor label = 'More information'
    @property() accessor placement: TooltipPlacement = 'bottom-start'

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: inline-flex;
                align-items: center;
                vertical-align: middle;
            }

            .info-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.25rem;
                border: none;
                border-radius: var(--wg-radius-full);
                background: transparent;
                color: var(--wg-text-secondary);
            }

            /* As specific as Bootstrap's [type=button]:not(:disabled) pointer, so it
               wins. Clicking only shows the tooltip, like hovering does */
            .info-btn:not(:disabled) {
                cursor: help;
            }

            .info-btn:hover {
                color: var(--wg-text);
            }

            .info-btn:focus-visible {
                outline: 2px solid var(--wg-accent);
            }

            a {
                color: inherit;
                text-decoration: underline;
                white-space: nowrap;
            }
        `,
    ]

    render() {
        return html`
            <wg-tooltip placement=${this.placement}>
                <button
                    class="info-btn"
                    type="button"
                    aria-label=${this.label}
                    aria-describedby="info"
                >
                    ${infoIcon}
                </button>
                <span slot="content" id="info"
                    >${this.text}
                    ${
                        this.docsUrl
                            ? html`<a
                                  href=${this.docsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Learn more in the docs</a
                              >`
                            : ''
                    }</span
                >
            </wg-tooltip>
        `
    }
}
