// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormHelperText,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material'
import { useForm } from '@tanstack/react-form'
import type { AssetBody } from '@canton-network/wallet-sdk'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRegistryUrls } from '@hooks/useRegistryUrls'
import { useInstruments } from '@hooks/useInstruments'
import { useWalletSdk } from '@hooks/useWalletSdk'
import { usePrimaryAccount } from '@hooks/useAccounts'
import { useCreatePreapprovalContracts } from '@hooks/useCreatePreapprovalContracts'

type PreapprovalFormData = {
    registryUrl: string
    operatorParty: string
    selectedAssetKeys: string[]
}

const registryUrlValidator = z.string().min(1, 'Select a registry')
const operatorPartyValidator = z
    .string()
    .trim()
    .min(1, 'Operator party is required')
const selectedAssetsValidator = z
    .array(z.string())
    .min(1, 'Select at least one asset')

const getAssetKey = (asset: AssetBody) =>
    `${asset.admin}::${asset.id}::${asset.registryUrl.toString()}`

const formatRegistryOption = (partyId: string, registryUrl: string) =>
    `${partyId} — ${registryUrl}`

export function PreapprovalContractSettings() {
    const registryUrls = useRegistryUrls()
    const instruments = useInstruments()
    const primaryParty = usePrimaryAccount()?.partyId
    const {
        sdk,
        isLoading: isWalletSdkLoading,
        error: walletSdkError,
        refresh,
    } = useWalletSdk()

    const createPreapprovalContractsMutation = useCreatePreapprovalContracts()

    const [fetchedAssets, setFetchedAssets] = useState<AssetBody[]>([])
    const [hasFetchedAssets, setHasFetchedAssets] = useState(false)

    const registryOptions = useMemo(
        () => Array.from(registryUrls.entries()),
        [registryUrls]
    )
    const form = useForm({
        defaultValues: {
            registryUrl: '',
            operatorParty: '',
            selectedAssetKeys: [],
        } as PreapprovalFormData,
        onSubmit: async ({ value: formData }) => {
            if (!primaryParty) {
                toast.error('Primary party is unavailable')
                return
            }

            if (!sdk) {
                toast.error('Wallet SDK is not ready')
                return
            }

            const selectedAssets = fetchedAssets.filter((asset) =>
                formData.selectedAssetKeys.includes(getAssetKey(asset))
            )

            await createPreapprovalContractsMutation.mutateAsync({
                receiver: primaryParty,
                operator: formData.operatorParty.trim(),
                instrumentAdmin: selectedAssets[0].admin,
                assets: selectedAssets,
            })
            toast.success('Preapproval contract created')
        },
    })

    const handleFetchAssets = () => {
        const registryUrl = form.getFieldValue('registryUrl')

        if (!sdk) {
            toast.error('Wallet SDK is not ready')
            return
        }

        const normalizedRegistryUrl = new URL(registryUrl).toString()
        const registryEntry = registryOptions.find(
            ([, url]) => new URL(url).toString() === normalizedRegistryUrl
        )
        const assets: AssetBody[] = registryEntry
            ? (instruments.get(registryEntry[0]) ?? []).map((instrument) => ({
                  id: instrument.id,
                  displayName: instrument.name,
                  symbol: instrument.symbol,
                  registryUrl: new URL(registryEntry[1]),
                  admin: registryEntry[0],
              }))
            : []
        setFetchedAssets(assets)
        setHasFetchedAssets(true)
        form.setFieldValue('selectedAssetKeys', [])
        toast.success(
            assets.length > 0
                ? `Fetched ${assets.length} asset${assets.length === 1 ? '' : 's'}`
                : 'No assets found for this registry'
        )
    }

    const handleToggleAll = (selectedAssetKeys: string[]) => {
        const allSelected =
            fetchedAssets.length > 0 &&
            fetchedAssets.every((asset) =>
                selectedAssetKeys.includes(getAssetKey(asset))
            )

        form.setFieldValue(
            'selectedAssetKeys',
            allSelected ? [] : fetchedAssets.map(getAssetKey)
        )
    }

    const noRegistries = registryOptions.length === 0
    const fetchDisabled = noRegistries || !sdk || isWalletSdkLoading

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                    Preapproval Contracts
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Create preapproval contracts for selected assets from a
                    configured registry.
                </Typography>

                {!primaryParty && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Connect a wallet to create preapproval contracts.
                    </Alert>
                )}
                {isWalletSdkLoading && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Preparing wallet SDK…
                    </Alert>
                )}
                {walletSdkError && (
                    <Alert
                        severity="error"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={refresh}
                            >
                                Retry
                            </Button>
                        }
                        sx={{ mb: 2 }}
                    >
                        Wallet SDK failed to initialize: {walletSdkError}
                    </Alert>
                )}
                {noRegistries && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Add a registry above before creating preapproval
                        contracts.
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <form.Field
                                name="registryUrl"
                                validators={{
                                    onChange: registryUrlValidator,
                                    onSubmit: registryUrlValidator,
                                }}
                            >
                                {(field) => (
                                    <FormControl
                                        fullWidth
                                        size="small"
                                        error={
                                            field.state.meta.isTouched &&
                                            field.state.meta.errors.length > 0
                                        }
                                        disabled={noRegistries}
                                    >
                                        <InputLabel id="preapproval-registry-label">
                                            Registry
                                        </InputLabel>
                                        <Select
                                            labelId="preapproval-registry-label"
                                            label="Registry"
                                            value={field.state.value}
                                            onChange={(event) => {
                                                field.handleChange(
                                                    event.target.value
                                                )
                                                setFetchedAssets([])
                                                setHasFetchedAssets(false)
                                                form.setFieldValue(
                                                    'selectedAssetKeys',
                                                    []
                                                )
                                            }}
                                            onBlur={field.handleBlur}
                                        >
                                            {registryOptions.map(
                                                ([partyId, registryUrl]) => (
                                                    <MenuItem
                                                        key={partyId}
                                                        value={registryUrl}
                                                    >
                                                        {formatRegistryOption(
                                                            partyId,
                                                            registryUrl
                                                        )}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                        <FormHelperText>
                                            {field.state.meta.isTouched &&
                                            field.state.meta.errors.length > 0
                                                ? field.state.meta.errors[0]
                                                      ?.message
                                                : noRegistries
                                                  ? 'No registries configured'
                                                  : ''}
                                        </FormHelperText>
                                    </FormControl>
                                )}
                            </form.Field>

                            <form.Field
                                name="operatorParty"
                                validators={{
                                    onChange: operatorPartyValidator,
                                    onSubmit: operatorPartyValidator,
                                }}
                            >
                                {(field) => (
                                    <TextField
                                        label="Operator Party"
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(
                                                event.target.value
                                            )
                                        }
                                        onBlur={field.handleBlur}
                                        error={
                                            field.state.meta.isTouched &&
                                            field.state.meta.errors.length > 0
                                        }
                                        helperText={
                                            field.state.meta.isTouched &&
                                            field.state.meta.errors.length > 0
                                                ? field.state.meta.errors[0]
                                                      ?.message
                                                : ''
                                        }
                                        fullWidth
                                        size="small"
                                    />
                                )}
                            </form.Field>

                            <Button
                                type="button"
                                variant="contained"
                                onClick={handleFetchAssets}
                                disabled={fetchDisabled}
                                sx={{
                                    alignSelf: 'flex-start',
                                    minWidth: 160,
                                    minHeight: 40,
                                }}
                            >
                                {isWalletSdkLoading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    'Fetch assets'
                                )}
                            </Button>
                        </Box>

                        {hasFetchedAssets && (
                            <>
                                <Divider />
                                <form.Field
                                    name="selectedAssetKeys"
                                    validators={{
                                        onChange: selectedAssetsValidator,
                                        onSubmit: selectedAssetsValidator,
                                    }}
                                >
                                    {(field) => {
                                        const selectedAssetKeys =
                                            field.state.value
                                        const selectedCount =
                                            selectedAssetKeys.length
                                        const allSelected =
                                            fetchedAssets.length > 0 &&
                                            fetchedAssets.every((asset) =>
                                                selectedAssetKeys.includes(
                                                    getAssetKey(asset)
                                                )
                                            )

                                        return (
                                            <Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        mb: 1,
                                                    }}
                                                >
                                                    <Typography variant="subtitle1">
                                                        Assets
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: 2,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {selectedCount} of{' '}
                                                            {
                                                                fetchedAssets.length
                                                            }{' '}
                                                            selected
                                                        </Typography>
                                                        <Button
                                                            type="button"
                                                            size="small"
                                                            onClick={() =>
                                                                handleToggleAll(
                                                                    selectedAssetKeys
                                                                )
                                                            }
                                                            disabled={
                                                                fetchedAssets.length ===
                                                                0
                                                            }
                                                        >
                                                            {allSelected
                                                                ? 'Clear all'
                                                                : 'Toggle all'}
                                                        </Button>
                                                    </Box>
                                                </Box>

                                                {fetchedAssets.length > 0 ? (
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            maxHeight: 320,
                                                            overflow: 'auto',
                                                        }}
                                                    >
                                                        <List disablePadding>
                                                            {fetchedAssets.map(
                                                                (asset) => {
                                                                    const key =
                                                                        getAssetKey(
                                                                            asset
                                                                        )
                                                                    const checked =
                                                                        selectedAssetKeys.includes(
                                                                            key
                                                                        )

                                                                    return (
                                                                        <ListItem
                                                                            key={
                                                                                key
                                                                            }
                                                                            disablePadding
                                                                        >
                                                                            <ListItemButton
                                                                                onClick={() => {
                                                                                    field.handleChange(
                                                                                        checked
                                                                                            ? selectedAssetKeys.filter(
                                                                                                  (
                                                                                                      value
                                                                                                  ) =>
                                                                                                      value !==
                                                                                                      key
                                                                                              )
                                                                                            : [
                                                                                                  ...selectedAssetKeys,
                                                                                                  key,
                                                                                              ]
                                                                                    )
                                                                                }}
                                                                            >
                                                                                <ListItemIcon>
                                                                                    <Checkbox
                                                                                        edge="start"
                                                                                        checked={
                                                                                            checked
                                                                                        }
                                                                                        tabIndex={
                                                                                            -1
                                                                                        }
                                                                                        disableRipple
                                                                                    />
                                                                                </ListItemIcon>
                                                                                <ListItemText
                                                                                    primary={
                                                                                        asset.symbol
                                                                                    }
                                                                                    secondary={`${asset.displayName} · ${asset.id} · ${asset.admin}`}
                                                                                />
                                                                            </ListItemButton>
                                                                        </ListItem>
                                                                    )
                                                                }
                                                            )}
                                                        </List>
                                                    </Paper>
                                                ) : (
                                                    <Alert severity="info">
                                                        No assets found for this
                                                        registry.
                                                    </Alert>
                                                )}

                                                {field.state.meta.isTouched &&
                                                    field.state.meta.errors
                                                        .length > 0 && (
                                                        <FormHelperText error>
                                                            {
                                                                field.state.meta
                                                                    .errors[0]
                                                                    ?.message
                                                            }
                                                        </FormHelperText>
                                                    )}
                                            </Box>
                                        )
                                    }}
                                </form.Field>
                            </>
                        )}

                        <form.Subscribe
                            selector={(state) => ({
                                canSubmit: state.canSubmit,
                                isSubmitting: state.isSubmitting,
                                values: state.values,
                            })}
                        >
                            {({ canSubmit, isSubmitting, values }) => {
                                const isCreating =
                                    isSubmitting ||
                                    createPreapprovalContractsMutation.isPending
                                const createDisabled =
                                    !canSubmit ||
                                    isCreating ||
                                    !primaryParty ||
                                    !sdk ||
                                    isWalletSdkLoading ||
                                    values.selectedAssetKeys.length === 0

                                return hasFetchedAssets ? (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={createDisabled}
                                        sx={{
                                            alignSelf: 'flex-start',
                                            minWidth: 160,
                                        }}
                                    >
                                        {isCreating ? 'Creating...' : 'Create'}
                                    </Button>
                                ) : null
                            }}
                        </form.Subscribe>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
