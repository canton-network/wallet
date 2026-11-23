// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSuspenseQuery } from '@tanstack/react-query'

import { siteApprovalQuery, useDecideSiteApproval } from './api.ts'

export function ApproveSitePage({ id }: { id: string }) {
    const { data: request } = useSuspenseQuery(siteApprovalQuery(id))
    const decide = useDecideSiteApproval(id)

    // The page opens in the toolbar popup, which has nothing else to show.
    const answer = (approved: boolean) =>
        decide.mutate(approved, { onSuccess: () => window.close() })

    return (
        <Stack spacing={2} sx={{ p: 1, maxWidth: 440, mx: 'auto' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Connect to this site?
            </Typography>

            {request === null ? (
                <Alert severity="info">
                    This request is no longer waiting for an answer. It may have
                    timed out. Connect again from the site.
                </Alert>
            ) : (
                <>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography
                            sx={{
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                            }}
                        >
                            {request.origin}
                        </Typography>
                    </Paper>
                    <Alert severity="warning">
                        If you approve, this site can read your parties and call
                        the ledger with your full rights, on any network you
                        sign in to. It also receives your ledger access token,
                        which it can keep using until the token expires, even
                        after it disconnects. Disconnecting only stops the
                        wallet from serving the site. Only approve sites you
                        trust.
                    </Alert>
                    {decide.isError && (
                        <Alert severity="error">
                            Couldn't save your answer. {decide.error.message}
                        </Alert>
                    )}
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            fullWidth
                            disabled={decide.isPending}
                            onClick={() => answer(false)}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            loading={decide.isPending && decide.variables}
                            disabled={decide.isPending}
                            onClick={() => answer(true)}
                        >
                            Approve
                        </Button>
                    </Stack>
                </>
            )}
        </Stack>
    )
}
