// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Auth from './Auth.tsx'

import {
    createTheme,
    responsiveFontSizes,
    ThemeProvider,
} from '@mui/material/styles'
import { configure } from '@logtape/logtape'

let theme = createTheme()

// fix the default font sizes for h1-h6, so they take less space in the small popup
theme = responsiveFontSizes(theme, {
    factor: 3,
    variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
})

await configure(configuration)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Auth />
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
