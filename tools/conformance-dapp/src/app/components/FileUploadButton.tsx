// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type React from 'react'
import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'

interface FileUploadButtonProps {
    accept: string
    inputTestId: string
    onFileSelected: (file: File) => void
    children: React.ReactNode
    disabled?: boolean
    startIcon?: React.ReactNode
    sx?: SxProps<Theme>
    title?: string
    'data-testid'?: string
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
    accept,
    inputTestId,
    onFileSelected,
    children,
    disabled,
    startIcon,
    sx,
    ...rest
}) => {
    return (
        <Button
            {...rest}
            component="label"
            disabled={disabled}
            startIcon={startIcon}
            sx={sx}
        >
            {children}
            <input
                type="file"
                accept={accept}
                hidden
                data-testid={inputTestId}
                onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (file) onFileSelected(file)
                }}
            />
        </Button>
    )
}
