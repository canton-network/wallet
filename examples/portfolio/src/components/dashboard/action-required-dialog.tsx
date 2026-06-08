// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dialog, DialogContent, Typography } from '@mui/material'
import type { ActionItem } from '@components/types'

interface ActionRequiredDialogProps {
    item: ActionItem | null
    onClose: () => void
}

export function ActionRequiredDialog({
    item,
    onClose,
}: ActionRequiredDialogProps) {
    return (
        <Dialog
            open={Boolean(item)}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: 'min(100%, 640px)',
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 1,
                        boxShadow: 24,
                        color: 'text.primary',
                    },
                },
                backdrop: {
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.64)',
                        backdropFilter: 'blur(2px)',
                    },
                },
            }}
        >
            <DialogContent sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    {item ? getItemDialogTitle(item) : ''}
                </Typography>
            </DialogContent>
        </Dialog>
    )
}

function getItemDialogTitle(item: ActionItem) {
    return item.kind === 'transfer' ? 'Transfer Offer' : 'Allocation'
}
