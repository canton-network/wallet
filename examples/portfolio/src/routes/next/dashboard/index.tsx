import { useState } from 'react'
import { PillButton } from '@components/ui/PillButton'
import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { AllAssetsContent } from '@components/dashboard/all-assets-content'
import { ActionRequiredSection } from '@components/dashboard/action-required-section'
import { TransferDialog } from '@components/next/transfer-dialog'
import { useActionRequiredItems } from '@hooks/useActionRequiredItems'
import { useAllAccountAssets } from '@hooks/useAllAccountAssets'

export const Route = createFileRoute('/next/dashboard/')({
    component: RouteComponent,
})

function RouteComponent() {
    const allAccountAssets = useAllAccountAssets()
    const actionRequiredItems = useActionRequiredItems()
    const [transferOpen, setTransferOpen] = useState(false)

    return (
        <Box sx={{ px: 5.5, py: 7.5 }}>
            <Box
                sx={{
                    mb: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h4" component="h1">
                    Dashboard
                </Typography>

                <PillButton type="button" onClick={() => setTransferOpen(true)}>
                    Transfer
                </PillButton>
            </Box>

            <ActionRequiredSection {...actionRequiredItems} />

            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                All assets
            </Typography>

            <AllAssetsContent {...allAccountAssets} />

            <TransferDialog
                open={transferOpen}
                onClose={() => setTransferOpen(false)}
            />
        </Box>
    )
}
