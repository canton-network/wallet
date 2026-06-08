// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import { Dialog, DialogContent, Typography } from '@mui/material'
import type { PartyId } from '@canton-network/core-types'
import { toast } from 'sonner'
import type {
    ActionItem,
    AllocationActionItem,
    TransferActionItem,
    TransferLegWithAllocation,
} from '@components/types'
import { AllocationActionDialogContent } from '@components/dashboard/allocation-action-dialog-content'
import { TransferOfferActionDialogContent } from '@components/dashboard/transfer-offer-action-dialog-content'
import { useCreateAllocation } from '@hooks/useCreateAllocation'
import { useExerciseTransfer } from '@hooks/useExerciseTransfer'
import { useWithdrawAllocation } from '@hooks/useWithdrawAllocation'

interface ActionRequiredDialogProps {
    item: ActionItem | null
    onClose: () => void
}

interface AllocationDialogState {
    itemContractId: string | null
    loadingLegId: string | null
    failedLegId: string | null
    allocationError: string | null
}

const EMPTY_ALLOCATION_STATE: AllocationDialogState = {
    itemContractId: null,
    loadingLegId: null,
    failedLegId: null,
    allocationError: null,
}

export function ActionRequiredDialog({
    item,
    onClose,
}: ActionRequiredDialogProps) {
    const exerciseTransferMutation = useExerciseTransfer()
    const createAllocationMutation = useCreateAllocation()
    const withdrawAllocationMutation = useWithdrawAllocation()
    const [allocationState, setAllocationState] =
        useState<AllocationDialogState>(EMPTY_ALLOCATION_STATE)
    const isLoading =
        exerciseTransferMutation.isPending ||
        createAllocationMutation.isPending ||
        withdrawAllocationMutation.isPending
    const currentAllocationState =
        allocationState.itemContractId === item?.contractId
            ? allocationState
            : EMPTY_ALLOCATION_STATE

    const handleClose = () => {
        if (!isLoading) {
            setAllocationState(EMPTY_ALLOCATION_STATE)
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

    const handleCreateAllocation = (
        allocationItem: AllocationActionItem,
        leg: TransferLegWithAllocation
    ) => {
        setAllocationState({
            itemContractId: allocationItem.contractId,
            loadingLegId: leg.transferLegId,
            failedLegId: null,
            allocationError: null,
        })

        createAllocationMutation.mutate(
            {
                party: allocationItem.currentPartyId as PartyId,
                allocationSpecification: {
                    settlement: allocationItem.settlement,
                    transferLegId: leg.transferLegId,
                    transferLeg: leg.transferLeg,
                },
            },
            {
                onSuccess: () => {
                    toast.success('Allocation created successfully')
                },
                onError: (error) => {
                    setAllocationState({
                        itemContractId: allocationItem.contractId,
                        loadingLegId: null,
                        failedLegId: leg.transferLegId,
                        allocationError: error.message,
                    })
                    toast.error(
                        `Failed to allocate transfer leg: ${error.message}`
                    )
                },
                onSettled: () =>
                    setAllocationState((current) =>
                        current.itemContractId === allocationItem.contractId
                            ? { ...current, loadingLegId: null }
                            : current
                    ),
            }
        )
    }

    const handleWithdrawAllocation = (
        allocationItem: AllocationActionItem,
        leg: TransferLegWithAllocation,
        allocationContractId: string
    ) => {
        setAllocationState({
            itemContractId: allocationItem.contractId,
            loadingLegId: leg.transferLegId,
            failedLegId: null,
            allocationError: null,
        })

        withdrawAllocationMutation.mutate(
            {
                party: allocationItem.currentPartyId as PartyId,
                contractId: allocationContractId,
                instrumentId: leg.transferLeg.instrumentId,
            },
            {
                onSuccess: () => {
                    toast.success('Allocation withdrawn successfully')
                },
                onError: (error) =>
                    toast.error(
                        `Failed to withdraw allocation: ${error.message}`
                    ),
                onSettled: () =>
                    setAllocationState((current) =>
                        current.itemContractId === allocationItem.contractId
                            ? { ...current, loadingLegId: null }
                            : current
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
                container: {
                    sx: {
                        alignItems: 'flex-start',
                    },
                },
                paper: {
                    sx: {
                        width: 'min(100%, 960px)',
                        maxHeight: 'min(calc(100vh - 48px), 100%)',
                        my: 10,
                        overflow: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
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
            <DialogContent
                sx={{
                    p: { xs: 3, md: 4 },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                {item?.kind === 'transfer' ? (
                    <TransferOfferActionDialogContent
                        item={item}
                        isLoading={isLoading}
                        onClose={handleClose}
                        onAction={handleTransferAction}
                    />
                ) : item?.kind === 'allocation' ? (
                    <AllocationActionDialogContent
                        item={item}
                        isLoading={isLoading}
                        loadingLegId={currentAllocationState.loadingLegId}
                        failedLegId={currentAllocationState.failedLegId}
                        allocationError={currentAllocationState.allocationError}
                        onClose={handleClose}
                        onCreateAllocation={(leg) =>
                            handleCreateAllocation(item, leg)
                        }
                        onWithdrawAllocation={(leg, contractId) =>
                            handleWithdrawAllocation(item, leg, contractId)
                        }
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
