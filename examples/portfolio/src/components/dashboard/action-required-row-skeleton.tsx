// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Skeleton } from '@mui/material'
import {
    OfferRowGrid,
    OfferRowShell,
} from '@components/offers/offer-row-layout'

export function ActionRequiredRowSkeleton() {
    return (
        <OfferRowShell>
            <OfferRowGrid columns={5}>
                {Array.from({ length: 5 }, (_, index) => (
                    <Box key={index} sx={{ minWidth: 0 }}>
                        <Skeleton variant="text" width={80} />
                        <Skeleton variant="text" width="80%" />
                        {index === 2 ? (
                            <Skeleton variant="text" width="70%" />
                        ) : null}
                    </Box>
                ))}
            </OfferRowGrid>
        </OfferRowShell>
    )
}
