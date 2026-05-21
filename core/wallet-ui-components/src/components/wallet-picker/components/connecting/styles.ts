// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'
import commonStyles from '../../styles'

export default css`
    ${commonStyles}

    code {
        display: block;
        word-break: break-all;
        font-size: 11px;
        background: var(--wg-theme-background-color, #111);
        padding: 12px;
        border-radius: 6px;
        margin: 8px 0;
        max-height: 120px;
        overflow: auto;
        user-select: all;
        cursor: pointer;
    }

    img {
        display: block;
        margin: 0 auto 12px;
        width: 200px;
        height: 200px;
        border-radius: 8px;
    }

    button {
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        background: #646cff;
        color: white;
        cursor: pointer;
        font-size: 14px;
        margin-top: 4px;
    }

    .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid var(--wg-theme-border-color);
        border-top-color: var(--wg-theme-accent-color);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`
