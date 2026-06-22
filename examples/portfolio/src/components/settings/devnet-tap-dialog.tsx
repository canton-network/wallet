// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
    Box,
    CircularProgress,
    Dialog,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material'
import { useForm, type AnyFieldApi } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { type InstrumentId } from '@canton-network/core-token-standard'
import { CopyableIdentifier } from '@components/copyable-identifier'
import { PillButton } from '@components/ui/PillButton'
import { useConnection } from '@contexts/ConnectionContext'
import { usePortfolio } from '@contexts/PortfolioContext'
import { usePortfolioConfig } from '@contexts/PortfolioConfigContext'
import { usePrimaryAccount } from '@hooks/useAccounts'
import { useInstruments } from '@hooks/useInstruments'
import { useRegistryUrls } from '@hooks/useRegistryUrls'

interface DevNetTapDialogProps {
    open: boolean
    onClose: () => void
}

interface TapInstrumentOption {
    instrumentId: InstrumentId
    name: string
    symbol: string
}

const instrumentValidator = z
    .object({
        admin: z.string(),
        id: z.string(),
    })
    .nullable()
    .refine((value) => value !== null, 'Select an instrument')

const amountValidator = z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => {
        return Number(value) > 0
    }, 'Amount must be a positive number')

const instrumentKey = (instrumentId: InstrumentId) =>
    `${instrumentId.admin}::${instrumentId.id}`

const findInstrumentByKey = (
    instruments: TapInstrumentOption[],
    key: string
): TapInstrumentOption | undefined =>
    instruments.find(
        (instrument) => instrumentKey(instrument.instrumentId) === key
    )

const defaultValues = {
    instrumentId: null as InstrumentId | null,
    amount: '100',
}

