// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AuthErrorName } from '@/shared/auth-protocol'
import { networksQuery, idpsQuery } from '@/ui/features/networks'
import { useConnect } from './api'
import {
    LoginForm,
    type LoginConnectEvent,
} from '@canton-network/core-wallet-ui-components/react'
import type { PublicNetwork } from '@canton-network/core-wallet-user-rpc-client'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'

/** The auth methods `auth.connect` supports so far. */
const SUPPORTED_AUTH_METHODS = new Set(['authorization_code'])

export function ConnectPage() {
    const navigate = useNavigate()
    const networks = useQuery(networksQuery())
    const idps = useQuery(idpsQuery())
    const connect = useConnect()

    function handleSubmit(event: LoginConnectEvent) {
        event.preventDefault()
        if (event.selectedNetwork.id === '' || connect.isPending) return
        connect.mutate(event.selectedNetwork.id, {
            onSuccess: () => void navigate({ to: '/' }),
        })
    }

    const loginNetworks =
        networks.data ??
        [].filter((network: PublicNetwork) => {
            return SUPPORTED_AUTH_METHODS.has(network.authMethod)
        })

    return (
        <Stack>
            <LoginForm
                networks={loginNetworks}
                idps={idps.data ?? []}
                loading={networks.isPending}
                connecting={connect.isPending}
                onLoginConnect={handleSubmit}
            />
            {connect.isError && (
                <Alert severity="error">
                    {connectErrorMessage(connect.error)}
                </Alert>
            )}
        </Stack>
    )
}

function connectErrorMessage(error: Error): string {
    switch (error.name) {
        case AuthErrorName.SignInFailed:
            return 'Sign-in was cancelled or failed. Try again.'
        case AuthErrorName.UnsupportedAuthMethod:
            return "This network's sign-in method isn't supported yet."
        default:
            return "Couldn't connect to the network. Try again."
    }
}
