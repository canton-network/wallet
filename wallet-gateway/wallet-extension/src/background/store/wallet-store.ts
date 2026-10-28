// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type Memory,
    StoreInternal,
} from '@canton-network/core-wallet-store-inmemory'
import { logger } from '@/shared/logger'
import { type Vault, VaultLockedError } from '../vault'
import { defaultConfig } from './default-config'
import type { WalletStore } from './index'
import { persistent } from './persistent-store'
import { decodeSnapshot, encodeSnapshot, type SnapshotV1 } from './snapshot'

export interface WalletStoreHolder {
    /**
     * The unscoped store. The first call after an unlock builds it from the
     * vault. Throws `VaultLockedError` while the vault isn't unlocked.
     */
    get(): Promise<WalletStore>
}

type CloseReason = 'lock' | 'failed write'

/** One store built from the vault. A lock or a failed write closes it. */
interface Instance {
    closedBy?: CloseReason
}

/**
 * Keeps the wallet store in the vault item `walletStore`, as one snapshot
 * that each write replaces. Writes run one at a time, and a write resolves
 * only after a snapshot containing it is in the vault. A lock or reset
 * closes the store. After that its reads and writes reject, so it can't
 * show data once the vault is locked or write into a vault opened later.
 */
export function createWalletStore(
    vault: Pick<Vault, 'ready' | 'status' | 'defineItem' | 'onLock'>
): WalletStoreHolder {
    // Never log the snapshot. It holds access tokens and client secrets.
    const item = vault.defineItem<SnapshotV1 | null>('walletStore', {
        fallback: null,
    })
    let current: { instance: Instance; store: Promise<WalletStore> } | undefined

    function close(instance: Instance, reason: CloseReason): void {
        instance.closedBy ??= reason
        if (current?.instance === instance) current = undefined
    }

    vault.onLock(() => {
        if (current) close(current.instance, 'lock')
    })

    function assertOpen(instance: Instance): void {
        const reason = instance.closedBy
        switch (reason) {
            case undefined:
                return
            case 'lock':
                throw new VaultLockedError(
                    'The vault was locked after the wallet store was loaded.'
                )
            case 'failed write':
                throw new Error(
                    'The wallet store was reloaded after a failed write.'
                )
            default: {
                const unhandled: never = reason
                throw new Error(`Unhandled close reason: ${String(unhandled)}`)
            }
        }
    }

    async function load(instance: Instance): Promise<WalletStore> {
        const snapshot = await item.getValue()
        // The vault may have locked while we were reading.
        assertOpen(instance)
        const { config, memory } =
            snapshot === null
                ? { config: defaultConfig(), memory: new Map() as Memory }
                : decodeSnapshot(snapshot)
        const store = new StoreInternal(config, logger, undefined, memory)
        // One queue for every withAuthContext() copy, so a snapshot never
        // includes another caller's unfinished write.
        let writes: Promise<unknown> = Promise.resolve()
        return persistent(store, {
            assertOpen: () => assertOpen(instance),
            write(change) {
                const result = writes.then(async () => {
                    assertOpen(instance)
                    const value = await change()
                    // Check again in case the vault locked during the change.
                    assertOpen(instance)
                    try {
                        await item.setValue(encodeSnapshot(config, memory))
                    } catch (error) {
                        // Memory has a change that never reached disk. Close
                        // the store so queued writes reject and the next
                        // get() reloads the last saved snapshot.
                        close(instance, 'failed write')
                        throw error
                    }
                    return value
                })
                writes = result.catch(() => undefined)
                return result
            },
        })
    }

    function start(): Promise<WalletStore> {
        const instance: Instance = {}
        const store = load(instance).catch((error: unknown) => {
            // Let the next get() try again. A corrupt snapshot keeps failing
            // rather than falling back to the defaults.
            if (current?.instance === instance) current = undefined
            throw error
        })
        // Cache it before anything awaits, so concurrent calls share one instance.
        current = { instance, store }
        return store
    }

    return {
        async get() {
            await vault.ready
            if (vault.status() !== 'unlocked') throw new VaultLockedError()
            return current?.store ?? start()
        },
    }
}
