// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { TokenInstruments } from './aggregate-holdings'
import type { TokenClient } from './client'

export interface TokenContextValue {
    client: TokenClient | undefined
    instruments: TokenInstruments
    isLoading: boolean
    error: Error | null
}

const TokenContext = createContext<TokenContextValue | null>(null)

export interface TokenProviderProps {
    client: TokenClient | undefined
    instruments: TokenInstruments
    isLoading?: boolean
    error?: Error | null
    children: ReactNode
}

// Changing the client keeps the cached queries; apps clear tokenQueryKeys.all.
export function TokenProvider({
    client,
    instruments,
    isLoading = false,
    error = null,
    children,
}: TokenProviderProps) {
    const value = useMemo(
        () => ({ client, instruments, isLoading, error }),
        [client, instruments, isLoading, error]
    )
    return <TokenContext value={value}>{children}</TokenContext>
}

export function useTokenContext(): TokenContextValue {
    const value = useContext(TokenContext)
    if (!value) {
        throw new Error('useTokenContext must be used within a TokenProvider')
    }
    return value
}
