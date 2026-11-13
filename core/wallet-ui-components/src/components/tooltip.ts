// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { customElement, property, query } from 'lit/decorators.js'
import { BaseElement } from '../internal/base-element'
import { css, html } from 'lit'

export type TooltipPlacement = 'top' | 'bottom' | 'bottom-start' | 'left'

const GAP = 6
const VIEWPORT_MARGIN = 8
// Sweeping the pointer across a list shouldn't flash every tooltip on the way
const SHOW_DELAY_MS = 150
// Long enough to move the pointer from the trigger onto the tooltip
const HIDE_DELAY_MS = 150

/** Hides the tooltip that is open, so only one is open at a time */
let hideOpenTooltip: (() => void) | undefined

const supportsAnchorPositioning = () =>
    typeof CSS !== 'undefined' && CSS.supports('anchor-name: --a')

/**
 * Shows a styled tooltip while the trigger is hovered or focused, instead of
 * the browser's delayed native `title` tooltip. It stays open while the
 * pointer is over it, so it can contain links.
 *
 * It uses the platform where it can:
 *  - The Popover API shows it in the top layer, so `overflow: hidden`
 *    containers don't clip it. It's a manual popover, because the light
 *    dismiss of `hint` popovers closes a tooltip that a tap just opened.
 *  - CSS anchor positioning keeps it attached to the trigger while the page
 *    scrolls or resizes, and flips it when it would leave the viewport.
 *    Browsers without it get a position computed once on open.
 *
 * Only one tooltip is open at a time.
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

    @query('.bubble') private accessor bubble!: HTMLElement
    @query('.anchor') private accessor anchor!: HTMLElement

    private showTimer: ReturnType<typeof setTimeout> | undefined
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

            .anchor {
                display: inline-flex;
                align-items: center;
                min-width: 0;
                max-width: 100%;
                /* Tree-scoped, so every tooltip only sees its own trigger */
                anchor-name: --wg-tooltip-trigger;
            }

            .bubble {
                position: fixed;
                inset: auto;
                margin: 0;
                border: none;
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

            /* Without the Popover API, show and hide it by hand */
            .bubble:not(:popover-open):not(.open) {
                display: none;
            }

            /* Covers the gap so the pointer can move onto the tooltip */
            .bubble::before {
                content: '';
                position: absolute;
                inset: -${GAP}px;
                z-index: -1;
            }

            @supports (anchor-name: --a) {
                .bubble {
                    position-anchor: --wg-tooltip-trigger;
                    position-try-fallbacks: flip-block, flip-inline;
                    margin-top: ${GAP}px;
                    position-area: block-end span-inline-end;
                }

                :host([placement='bottom']) .bubble {
                    position-area: block-end;
                }

                :host([placement='top']) .bubble {
                    margin: 0 0 ${GAP}px;
                    position-area: block-start;
                }

                :host([placement='left']) .bubble {
                    margin: 0 ${GAP}px 0 0;
                    position-area: inline-start;
                    position-try-fallbacks: flip-inline;
                }
            }
        `,
    ]

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('pointerenter', this.onPointerEnter)
        this.addEventListener('pointerleave', this.scheduleHide)
        this.addEventListener('focusin', this.show)
        this.addEventListener('focusout', this.scheduleHide)
        this.addEventListener('keydown', this.onKeyDown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.hide()
    }

    private get isOpen() {
        return this.bubble?.classList.contains('open') ?? false
    }

    private onPointerEnter = (e: PointerEvent) => {
        clearTimeout(this.hideTimer)
        // Touch has no hover; a tap focuses the trigger instead
        if (e.pointerType === 'touch' || this.isOpen) return
        clearTimeout(this.showTimer)
        this.showTimer = setTimeout(this.show, SHOW_DELAY_MS)
    }

    private show = () => {
        clearTimeout(this.showTimer)
        clearTimeout(this.hideTimer)
        const bubble = this.bubble
        if (!bubble || this.isOpen) return
        if (hideOpenTooltip !== this.hide) hideOpenTooltip?.()
        hideOpenTooltip = this.hide
        bubble.classList.add('open')
        if (typeof bubble.showPopover === 'function') {
            bubble.showPopover()
        }
        if (!supportsAnchorPositioning()) {
            this.positionOnce(bubble)
            // The position is computed once, so hide instead of drifting
            window.addEventListener('scroll', this.hide, {
                capture: true,
                once: true,
            })
        }
    }

    private hide = () => {
        clearTimeout(this.showTimer)
        clearTimeout(this.hideTimer)
        const bubble = this.bubble
        if (hideOpenTooltip === this.hide) hideOpenTooltip = undefined
        if (!bubble) return
        bubble.classList.remove('open')
        if (bubble.matches(':popover-open')) {
            bubble.hidePopover()
        }
        window.removeEventListener('scroll', this.hide, { capture: true })
    }

    private scheduleHide = () => {
        clearTimeout(this.showTimer)
        clearTimeout(this.hideTimer)
        this.hideTimer = setTimeout(this.hide, HIDE_DELAY_MS)
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.hide()
        }
    }

    private positionOnce(bubble: HTMLElement) {
        const anchor = this.anchor.getBoundingClientRect()
        const { width, height } = bubble.getBoundingClientRect()
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
        bubble.style.left = `${Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft))}px`
        bubble.style.top = `${Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop))}px`
    }

    render() {
        return html`
            <span class="anchor"><slot></slot></span>
            <span
                class="bubble"
                popover="manual"
                role="tooltip"
                @pointerenter=${() => clearTimeout(this.hideTimer)}
                @pointerleave=${this.scheduleHide}
                ><slot name="content">${this.text}</slot></span
            >
        `
    }
}
