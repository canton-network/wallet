// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react'
import { z } from 'zod'
import Box from '@mui/material/Box'
import { ConfigSchema, type Config } from '../../config.ts'
import { TestSelectionPanel } from './TestSelectionPanel.tsx'
import { ProviderConfigPanel } from './ProviderConfigPanel.tsx'
import { SigningKeyPanel } from './SigningKeyPanel.tsx'

export function ConfigurationPanel({
    configText,
    setConfigText,
    setError,
    running,
    runDisabled,
    onRun,
    onCancel,
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
    onRun: (only?: string[]) => void
    onCancel: () => void
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

    async function importConfig(file: File) {
        const config = ConfigSchema.safeParse(JSON.parse(await file.text()))
        if (config.success) {
            setConfigText(JSON.stringify(config.data, null, 2))
            setError('')
        } else {
            setError(z.prettifyError(config.error))
        }
    }

    return (
        <Box
            component="section"
            aria-label="Configuration"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                pr: 2,
                borderRight: 1,
                borderColor: 'divider',
            }}
        >
            <TestSelectionPanel
                running={running}
                current={current}
                runDisabled={runDisabled}
                onRun={onRun}
                onCancel={onCancel}
                toggleTest={toggleTest}
                toggleGroup={toggleGroup}
            />
            <ProviderConfigPanel
                running={running}
                current={current}
                updateConfig={updateConfig}
                onImportConfig={importConfig}
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
