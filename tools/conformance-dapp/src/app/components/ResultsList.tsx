// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ReplayIcon from '@mui/icons-material/Replay'
import { alpha, type Theme } from '@mui/material/styles'
import { useState } from 'react'
import type { Report, TestResult, Observation } from '../../report.ts'
import { groups } from '../../tests/index.ts'
import type { Case } from '../../tests/types.ts'
import { JsonLogViewer } from './JsonLogViewer.tsx'

const STATUS_ORDER = [
    'running',
    'passed',
    'failed',
    'skipped',
    'pending',
    'other',
] as const

function statusColor(theme: Theme, status: string): string {
    if (status === 'running' || status === 'passed')
        return theme.palette.primary.main
    if (status === 'failed') return theme.palette.error.main
    return theme.palette.text.secondary
}

function StatusChip({ status, label }: { status: string; label: string }) {
    return (
        <Chip
            size="small"
            variant="outlined"
            label={label}
            sx={(theme) => {
                const color = statusColor(theme, status)
                return {
                    color,
                    borderColor: color,
                    fontWeight: 600,
                    bgcolor: alpha(color, 0.1),
                }
            }}
        />
    )
}

export function ResultsList({
    running,
    runningCase,
    runDisabled,
    onRerun,
    results,
    observations,
    report,
    diagnosticsAvailable,
    diagnosticsError,
}: {
    running: boolean
    runningCase: Case | undefined
    runDisabled: boolean
    onRerun: (id: string) => void
    results: TestResult[]
    observations: Observation[]
    report: Report | undefined
    diagnosticsAvailable: boolean
    diagnosticsError: string
}) {
    const [openLogs, setOpenLogs] = useState<ReadonlySet<string>>(new Set())
    const toggleLogs = (key: string) =>
        setOpenLogs((previous) => {
            const next = new Set(previous)
            if (!next.delete(key)) next.add(key)
            return next
        })
    const runningRow: TestResult | undefined = runningCase && {
        testId: runningCase.id,
        name: runningCase.name,
        status: 'pending',
        duration: 0,
    }
    const rows = runningRow ? [...results, runningRow] : results
    const statusOf = (result: TestResult) =>
        result === runningRow ? 'running' : result.status
    const groupedResults = groups.map((group) => ({
        category: group.category,
        results: rows.filter((result) =>
            group.cases.some((testCase) => testCase.id === result.testId)
        ),
    }))
    groupedResults.push({
        category: 'Other',
        results: rows.filter(
            (result) =>
                !groups.some((group) =>
                    group.cases.some(
                        (testCase) => testCase.id === result.testId
                    )
                )
        ),
    })
    return (
        <>
            {rows.length === 0 ? (
                <Typography align="center" color="textSecondary" sx={{ py: 8 }}>
                    {running ? 'Awaiting wallet response' : 'No test results'}
                </Typography>
            ) : (
                <Box data-testid="test-results">
                    {groupedResults
                        .filter((group) => group.results.length > 0)
                        .map((group) => (
                            <Accordion
                                key={group.category}
                                data-testid={`result-group-${group.category}`}
                                defaultExpanded={group.results.some(
                                    (result) => result.status !== 'skipped'
                                )}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            flexWrap: 'wrap',
                                            gap: 1.5,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            component="strong"
                                        >
                                            {group.category}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 0.5,
                                            }}
                                        >
                                            {STATUS_ORDER.map((status) => {
                                                const count =
                                                    group.results.filter(
                                                        (result) =>
                                                            statusOf(result) ===
                                                            status
                                                    ).length
                                                return count > 0 ? (
                                                    <StatusChip
                                                        key={status}
                                                        status={status}
                                                        label={`${count} ${status}`}
                                                    />
                                                ) : null
                                            })}
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List disablePadding>
                                        {group.results.map((result, index) => {
                                            const status = statusOf(result)
                                            const key = `${result.testId ?? result.name}-${index}`
                                            const logsOpen = openLogs.has(key)
                                            const logs = observations.filter(
                                                (entry) =>
                                                    entry.testId ===
                                                    result.testId
                                            )
                                            return (
                                                <ListItem
                                                    key={key}
                                                    data-testid={`result-${result.testId}`}
                                                    data-status={status}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems:
                                                            'flex-start',
                                                        flexWrap: 'wrap',
                                                        gap: 1.5,
                                                        borderBottom: 1,
                                                        borderColor: 'divider',
                                                        px: 0,
                                                        py: 2,
                                                        '&:last-of-type': {
                                                            borderBottom: 0,
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            flex: 1,
                                                            minWidth: 130,
                                                            gap: 0.75,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            component="strong"
                                                        >
                                                            {result.name}
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                color="textSecondary"
                                                            >
                                                                {result.testId}{' '}
                                                                ·{' '}
                                                                {status ===
                                                                'running'
                                                                    ? 'running'
                                                                    : `${result.duration} ms`}
                                                            </Typography>
                                                            {logs.length >
                                                                0 && (
                                                                <Button
                                                                    size="small"
                                                                    data-testid={`logs-toggle-${result.testId}`}
                                                                    aria-expanded={
                                                                        logsOpen
                                                                    }
                                                                    aria-controls={`logs-${key}`}
                                                                    onClick={() =>
                                                                        toggleLogs(
                                                                            key
                                                                        )
                                                                    }
                                                                    endIcon={
                                                                        <ExpandMoreIcon
                                                                            sx={{
                                                                                transition:
                                                                                    'transform 150ms',
                                                                                transform:
                                                                                    logsOpen
                                                                                        ? 'rotate(180deg)'
                                                                                        : undefined,
                                                                            }}
                                                                        />
                                                                    }
                                                                    sx={{
                                                                        py: 0,
                                                                        minWidth: 0,
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    {
                                                                        logs.length
                                                                    }{' '}
                                                                    {logs.length ===
                                                                    1
                                                                        ? 'log'
                                                                        : 'logs'}
                                                                </Button>
                                                            )}
                                                        </Box>
                                                        {result.message && (
                                                            <Box
                                                                component="pre"
                                                                sx={{
                                                                    whiteSpace:
                                                                        'pre-wrap',
                                                                    overflowWrap:
                                                                        'anywhere',
                                                                    fontSize: 12,
                                                                    margin: 0,
                                                                    color:
                                                                        result.status ===
                                                                        'skipped'
                                                                            ? 'text.secondary'
                                                                            : 'error.main',
                                                                }}
                                                            >
                                                                {result.message}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <StatusChip
                                                        status={status}
                                                        label={status}
                                                    />
                                                    {status === 'running' ? (
                                                        <CircularProgress
                                                            size={16}
                                                            sx={{ m: 0.5 }}
                                                        />
                                                    ) : (
                                                        result.testId && (
                                                            <IconButton
                                                                title={`Rerun "${result.name}"`}
                                                                data-testid={`rerun-${result.testId}`}
                                                                disabled={
                                                                    runDisabled
                                                                }
                                                                onClick={() =>
                                                                    onRerun(
                                                                        result.testId!
                                                                    )
                                                                }
                                                            >
                                                                <ReplayIcon fontSize="inherit" />
                                                            </IconButton>
                                                        )
                                                    )}
                                                    <Collapse
                                                        in={
                                                            logsOpen &&
                                                            logs.length > 0
                                                        }
                                                        unmountOnExit
                                                        sx={{
                                                            flexBasis: '100%',
                                                        }}
                                                    >
                                                        <JsonLogViewer
                                                            id={`logs-${key}`}
                                                            testId={`logs-${result.testId}`}
                                                            observations={logs}
                                                        />
                                                    </Collapse>
                                                </ListItem>
                                            )
                                        })}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                </Box>
            )}
            {diagnosticsError && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {diagnosticsError}
                </Typography>
            )}
            {report && !diagnosticsAvailable && (
                <Typography
                    data-testid="diagnostics-unavailable"
                    color="textSecondary"
                    sx={{ mt: 2 }}
                >
                    Diagnostic logs not included
                </Typography>
            )}
        </>
    )
}
