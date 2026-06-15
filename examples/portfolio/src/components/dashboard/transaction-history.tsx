// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Paper, Typography } from '@mui/material'

export function TransactionHistory() {
    return (
        <Box
            component={Paper}
            elevation={0}
            sx={{
                minHeight: 160,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                px: 3,
                py: 5,
                textAlign: 'center',
            }}
        >
            <Box>
                <Typography variant="h6" component="p" sx={{ mb: 1 }}>
                    Coming soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Transaction history for this wallet will be available here.
                </Typography>
            </Box>
        </Box>
    )
}
