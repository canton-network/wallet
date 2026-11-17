// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createComponent, type EventName } from '@lit/react'
import React from 'react'

import {
    WgWalletsSync as WgWalletsSyncElement,
    type WalletsSyncEvent,
} from '../../components/wallets-sync.ts'

export const WalletsSync = createComponent({
    tagName: 'wg-wallets-sync',
    elementClass: WgWalletsSyncElement,
    react: React,
    events: {
        onWalletsSync: 'wallets-sync' as EventName<WalletsSyncEvent>,
    },
})
