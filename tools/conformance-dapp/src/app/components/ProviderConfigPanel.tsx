// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import NativeSelect from '@mui/material/NativeSelect'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import type React from 'react'
import type { Config } from '../../config.ts'
import { DownloadJsonButton } from './DownloadJsonButton.tsx'
import { FileUploadButton } from './FileUploadButton.tsx'

type NativeSelectInputProps = React.ComponentProps<
    typeof NativeSelect
>['inputProps']

/** Cast needed since `NativeSelectInputProps` has no override hook for arbitrary attributes, unlike Checkbox. */
function selectTestId(testId: string): NativeSelectInputProps {
    return { 'data-testid': testId } as NativeSelectInputProps
}

export function ProviderConfigPanel({
    running,
    current,
    updateConfig,
    onImportConfig,
}: {
    running: boolean
    current: Config | undefined
    updateConfig: (update: (config: Config) => Config) => void
    onImportConfig: (file: File) => Promise<void>
}) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Advanced automation config
            </AccordionSummary>
            <AccordionDetails
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <Typography variant="caption" color="textSecondary">
                    Controls how this tool finds a wallet ("Provider") and how
                    it detects wallet approval/rejection ("Wrapper"). Most runs
                    can leave these as their defaults — change them only to
                    automate this tool against a specific wallet or CI setup.
                </Typography>
                <FormControl disabled={running || !current}>
                    <InputLabel variant="standard" htmlFor="provider-select">
                        Provider
                    </InputLabel>
                    <NativeSelect
                        id="provider-select"
                        inputProps={selectTestId('provider-select')}
                        value={current?.provider.type ?? 'picker'}
                        onChange={(event) =>
                            updateConfig((config) => ({
                                ...config,
                                provider:
                                    event.target.value === 'picker'
                                        ? { type: 'picker' }
                                        : event.target.value === 'remote'
                                          ? {
                                                type: 'remote',
                                                url: 'http://localhost:3030/api/v0/dapp',
                                            }
                                          : {
                                                type: 'extension',
                                                target: 'your-announced-extension-id',
                                            },
                            }))
                        }
                    >
                        <option value="picker">Wallet picker</option>
                        <option value="remote">Remote wallet</option>
                        <option value="extension">Browser extension</option>
                    </NativeSelect>
                </FormControl>
                {current?.provider.type === 'remote' && (
                    <TextField
                        label="Gateway URL"
                        disabled={running}
                        value={current.provider.url}
                        slotProps={{
                            htmlInput: { 'data-testid': 'provider-url' },
                        }}
                        onChange={(event) =>
                            updateConfig((config) => ({
                                ...config,
                                provider: {
                                    ...(config.provider as typeof current.provider),
                                    url: event.target.value,
                                },
                            }))
                        }
                    />
                )}
                {current?.provider.type === 'extension' && (
                    <TextField
                        label="Extension target"
                        disabled={running}
                        value={current.provider.target}
                        slotProps={{
                            htmlInput: { 'data-testid': 'provider-target' },
                        }}
                        onChange={(event) =>
                            updateConfig((config) => ({
                                ...config,
                                provider: {
                                    ...(config.provider as typeof current.provider),
                                    target: event.target.value,
                                },
                            }))
                        }
                    />
                )}
                <FormControl disabled={running || !current}>
                    <InputLabel variant="standard" htmlFor="wrapper-select">
                        Wrapper
                    </InputLabel>
                    <NativeSelect
                        id="wrapper-select"
                        inputProps={selectTestId('wrapper-select')}
                        value={current?.wrapper.type ?? 'manual'}
                        onChange={(event) =>
                            updateConfig((config) => ({
                                ...config,
                                wrapper:
                                    event.target.value === 'webhook'
                                        ? {
                                              type: 'webhook',
                                              url: 'http://localhost:9000/interaction',
                                          }
                                        : event.target.value === 'window'
                                          ? { type: 'window' }
                                          : { type: 'manual' },
                            }))
                        }
                    >
                        <option value="manual">User interaction</option>
                        <option value="window">Window events</option>
                        <option value="webhook">Webhook</option>
                    </NativeSelect>
                </FormControl>
                {current?.wrapper.type === 'webhook' && (
                    <TextField
                        label="Webhook URL"
                        disabled={running}
                        value={current.wrapper.url}
                        slotProps={{
                            htmlInput: { 'data-testid': 'wrapper-url' },
                        }}
                        onChange={(event) =>
                            updateConfig((config) => ({
                                ...config,
                                wrapper: {
                                    ...(config.wrapper as typeof current.wrapper),
                                    url: event.target.value,
                                },
                            }))
                        }
                    />
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <FileUploadButton
                        accept=".json,application/json"
                        inputTestId="config-file"
                        data-testid="import-config"
                        disabled={running}
                        startIcon={<UploadFileIcon />}
                        onFileSelected={onImportConfig}
                    >
                        Import config
                    </FileUploadButton>
                    <DownloadJsonButton
                        data-testid="export-config"
                        disabled={running}
                        data={current}
                        filename="cip103-config.json"
                        startIcon={<DownloadIcon />}
                    >
                        Export config
                    </DownloadJsonButton>
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}
