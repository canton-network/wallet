// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, FormControlLabel, Switch } from '@mui/material'

interface OfferToolbarProps {
    showExpiredOffers: boolean
    onShowExpiredOffersChange: (value: boolean) => void
}

export function OfferToolbar({
    showExpiredOffers,
    onShowExpiredOffersChange,
}: OfferToolbarProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                gap: 3,
                pb: { xs: 2, md: 1 },
                flexWrap: 'wrap',
            }}
        >
            <FormControlLabel
                control={
                    <Switch
                        checked={showExpiredOffers}
                        onChange={(event) =>
                            onShowExpiredOffersChange(event.target.checked)
                        }
                        slotProps={{
                            input: { 'aria-label': 'Show expired offers' },
                        }}
                        sx={{
                            width: 34,
                            height: 18,
                            p: 0,
                            '& .MuiSwitch-switchBase': {
                                p: 0.25,
                                '&.Mui-checked': {
                                    transform: 'translateX(16px)',
                                    color: 'text.primary',
                                    '& + .MuiSwitch-track': {
                                        bgcolor: 'secondary.main',
                                        opacity: 1,
                                    },
                                },
                                '&.Mui-focusVisible .MuiSwitch-thumb': {
                                    outline: (theme) =>
                                        `2px solid ${theme.palette.secondary.main}`,
                                    outlineOffset: 2,
                                },
                            },
                            '& .MuiSwitch-thumb': {
                                width: 14,
                                height: 14,
                                bgcolor: 'text.primary',
                                boxShadow: 'none',
                            },
                            '& .MuiSwitch-track': {
                                borderRadius: 999,
                                bgcolor: 'action.disabledBackground',
                                opacity: 1,
                            },
                        }}
                    />
                }
                label="Show expired offers"
                sx={{
                    m: 0,
                    color: 'text.primary',
                    gap: 0.75,
                    '& .MuiFormControlLabel-label': {
                        typography: 'body1',
                    },
                }}
            />
        </Box>
    )
}
