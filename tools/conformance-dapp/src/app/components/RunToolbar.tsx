// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box'
import DownloadIcon from '@mui/icons-material/Download'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import type React from 'react'
import { serializeReport, type Report } from '../../report.ts'
import { DownloadJsonButton } from './DownloadJsonButton.tsx'
import { FileUploadButton } from './FileUploadButton.tsx'

interface RunToolbarProps {
    running: boolean
    signing: boolean
    importing: boolean
    report: Report | undefined
    diagnosticsAvailable: boolean
    onImportReport: (file: File) => void
}

export const RunToolbar: React.FC<RunToolbarProps> = ({
    running,
    signing,
    importing,
    report,
    diagnosticsAvailable,
    onImportReport,
}) => {
    const busy = running || signing || importing

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <DownloadJsonButton
                title="Download report without diagnostic logs"
                data-testid="download-report"
                disabled={busy}
                data={report && serializeReport(report)}
                filename="cip103-ctrf.json"
                startIcon={<DownloadIcon />}
            >
                Report
            </DownloadJsonButton>
            <DownloadJsonButton
                title="Download report with unsigned diagnostic logs"
                data-testid="download-report-diagnostics"
                disabled={!diagnosticsAvailable || busy}
                data={report && serializeReport(report, 'report+diagnostics')}
                filename="cip103-ctrf-diagnostics.json"
                startIcon={<DownloadIcon />}
            >
                Report + diagnostics
            </DownloadJsonButton>
            <FileUploadButton
                accept=".json,application/json"
                inputTestId="report-file"
                data-testid="import-report"
                disabled={busy}
                startIcon={<UploadFileIcon />}
                onFileSelected={onImportReport}
            >
                Import report
            </FileUploadButton>
        </Box>
    )
}
