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
 * Provided by the holder in `wallet-store.ts`, which decides when a store
 * is closed and saves it after each write.
 */
export interface StoreAccess {
    assertOpen(): void
    /**
     * Runs `change` once the writes before it have settled, then saves the
     * store. Rejects without running `change` once the store is closed.
     */
    write<T>(change: () => Promise<T>): Promise<T>
}

/**
 * Wraps `store` so its writes go through `access.write()`, and its reads
 * and `withAuthContext()` fail once the store is closed.
 */
export function persistent(
    store: StoreInternal,
    access: StoreAccess
): WalletStore {
    return new Proxy(store, {
        get(target, prop, receiver) {
            if (prop === 'withAuthContext') {
                return (context?: AuthContext) => {
                    access.assertOpen()
                    return persistent(target.withAuthContext(context), access)
                }
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
            if (kind === undefined || typeof value !== 'function') return value
            // Call with the real store as `this`, so its calls to its own
            // methods skip the proxy. Otherwise a write that calls another
            // write would queue behind itself and never finish.
            const call = async (args: unknown[]): Promise<unknown> =>
                value.apply(target, args)
            if (kind === 'write') {
                return (...args: unknown[]) => access.write(() => call(args))
            }
            return async (...args: unknown[]) => {
                access.assertOpen()
                const result = await call(args)
                // Check again in case the vault locked during the read.
                access.assertOpen()
                return result
            }
        },
    })
}
