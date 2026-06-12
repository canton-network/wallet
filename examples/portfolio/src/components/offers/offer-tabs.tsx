// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@mui/material'
import type { OfferDirection } from '@hooks/useOffers'

interface OfferTabsProps {
    value: OfferDirection
    onChange: (value: OfferDirection) => void
}

export function OfferTabs({ value, onChange }: OfferTabsProps) {
    return (
        <Tabs
            value={value}
            onChange={(_, nextValue: OfferDirection) => onChange(nextValue)}
            aria-label="Offer direction"
            textColor="inherit"
            slotProps={{
                indicator: {
                    sx: {
                        backgroundColor: (theme) => theme.portfolio.nav.main,
                    },
                },
            }}
            sx={{
                minHeight: 'unset',
                '& .MuiTab-root': {
                    minHeight: 'unset',
                    px: 0,
                    py: 0,
                    pb: 2,
                    mr: 2,
                    color: 'text.secondary',
                    fontSize: (theme) => theme.typography.body1.fontSize,
                    lineHeight: (theme) => theme.typography.body1.lineHeight,
                    textTransform: 'none',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                },
                '& .Mui-selected': {
                    color: 'text.primary',
                    fontWeight: 600,
                },
            }}
        >
            <Tab disableRipple value="incoming" label="Incoming" />
            <Tab disableRipple value="outgoing" label="Outgoing" />
        </Tabs>
    )
}
