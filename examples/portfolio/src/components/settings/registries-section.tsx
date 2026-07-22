// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import { toast } from 'sonner'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { PillButton } from '@components/ui/PillButton'
import {
    useReachableRegistryUrls,
    useRegistryMutations,
} from '@hooks/useRegistryUrls'
import type { RegistryReachabilityStatus } from '../../types/registries'
import { AddRegistryDialog } from './add-registry-dialog'

const statusDetails: Record<
    RegistryReachabilityStatus,
    { label: string; color: string }
> = {
    reachable: { label: 'Reachable', color: 'success.main' },
    unreachable: { label: 'Unreachable', color: 'error.main' },
    checking: { label: 'Checking', color: 'text.disabled' },
}

export function RegistriesSection() {
    const { entries } = useReachableRegistryUrls()
    const { deleteRegistryUrl } = useRegistryMutations()
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    const registries = [...entries].sort((left, right) =>
        (left.partyId ?? '').localeCompare(right.partyId ?? '')
    )

    const handleDeleteRegistry = (partyId: string) => {
        deleteRegistryUrl(partyId)
        toast.success('Registry URL deleted')
    }

    return (
        <Box component="section" aria-labelledby="registries-heading">
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                }}
            >
                <Typography id="registries-heading" variant="h5" component="h2">
                    Registries
                </Typography>

                <PillButton
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => setAddDialogOpen(true)}
                >
                    Add
                </PillButton>
            </Box>

            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflowX: 'auto',
                }}
            >
                <Table
                    aria-label="Registries"
                    sx={{ minWidth: 880, tableLayout: 'fixed' }}
                >
                    <TableHead>
                        <TableRow>
                            <HeaderCell width="32%">Party ID</HeaderCell>
                            <HeaderCell width="32%">Registry URL</HeaderCell>
                            <HeaderCell width="20%">Status</HeaderCell>
                            <HeaderCell width={160}>Action</HeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {registries.length > 0 ? (
                            registries.map((registry) => (
                                <TableRow
                                    key={registry.registryUrl}
                                    sx={{
                                        '&:last-child td': { borderBottom: 0 },
                                    }}
                                >
                                    <BodyCell>
                                        {registry.partyId ? (
                                            <CopyableIdentifier
                                                value={registry.partyId}
                                                maxLength={24}
                                            />
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Resolving…
                                            </Typography>
                                        )}
                                    </BodyCell>
                                    <BodyCell>
                                        <CopyableIdentifier
                                            value={registry.registryUrl}
                                            maxLength={30}
                                        />
                                    </BodyCell>
                                    <RegistryStatusCell
                                        status={registry.status}
                                    />
                                    <BodyCell width={160}>
                                        {registry.partyId &&
                                        registry.isRemovable ? (
                                            <PillButton
                                                type="button"
                                                tone="danger"
                                                size="small"
                                                onClick={() =>
                                                    registry.partyId &&
                                                    handleDeleteRegistry(
                                                        registry.partyId
                                                    )
                                                }
                                                sx={{ px: 2 }}
                                            >
                                                Delete
                                            </PillButton>
                                        ) : null}
                                    </BodyCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ px: 2, py: 4 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            textAlign: 'center',
                                        }}
                                    >
                                        No registries configured
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddRegistryDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
        </Box>
    )
}

function RegistryStatusCell({
    status,
}: {
    status: RegistryReachabilityStatus
}) {
    const details = statusDetails[status]

    return (
        <BodyCell ariaLabel={`Registry status: ${details.label}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    aria-hidden="true"
                    sx={{
                        width: 8,
                        height: 8,
                        flex: '0 0 auto',
                        borderRadius: '50%',
                        bgcolor: details.color,
                    }}
                />
                <Typography variant="body2">{details.label}</Typography>
            </Box>
        </BodyCell>
    )
}

interface CellProps {
    children: React.ReactNode
    width?: string | number
    ariaLabel?: string
}

function HeaderCell({ children, width }: CellProps) {
    return (
        <TableCell
            sx={{
                px: 2,
                py: 1.75,
                color: 'text.primary',
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                width,
            }}
        >
            {children}
        </TableCell>
    )
}

function BodyCell({ children, width, ariaLabel }: CellProps) {
    return (
        <TableCell
            aria-label={ariaLabel}
            sx={{
                px: 2,
                py: 2.25,
                color: 'text.primary',
                verticalAlign: 'middle',
                width,
            }}
        >
            {children}
        </TableCell>
    )
}
