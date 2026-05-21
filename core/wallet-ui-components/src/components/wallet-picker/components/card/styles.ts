// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'
import commonStyles from '../../styles'

export default css`
    ${commonStyles}

    .wallet-remove-btn {
        border: none;
        background: transparent;
        color: var(--wg-theme-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 0.15s ease;
        flex-shrink: 0;
        padding: 0;
        width: 16px;
        height: 16px;
    }

    .wallet-remove-btn:hover {
        color: var(--wg-theme-error-color);
    }

    .wallet-remove-btn:focus-visible {
        outline: 2px solid var(--wg-theme-accent-color);
        outline-offset: 4px;
        border-radius: 4px;
    }

    .wallet-remove-btn svg {
        width: 16px;
        height: 16px;
    }

    .wallet-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 8px;
        border: 1px solid var(--wg-theme-border-color);
        background: var(--wg-theme-surface-color);
        cursor: pointer;
        transition: all 0.15s ease;
        width: 100%;
        text-align: left;
        margin-bottom: 8px;
    }

    .wallet-card:hover {
        background: var(--wg-theme-surface-hover);
        border-color: var(--wg-theme-accent-color);
    }

    .wallet-card:focus-visible {
        outline: 2px solid var(--wg-theme-accent-color);
        outline-offset: 2px;
    }

    .wallet-card:active {
        transform: scale(0.99);
    }

    .wallet-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--wg-theme-icon-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
    }

    .wallet-icon img {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        object-fit: cover;
    }

    .wallet-icon svg {
        width: 22px;
        height: 22px;
        color: var(--wg-theme-text-secondary);
    }

    .wallet-name {
        flex: 1;
        min-width: 0;
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`
