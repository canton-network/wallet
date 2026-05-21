// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'
import commonStyles from '../../styles'

export default css`
    ${commonStyles}

    .error-icon {
        color: var(--wg-theme-error-color);
    }

    .btn-row {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }

    .btn-primary {
        background: var(--wg-theme-primary-color);
        color: var(--wg-theme-primary-text-color);
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
    }

    .btn-primary:hover {
        background: var(--wg-theme-primary-hover);
    }

    .btn-secondary {
        background: transparent;
        color: var(--wg-theme-text-secondary);
        border: 1px solid var(--wg-theme-border-color);
        border-radius: 8px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
    }
`
