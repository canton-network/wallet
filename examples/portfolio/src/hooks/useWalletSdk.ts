// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'
import * as dappSdk from '@canton-network/dapp-sdk'
import * as walletSdk from '@canton-network/wallet-sdk'
import { useConnection } from '../contexts/ConnectionContext'
import { queryKeys } from './query-keys'
import {
    WalletSDKUtilitiesPlugin,
    WalletSDKUtilitiesPluginName,
} from '@lib/wallet-sdk-utility/src/extension'

export const useWalletSdk = () => {
    const { status } = useConnection()
    const sessionToken = status?.session?.accessToken
    const isConnected = status?.connection?.isConnected ?? false

    const walletSdkQuery = useQuery({
        queryKey: queryKeys.walletSdk.forConnection(sessionToken),
        enabled: isConnected && !!sessionToken,
        staleTime: Infinity,
        gcTime: 0,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        retry: false,
        queryFn: async () => {
            if (!sessionToken) {
                throw new Error('Wallet session token is not available')
            }

            const provider = dappSdk.getConnectedProvider()
            if (!provider) {
                throw new Error('Dapp provider is not available')
            }

            const sdk = await walletSdk.SDK.create({
                ledgerProvider: provider as never,
            })

            const pluginSDK = sdk.registerPlugins({
                [WalletSDKUtilitiesPluginName]: WalletSDKUtilitiesPlugin,
            })

            return pluginSDK
        },
    })

    return {
        sdk: walletSdkQuery.data!,
        isLoading: walletSdkQuery.isLoading || walletSdkQuery.isFetching,
        error:
            walletSdkQuery.error instanceof Error
                ? walletSdkQuery.error.message
                : walletSdkQuery.error
                  ? String(walletSdkQuery.error)
                  : undefined,
        refresh: () => {
            void walletSdkQuery.refetch()
        },
    }
}
