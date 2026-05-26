// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react'
import * as dappSdk from '@canton-network/dapp-sdk'
import * as walletSdk from '@canton-network/wallet-sdk'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import { useConnection } from './ConnectionContext'
import { useRegistryUrls } from './RegistryServiceContext'
import { WalletSdkContext } from './WalletSdkContext'

type WalletSdk = SDKInterface<'asset'>

export const WalletSdkProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { status } = useConnection()
    const registryUrls = useRegistryUrls()
    const sessionToken = status?.session?.accessToken
    const isConnected = status?.connection?.isConnected ?? false
    const registryUrlKey = useMemo(
        () => Array.from(registryUrls.values()).sort().join('|'),
        [registryUrls]
    )
    const [sdk, setSdk] = useState<WalletSdk | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const [refreshNonce, setRefreshNonce] = useState(0)

    const refresh = useCallback(() => {
        setRefreshNonce((value) => value + 1)
    }, [])

    useEffect(() => {
        let isStale = false

        const initialize = async () => {
            if (!isConnected || !sessionToken) {
                setSdk(undefined)
                setError(undefined)
                setIsLoading(false)
                return
            }

            const provider = dappSdk.getConnectedProvider()
            if (!provider) {
                setSdk(undefined)
                setError('Dapp provider is not available')
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(undefined)

            try {
                const nextSdk = (await walletSdk.SDK.create({
                    ledgerProvider: provider as never,
                    asset: {
                        auth: {
                            method: 'static',
                            token: sessionToken,
                        },
                        registries: Array.from(registryUrls.values()).map(
                            (url) => new URL(url)
                        ),
                    },
                })) as WalletSdk

                if (!isStale) {
                    setSdk(nextSdk)
                }
            } catch (err) {
                if (!isStale) {
                    setSdk(undefined)
                    setError(err instanceof Error ? err.message : String(err))
                }
            } finally {
                if (!isStale) {
                    setIsLoading(false)
                }
            }
        }

        initialize()

        return () => {
            isStale = true
        }
    }, [isConnected, sessionToken, registryUrls, registryUrlKey, refreshNonce])

    return (
        <WalletSdkContext.Provider value={{ sdk, isLoading, error, refresh }}>
            {children}
        </WalletSdkContext.Provider>
    )
}
