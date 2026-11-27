// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { infoCircleFillIcon } from '../icons/index.ts'
import { BaseElement } from '../internal/base-element.ts'
import { CANTON_SCOPES, isCantonScope } from '../logic/scopes.ts'

/** Read-only list of Ledger API access token scopes requested by a dApp. Scopes recognized by Canton explain what they allow in a tooltip */
export
@customElement('wg-scope-list')
class WgScopeList extends BaseElement {
    @property({ type: Array }) accessor scopes: string[] = []

    static styles = [
        BaseElement.styles,
        css`
            .info-wrap {
                position: relative;
                display: inline-flex;
                vertical-align: middle;
            }

            .info-icon {
                display: inline-flex;
                padding: 0;
                border: none;
                background: transparent;
                color: var(--wg-text-secondary);
                cursor: pointer;
            }

            .info-icon svg {
                width: 12px;
                height: 12px;
            }

            .info-icon:focus-visible {
                outline: 2px solid var(--wg-accent);
                border-radius: 999px;
            }

            .info-tooltip {
                position: absolute;
                bottom: calc(100% + 6px);
                left: 50%;
                transform: translateX(-50%);
                z-index: 20;
                width: max-content;
                max-width: min(260px, 70vw);
                padding: var(--wg-space-2) var(--wg-space-3);
                border-radius: var(--wg-radius-md);
                background: var(--wg-text);
                color: var(--wg-surface);
                box-shadow: var(--wg-shadow-md);
                font-family: var(--bs-body-font-family);
                font-size: var(--wg-font-size-xs);
                line-height: 1.4;
                white-space: normal;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.12s ease;
            }

            .info-wrap:hover .info-tooltip,
            .info-wrap:focus-within .info-tooltip {
                opacity: 1;
                visibility: visible;
            }
        `,
    ]

    protected render() {
        if (!this.scopes.length) {
            return nothing
        }
        return html`
            <ul class="mb-0 font-monospace small text-break">
                ${this.scopes.map(
                    (scope, index) =>
                        html`<li>
                            <span class="scope">${scope}</span
                            >${this.renderInfo(scope, index)}
                        </li>`
                )}
            </ul>
        `
    }

    private renderInfo(scope: string, index: number) {
        if (!isCantonScope(scope)) {
            return nothing
        }
        const tooltipId = `scope-info-${index}`
        return html` <span class="info-wrap">
            <button
                class="info-icon"
                type="button"
                aria-label="About ${scope}"
                aria-describedby=${tooltipId}
            >
                ${infoCircleFillIcon}
            </button>
            <span id=${tooltipId} class="info-tooltip" role="tooltip"
                >${CANTON_SCOPES[scope]}</span
            >
        </span>`
    }
}
