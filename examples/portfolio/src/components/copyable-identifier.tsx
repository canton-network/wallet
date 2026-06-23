import React from 'react'
import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { normalizeSx } from '@components/ui/utils'
import { CopyIconButton } from './ui/CopyIconButton'

interface CopyableIdentifierProps {
    value: string
    maxLength?: number
    sx?: SxProps<Theme>
}

export const CopyableIdentifier: React.FC<CopyableIdentifierProps> = ({
    value,
    maxLength = 8,
    sx,
}) => {
    const truncate = (str: string, len: number) => {
        if (str.length <= len) {
            return str
        }
        return `${str.slice(0, len)}...`
    }

    const formatPartyId = (val: string) => {
        const parts = val.split('::')
        const prefix = parts[0] || ''
        const suffix = parts[1] || ''
        return `${truncate(prefix, maxLength)}::${truncate(suffix, maxLength)}`
    }

    const getDisplayValue = () => {
        if (value.includes('::')) {
            return formatPartyId(value)
        }
        return truncate(value, maxLength)
    }

    const displayValue = getDisplayValue()

    return (
        <Box
            sx={[
                {
                    minWidth: 0,
                    maxWidth: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                },
                ...normalizeSx(sx),
            ]}
        >
            <Typography
                variant="body2"
                component="span"
                sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {displayValue}
            </Typography>
            <CopyIconButton value={value} sx={{ flexShrink: 0, p: 0.5 }} />
        </Box>
    )
}
