// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import type { PendingRequest } from '../hooks/useSuiteRun.ts'

/** Offers a way out of a request the wallet is taking its time to answer. */
export function WaitingDialog({
    pending,
    fail,
    cancel,
}: {
    pending: PendingRequest
    fail: () => void
    cancel: () => void
}) {
    return (
        <Dialog
            open
            data-testid="waiting-dialog"
            onClose={(_event, reason) => {
                if (reason === 'escapeKeyDown') cancel()
            }}
        >
            <DialogTitle
                sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
            >
                <CircularProgress size={18} />
                <Box component="span">
                    Waiting for {pending.method} to respond
                </Box>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {pending.testId} is still waiting on your wallet. Mark it as
                    failed to record it now and carry on with the rest of the
                    suite, instead of waiting for the test timeout.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button data-testid="cancel-waiting" onClick={cancel}>
                    Cancel run
                </Button>
                <Button
                    variant="contained"
                    data-testid="fail-waiting"
                    onClick={fail}
                >
                    Mark as failed
                </Button>
            </DialogActions>
        </Dialog>
    )
}
