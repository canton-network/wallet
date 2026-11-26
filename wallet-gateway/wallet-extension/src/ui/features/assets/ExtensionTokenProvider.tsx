// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    TokenProvider,
    type TokenInstruments,
} from '@canton-network/core-wallet-ui-components/react/token'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { getTokenClient } from '@/ui/lib/token-client.ts'

import { tokenInstrumentsQuery } from './api.ts'

const NO_INSTRUMENTS: TokenInstruments = new Map()

/**
 * Holdings don't need the instruments, so a registry that fails only costs
 * the names: the error isn't passed on, the assets page shows it instead.
 */
export function ExtensionTokenProvider({ children }: { children: ReactNode }) {
    const instruments = useQuery(tokenInstrumentsQuery())
    return (
        <TokenProvider
            client={getTokenClient()}
            instruments={instruments.data ?? NO_INSTRUMENTS}
            isLoading={instruments.isLoading}
        >
            {children}
        </TokenProvider>
    )
}
