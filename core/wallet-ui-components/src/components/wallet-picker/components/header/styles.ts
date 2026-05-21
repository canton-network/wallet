// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'
import commonStyles from '../../styles'

export default css`
    ${commonStyles}

    .header {
        height: 40px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--wg-theme-border-color);
    }

    .header-logo {
        width: 28px;
        height: 28px;
    }
`
