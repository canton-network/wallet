// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'

const commonStyles = css`
    * {
        box-sizing: border-box;
        font-family: var(--wg-theme-font-family);
        color: var(--wg-theme-text-color);
    }

    .status-view {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        gap: 16px;
        text-align: center;
        flex: 1;
    }

    .status-view h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .status-view p {
        margin: 0;
        font-size: 14px;
        color: var(--wg-theme-text-secondary);
    }
`
export default commonStyles

export const componentStyles = css`
    ${commonStyles}

    .view-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .view-title {
        font-size: 20px;
        font-weight: 600;
        padding: 16px 24px 12px;
        color: var(--wg-theme-text-color);
    }
`
