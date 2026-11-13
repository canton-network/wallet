// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { customElement, property, query, state } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { css, html } from 'lit'

export type TooltipPlacement = 'top' | 'bottom' | 'bottom-start' | 'left'

const GAP = 6
const VIEWPORT_MARGIN = 8
const HIDE_DELAY_MS = 120

/**
 * Shows a styled tooltip while the trigger is hovered or focused, instead of
 * the browser's delayed native `title` tooltip. The tooltip is shown in the
 * top layer, so containers with `overflow: hidden` don't clip it, and it
 * stays open while the pointer is over it, so it can contain links.
 *
 * Slots:
 *  - default: the trigger, which should be focusable for keyboard users
 *  - `content`: rich tooltip content, used instead of `text`
 */
export
@customElement('wg-tooltip')
class WgTooltip extends BaseElement {
    @property() accessor text = ''
    @property() accessor placement: TooltipPlacement = 'bottom-start'

    @state() private accessor open = false
    @query('.bubble') private accessor bubble!: HTMLElement

    private hideTimer: ReturnType<typeof setTimeout> | undefined

    static styles = [
        BaseElement.styles,
        css`
            :host {
                display: inline-flex;
                min-width: 0;
                max-width: 100%;
                /* Blend into the surrounding text */
                color: inherit;
                font: inherit;
                line-height: inherit;
            }

            .bubble {
                position: fixed;
                inset: auto;
                margin: 0;
                border: none;
                z-index: 1000;
                width: max-content;
                max-width: min(320px, calc(100vw - 16px));
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
                overflow: visible;
                overflow-wrap: anywhere;
            }

            .bubble:not(.open) {
                display: none;
            }

            /* Covers the gap so the pointer can move onto the tooltip */
            .bubble::before {
                content: '';
                position: absolute;
                inset: -${GAP}px;
                z-index: -1;
            }
        `,
    ]

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('mouseenter', this.show)
        this.addEventListener('mouseleave', this.scheduleHide)
        this.addEventListener('focusin', this.show)
        this.addEventListener('focusout', this.scheduleHide)
        this.addEventListener('keydown', this.onKeyDown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        clearTimeout(this.hideTimer)
        window.removeEventListener('scroll', this.hide, { capture: true })
    }

    private show = () => {
        clearTimeout(this.hideTimer)
        this.open = true
        // The position is computed once, so hide instead of drifting on scroll
        window.addEventListener('scroll', this.hide, {
            capture: true,
            once: true,
        })
    }

    private hide = () => {
        clearTimeout(this.hideTimer)
        this.open = false
    }

    private scheduleHide = () => {
        clearTimeout(this.hideTimer)
        this.hideTimer = setTimeout(this.hide, HIDE_DELAY_MS)
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.hide()
        }
    }

    protected updated() {
        const tip = this.bubble
        const supportsPopover = typeof tip.showPopover === 'function'
        if (!this.open) {
            if (supportsPopover && tip.matches(':popover-open')) {
                tip.hidePopover()
            }
            return
        }
        if (supportsPopover && !tip.matches(':popover-open')) {
            tip.showPopover()
        }
        this.position(tip)
    }

    private position(tip: HTMLElement) {
        const anchor = this.getBoundingClientRect()
        const { width, height } = tip.getBoundingClientRect()
        let top: number
        let left: number
        switch (this.placement) {
            case 'top':
                top = anchor.top - height - GAP
                left = anchor.left + (anchor.width - width) / 2
                break
            case 'bottom':
                top = anchor.bottom + GAP
                left = anchor.left + (anchor.width - width) / 2
                break
            case 'left':
                top = anchor.top + (anchor.height - height) / 2
                left = anchor.left - width - GAP
                break
            default:
                top = anchor.bottom + GAP
                left = anchor.left
        }
        const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN
        const maxTop = window.innerHeight - height - VIEWPORT_MARGIN
        tip.style.left = `${Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft))}px`
        tip.style.top = `${Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop))}px`
    }

    render() {
        return html`
            <slot></slot>
            <span
                class="bubble ${this.open ? 'open' : ''}"
                popover="manual"
                role="tooltip"
                @mouseenter=${this.show}
                @mouseleave=${this.scheduleHide}
                ><slot name="content">${this.text}</slot></span
            >
        `
    }
}
