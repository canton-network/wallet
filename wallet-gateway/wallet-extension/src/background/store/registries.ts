// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vault } from '../vault'

/** Registry URLs by network id. Strings, because vault values are JSON. */
export type Registries = Record<string, string[]>

/** Seeds the scan registry of Splice LocalNet. */
const DEFAULT_REGISTRIES: Registries = {
    'canton:localnet': ['http://scan.localhost:4000'],
}

/** The token standard registries the wallet SDK reads from, per network. */
export interface RegistryStore {
    /** An empty list when the network has none. Throws `VaultLockedError` while locked. */
    forNetwork(networkId: string): Promise<string[]>
}

/** Keeps the registry URLs in the vault item `registries`. */
export function createRegistryStore(
    vault: Pick<Vault, 'defineItem'>
): RegistryStore {
    const item = vault.defineItem<Registries>('registries', {
        fallback: DEFAULT_REGISTRIES,
    })
    return {
        async forNetwork(networkId) {
            return (await item.getValue())[networkId] ?? []
        },
    }
}
