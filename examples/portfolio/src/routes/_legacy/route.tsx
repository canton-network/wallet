import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Container } from '@mui/material'
import { Header } from '../../components/header'
import { NetworkBanner } from '../../components/network-banner'
import { RegistryValidationModal } from '../../components/registry-validation-modal'
import type { RegistryValidationStatus } from '../../types/registries'
import { useReachableRegistryUrls } from '../../hooks/useRegistryUrls'

export const Route = createFileRoute('/_legacy')({
    component: LegacyLayout,
})

function LegacyLayout() {
    const { entries } = useReachableRegistryUrls()
    let validationStatus: RegistryValidationStatus = 'checking'
    if (entries.length === 0) {
        validationStatus = 'no-registries'
    } else if (entries.some((entry) => entry.status === 'reachable')) {
        validationStatus = 'valid'
    } else if (entries.every((entry) => entry.status === 'unreachable')) {
        validationStatus = 'all-unreachable'
    }

    return (
        <>
            <NetworkBanner />
            <Container maxWidth="lg">
                <Header />
                <Outlet />
            </Container>

            <RegistryValidationModal validationStatus={validationStatus} />
        </>
    )
}
