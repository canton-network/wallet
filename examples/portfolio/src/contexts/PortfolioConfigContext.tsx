// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PortfolioConfig } from '@lib/schemas'
import { createContext, useContext } from 'react'

export const PortfolioConfigContext = createContext<
    PortfolioConfig | undefined
>(undefined)

export const usePortfolioConfig = () => {
    const ctx = useContext(PortfolioConfigContext)
    if (!ctx) {
        throw new Error(
            'usePortfolioConfig must be used within PortfolioConfigProvider'
        )
    }
    return ctx
}
