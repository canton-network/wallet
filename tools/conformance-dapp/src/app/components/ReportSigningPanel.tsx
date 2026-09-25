// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import DownloadIcon from '@mui/icons-material/Download'
import type { Signature } from '../../report.ts'
import { DownloadJsonButton } from './DownloadJsonButton.tsx'

export function ReportSigningPanel({
    running,
    signing,
    importing,
    hash,
    signature,
    onSignWithWallet,
}: {
    running: boolean
    signing: boolean
    importing: boolean
    hash: string
    signature: Signature | undefined
    onSignWithWallet: () => void
}) {
    const busy = running || signing || importing
    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                py: 2.25,
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary">
                    Report SHA-256
                </Typography>
                <Typography
                    variant="caption"
                    component="code"
                    data-testid="result-hash"
                    sx={{ display: 'block', overflowWrap: 'anywhere' }}
                >
                    {hash}
                </Typography>
            </Box>
            <Button
                data-testid="sign-with-wallet"
                disabled={busy}
                startIcon={<AccountBalanceWalletIcon />}
                onClick={onSignWithWallet}
            >
                {signing ? 'Signing with wallet...' : 'Sign with wallet'}
            </Button>
            <DownloadJsonButton
                data-testid="download-signature"
                disabled={busy}
                data={signature}
                filename="cip103-ctrf.json.sig"
                startIcon={<DownloadIcon />}
            >
                Download signature
            </DownloadJsonButton>
        </Box>
    )
}
