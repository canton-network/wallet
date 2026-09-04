// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react'
import * as sdk from '@canton-network/dapp-sdk'

/**
 * React hook that manages the connection to the wallet gateway.
 * Uses the dapp-sdk to connect and disconnect, and updates the connection status.
 *
 * @returns { status, statusEvent }
 */
export function useStatus(): {
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
        const onStatusChanged = (s: sdk.dappAPI.StatusEvent) => {
            setStatusEvent(s.connection?.isConnected ? s : undefined)
        }

        sdk.onStatusChanged(onStatusChanged)
        return () => {
            sdk.removeOnStatusChanged(onStatusChanged)
        }
    }, [])

    return {
        status,
        statusEvent,
    }
}
