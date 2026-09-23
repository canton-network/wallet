// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import KeyIcon from '@mui/icons-material/Key'
import { FileUploadButton } from './FileUploadButton.tsx'

export function SigningKeyPanel({
    running,
    privateKey,
    onImportKey,
    onClearKey,
}: {
    running: boolean
    privateKey: string
    onImportKey: (file: File) => Promise<void>
    onClearKey: () => void
}) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <FileUploadButton
                accept=".pem,.key"
                inputTestId="signing-key-file"
                data-testid="import-signing-key"
                disabled={running}
                startIcon={<KeyIcon />}
                onFileSelected={onImportKey}
            >
                {privateKey ? 'Replace signing key' : 'Import signing key'}
            </FileUploadButton>
            {privateKey && (
                <Button
                    data-testid="clear-signing-key"
                    disabled={running}
                    onClick={onClearKey}
                >
                    Clear key
                </Button>
            )}
        </Box>
    )
}
