// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createComponent, type EventName } from '@lit/react'
import React from 'react'

import type {
    WalletAllocateEvent,
    WalletCardEditEvent,
    WalletSetPrimaryEvent,
} from '../../components/wallet-card.ts'
import { WgWalletList as WgWalletListElement } from '../../components/wallet-list.ts'

export const WalletList = createComponent({
    tagName: 'wg-wallet-list',
    elementClass: WgWalletListElement,
    react: React,
    events: {
        onWalletAllocate: 'wallet-allocate' as EventName<WalletAllocateEvent>,
        onWalletEdit: 'wallet-edit' as EventName<WalletCardEditEvent>,
        onWalletSetPrimary:
            'wallet-set-primary' as EventName<WalletSetPrimaryEvent>,
    },
})