export function DevNetTapDialog({ open, onClose }: DevNetTapDialogProps) {
    const sessionToken = useConnection().status?.session?.accessToken
    const primaryParty = usePrimaryAccount()?.partyId
    const { tap } = usePortfolio()
    const {
        amulet: { validatorUrl },
    } = usePortfolioConfig()
    const registryUrls = useRegistryUrls()
    const instruments = useInstruments()

    const availableInstruments = useMemo(() => {
        const result: TapInstrumentOption[] = []
        for (const [admin, adminInstruments] of instruments) {
            for (const instrument of adminInstruments) {
                result.push({
                    instrumentId: { admin, id: instrument.id },
                    name: instrument.name ?? instrument.symbol,
                    symbol: instrument.symbol,
                })
            }
        }

        return result.sort((left, right) => left.name.localeCompare(right.name))
    }, [instruments])

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value: formData }) => {
            if (!sessionToken) {
                toast.error('Wallet session is unavailable')
                return
            }
            if (!primaryParty) {
                toast.error('Primary wallet is unavailable')
                return
            }
            if (!formData.instrumentId) {
                toast.error('Select an instrument')
                return
            }

            try {
                await tap({
                    registryUrls,
                    party: primaryParty,
                    sessionToken,
                    validatorUrl,
                    instrumentId: formData.instrumentId,
                    amount: Number(formData.amount),
                })
                toast.success('Tap successful')
            } catch (error) {
                toast.error(
                    `Tap failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
            }
        },
    })

    const disabled = !sessionToken || !primaryParty

    const handleClose = () => {
        if (!form.state.isSubmitting) {
            onClose()
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: 'min(100%, 640px)',
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 1,
                        boxShadow: 24,
                        color: 'text.primary',
                    },
                },
                backdrop: {
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.64)',
                        backdropFilter: 'blur(2px)',
                    },
                },
            }}
        >
            <Box
                component="form"
                onSubmit={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    form.handleSubmit()
                }}
                sx={{ px: 3, pt: 3, pb: 3 }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 3,
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" component="h2">
                        DevNet tap
                    </Typography>
                    <IconButton
                        aria-label="Close DevNet tap dialog"
                        onClick={handleClose}
                        disabled={form.state.isSubmitting}
                        sx={{
                            color: 'secondary.main',
                            mt: 0.25,
                            '&:active': { transform: 'scale(0.97)' },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ display: 'grid', gap: 3 }}>
                    <FieldBlock label="Wallet address">
                        {primaryParty ? (
                            <CopyableIdentifier
                                value={primaryParty}
                                maxLength={36}
                            />
                        ) : (
                            <Typography color="text.secondary">
                                No primary wallet connected
                            </Typography>
                        )}
                    </FieldBlock>

                    <form.Field
                        name="instrumentId"
                        validators={{
                            onChange: instrumentValidator,
                            onSubmit: instrumentValidator,
                        }}
                    >
                        {(field) => {
                            const selectedKey = field.state.value
                                ? instrumentKey(field.state.value)
                                : ''
                            const selectDisabled =
                                disabled || availableInstruments.length === 0

                            return (
                                <FieldBlock label="Select instrument">
                                    <FormControl
                                        fullWidth
                                        error={hasFieldError(field)}
                                        disabled={selectDisabled}
                                    >
                                        <Select
                                            displayEmpty
                                            value={selectedKey}
                                            onChange={(event) => {
                                                const selected =
                                                    findInstrumentByKey(
                                                        availableInstruments,
                                                        event.target.value
                                                    )
                                                field.handleChange(
                                                    selected?.instrumentId ??
                                                        null
                                                )
                                            }}
                                            onBlur={field.handleBlur}
                                            IconComponent={
                                                KeyboardArrowDownIcon
                                            }
                                            renderValue={(key) => {
                                                if (!key) {
                                                    return (
                                                        <Typography
                                                            sx={{
                                                                color: 'text.disabled',
                                                            }}
                                                        >
                                                            {availableInstruments.length >
                                                            0
                                                                ? 'Select an instrument'
                                                                : 'No instruments available'}
                                                        </Typography>
                                                    )
                                                }

                                                const selected =
                                                    findInstrumentByKey(
                                                        availableInstruments,
                                                        key
                                                    )
                                                return selected?.name ?? key
                                            }}
                                            MenuProps={{
                                                slotProps: {
                                                    paper: {
                                                        sx: {
                                                            bgcolor:
                                                                'background.paper',
                                                            color: 'text.primary',
                                                            backgroundImage:
                                                                'none',
                                                        },
                                                    },
                                                },
                                            }}
                                            sx={selectSx}
                                        >
                                            {availableInstruments.map(
                                                (instrument) => {
                                                    const key = instrumentKey(
                                                        instrument.instrumentId
                                                    )
                                                    return (
                                                        <MenuItem
                                                            key={key}
                                                            value={key}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    minWidth: 0,
                                                                }}
                                                            >
                                                                <Typography>
                                                                    {
                                                                        instrument.name
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        display:
                                                                            'block',
                                                                    }}
                                                                >
                                                                    {
                                                                        instrument.symbol
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        </MenuItem>
                                                    )
                                                }
                                            )}
                                        </Select>
                                        <FormHelperText
                                            sx={{
                                                ml: 0,
                                                mt: 1,
                                                color: hasFieldError(field)
                                                    ? 'error.main'
                                                    : 'text.secondary',
                                            }}
                                        >
                                            {hasFieldError(field)
                                                ? getFieldError(field)
                                                : availableInstruments.length ===
                                                    0
                                                  ? 'Add a registry with instruments before tapping.'
                                                  : ''}
                                        </FormHelperText>
                                    </FormControl>
                                </FieldBlock>
                            )
                        }}
                    </form.Field>

                    <form.Field
                        name="amount"
                        validators={{
                            onChange: amountValidator,
                            onSubmit: amountValidator,
                        }}
                    >
                        {(field) => (
                            <FieldBlock label="Amount">
                                <TextField
                                    type="number"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={disabled}
                                    error={hasFieldError(field)}
                                    helperText={
                                        hasFieldError(field)
                                            ? getFieldError(field)
                                            : undefined
                                    }
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <form.Subscribe
                                                    selector={(state) =>
                                                        state.values
                                                            .instrumentId
                                                    }
                                                >
                                                    {(instrumentId) => {
                                                        const selected =
                                                            instrumentId
                                                                ? findInstrumentByKey(
                                                                      availableInstruments,
                                                                      instrumentKey(
                                                                          instrumentId
                                                                      )
                                                                  )
                                                                : undefined
                                                        return selected ? (
                                                            <InputAdornment position="end">
                                                                {
                                                                    selected.symbol
                                                                }
                                                            </InputAdornment>
                                                        ) : null
                                                    }}
                                                </form.Subscribe>
                                            ),
                                        },
                                    }}
                                    sx={textFieldSx}
                                />
                            </FieldBlock>
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => ({
                            canSubmit: state.canSubmit,
                            isSubmitting: state.isSubmitting,
                        })}
                    >
                        {({ canSubmit, isSubmitting }) => (
                            <PillButton
                                type="submit"
                                fullWidth
                                disabled={
                                    !canSubmit ||
                                    isSubmitting ||
                                    disabled ||
                                    availableInstruments.length === 0
                                }
                                sx={{ mt: 0.5, minHeight: 48 }}
                            >
                                {isSubmitting ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    'Tap'
                                )}
                            </PillButton>
                        )}
                    </form.Subscribe>
                </Box>
            </Box>
        </Dialog>
    )
}

interface FieldBlockProps {
    label: string
    children: React.ReactNode
}

const FieldBlock: React.FC<FieldBlockProps> = ({ label, children }) => (
    <Box>
        <Typography
            sx={{
                mb: 0.75,
                color: 'text.primary',
                fontWeight: 800,
                textTransform: 'uppercase',
            }}
        >
            {label}
        </Typography>
        {children}
    </Box>
)

const controlBaseSx: SxProps<Theme> = {
    minHeight: 48,
    bgcolor: (theme) => theme.portfolio.surface.required,
    color: 'text.primary',
    borderRadius: 1,
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': (theme) => ({
        border: `1px solid ${theme.palette.secondary.main}`,
    }),
    '&.Mui-disabled': {
        bgcolor: 'action.disabledBackground',
    },
}

const selectSx: SxProps<Theme> = {
    ...controlBaseSx,
    '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        minHeight: 'auto',
        px: 2.5,
        py: 1.25,
    },
    '& .MuiSelect-icon': {
        color: 'text.primary',
        right: 20,
    },
}

const textFieldSx: SxProps<Theme> = {
    '& .MuiInputBase-root': controlBaseSx,
    '& .MuiInputBase-input': {
        px: 2.5,
        py: 1.25,
        '&::placeholder': {
            color: 'text.disabled',
            opacity: 1,
        },
    },
    '& .MuiInputAdornment-root .MuiTypography-root': {
        color: 'text.primary',
    },
    '& .MuiFormHelperText-root': {
        ml: 0,
        mt: 1,
        color: 'text.secondary',
        fontSize: 14,
    },
}

const hasFieldError = (field: AnyFieldApi) =>
    field.state.meta.isTouched && field.state.meta.errors.length > 0

const getFieldError = (field: AnyFieldApi) => {
    if (!hasFieldError(field)) return undefined
    return String(field.state.meta.errors[0].message)
}
