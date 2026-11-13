// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

import { BaseElement } from '../internal/base-element.ts'

export type TooltipPlacement = 'bottom' | 'bottom-start' | 'left'

const GAP = 6
// Sweeping the pointer across a list shouldn't flash every tooltip on the way
const SHOW_DELAY_MS = 150
// Long enough to move the pointer from the trigger onto the tooltip
const HIDE_DELAY_MS = 150

/** Hides the tooltip that is open, so only one is open at a time */
let hideOpenTooltip: (() => void) | undefined

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
 *
 * Only one tooltip is open at a time. Touch has no hover, so a tap opens it
 * and a tap elsewhere closes it.
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
    /** Set when the content has links, which a `tooltip` role can't contain */
    @property({ type: Boolean }) accessor interactive = false
    /** Cuts the content off with an ellipsis, and shows `text` only when it's cut off */
    @property({ type: Boolean, reflect: true }) accessor truncate = false

    /** Renders `text` only while open, so the page holds each value once */
    @state() private accessor open = false

    @query('.anchor') private accessor anchor!: HTMLElement
    @query('.bubble') private accessor bubble!: HTMLElement

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
                background: transparent;
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

            :host([truncate]) .anchor {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .bubble {
                position: fixed;
                inset: auto;
                margin: ${GAP}px 0 0;
                position-anchor: --wg-tooltip-trigger;
                position-area: block-end span-inline-end;
                position-try-fallbacks: flip-block, flip-inline;
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

            /* Covers the gap so the pointer can move onto the tooltip */
            .bubble::before {
                content: '';
                position: absolute;
                inset: -${GAP}px;
                z-index: -1;
            }

            :host([placement='bottom']) .bubble {
                position-area: block-end;
            }

            :host([placement='left']) .bubble {
                margin: 0 ${GAP}px 0 0;
                position-area: inline-start;
                position-try-fallbacks: flip-inline;
            }
        `,
    ]

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('pointerenter', this.onPointerEnter)
        this.addEventListener('pointerleave', this.scheduleHide)
        this.addEventListener('focusin', this.show)
        this.addEventListener('click', this.show)
        this.addEventListener('focusout', this.scheduleHide)
        this.addEventListener('keydown', this.onKeyDown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.hide()
    }

    private get hasHiddenContent() {
        return (
            !this.truncate || this.anchor.scrollWidth > this.anchor.clientWidth
        )
    }

    private get isOpen() {
        return this.bubble?.matches(':popover-open') ?? false
    }

    private onPointerEnter = (e: PointerEvent) => {
        clearTimeout(this.hideTimer)
        // Touch has no hover; the tap's click opens it instead
        if (e.pointerType === 'touch' || this.isOpen) return
        clearTimeout(this.showTimer)
        this.showTimer = setTimeout(this.show, SHOW_DELAY_MS)
    }

    private show = () => {
        clearTimeout(this.showTimer)
        clearTimeout(this.hideTimer)
        const bubble = this.bubble
        if (!bubble || this.isOpen || !this.hasHiddenContent) return
        if (hideOpenTooltip !== this.hide) hideOpenTooltip?.()
        hideOpenTooltip = this.hide
        document.addEventListener('pointerdown', this.onOutsidePointerDown, {
            capture: true,
        })
        this.open = true
        bubble.showPopover()
    }

    private hide = () => {
        clearTimeout(this.showTimer)
        clearTimeout(this.hideTimer)
        const bubble = this.bubble
        if (hideOpenTooltip === this.hide) hideOpenTooltip = undefined
        if (!bubble) return
        document.removeEventListener('pointerdown', this.onOutsidePointerDown, {
            capture: true,
        })
        if (this.isOpen) bubble.hidePopover()
        this.open = false
    }

    private scheduleHide = () => {
        clearTimeout(this.showTimer)
        clearTimeout(this.hideTimer)
        this.hideTimer = setTimeout(this.hide, HIDE_DELAY_MS)
    }

    private onOutsidePointerDown = (e: PointerEvent) => {
        if (!e.composedPath().includes(this)) this.hide()
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.hide()
        }
    }

    render() {
        return html`
            <span class="anchor"><slot></slot></span>
            <span
                class="bubble"
                popover="manual"
                role=${this.interactive ? 'group' : 'tooltip'}
                @pointerenter=${() => clearTimeout(this.hideTimer)}
                @pointerleave=${this.scheduleHide}
                ><slot name="content"
                    >${this.open ? this.text : nothing}</slot
                ></span
            >
        `
    }
}
