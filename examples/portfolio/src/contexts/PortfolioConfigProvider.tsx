// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PortfolioConfigContext } from '@contexts/PortfolioConfigContext'
import type { PortfolioConfig } from '@lib/schemas'
import type { ReactNode } from 'react'

export const PortfolioConfigProvider = ({
    children,
    config,
}: {
    children: ReactNode
    config: PortfolioConfig
}) => {
    return (
        <PortfolioConfigContext.Provider value={config}>
            {children}
        </PortfolioConfigContext.Provider>
    )
}
