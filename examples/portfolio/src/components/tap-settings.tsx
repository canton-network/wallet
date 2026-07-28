// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography, Button, TextField, Paper } from '@mui/material'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { useConnection } from '../contexts/ConnectionContext'
import { usePrimaryAccount } from '@hooks/useAccounts'
import { useWalletSdk } from '@hooks/useWalletSdk'
import { submitViaProvider } from '@lib/submit'

export const TapSettings: React.FC = () => {
    const sessionToken = useConnection().status?.session?.accessToken
    const primaryParty = usePrimaryAccount()?.partyId
    const { sdk } = useWalletSdk()

    const form = useForm({
        defaultValues: {
            amount: '10000',
        },

        onSubmit: async ({ value: formData }) => {
            if (!sessionToken || !primaryParty || !sdk) {
                return
            }

            try {
                await submitViaProvider(
                    await sdk.amulet.tap(primaryParty, formData.amount),
                    primaryParty
                )
                toast.success('Tap successful')
            } catch (error) {
                toast.error(
                    `Tap failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
            }
        },
    })

    const amountValidator = z
        .string()
        .min(1, 'Amount is required')
        .refine((val) => {
            const num = Number(val)
            return !isNaN(num) && num > 0
        }, 'Amount must be a positive number')

    return (
        <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                DevNet Tap
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                For testing purposes (DevNet only)
            </Typography>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField label="Instrument" value="Amulet" disabled />

                    <form.Field
                        name="amount"
                        validators={{
                            onChange: amountValidator,
                        }}
                    >
                        {(field) => (
                            <TextField
                                label="Amount"
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                error={
                                    field.state.meta.isTouched &&
                                    field.state.meta.errors.length > 0
                                }
                                helperText={
                                    field.state.meta.isTouched &&
                                    field.state.meta.errors.length > 0
                                        ? field.state.meta.errors[0]?.message
                                        : ''
                                }
                                fullWidth
                            />
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => ({
                            canSubmit: state.canSubmit,
                        })}
                    >
                        {({ canSubmit }) => (
                            <Button
                                type="submit"
                                disabled={
                                    !canSubmit ||
                                    !sessionToken ||
                                    !primaryParty ||
                                    !sdk
                                }
                                variant="contained"
                                sx={{ width: 200 }}
                            >
                                TAP
                            </Button>
                        )}
                    </form.Subscribe>
                </Box>
            </form>
        </Paper>
    )
}
