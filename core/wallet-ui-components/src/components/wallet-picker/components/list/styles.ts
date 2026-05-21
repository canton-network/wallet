// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'
import commonStyles from '../../styles'

export default css`
    ${commonStyles}

    .wallet-list {
        flex: 1;
        overflow-y: auto;
        padding: 4px 12px 0;
    }

    .custom-url-section {
        padding: 8px 12px 16px;
    }

    .custom-url-label {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--wg-theme-text-color);
        padding: 0 4px 8px;
    }

    .custom-url-label .info-wrap {
        display: inline-flex;
        align-items: center;
    }

    .custom-url-label .info-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        color: var(--wg-theme-text-secondary);
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
    }

    .custom-url-label .info-icon:focus-visible {
        outline: 2px solid var(--wg-theme-accent-color);
        border-radius: 999px;
    }

    .custom-url-label .info-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
        width: max-content;
        max-width: min(320px, 90vw);
        padding: 8px 10px;
        border: none;
        border-radius: 10px;
        background: var(--wg-theme-primary-color);
        color: var(--wg-theme-primary-text-color);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.4;
        text-transform: none;
        letter-spacing: normal;
        white-space: normal;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.12s ease;
    }

    .custom-url-label .info-wrap:hover .info-tooltip {
        opacity: 1;
        visibility: visible;
    }

    .custom-url-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .custom-url-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--wg-theme-border-color);
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        background: var(--wg-theme-surface-color);
        color: var(--wg-theme-text-color);
    }

    .custom-url-input:focus {
        border-color: var(--wg-theme-accent-color);
        box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
    }

    .custom-url-input::placeholder {
        color: var(--wg-theme-text-secondary);
    }

    .btn-add {
        background: var(--wg-theme-primary-color);
        color: var(--wg-theme-primary-text-color);
        border: none;
        border-radius: 20px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
        white-space: nowrap;
    }

    .btn-add:hover {
        background: var(--wg-theme-primary-hover);
    }

    .btn-add:disabled {
        opacity: 0.5;
        cursor: default;
    }

    .empty-state {
        color: var(--wg-theme-text-secondary);
    }
`
