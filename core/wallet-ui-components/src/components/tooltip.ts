// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { customElement, property } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { css, html } from 'lit'

export type TooltipPlacement = 'top' | 'bottom' | 'bottom-start' | 'left'

/**
 * Shows a styled tooltip while the trigger is hovered or focused, instead of
 * the browser's delayed native `title` tooltip. The tooltip stays open while
 * the pointer is over it, so it can contain links.
 *
 * Slots:
 *  - default: the trigger, which should be focusable for keyboard users
 *  - `content`: rich tooltip content, used instead of `text`
 */
export
@customElement('wg-tooltip')
class WgTooltip extends BaseElement {
    @property() accessor text = ''
    @property({ reflect: true }) accessor placement: TooltipPlacement =
        'bottom-start'

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: inline-flex;
                position: relative;
                min-width: 0;
                --wg-tooltip-gap: 6px;
            }

            .tooltip {
                position: absolute;
                z-index: 30;
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
                letter-spacing: normal;
                text-align: left;
                text-transform: none;
                white-space: normal;
                overflow-wrap: anywhere;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition:
                    opacity 0.12s ease,
                    visibility 0.12s;
            }

            /* Covers the gap so the pointer can move onto the tooltip */
            .tooltip::before {
                content: '';
                position: absolute;
                inset: calc(-1 * var(--wg-tooltip-gap));
                z-index: -1;
            }

            :host(:hover) .tooltip,
            :host(:focus-within) .tooltip {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }

            :host([placement='bottom-start']) .tooltip {
                top: calc(100% + var(--wg-tooltip-gap));
                left: 0;
            }

            :host([placement='bottom']) .tooltip {
                top: calc(100% + var(--wg-tooltip-gap));
                left: 50%;
                transform: translateX(-50%);
            }

            :host([placement='top']) .tooltip {
                bottom: calc(100% + var(--wg-tooltip-gap));
                left: 50%;
                transform: translateX(-50%);
            }

            :host([placement='left']) .tooltip {
                top: 50%;
                right: calc(100% + var(--wg-tooltip-gap));
                transform: translateY(-50%);
            }

            ::slotted(a),
            .tooltip a {
                color: inherit;
                text-decoration: underline;
            }
        `,
    ]

    render() {
        return html`
            <slot></slot>
            <span class="tooltip" id="tooltip" role="tooltip"
                ><slot name="content">${this.text}</slot></span
            >
        `
    }
}
