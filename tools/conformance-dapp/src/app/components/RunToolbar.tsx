// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import DownloadIcon from '@mui/icons-material/Download'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { exportReport, serializeReport, type Report } from '../../report.ts'
import { DownloadJsonButton } from './DownloadJsonButton.tsx'
import { FileUploadButton } from './FileUploadButton.tsx'

export function RunToolbar({
    running,
    signing,
    importing,
    canRun,
    report,
    diagnosticsAvailable,
    onStart,
    onCancel,
    onImportReport,
}: {
    running: boolean
    signing: boolean
    importing: boolean
    canRun: boolean
    report: Report | undefined
    diagnosticsAvailable: boolean
    onStart: () => void
    onCancel: () => void
    onImportReport: (file: File) => void
}) {
    const busy = running || signing || importing

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 2.75,
            }}
        >
            <Typography variant="h6" component="h2" id="execution-title">
                Test run
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                    variant="contained"
                    data-testid="run-suite"
                    disabled={busy || !canRun}
                    startIcon={<PlayArrowIcon />}
                    onClick={onStart}
                >
                    Run suite
                </Button>
                <IconButton
                    title="Cancel run"
                    data-testid="cancel-run"
                    disabled={!running}
                    onClick={onCancel}
                >
                    <StopIcon />
                </IconButton>
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
                    data={
                        report &&
                        serializeReport(
                            exportReport(report, 'report+diagnostics')
                        )
                    }
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
        </Box>
    )
}
