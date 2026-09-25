// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import { ConfigSchema, type Config } from '../../config.ts'
import { FileUploadButton } from './FileUploadButton.tsx'
import { DownloadJsonButton } from './DownloadJsonButton.tsx'
import { TestSelectionPanel } from './TestSelectionPanel.tsx'
import { ProviderConfigPanel } from './ProviderConfigPanel.tsx'
import { SigningKeyPanel } from './SigningKeyPanel.tsx'

export function ConfigurationPanel({
    configText,
    setConfigText,
    setError,
    running,
    runDisabled,
    onRunOnly,
    current,
    privateKey,
    onImportKey,
    onClearKey,
}: {
    configText: string
    setConfigText: Dispatch<SetStateAction<string>>
    setError: Dispatch<SetStateAction<string>>
    running: boolean
    runDisabled: boolean
    onRunOnly: (ids: string[]) => void
    current: Config | undefined
    privateKey: string
    onImportKey: (file: File) => Promise<void>
    onClearKey: () => void
}) {
    function updateConfig(update: (config: Config) => Config) {
        const config = ConfigSchema.safeParse(JSON.parse(configText))
        if (config.success) {
            setConfigText(JSON.stringify(update(config.data), null, 2))
            setError('')
        } else {
            setError(z.prettifyError(config.error))
        }
    }

    function toggleTest(id: string, enabled: boolean) {
        updateConfig((config) => ({
            ...config,
            disabledTests: enabled
                ? config.disabledTests.filter((testId) => testId !== id)
                : [...config.disabledTests, id],
        }))
    }

    function toggleGroup(ids: string[], enabled: boolean) {
        updateConfig((config) => ({
            ...config,
            disabledTests: enabled
                ? config.disabledTests.filter((testId) => !ids.includes(testId))
                : [
                      ...config.disabledTests,
                      ...ids.filter((id) => !config.disabledTests.includes(id)),
                  ],
        }))
    }

    return (
        <Box
            component="section"
            aria-labelledby="configuration-title"
            sx={{ pr: 3, borderRight: 1, borderColor: 'divider' }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    mb: 2.75,
                }}
            >
                <Typography
                    variant="h6"
                    component="h2"
                    id="configuration-title"
                >
                    Configuration
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <FileUploadButton
                        accept=".json,application/json"
                        inputTestId="config-file"
                        title="Import configuration"
                        data-testid="import-config"
                        disabled={running}
                        sx={{ minWidth: 0, px: 1.25 }}
                        onFileSelected={async (file) => {
                            const config = ConfigSchema.safeParse(
                                JSON.parse(await file.text())
                            )
                            if (config.success) {
                                setConfigText(
                                    JSON.stringify(config.data, null, 2)
                                )
                                setError('')
                            } else {
                                setError(z.prettifyError(config.error))
                            }
                        }}
                    >
                        <UploadFileIcon fontSize="small" />
                    </FileUploadButton>
                    <DownloadJsonButton
                        title="Export configuration"
                        data-testid="export-config"
                        disabled={running}
                        data={current}
                        filename="cip103-config.json"
                        sx={{ minWidth: 0, px: 1.25 }}
                    >
                        <DownloadIcon fontSize="small" />
                    </DownloadJsonButton>
                </Box>
            </Box>
            <TestSelectionPanel
                running={running}
                current={current}
                runDisabled={runDisabled}
                onRunOnly={onRunOnly}
                toggleTest={toggleTest}
                toggleGroup={toggleGroup}
            />
            <ProviderConfigPanel
                running={running}
                current={current}
                updateConfig={updateConfig}
            />
            <SigningKeyPanel
                running={running}
                privateKey={privateKey}
                onImportKey={onImportKey}
                onClearKey={onClearKey}
            />
        </Box>
    )
}
