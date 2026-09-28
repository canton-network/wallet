import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ThemeContext } from '../contexts/theme-context'
import { darkTheme, lightTheme } from '../lib/theme'

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme ? savedTheme === 'dark' : true
    })

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    }, [isDarkMode])

    const toggleTheme = useCallback(() => {
        setIsDarkMode((prev) => !prev)
    }, [])

    const theme = isDarkMode ? darkTheme : lightTheme
    const contextValue = useMemo(
        () => ({ isDarkMode, toggleTheme }),
        [isDarkMode, toggleTheme]
    )

    return (
        <ThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    )
}
