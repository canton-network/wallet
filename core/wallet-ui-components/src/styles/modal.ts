// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'

// TODO: maybe turn this into a proper LitElement / web component
export const modalStyles = css`
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal-content {
        background: var(--wg-surface);
        padding: var(--wg-space-8);
        border-radius: var(--wg-radius-xl);
        min-width: 300px;
        max-width: 95vw;
        max-height: 75vh;
        overflow-y: scroll;
        box-shadow: var(--wg-shadow-lg);
        color: var(--wg-text);
        border: 1px solid var(--wg-border);
    }
    @media (max-width: 600px) {
        .modal-content {
            padding: var(--wg-space-4);
            min-width: unset;
        }
    }
    @media (max-width: 400px) {
        .modal-content {
            padding: var(--wg-space-2);
        }
    }
`

const LIGHT_TOKENS = `
    --accent: #111111;
    --accent-hover: #000000;
    --accent-contrast: #ffffff;
    --accent-soft: rgba(17, 17, 17, 0.06);
    --border: #ececf3;
    --border-hover: #d3d3e0;
    --surface: #ffffff;
    --surface-2: #f4f4f7;
    --surface-hover: #ebebf0;
    --text: #373737;
    --text-muted: #6b7280;
    --icon-muted: #999999;
    --scrollbar: #d4d4dc;
    --success: #4e9e73;
    --success-soft: rgba(78, 158, 115, 0.14);
    --danger: #dc2626;
    --danger-text: #b91c1c;
    --danger-soft: rgba(220, 38, 38, 0.08);
    --danger-soft-hover: rgba(220, 38, 38, 0.1);
    --backdrop: rgba(71, 88, 107, 0.24);
    --fade-shadow: rgba(15, 23, 42, 0.18);
    --shadow-modal:
        0 12px 32px -18px rgba(15, 23, 42, 0.12),
        0 2px 8px -6px rgba(15, 23, 42, 0.06);
`

const DARK_TOKENS = `
    --accent: #f4f4f6;
    --accent-hover: #e2e2e6;
    --accent-contrast: #16171b;
    --accent-soft: rgba(255, 255, 255, 0.08);
    --border: #2b2d34;
    --border-hover: #3b3e47;
    --surface: #17181c;
    --surface-2: #202228;
    --surface-hover: #2a2c33;
    --text: #e7e7ea;
    --text-muted: #9aa0aa;
    --icon-muted: #8a8f99;
    --scrollbar: #3b3e47;
    --success: #6ac394;
    --success-soft: rgba(106, 195, 148, 0.16);
    --danger: #f26d6d;
    --danger-text: #f4a3a3;
    --danger-soft: rgba(242, 109, 109, 0.12);
    --danger-soft-hover: rgba(242, 109, 109, 0.16);
    --backdrop: rgba(0, 0, 0, 0.5);
    --fade-shadow: rgba(0, 0, 0, 0.5);
    --shadow-modal:
        0 12px 32px -18px rgba(0, 0, 0, 0.4),
        0 2px 8px -6px rgba(0, 0, 0, 0.24);
`

