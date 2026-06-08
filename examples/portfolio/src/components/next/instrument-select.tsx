// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
    Box,
    FormControl,
    FormHelperText,
    MenuItem,
    Select,
    Typography,
} from '@mui/material'
import Decimal from 'decimal.js'
import { useAggregatedHoldings } from '@hooks/useAggregatedHoldings'
import type { InstrumentId } from '@canton-network/core-token-standard'
import type { SelectableInstrument } from './transfer-types'

interface InstrumentSelectProps {
    partyId: string | undefined
    value: InstrumentId | null
    onChange: (instrument: SelectableInstrument | null) => void
    disabled?: boolean
    error?: boolean
    helperText?: string
}

const instrumentKey = (instrumentId: InstrumentId) =>
    `${instrumentId.admin}::${instrumentId.id}`

export const InstrumentSelect: React.FC<InstrumentSelectProps> = ({
    partyId,
    value,
    onChange,
    disabled = false,
    error = false,
    helperText,
}) => {
    const {
        instruments: aggregatedHoldings,
        isLoading,
        isError,
    } = useAggregatedHoldings(partyId)

    const selectableInstruments = useMemo(
        (): SelectableInstrument[] =>
            aggregatedHoldings.flatMap((holding) => {
                const instrument = holding.instrument
                if (!instrument) return []
                if (new Decimal(holding.availableAmount).lte(0)) return []

                return [
                    {
                        instrumentId: holding.instrumentId,
                        symbol: instrument.symbol,
                        name: instrument.name,
                        availableAmount: holding.availableAmount,
                        decimals: instrument.decimals,
                    },
                ]
            }),
        [aggregatedHoldings]
    )

    const selectedInstrument = useMemo(() => {
        if (!value) return null
        return (
            selectableInstruments.find(
                (instrument) =>
                    instrumentKey(instrument.instrumentId) ===
                    instrumentKey(value)
            ) ?? null
        )
    }, [selectableInstruments, value])

    const selectedKey = value ? instrumentKey(value) : ''
    const emptyMessage = isLoading
        ? 'Loading assets...'
        : isError
          ? 'Could not load assets'
          : 'No transferable balances available'
    const selectDisabled =
        disabled || isLoading || isError || selectableInstruments.length === 0

    const handleChange = (key: string) => {
        if (!key) {
            onChange(null)
            return
        }

        const selected = selectableInstruments.find(
            (instrument) => instrumentKey(instrument.instrumentId) === key
        )
        onChange(selected ?? null)
    }

    return (
        <FormControl fullWidth error={error} disabled={selectDisabled}>
            <Select
                displayEmpty
                value={selectedKey}
                onChange={(event) => handleChange(event.target.value)}
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(key) => {
                    if (!key) {
                        return (
                            <Typography sx={{ color: 'text.disabled' }}>
                                {selectableInstruments.length > 0
                                    ? 'Select an asset'
                                    : emptyMessage}
                            </Typography>
                        )
                    }

                    return (
                        <Typography sx={{ color: 'text.primary' }}>
                            {selectedInstrument?.name ??
                                selectedInstrument?.symbol ??
                                'Selected asset'}
                        </Typography>
                    )
                }}
                MenuProps={{
                    slotProps: {
                        paper: {
                            sx: {
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                backgroundImage: 'none',
                            },
                        },
                    },
                }}
                sx={{
                    minHeight: 48,
                    bgcolor: (theme) => theme.portfolio.surface.required,
                    color: 'text.primary',
                    borderRadius: 1,
                    '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 'auto',
                        px: 2.5,
                        py: 1.25,
                    },
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': (theme) => ({
                        border: `1px solid ${theme.palette.secondary.main}`,
                    }),
                    '& .MuiSelect-icon': {
                        color: 'text.primary',
                        right: 20,
                    },
                    '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground',
                    },
                }}
            >
                <MenuItem value="">
                    <em>
                        {selectableInstruments.length > 0
                            ? 'Select an asset'
                            : emptyMessage}
                    </em>
                </MenuItem>
                {selectableInstruments.map((instrument) => {
                    const key = instrumentKey(instrument.instrumentId)
                    return (
                        <MenuItem key={key} value={key}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography>{instrument.name}</Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block' }}
                                    >
                                        {instrument.symbol}
                                    </Typography>
                                </Box>
                                <Typography color="text.secondary">
                                    {instrument.availableAmount}{' '}
                                    {instrument.symbol}
                                </Typography>
                            </Box>
                        </MenuItem>
                    )
                })}
            </Select>
            {helperText && (
                <FormHelperText
                    sx={{
                        ml: 0,
                        mt: 1,
                        color: error ? 'error.main' : 'text.secondary',
                    }}
                >
                    {helperText}
                </FormHelperText>
            )}
        </FormControl>
    )
}
