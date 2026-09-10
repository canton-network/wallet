// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { RpcTypes as DappSyncRpc } from '@canton-network/core-wallet-dapp-rpc-client'
import { Provider } from '@canton-network/core-splice-provider'
import { LedgerTypes } from '@canton-network/core-ledger-client-types'

export type DappLedgerRpc = DappSyncRpc & LedgerTypes

declare global {
    interface Window {
        // we assume that we will always use a full DappProvider in the browser context
        canton?: Provider<DappLedgerRpc> | undefined
    }
}

export * from './DappSyncProvider'
export * from './DappAsyncProvider'
