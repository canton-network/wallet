// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { questionCircleIcon } from '../icons/index.ts'
import { BaseElement } from '../internal/base-element.ts'
import './tooltip.ts'

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

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: inline-flex;
                align-items: center;
                vertical-align: middle;
                background: transparent;
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

            .info-btn svg {
                width: 0.875rem;
                height: 0.875rem;
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
            <wg-tooltip ?interactive=${!!this.docsUrl}>
                <button
                    class="info-btn"
                    type="button"
                    aria-label=${this.label}
                    aria-describedby="info"
                >
                    ${questionCircleIcon}
                </button>
                <span slot="content"
                    ><span id="info">${this.text}</span> ${
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
