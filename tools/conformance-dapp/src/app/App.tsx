// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useMediaQuery from '@mui/material/useMediaQuery'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import GppBadIcon from '@mui/icons-material/GppBad'
import { CANTON_LOGO_PNG } from '@canton-network/dapp-sdk'
import { ConfigSchema, defaultConfig } from '../config.ts'
import {
    runPassed,
    DiagnosticsSchema,
    type Report,
    type Signature,
    type TestResult,
    type Observation,
} from '../report.ts'
import { InteractionDialog } from './components/InteractionDialog.tsx'
import { WaitingDialog } from './components/WaitingDialog.tsx'
import { ConfigurationPanel } from './components/ConfigurationPanel.tsx'
import { RunToolbar } from './components/RunToolbar.tsx'
import { ResultsList } from './components/ResultsList.tsx'
import { ReportSigningPanel } from './components/ReportSigningPanel.tsx'
import { useSuiteRun } from './hooks/useSuiteRun.ts'
import { useReportSigning } from './hooks/useReportSigning.ts'
import { useReportImport } from './hooks/useReportImport.ts'
import { TEST_CASE_COUNT } from '../suite.ts'
import { cases } from '../tests/index.ts'
import { lightTheme, darkTheme } from './theme.ts'

function SummaryStat({ value, label }: { value: number; label: string }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="h5">{value}</Typography>
            <Typography variant="caption" color="textSecondary">
                {label}
            </Typography>
        </Box>
    )
}

