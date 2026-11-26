// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createContext } from 'react'

import type { TokenInstruments } from './aggregate-holdings.ts'
import type { TokenClient } from './client.ts'

export interface TokenContextValue {
    client: TokenClient | undefined
    instruments: TokenInstruments
    isLoading: boolean
    error: Error | null
}

export const TokenContext = createContext<TokenContextValue | null>(null)
