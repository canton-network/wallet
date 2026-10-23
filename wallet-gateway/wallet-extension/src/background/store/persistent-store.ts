// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { rpcErrors } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import type { StoreInternal } from '@canton-network/core-wallet-store-inmemory'
import type { WalletStore } from './index'

/**
 * The proxy saves a snapshot after each write and never after a read,
 * because every save re-encrypts the whole vault. This table tells it which
 * methods are writes. If you add a method to Store, this won't compile until
 * you list it here too.
 */
const KIND = {
    getWallets: 'read',
    getWallet: 'read',
    getWalletByJwt: 'read',
    getAllWallets: 'read',
    getPrimaryWallet: 'read',
    setPrimaryWallet: 'write',
    setAuthPartyWallet: 'write',
    addWallet: 'write',
    updateWallet: 'write',
    removeWallet: 'write',
    getUserRights: 'read',
    setUserRights: 'write',

    getSession: 'read',
    listSessions: 'read',
    setSession: 'write',
    removeSession: 'write',
    getSelfIssuedLoginSession: 'read',
    removeSelfIssuedLoginSession: 'write',
    upgradeSelfIssuedLoginSession: 'write',

    getIdp: 'read',
    listIdps: 'read',
    updateIdp: 'write',
    addIdp: 'write',
    removeIdp: 'write',

    getNetwork: 'read',
    getCurrentNetwork: 'read',
    getNetworkForTokenVerification: 'read',
    listNetworks: 'read',
    updateNetwork: 'write',
    addNetwork: 'write',
    removeNetwork: 'write',

    setTransaction: 'write',
    setTransactionSigned: 'write',
    setTransactionStatus: 'write',
    getTransaction: 'read',
    getLatestTransactionByCommandId: 'read',
    listTransactions: 'read',
    listAllPendingTransactions: 'read',
    removeTransaction: 'write',
    transactionsCount: 'read',

    setMessageRaw: 'write',
    setMessageRawStatus: 'write',
    getMessageRaw: 'read',
    listMessageRaws: 'read',
    removeMessageRaw: 'write',

    // The extension has no API keys.
    addApiKey: 'unsupported',
    listApiKeys: 'unsupported',
    getApiKey: 'unsupported',
    removeApiKey: 'unsupported',
} as const satisfies Record<keyof Store, 'read' | 'write' | 'unsupported'>

/**
 * Wraps `store` so that each write calls `persist()` after it resolves.
 * A write that throws, a read, or an unsupported method never persists.
 */
export function persistent(
    store: StoreInternal,
    persist: () => Promise<void>
): WalletStore {
    return new Proxy(store, {
        get(target, prop, receiver) {
            if (prop === 'withAuthContext') {
                return (context?: AuthContext) =>
                    persistent(target.withAuthContext(context), persist)
            }
            const value: unknown = Reflect.get(target, prop, receiver)
            const kind = Object.hasOwn(KIND, prop)
                ? KIND[prop as keyof Store]
                : undefined
            if (kind === 'unsupported') {
                return async () => {
                    throw rpcErrors.methodNotSupported()
                }
            }
            if (kind !== 'write' || typeof value !== 'function') return value
            return async (...args: unknown[]) => {
                // `this` is the target, so internal calls don't persist twice.
                const result: unknown = await value.apply(target, args)
                await persist()
                return result
            }
        },
    })
}
