// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * High-level dApp SDK methods for discovering wallets, connecting users,
 * reading parties, requesting signatures, and submitting transactions.
 *
 * Import from `@canton-network/dapp-sdk`:
 *
 * ```ts
 * import { init, connect, listAccounts } from '@canton-network/dapp-sdk'
 * ```
 *
 * @module
 * @packageDocumentation
 */

export type { DappSDKConnectOptions } from './sdk'
export {
    init,
    connect,
    disconnect,
    isConnected,
    status,
    listAccounts,
    prepareExecute,
    prepareExecuteAndWait,
    ledgerApi,
    open,
    getConnectedProvider,
    onStatusChanged,
    onAccountsChanged,
    onConnected,
    onTxChanged,
    removeOnStatusChanged,
    removeOnAccountsChanged,
    removeOnConnected,
    removeOnTxChanged,
} from './sdk'
