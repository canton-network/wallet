// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TokenProvider } from '@canton-network/core-wallet-ui-components/react/token'
import { useInstruments } from '@hooks/useInstruments'
import { useWalletSdk } from '@hooks/useWalletSdk'
import { useMemo, type ReactNode } from 'react'

export function PortfolioTokenProvider({ children }: { children: ReactNode }) {
    const { sdk, isLoading, error } = useWalletSdk()
    const instruments = useInstruments()
    const clientError = useMemo(
        () => (error ? new Error(error) : null),
        [error]
    )

    return (
        <TokenProvider
            client={sdk}
            instruments={instruments}
            isLoading={isLoading}
            error={clientError}
        >
            {children}
        </TokenProvider>
    )
}
