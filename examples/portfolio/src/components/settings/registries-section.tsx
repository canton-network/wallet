// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react'
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
import { useRegistryMutations, useRegistryUrls } from '@hooks/useRegistryUrls'
import { AddRegistryDialog } from './add-registry-dialog'

interface RegistryRow {
    partyId: string
    registryUrl: string
}

export function RegistriesSection() {
    const registryUrls = useRegistryUrls()
    const { deleteRegistryUrl } = useRegistryMutations()
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    const registries = useMemo(
        () =>
            Array.from(registryUrls.entries())
                .map(
                    ([partyId, registryUrl]): RegistryRow => ({
                        partyId,
                        registryUrl,
                    })
                )
                .sort((left, right) =>
                    left.partyId.localeCompare(right.partyId)
                ),
        [registryUrls]
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
                    sx={{ minWidth: 760, tableLayout: 'fixed' }}
                >
                    <TableHead>
                        <TableRow>
                            <HeaderCell width="42%">Party ID</HeaderCell>
                            <HeaderCell width="42%">Registry URL</HeaderCell>
                            <HeaderCell width={160}>Action</HeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {registries.length > 0 ? (
                            registries.map((registry) => (
                                <TableRow
                                    key={registry.partyId}
                                    sx={{
                                        '&:last-child td': { borderBottom: 0 },
                                    }}
                                >
                                    <BodyCell>
                                        <CopyableIdentifier
                                            value={registry.partyId}
                                            maxLength={24}
                                        />
                                    </BodyCell>
                                    <BodyCell>
                                        <CopyableIdentifier
                                            value={registry.registryUrl}
                                            maxLength={30}
                                        />
                                    </BodyCell>
                                    <BodyCell width={160}>
                                        <PillButton
                                            type="button"
                                            tone="danger"
                                            size="small"
                                            onClick={() =>
                                                handleDeleteRegistry(
                                                    registry.partyId
                                                )
                                            }
                                            sx={{ px: 2 }}
                                        >
                                            Delete
                                        </PillButton>
                                    </BodyCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} sx={{ px: 2, py: 4 }}>
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

interface CellProps {
    children: React.ReactNode
    width?: string | number
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

function BodyCell({ children, width }: CellProps) {
    return (
        <TableCell
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
