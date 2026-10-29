// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { CopyIconButton } from '@components/ui/CopyIconButton'
import { normalizeSx } from '@components/ui/utils'
import { formatCharacterCount } from '@components/utils'

interface DescriptionMetaProps {
    value: string
    sx?: SxProps<Theme>
}

export function DescriptionMeta({ value, sx }: DescriptionMetaProps) {
    return (
        <Box
            sx={[
                { display: 'flex', alignItems: 'center', gap: 0.5 },
                ...normalizeSx(sx),
            ]}
        >
            <Typography
                variant="body2"
                component="span"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap' }}
            >
                {formatCharacterCount(value)}
            </Typography>
            <CopyIconButton
                value={value}
                label="Copy description"
                sx={{ flexShrink: 0, p: 0.5 }}
            />
        </Box>
    )
}

interface DescriptionTextProps {
    value: string
    maxHeight?: number
}

export function DescriptionText({
    value,
    maxHeight = 200,
}: DescriptionTextProps) {
    if (!value) {
        return <Typography color="text.secondary">—</Typography>
    }

    return (
        <Box
            sx={{
                minWidth: 0,
                maxWidth: '100%',
                ml: 'auto',
                display: 'grid',
                justifyItems: 'end',
                gap: 0.5,
            }}
        >
            <Typography
                role="region"
                aria-label="Description"
                tabIndex={0}
                sx={{
                    maxWidth: '100%',
                    maxHeight,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                }}
            >
                {value}
            </Typography>
            <DescriptionMeta value={value} />
        </Box>
    )
}