export function App() {
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
    const [darkOverride, setDarkOverride] = useState<boolean>()
    const dark = darkOverride ?? prefersDark

    const [configText, setConfigText] = useState(
        JSON.stringify(defaultConfig, null, 2)
    )
    const [results, setResults] = useState<TestResult[]>([])
    const [observations, setObservations] = useState<Observation[]>([])
    const [report, setReport] = useState<Report>()
    const [signature, setSignature] = useState<Signature>()
    const [error, setError] = useState('')
    const [diagnosticsError, setDiagnosticsError] = useState('')

    // Shared mutual-exclusion guards: only one of run/sign/import may be active.
    const runActiveRef = useRef<AbortController | null>(null)
    const signingActiveRef = useRef(false)
    const importingActiveRef = useRef(false)

    const signing = useReportSigning({
        runActiveRef,
        signingActiveRef,
        importingActiveRef,
        report,
        setSignature,
        setError,
    })
    const suiteRun = useSuiteRun({
        runActiveRef,
        signingActiveRef,
        importingActiveRef,
        setResults,
        setObservations,
        setReport,
        setSignature,
        setError,
        setDiagnosticsError,
        setConfigText,
        signIfConfigured: signing.signIfConfigured,
    })
    const reportImport = useReportImport({
        runActiveRef,
        signingActiveRef,
        importingActiveRef,
        setResults,
        setObservations,
        setReport,
        setSignature,
        setError,
        setDiagnosticsError,
    })

    async function triggerRun(only?: string[]) {
        try {
            await suiteRun.run(JSON.parse(configText), only)
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught))
        }
    }

    const busy = suiteRun.running || signing.signing || reportImport.importing
    const parsed = ConfigSchema.safeParse(
        (() => {
            try {
                return JSON.parse(configText)
            } catch {
                return null
            }
        })()
    )
    const current = parsed.success ? parsed.data : undefined
    const diagnosticsAvailable = Boolean(
        report && DiagnosticsSchema.safeParse(report.extra?.diagnostics).success
    )

    const statusText = suiteRun.running
        ? 'Running'
        : report
          ? runPassed(report)
              ? report.results.summary.skipped > 0
                  ? 'Passed (partial)'
                  : 'Passed'
              : 'Failed / incomplete'
          : 'Ready'

    const phaseLabel =
        suiteRun.phase === 'connecting'
            ? 'Connecting to wallet'
            : suiteRun.phase === 'finalizing'
              ? 'Finalizing report'
              : suiteRun.prompt
                ? 'Waiting for wallet action'
                : 'Running tests'

    // The suite reports every case in order, so the next unreported one is running.
    const runningCase =
        suiteRun.running && suiteRun.phase === 'testing'
            ? cases[results.length]
            : undefined

    return (
        <ThemeProvider theme={dark ? darkTheme : lightTheme}>
            <CssBaseline />
            <Box
                component="main"
                sx={{
                    maxWidth: 1500,
                    mx: 'auto',
                    px: { xs: 2, sm: 3.5 },
                    pb: 5,
                }}
            >
                <Box
                    component="header"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        py: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.75,
                            minWidth: 0,
                        }}
                    >
                        <Box
                            component="img"
                            data-testid="canton-logo"
                            src={CANTON_LOGO_PNG}
                            alt="Canton"
                            sx={{ width: 42, height: 42, objectFit: 'contain' }}
                        />
                        <Typography variant="h5" component="h1">
                            CIP-103 Conformance Tests
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box
                            data-testid="run-status"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: 13,
                                whiteSpace: 'nowrap',
                                pl: 1.5,
                                borderLeft: 3,
                                borderColor: suiteRun.running
                                    ? 'primary.main'
                                    : 'divider',
                            }}
                        >
                            {suiteRun.running && <CircularProgress size={16} />}
                            {statusText}
                        </Box>
                        <IconButton
                            title="Toggle color mode"
                            onClick={() => setDarkOverride(!dark)}
                        >
                            {dark ? (
                                <LightModeIcon fontSize="small" />
                            ) : (
                                <DarkModeIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'minmax(280px, 370px) minmax(0, 1fr)',
                        },
                        gap: { xs: 3, md: 0 },
                        pt: 3,
                    }}
                >
                    <ConfigurationPanel
                        configText={configText}
                        setConfigText={setConfigText}
                        setError={setError}
                        running={suiteRun.running}
                        runDisabled={busy || !current}
                        onRunOnly={(ids) => void triggerRun(ids)}
                        current={current}
                        privateKey={signing.privateKey}
                        onImportKey={signing.importPrivateKeyFile}
                        onClearKey={signing.clearPrivateKey}
                    />
                    <Box
                        component="section"
                        aria-labelledby="execution-title"
                        sx={{ pl: { md: 3.5 }, minWidth: 0 }}
                    >
                        <RunToolbar
                            running={suiteRun.running}
                            signing={signing.signing}
                            importing={reportImport.importing}
                            canRun={Boolean(current)}
                            report={report}
                            diagnosticsAvailable={diagnosticsAvailable}
                            onStart={() => void triggerRun()}
                            onCancel={suiteRun.cancel}
                            onImportReport={(file) =>
                                void reportImport.importReport(file)
                            }
                        />
                        {suiteRun.running && (
                            <Box
                                data-testid="run-progress"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    py: 2,
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    color: 'primary.main',
                                }}
                            >
                                <CircularProgress size={22} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'baseline',
                                            gap: '6px 12px',
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            component="strong"
                                        >
                                            {phaseLabel}
                                        </Typography>
                                        {suiteRun.phase === 'testing' && (
                                            <Typography
                                                variant="caption"
                                                color="textSecondary"
                                            >
                                                {runningCase?.id ??
                                                    'Starting suite'}
                                                {' · '}
                                                {results.length} /{' '}
                                                {TEST_CASE_COUNT} cases
                                                processed
                                            </Typography>
                                        )}
                                    </Box>
                                    <LinearProgress
                                        aria-label="Test cases processed"
                                        variant={
                                            suiteRun.phase === 'testing'
                                                ? 'determinate'
                                                : 'indeterminate'
                                        }
                                        value={
                                            suiteRun.phase === 'testing'
                                                ? (results.length /
                                                      TEST_CASE_COUNT) *
                                                  100
                                                : undefined
                                        }
                                        sx={{ mt: 1.25 }}
                                    />
                                </Box>
                            </Box>
                        )}
                        {error && (
                            <Alert
                                severity="error"
                                data-testid="run-error"
                                sx={{ mb: 2.5, overflowWrap: 'anywhere' }}
                            >
                                {error}
                            </Alert>
                        )}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(4, minmax(0, 1fr))',
                                borderBlock: 1,
                                borderColor: 'divider',
                                py: 2.5,
                                gap: 1.25,
                            }}
                        >
                            {(['passed', 'failed', 'skipped'] as const).map(
                                (status) => (
                                    <SummaryStat
                                        key={status}
                                        label={
                                            status.charAt(0).toUpperCase() +
                                            status.slice(1)
                                        }
                                        value={
                                            results.filter(
                                                (result) =>
                                                    result.status === status
                                            ).length
                                        }
                                    />
                                )
                            )}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.75,
                                }}
                            >
                                {signature ? (
                                    <VerifiedUserIcon />
                                ) : (
                                    <GppBadIcon />
                                )}
                                <Typography
                                    data-testid="signature-status"
                                    variant="caption"
                                    color="textSecondary"
                                >
                                    {signature ? 'Signed' : 'Unsigned'}
                                </Typography>
                            </Box>
                        </Box>
                        {report && (
                            <ReportSigningPanel
                                running={suiteRun.running}
                                signing={signing.signing}
                                importing={reportImport.importing}
                                hash={signing.hash}
                                signature={signature}
                                onSignWithWallet={() =>
                                    void signing.signWithWallet()
                                }
                            />
                        )}
                        <ResultsList
                            running={suiteRun.running}
                            runningCase={runningCase}
                            runDisabled={busy || !current}
                            onRerun={(id) => void triggerRun([id])}
                            results={results}
                            observations={observations}
                            report={report}
                            diagnosticsAvailable={diagnosticsAvailable}
                            diagnosticsError={diagnosticsError}
                        />
                    </Box>
                </Box>
                {suiteRun.prompt && (
                    <InteractionDialog
                        {...suiteRun.prompt}
                        fail={suiteRun.failTest}
                    />
                )}
                {suiteRun.waiting && (
                    <WaitingDialog
                        pending={suiteRun.waiting}
                        fail={suiteRun.failTest}
                        cancel={suiteRun.cancel}
                    />
                )}
            </Box>
        </ThemeProvider>
    )
}
