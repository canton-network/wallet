// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { Observation } from '../../report.ts'

const TOKEN_PATTERN =
    /("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b)/g

function tokenKind(token: string): 'key' | 'string' | 'literal' | 'number' {
    if (token.startsWith('"')) return token.endsWith(':') ? 'key' : 'string'
    return /^(true|false|null)$/.test(token) ? 'literal' : 'number'
}

function JsonValue({ value }: { value: unknown }) {
    const { palette } = useTheme()
    const dark = palette.mode === 'dark'
    const colors = {
        key: dark ? '#7ab8e0' : '#155b94',
        string: palette.primary.main,
        number: dark ? '#e0a06e' : '#934514',
        literal: palette.error.main,
    }
    const tokens = JSON.stringify(value, null, 2).split(TOKEN_PATTERN)
    return (
        <Box
            component="pre"
            sx={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                fontSize: 12,
                lineHeight: 1.55,
                margin: 0,
                width: '100%',
            }}
        >
            <code>
                {tokens.map((token, index) =>
                    index % 2 === 0 ? (
                        token
                    ) : (
                        <Box
                            component="span"
                            key={index}
                            className={`json-${tokenKind(token)}`}
                            sx={{ color: colors[tokenKind(token)] }}
                        >
                            {token}
                        </Box>
                    )
                )}
            </code>
        </Box>
    )
}

function ObservationEntry({ observation }: { observation: Observation }) {
    const isRequest =
        observation.result === undefined &&
        observation.error === undefined &&
        observation.event === undefined
    const isError = observation.error !== undefined
    const payload = isRequest
        ? observation.params
        : isError
          ? observation.error
          : observation.result
    const Arrow = isRequest ? ArrowForwardIcon : ArrowBackIcon
    const time = new Date(observation.timestamp)
    return (
        <Box
            data-testid="log-entry"
            data-direction={isRequest ? 'request' : 'response'}
            sx={{
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 0 },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    component="span"
                    title={isRequest ? 'Request' : 'Response'}
                    sx={{
                        display: 'flex',
                        color: isError ? 'error.main' : 'text.secondary',
                    }}
                >
                    <Arrow fontSize="small" />
                </Box>
                <Typography
                    variant="subtitle2"
                    component="strong"
                    sx={{
                        fontFamily: 'monospace',
                        color: isError ? 'error.main' : undefined,
                    }}
                >
                    {observation.method}
                </Typography>
                {observation.event && (
                    <Chip size="small" label={observation.event} />
                )}
                {isError && <Chip size="small" color="error" label="error" />}
                <Typography
                    variant="caption"
                    color="textSecondary"
                    title={time.toISOString()}
                    sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
                >
                    {time.toLocaleString()}
                </Typography>
            </Box>
            {payload !== undefined && (
                <Box sx={{ pl: 3.5, pt: 0.5 }}>
                    <JsonValue value={payload} />
                </Box>
            )}
        </Box>
    )
}

export function JsonLogViewer({
    id,
    testId,
    observations,
}: {
    id: string
    testId: string
    observations: Observation[]
}) {
    return (
        <Box
            id={id}
            data-testid={testId}
            sx={{
                maxHeight: 500,
                overflow: 'auto',
                px: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.default',
            }}
        >
            {observations.map((observation, index) => (
                <ObservationEntry key={index} observation={observation} />
            ))}
        </Box>
    )
}
