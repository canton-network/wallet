// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import type { Interaction } from '@canton-network/core-provider-conformance'
import type React from 'react'

interface InteractionDialogProps {
    interaction: Interaction
    finish: () => void
    fail: () => void
    cancel: () => void
}

export const InteractionDialog: React.FC<InteractionDialogProps> = ({
    interaction,
    finish,
    fail,
    cancel,
}) => {
    return (
        <Dialog
            open
            data-testid="interaction-dialog"
            onClose={(_event, reason) => {
                if (reason === 'escapeKeyDown') cancel()
            }}
        >
            <DialogTitle>
                {interaction.decision === 'approve' ? 'Approve' : 'Reject'}{' '}
                {interaction.method} in your wallet
            </DialogTitle>
            <DialogContent>
                <Box
                    component="pre"
                    sx={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        fontSize: 12,
                        margin: 0,
                    }}
                >
                    {JSON.stringify(interaction.params ?? {}, null, 2)}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button data-testid="cancel-interaction" onClick={cancel}>
                    Cancel run
                </Button>
                <Button
                    title="Fail this test now instead of waiting for its timeout, then continue with the rest of the suite"
                    data-testid="fail-interaction"
                    onClick={fail}
                >
                    Mark as failed
                </Button>
                <Button
                    variant="contained"
                    data-testid="complete-interaction"
                    autoFocus
                    onClick={finish}
                >
                    Action completed
                </Button>
            </DialogActions>
        </Dialog>
    )
}
