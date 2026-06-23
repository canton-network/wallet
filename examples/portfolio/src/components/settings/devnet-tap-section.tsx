// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { PillButton } from '@components/ui/PillButton'
import { useIsDevNet } from '@hooks/useIsDevNet'
import { DevNetTapDialog } from './devnet-tap-dialog'

export function DevNetTapSection() {
    const { data: isDevNet } = useIsDevNet()
    const [tapDialogOpen, setTapDialogOpen] = useState(false)

    if (!isDevNet) return null

    return (
        <Box
            component="section"
            aria-labelledby="devnet-heading"
            sx={{ mt: 3 }}
        >
            <Typography
                id="devnet-heading"
                variant="h5"
                component="h2"
                sx={{ mb: 2 }}
            >
                DevNet
            </Typography>

            <Paper
                variant="outlined"
                sx={{
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 2,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        sx={{
                            mb: 0.75,
                            color: 'text.primary',
                            fontSize: 12,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                        }}
                    >
                        DevNet Tap
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Get free tokens to help with testing your application.
                    </Typography>
                </Box>

                <PillButton
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => setTapDialogOpen(true)}
                    sx={{ px: 2.5, flexShrink: 0 }}
                >
                    Tap
                </PillButton>
            </Paper>

            <DevNetTapDialog
                open={tapDialogOpen}
                onClose={() => setTapDialogOpen(false)}
            />
        </Box>
    )
}
