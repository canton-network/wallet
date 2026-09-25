// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FastForwardIcon from '@mui/icons-material/FastForward'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import type { Config } from '../../config.ts'
import { groups } from '../../tests/index.ts'

export function TestSelectionPanel({
    running,
    current,
    runDisabled,
    onRunOnly,
    toggleTest,
    toggleGroup,
}: {
    running: boolean
    current: Config | undefined
    runDisabled: boolean
    onRunOnly: (ids: string[]) => void
    toggleTest: (id: string, enabled: boolean) => void
    toggleGroup: (ids: string[], enabled: boolean) => void
}) {
    return (
        <Box
            component="fieldset"
            disabled={running || !current}
            sx={{ border: 0, p: 0, m: 0 }}
        >
            <Typography variant="subtitle2" component="legend" sx={{ mb: 0.5 }}>
                Tests
            </Typography>
            {groups.map((group) => {
                const ids = group.cases.map((testCase) => testCase.id)
                const enabledCount = ids.filter(
                    (id) => !current?.disabledTests.includes(id)
                ).length
                return (
                    <Box
                        key={group.category}
                        sx={{
                            mb: 0.75,
                            '&:not(:first-of-type)': {
                                borderTop: 1,
                                borderColor: 'divider',
                                pt: 0.75,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <FormControlLabel
                                sx={{ flex: 1, minWidth: 0, m: 0 }}
                                control={
                                    <Checkbox
                                        sx={{ p: 0.5 }}
                                        checked={enabledCount === ids.length}
                                        indeterminate={
                                            enabledCount > 0 &&
                                            enabledCount < ids.length
                                        }
                                        slotProps={{
                                            input: {
                                                'data-testid': `test-group-${group.category}`,
                                            },
                                        }}
                                        onChange={(event) =>
                                            toggleGroup(
                                                ids,
                                                event.target.checked
                                            )
                                        }
                                    />
                                }
                                label={group.category}
                            />
                            <IconButton
                                title={`Run only ${group.category} tests`}
                                data-testid={`run-group-${group.category}`}
                                disabled={runDisabled}
                                onClick={() => onRunOnly(ids)}
                            >
                                <FastForwardIcon fontSize="inherit" />
                            </IconButton>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                pl: 2,
                            }}
                        >
                            {group.cases.map((testCase) => (
                                <Box
                                    key={testCase.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    <FormControlLabel
                                        sx={{ flex: 1, minWidth: 0, m: 0 }}
                                        control={
                                            <Checkbox
                                                sx={{ p: 0.25 }}
                                                checked={
                                                    !current?.disabledTests.includes(
                                                        testCase.id
                                                    )
                                                }
                                                slotProps={{
                                                    input: {
                                                        'data-testid': `test-${testCase.id}`,
                                                    },
                                                }}
                                                onChange={(event) =>
                                                    toggleTest(
                                                        testCase.id,
                                                        event.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label={
                                            <Typography variant="caption">
                                                {testCase.name}
                                            </Typography>
                                        }
                                    />
                                    <IconButton
                                        sx={{ p: 0.25 }}
                                        title={`Run only "${testCase.name}"`}
                                        data-testid={`run-case-${testCase.id}`}
                                        disabled={runDisabled}
                                        onClick={() => onRunOnly([testCase.id])}
                                    >
                                        <PlayArrowIcon fontSize="inherit" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}
