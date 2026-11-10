// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import { Dialog, DialogContent, Typography } from '@mui/material'
import type { PartyId } from '@canton-network/core-types'
import { toast } from 'sonner'
import type {
    ActionItem,
    AllocationActionItem,
    AllocationRequestV2ActionItem,
    TransferActionItem,
    TransferLegWithAllocation,
} from '@components/types'
import {
    AllocationActionDialogContent,
    AllocationRequestV2DialogContent,
} from '@components/dashboard/allocation-action-dialog-content'
import {
    TransferOfferActionDialogContent,
    type AvailableTransferAction,
} from '@components/dashboard/transfer-offer-action-dialog-content'
import { useCreateAllocation } from '@hooks/useCreateAllocation'
import {
    transferActionVersion,
    useExerciseTransfer,
} from '@hooks/useExerciseTransfer'
import { useWithdrawAllocation } from '@hooks/useWithdrawAllocation'
import { useAllocationRequestV2Actions } from '@hooks/useAllocationRequestV2Actions'
import { AllocationV2DialogContent } from './allocation-v2-dialog-content'
import { useWithdrawAllocationV2 } from '@hooks/useWithdrawAllocationV2'

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
    const allocationRequestV2 = useAllocationRequestV2Actions()
    const [allocationState, setAllocationState] =
        useState<AllocationDialogState>(EMPTY_ALLOCATION_STATE)
    const isLoading =
        exerciseTransferMutation.isPending ||
        createAllocationMutation.isPending ||
        withdrawAllocationMutation.isPending ||
        allocationRequestV2.accept.isPending ||
        allocationRequestV2.reject.isPending
    const currentAllocationState =
        allocationState.itemContractId === item?.contractId
            ? allocationState
            : EMPTY_ALLOCATION_STATE

    const handleClose = () => {
        if (!isLoading) {
            setAllocationState(EMPTY_ALLOCATION_STATE)
            allocationRequestV2.accept.reset()
            allocationRequestV2.reject.reset()
            onClose()
        }
    }

    const handleTransferAction = (
        transferItem: TransferActionItem,
        availability: AvailableTransferAction
    ) => {
        const action = availability.action
        exerciseTransferMutation.mutate(
            {
                party: transferItem.currentPartyId as PartyId,
                contractId: transferItem.contractId,
                instrumentId: transferItem.instrumentId,
                instructionChoice: action,
                version: transferActionVersion(transferItem),
                actors: availability.actors,
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
    const handleAcceptAllocationRequestV2 = (
        requestItem: AllocationRequestV2ActionItem
    ) => {
        allocationRequestV2.reject.reset()
        allocationRequestV2.accept.mutate(requestItem, {
            onSuccess: (result) => {
                if (result.status === 'accepted') {
                    toast.success('Allocation withdrawn successfully')
                    handleClose()
                } else {
                    toast.warning(
                        'Partial allocation complete. Remaining assets need to be allocate elsewhere'
                    )
                }
            },
        })
    }

    const handleRejectAllocationRequestV2 = (
        requestItem: AllocationRequestV2ActionItem
    ) => {
        allocationRequestV2.accept.reset()
        allocationRequestV2.reject.mutate(requestItem, {
            onSuccess: () => {
                toast.success('Allocation withdrawn successfully')
                handleClose()
            },
            onError: (error) =>
                toast.error(
                    `Failed to reject allocation request: ${error.message}`
                ),
        })
    }

    const withdrawAllocationV2 = useWithdrawAllocationV2()

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
                ) : item?.kind === 'allocation-v2' ? (
                    <AllocationV2DialogContent
                        item={item}
                        isLoading={isLoading}
                        error={withdrawAllocationV2.error?.message ?? null}
                        onClose={handleClose}
                        onWithdraw={() =>
                            withdrawAllocationV2.mutate(item, {
                                onSuccess: () => {
                                    toast.success(
                                        'Allocation withdrawn, funds released'
                                    )
                                    handleClose()
                                },
                            })
                        }
                    />
                ) : item?.kind === 'allocation-request-v2' ? (
                    <AllocationRequestV2DialogContent
                        item={item}
                        isLoading={isLoading}
                        progress={allocationRequestV2.progress}
                        error={
                            (
                                allocationRequestV2.accept.error ??
                                allocationRequestV2.reject.error
                            )?.message ?? null
                        }
                        onClose={handleClose}
                        onAccept={() => handleAcceptAllocationRequestV2(item)}
                        onReject={() => handleRejectAllocationRequestV2(item)}
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
    switch (item.kind) {
        case 'transfer':
            return 'Transfer offer'
        case 'allocation':
        case 'allocation-request-v2':
            return 'Allocation Request'
        case 'allocation-v2':
            return 'Allocation'
        case 'allocation-instruction-v2':
            return 'Allocation Instruction'
    }
}
