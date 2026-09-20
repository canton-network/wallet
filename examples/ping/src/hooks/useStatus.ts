// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react'
import * as sdk from '@canton-network/dapp-sdk'

/**
 * React hook that manages the connection to the wallet gateway.
 * Uses the dapp-sdk to connect and disconnect, and updates the connection status.
 *
 * Pass `isConnected` so the statusChanged listener is attached after connect
 * (requireClient() fails before a session exists). When disconnected, Status is
 * derived as cleared (no setState-in-effect) so WG logout / disconnect clears UI.
 *
 * @returns { status, statusEvent }
 */
export function useStatus(isConnected?: boolean): {
    status: () => Promise<void>
    statusEvent?: sdk.dappAPI.StatusEvent
} {
    const [statusEvent, setStatusEvent] = useState<sdk.dappAPI.StatusEvent>()

    async function status() {
        await sdk
            .status()
            .then((s) =>
                setStatusEvent(s.connection?.isConnected ? s : undefined)
            )
            .catch(() => {
                setStatusEvent(undefined)
            })
    }

    useEffect(() => {
        status()
    }, [])

    useEffect(() => {
        if (!isConnected) {
            return
        }

        const onStatusChanged = (s: sdk.dappAPI.StatusEvent) => {
            setStatusEvent(s.connection?.isConnected ? s : undefined)
        }

        sdk.onStatusChanged(onStatusChanged).catch(() => {
            // Client not ready — ignore; next connect will re-run this effect.
        })
        return () => {
            sdk.removeOnStatusChanged(onStatusChanged).catch(() => {})
        }
    }, [isConnected])

    return {
        status,
        // Derive cleared Status when disconnected — avoids setState-in-effect.
        statusEvent: isConnected ? statusEvent : undefined,
    }
}
