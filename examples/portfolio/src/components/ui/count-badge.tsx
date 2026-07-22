// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Chip, type ChipProps } from '@mui/material'
import { normalizeSx } from '@components/ui/utils'

type CountBadgeProps = {
    count: number
} & Omit<ChipProps, 'label' | 'size'>

export function CountBadge({ count, sx, ...props }: CountBadgeProps) {
    return (
        <Chip
            label={count}
            size="small"
            sx={[
                {
                    height: 22,
                    minWidth: 22,
                    flexShrink: 0,
                    bgcolor: (theme) => theme.portfolio.nav.soft,
                    color: 'common.black',
                    fontWeight: 500,
                    '& .MuiChip-label': {
                        px: 0.75,
                    },
                },
                ...normalizeSx(sx),
            ]}
            {...props}
        />
    )
}
