// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isSpliceMessageEvent, WalletEvent } from '@canton-network/core-types'
import { stateManager } from './state-manager'

const handleMessage = (event: MessageEvent) => {
    if (!isSpliceMessageEvent(event)) return
    if (window.opener && event.source !== window.opener) return
    if (event.data.type !== WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN) return
    if (event.data.origin !== event.origin) return

    stateManager.currentOrigin.set(event.data.origin)
    window.opener.postMessage(
        {
            type: WalletEvent.SPLICE_WALLET_BROADCAST_ORIGIN_ACK,
        },
        event.origin
    )
    window.removeEventListener('message', handleMessage)
}

window.addEventListener('message', handleMessage)
