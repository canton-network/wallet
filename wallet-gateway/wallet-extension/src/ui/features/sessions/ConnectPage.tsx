// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type SubmitEvent, useState } from 'react'
import { AuthErrorName } from '@/shared/auth-protocol'
import { networksQuery } from '@/ui/features/networks'
import { useConnect } from './api'

/** The auth methods `auth.connect` supports so far. */
const SUPPORTED_AUTH_METHODS = new Set(['authorization_code'])

export function ConnectPage() {
    const navigate = useNavigate()
    const networks = useQuery(networksQuery())
    const connect = useConnect()
    const [networkId, setNetworkId] = useState('')

    // Preselect the first supported network once the list arrives.
    const selectedId =
        networkId ||
        networks.data?.find((n) => SUPPORTED_AUTH_METHODS.has(n.authMethod))
            ?.id ||
        ''

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (selectedId === '' || connect.isPending) return
        connect.mutate(selectedId, {
            onSuccess: () => void navigate({ to: '/' }),
        })
    }

    return (
        <Stack
            component="form"
            noValidate
            onSubmit={handleSubmit}
            spacing={2}
            sx={{ p: 3, width: '100%', maxWidth: 440, mx: 'auto' }}
        >
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Connect
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Choose a network and sign in to its identity provider.
            </Typography>
            {networks.isError ? (
                <Alert severity="error">Couldn't load the networks.</Alert>
            ) : (
                <TextField
                    select
                    label="Network"
                    fullWidth
                    value={selectedId}
                    onChange={(event) => setNetworkId(event.target.value)}
                    disabled={networks.isPending || connect.isPending}
                >
                    {(networks.data ?? []).map((network) => {
                        const supported = SUPPORTED_AUTH_METHODS.has(
                            network.authMethod
                        )
                        return (
                            <MenuItem
                                key={network.id}
                                value={network.id}
                                disabled={!supported}
                            >
                                {network.name}
                                {!supported && ' (not supported yet)'}
                            </MenuItem>
                        )
                    })}
                </TextField>
            )}
            {connect.isError && (
                <Alert severity="error">
                    {connectErrorMessage(connect.error)}
                </Alert>
            )}
            <Button
                type="submit"
                variant="contained"
                disabled={selectedId === ''}
                loading={connect.isPending}
            >
                Connect
            </Button>
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