export const walletPickerModalCss = `
:host {
    all: initial;
}

.discovery-modal-backdrop {
${LIGHT_TOKENS}
    position: fixed;
    inset: 0;
    background: var(--backdrop);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 2147483000;
    animation: swkFadeIn 0.2s ease-out;
    font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
        sans-serif;
}

@keyframes swkFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.discovery-modal-content {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow-modal);
    width: min(87.4vw, 342px);
    overflow: hidden;
    animation: swkSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.discovery-modal-inner {
    width: min(87.4vw, 342px);
    max-height: min(86vh, 640px);
    display: flex;
    flex-direction: column;
}

@keyframes swkSlideUp {
    from { transform: translateY(16px) scale(0.98); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
}

.discovery-modal-content button {
    box-sizing: border-box;
    font-family: inherit;
}

.discovery-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 24px 20px 16px;
}

.discovery-modal-heading {
    flex: 1;
    min-width: 0;
    text-align: left;
}

.discovery-modal-heading h2 {
    margin: 0;
    font-size: 17px;
    line-height: 32px;
    font-weight: 600;
    color: var(--text);
}

.discovery-modal-back,
.discovery-modal-close {
    flex-shrink: 0;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--icon-muted);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition:
        background 0.15s ease,
        color 0.15s ease,
        transform 0.15s ease;
}

.discovery-modal-back svg,
.discovery-modal-close svg {
    display: block;
}

.discovery-modal-back:hover,
.discovery-modal-close:hover {
    background: var(--surface-hover);
    color: var(--text);
}

.discovery-modal-back:active,
.discovery-modal-close:active {
    transform: scale(0.92);
}

.discovery-modal-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 20px 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar) transparent;
}

.discovery-modal-body::-webkit-scrollbar {
    width: 8px;
}

.discovery-modal-body::-webkit-scrollbar-thumb {
    background: var(--scrollbar);
    border-radius: 4px;
    border: 2px solid var(--surface);
}

.discovery-modal-view {
    animation: swkViewFade 0.25s ease;
}

@keyframes swkViewFade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

.discovery-modal-error {
    margin: 0 0 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--danger-soft);
    color: var(--danger-text);
    font-size: 13px;
    line-height: 1.4;
}

.wallet-picker-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* Show ~4.5 wallet rows (62px tall + 8px gap), then scroll. Only this
       list scrolls; the header and footer stay fixed. */
    max-height: calc(4.5 * 62px + 4 * 8px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar) transparent;
    padding-right: 4px;
    margin-right: -4px;
}

.wallet-picker-container::-webkit-scrollbar {
    width: 8px;
}

.wallet-picker-container::-webkit-scrollbar-thumb {
    background: var(--scrollbar);
    border-radius: 4px;
    border: 2px solid var(--surface);
}

/* Non-scrolling wrapper so the fade can sit at the list's viewport bottom. */
.wallet-picker-scroll {
    position: relative;
}

/* Fading divider pinned to the bottom of the scroll viewport to hint at more
   content below. Purely visual; clicks pass through to the row beneath. */
.wallet-picker-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 22px;
    z-index: 10;
    pointer-events: none;
    /* Inset shadow anchored to the bottom edge: reads as a shadowed border and
       stays clipped within this overlay so it never creeps onto the row above. */
    box-shadow: inset 0 -10px 10px -9px var(--fade-shadow);
    transition: opacity 300ms;
}

/* Mirror of the bottom fade, anchored to the top edge (content scrolled above). */
.wallet-picker-fade-top {
    top: 0;
    bottom: auto;
    box-shadow: inset 0 10px 10px -9px var(--fade-shadow);
}

/* Hidden once the list fits or is scrolled to the bottom (no more content). */
.wallet-picker-fade.is-hidden {
    opacity: 0;
}

.wallet-picker-item {
    display: flex;
    align-items: stretch;
    flex-shrink: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition:
        border-color 0.15s ease,
        background 0.15s ease,
        box-shadow 0.15s ease,
        transform 0.1s ease;
}

.wallet-picker-item-main {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
}

.wallet-picker-item:hover {
    background: var(--accent-soft);
    border-color: var(--border-hover);
}

.wallet-picker-item:active {
    transform: scale(0.985);
}

.wallet-picker-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    align-self: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0 8px 0 0;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition:
        background 0.15s ease,
        color 0.15s ease;
}

.wallet-picker-remove:hover {
    background: var(--danger-soft-hover);
    color: var(--danger);
}

.wallet-icon {
    width: 32px;
    height: 32px;
    border-radius: 22.5%;
    flex-shrink: 0;
    background: var(--surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--text-muted);
}

.wallet-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.wallet-icon-fallback {
    font-size: 17px;
    font-weight: 600;
    color: var(--accent);
}

.wallet-info {
    flex: 1;
    min-width: 0;
}

.wallet-info h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.wallet-installed-badge {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    padding: 3px 8px;
    border-radius: 999px;
    color: var(--success);
    background: var(--success-soft);
}

/* Plain text label revealed on row hover; the whole row is the install target. */
.wallet-get-badge {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    color: var(--text-muted);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.15s ease;
}

.wallet-picker-item:hover .wallet-get-badge,
.wallet-picker-item:focus-within .wallet-get-badge {
    opacity: 1;
}

.custom-url-input {
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0 12px;
    font-size: 14px;
    color: var(--text);
    background: var(--surface);
}

.custom-url-input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-color: var(--accent);
}

.gateway-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px 4px 4px;
}

.gateway-help {
    margin: 0;
    font-size: 14px;
    font-weight: 400;
    color: var(--text-muted);
    text-align: left;
}

.gateway-connect-button {
    width: 100%;
    height: 44px;
    border: 1px solid var(--accent);
    border-radius: 12px;
    padding: 0 14px;
    background: var(--accent);
    color: var(--accent-contrast);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        opacity 0.15s ease;
}

.gateway-connect-button:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
}

.gateway-connect-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

.discovery-modal-footer {
    padding: 10px 20px 16px;
    background: var(--surface);
    text-align: center;
}

.discovery-modal-no-wallet {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
}

.discovery-modal-no-wallet svg {
    display: block;
    flex-shrink: 0;
}

.discovery-modal-no-wallet-label {
    display: block;
    transform: translateY(1px);
}

.discovery-modal-no-wallet:hover {
    color: var(--accent);
    text-decoration: underline;
}

.walletconnect-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px 20px 8px;
    gap: 8px;
}

.connecting-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 18px;
    padding: 28px 16px 16px;
}

.connecting-spinner-ring {
    position: relative;
    width: 92px;
    height: 92px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.connecting-spinner-ring::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 26px;
    padding: 3px;
    background: conic-gradient(
        from var(--swk-spinner-angle),
        var(--accent) 0deg,
        var(--accent-soft) 70deg,
        var(--accent-soft) 360deg
    );
    -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: swkSpinnerAngle 0.9s linear infinite;
}

@keyframes swkSpinnerAngle {
    to { --swk-spinner-angle: 360deg; }
}

.connecting-avatar {
    width: 72px;
    height: 72px;
    border-radius: 22.5%;
    overflow: hidden;
    background: var(--surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.connecting-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.connecting-avatar-fallback {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent);
}

.walletconnect-qr {
    width: 220px;
    height: 220px;
    border-radius: 16px;
    display: block;
    margin: 0 auto 8px;
    padding: 12px;
    box-sizing: border-box;
    background: #ffffff;
    border: 1px solid var(--border);
    box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.25);
}

.walletconnect-qr-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-2);
}

.walletconnect-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
}

.walletconnect-divider {
    position: relative;
    width: 100%;
    height: 1px;
    background: var(--border);
    margin: 16px 0 12px;
}

.walletconnect-divider-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 10px;
    background: var(--surface);
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
}

.walletconnect-copy-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 6px;
    padding: 12px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.1s ease;
}

.walletconnect-copy-button svg {
    display: block;
}

.walletconnect-copy-button:hover:not(:disabled) {
    background: var(--surface-hover);
    border-color: var(--border-hover);
}

.walletconnect-copy-button:disabled {
    opacity: 0.5;
    cursor: progress;
}

.walletconnect-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: swkWcSpin 0.8s linear infinite;
}

.walletconnect-help {
    margin: 0;
    font-size: 14px;
    color: var(--text-muted);
}

@keyframes swkWcSpin {
    to { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
    .discovery-modal-backdrop {
${DARK_TOKENS}
    }
}

/* Explicit theme override (wins over the OS setting via prefers-color-scheme). */
:host([data-swk-theme='dark']) .discovery-modal-backdrop {
${DARK_TOKENS}
}

:host([data-swk-theme='light']) .discovery-modal-backdrop {
${LIGHT_TOKENS}
}

@media (max-width: 600px) {
    .discovery-modal-backdrop {
        align-items: flex-end;
        padding: 0;
    }

    .discovery-modal-content {
        width: 100vw;
        max-height: 88vh;
        border-radius: 20px 20px 0 0;
    }

    .discovery-modal-inner {
        width: 100vw;
    }
}
`
