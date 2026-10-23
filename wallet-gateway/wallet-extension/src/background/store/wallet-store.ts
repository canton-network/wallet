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
interface Build {
    closedBy?: CloseReason
}

/**
 * Keeps the wallet store in the vault item `walletStore`, as one snapshot
 * that every store write replaces. A lock or reset drops the store, and its
 * later writes reject, so it never writes into a vault opened after it.
 */
export function createWalletStore(
    vault: Pick<Vault, 'ready' | 'status' | 'defineItem' | 'onLock'>
): WalletStoreHolder {
    // Never log the snapshot. It holds access tokens and client secrets.
    const item = vault.defineItem<SnapshotV1 | null>('walletStore', {
        fallback: null,
    })
    let current: { build: Build; store: Promise<WalletStore> } | undefined

    function close(build: Build, reason: CloseReason): void {
        build.closedBy ??= reason
        if (current?.build === build) current = undefined
    }

    vault.onLock(() => {
        if (current) close(current.build, 'lock')
    })

    function assertOpen(build: Build): void {
        if (build.closedBy === 'lock') {
            throw new VaultLockedError(
                'The vault was locked after the wallet store was loaded.'
            )
        }
        // Not VaultLockedError, or the pages would show the unlock page.
        if (build.closedBy === 'failed write') {
            throw new Error(
                'The wallet store was reloaded after a failed write.'
            )
        }
    }

    async function load(build: Build): Promise<WalletStore> {
        const snapshot = await item.getValue()
        // The vault may have locked while we were reading.
        assertOpen(build)
        const { config, memory } =
            snapshot === null
                ? { config: defaultConfig(), memory: new Map() as Memory }
                : decodeSnapshot(snapshot)
        const store = new StoreInternal(config, logger, undefined, memory)
        return persistent(store, async () => {
            assertOpen(build)
            try {
                await item.setValue(encodeSnapshot(config, memory))
            } catch (error) {
                // Memory now holds a change that isn't on disk, so the next
                // get() rebuilds from the last snapshot.
                close(build, 'failed write')
                throw error
            }
        })
    }

    function start(): Promise<WalletStore> {
        const build: Build = {}
        const store = load(build).catch((error: unknown) => {
            // Let the next get() try again. A corrupt snapshot keeps failing
            // rather than falling back to the defaults.
            if (current?.build === build) current = undefined
            throw error
        })
        // Cache it before anything awaits, so concurrent calls share one build.
        current = { build, store }
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
