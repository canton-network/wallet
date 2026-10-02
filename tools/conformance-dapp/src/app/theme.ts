// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createTheme, type ThemeOptions } from '@mui/material/styles'

declare module '@mui/material/Checkbox' {
    interface CheckboxInputSlotPropsOverrides {
        'data-testid'?: string
        'aria-label'?: string
    }
}

const shared: ThemeOptions = {
    typography: {
        fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { textTransform: 'none' },
            },
        },
        // App-wide defaults so call sites don't repeat these on every instance.
        MuiIconButton: { defaultProps: { size: 'small' } },
        MuiTextField: { defaultProps: { size: 'small' } },
        MuiFormControl: { defaultProps: { size: 'small' } },
        MuiCheckbox: { defaultProps: { size: 'small' } },
        MuiAccordion: { defaultProps: { disableGutters: true } },
    },
}

export const lightTheme = createTheme({
    ...shared,
    palette: {
        mode: 'light',
        primary: { main: '#006b58' },
        error: { main: '#a3293a' },
        background: { default: '#f7f8f8', paper: '#ffffff' },
        text: { primary: '#252a2c', secondary: '#657171' },
        divider: '#d6dcdc',
    },
})

export const darkTheme = createTheme({
    ...shared,
    palette: {
        mode: 'dark',
        primary: { main: '#2fcaa3' },
        error: { main: '#f2879a' },
        background: { default: '#14181a', paper: '#1d2223' },
        text: { primary: '#e4e8e7', secondary: '#93a09e' },
        divider: '#33393a',
    },
})
