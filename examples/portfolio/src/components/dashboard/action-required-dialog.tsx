// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dialog, DialogContent, Typography } from '@mui/material'
import type { PartyId } from '@canton-network/core-types'
import { toast } from 'sonner'
import type { ActionItem, TransferActionItem } from '@components/types'
import { TransferOfferActionDialogContent } from '@components/dashboard/transfer-offer-action-dialog-content'
import { useExerciseTransfer } from '@hooks/useExerciseTransfer'

interface ActionRequiredDialogProps {
    item: ActionItem | null
    onClose: () => void
}

export function ActionRequiredDialog({
    item,
    onClose,
}: ActionRequiredDialogProps) {
    const exerciseTransferMutation = useExerciseTransfer()
    const isLoading = exerciseTransferMutation.isPending

    const handleClose = () => {
        if (!isLoading) {
            onClose()
        }
    }

    const handleTransferAction = (
        transferItem: TransferActionItem,
        action: 'Accept' | 'Reject' | 'Withdraw'
    ) => {
        exerciseTransferMutation.mutate(
            {
                party: transferItem.currentPartyId as PartyId,
                contractId: transferItem.contractId,
                instrumentId: transferItem.instrumentId,
                instructionChoice: action,
            },
            {
                onSuccess: () => {
                    toast.success(`${action} transfer successful`)
                    onClose()
                },
                onError: (error) =>
                    toast.error(
                        `Failed to ${action.toLowerCase()} transfer: ${error.message}`
                    ),
            }
        )
    }

    return (
        <Dialog
            open={Boolean(item)}
            onClose={handleClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: 'min(100%, 640px)',
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 0,
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
                {item?.kind === 'transfer' ? (
                    <TransferOfferActionDialogContent
                        item={item}
                        isLoading={isLoading}
                        onClose={handleClose}
                        onAction={handleTransferAction}
                    />
                ) : (
                    <Typography variant="h4" component="h1">
                        {item ? getItemDialogTitle(item) : ''}
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    )
}

function getItemDialogTitle(item: ActionItem) {
    return item.kind === 'transfer' ? 'Transfer Offer' : 'Allocation'
}
