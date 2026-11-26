// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as sdk from '@canton-network/dapp-sdk'
import { useEffect, useState } from 'react'

/** Connects to the wallet gateway and tracks the live connection/account state. */
export function useConnect() {
    const [connectResult, setConnectResult] =
        useState<sdk.dappAPI.ConnectResult>()
    const [accounts, setAccounts] = useState<sdk.dappAPI.Wallet[]>()
    const [sessionToken, setSessionToken] = useState<string>()

    const connected = connectResult?.isConnected ?? false

    async function connect() {
        // `connect()` resolves with only the connection (isConnected), not the
        // session token. Follow it with status() to capture the session's
        // accessToken -- otherwise `connected` flips true while `sessionToken`
        // stays undefined, so useWalletSdk never builds the SDK and every
        // sdk-backed control (tap, purchase, fetch ConversionRate) stays
        // disabled until a page reload re-reads the persisted session.
        await sdk.connect()
        const status = await sdk.status()
        setConnectResult(status.connection)
        setSessionToken(status.session?.accessToken)
    }

    async function disconnect() {
        await sdk.disconnect().catch(() => undefined)
        setConnectResult(undefined)
        setAccounts(undefined)
        setSessionToken(undefined)
    }

    useEffect(() => {
        sdk.init()
            .then(() => sdk.status())
            .then((s) => {
                setConnectResult(s.connection)
                setSessionToken(s.session?.accessToken)
            })
            .catch(() => undefined)
    }, [])

    useEffect(() => {
        if (!connected) return

        const onStatusChanged = (status: sdk.dappAPI.StatusEvent) => {
            setConnectResult(status.connection)
            setSessionToken(status.session?.accessToken)
        }
        void sdk.onStatusChanged(onStatusChanged).catch((error: unknown) => {
            console.error('Failed to subscribe to wallet status changes', error)
        })
        return () => {
            void sdk.removeOnStatusChanged(onStatusChanged)
        }
    }, [connected])

    useEffect(() => {
        if (!connected) return
        sdk.listAccounts()
            .then(setAccounts)
            .catch(() => setAccounts(undefined))

        const onAccountsChanged = (event: sdk.dappAPI.AccountsChangedEvent) =>
            setAccounts(event as unknown as sdk.dappAPI.Wallet[])
        void sdk.onAccountsChanged(onAccountsChanged)
        return () => {
            void sdk.removeOnAccountsChanged(onAccountsChanged)
            setAccounts(undefined)
        }
    }, [connected])

    const primaryParty = accounts?.find((account) => account.primary)?.partyId

    return {
        connect,
        disconnect,
        connectResult,
        connected,
        accounts,
        primaryParty,
        sessionToken,
    }
}
