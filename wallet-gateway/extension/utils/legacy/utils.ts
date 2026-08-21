// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Toast,
    ToastMessageType,
} from '@canton-network/core-wallet-ui-components'
import { toRelPath } from './routing'

export const showToast = (
    title: string,
    message: string,
    type: ToastMessageType
): void => {
    const toast = new Toast()
    toast.title = title
    toast.message = message
    toast.type = type
    document.body.appendChild(toast)
}

/** Resolves this Wallet Gateway instance's dApp API URL for clipboard copy. */
export async function fetchDappApiUrl(): Promise<string> {
    const defaultUrl = new URL(
        toRelPath('/api/v0/dapp'),
        window.location.origin
    ).toString()

    try {
        const response = await fetch(
            toRelPath('/.well-known/wallet-gateway-config')
        )
        if (!response.ok) {
            return defaultUrl
        }
        const config = (await response.json()) as { dappApiUrl?: string }
        return config.dappApiUrl || defaultUrl
    } catch {
        return defaultUrl
    }
}
