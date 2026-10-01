// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type React from 'react'
import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'

function triggerDownload(filename: string, data: unknown) {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    const url = URL.createObjectURL(
        new Blob([text], { type: 'application/json' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

interface DownloadJsonButtonProps {
    data: string | Record<string, unknown> | undefined
    filename: string
    children: React.ReactNode
    disabled?: boolean
    startIcon?: React.ReactNode
    sx?: SxProps<Theme>
    title?: string
    'data-testid'?: string
}

export const DownloadJsonButton: React.FC<DownloadJsonButtonProps> = ({
    data,
    filename,
    children,
    disabled,
    startIcon,
    sx,
    ...rest
}) => {
    return (
        <Button
            {...rest}
            disabled={data === undefined || disabled}
            startIcon={startIcon}
            sx={sx}
            onClick={() => triggerDownload(filename, data)}
        >
            {children}
        </Button>
    )
}
