// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Paper, Skeleton } from '@mui/material'

export function ActionRequiredRowSkeleton() {
    return (
        <Box
            component={Paper}
            elevation={0}
            sx={{
                minHeight: 108,
                p: 2,
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(5, minmax(0, 1fr))',
                },
                gap: { xs: 2, md: 3 },
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
            }}
        >
            {Array.from({ length: 5 }, (_, index) => (
                <Box key={index}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width="80%" />
                    {index === 2 ? (
                        <Skeleton variant="text" width="70%" />
                    ) : null}
                </Box>
            ))}
        </Box>
    )
}
