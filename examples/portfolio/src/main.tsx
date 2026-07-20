import { StrictMode } from 'react'
import '@fontsource/inter/index.css'
import './index.css'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { routeTree } from './routeTree.gen'
import ReactDOM from 'react-dom/client'

import { loadPortfolioConfig } from '@config/portfolio-config'
import { ConnectionProvider } from '@contexts/ConnectionProvider'
import { PortfolioProvider } from '@contexts/PortfolioProvider'
import { PortfolioConfigProvider } from '@contexts/PortfolioConfigProvider'
import { AppThemeProvider } from '@contexts/theme-provider'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchInterval: 5_000,
        },
    },
})

const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const renderConfigError = (root: ReactDOM.Root, error: unknown) => {
    root.render(
        <div role="alert">
            Failed to load portfolio configuration: <br /> {String(error)}
        </div>
    )
}

const renderApp = async (root: ReactDOM.Root) => {
    root.render(<div role="status">Loading portfolio configuration…</div>)

    const portfolioConfig = await loadPortfolioConfig()

    root.render(
        <StrictMode>
            <AppThemeProvider>
                <PortfolioConfigProvider config={portfolioConfig}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <QueryClientProvider client={queryClient}>
                            <ConnectionProvider>
                                <PortfolioProvider>
                                    <RouterProvider
                                        router={router}
                                        context={{ queryClient }}
                                    />
                                    <Toaster richColors />
                                </PortfolioProvider>
                            </ConnectionProvider>
                        </QueryClientProvider>
                    </LocalizationProvider>
                </PortfolioConfigProvider>
            </AppThemeProvider>
        </StrictMode>
    )
}

// Render the app
const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)

    renderApp(root).catch((error: unknown) => {
        renderConfigError(root, error)
    })
}
