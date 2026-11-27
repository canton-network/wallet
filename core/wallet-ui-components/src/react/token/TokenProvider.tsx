// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, type ReactNode } from 'react'

import type { TokenClient } from './client.ts'
import type { TokenInstruments } from './registry-instrument.ts'
import { TokenContext } from './TokenContext.ts'

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
