// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// NOTE: This file contains React wrappers for the Lit components in @canton-network/core-wallet-ui-components.
//       We can reuse these components until we rewrite them natively in React.

import React from 'react'
import { createComponent } from '@lit/react'
import {
    AppHeader as AppHeaderX,
    WgWalletsSync as WgWalletsSyncX,
} from '@canton-network/core-wallet-ui-components'

export const AppHeader = createComponent({
    tagName: 'app-header',
    elementClass: AppHeaderX,
    react: React,
    events: {
        onLogout: 'logout',
        onCopyDappApiUrl: 'copy-dapp-api-url',
    },
})

export const WgWalletsSync = createComponent({
    tagName: 'wg-wallets-sync',
    elementClass: WgWalletsSyncX,
    react: React,
    events: {
        onSyncSuccess: 'sync-success',
    },
})
