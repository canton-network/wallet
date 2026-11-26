// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react'

import { TokenContext, type TokenContextValue } from './TokenContext.ts'

export function useTokenContext(): TokenContextValue {
    const value = useContext(TokenContext)
    if (!value) {
        throw new Error('useTokenContext must be used within a TokenProvider')
    }
    return value
}
