// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext } from 'react'
import type { SDKInterface } from '@canton-network/wallet-sdk'

type WalletSdk = SDKInterface<'asset'>

type WalletSdkContextValue = {
    sdk: WalletSdk | undefined
    isLoading: boolean
    error: string | undefined
    refresh: () => void
}

export const WalletSdkContext = createContext<
    WalletSdkContextValue | undefined
>(undefined)

export const useWalletSdk = () => {
    const ctx = useContext(WalletSdkContext)
    if (!ctx) {
        throw new Error('useWalletSdk must be used within WalletSdkContext')
    }
    return ctx
}
