// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { RegistriesSection } from '@components/settings/registries-section'

export const Route = createFileRoute('/next/dashboard/settings')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Box sx={{ px: 5.5, py: 7.5 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Settings
            </Typography>

            <RegistriesSection />
        </Box>
    )
}
