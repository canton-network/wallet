// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { createVault, VaultLockedError } from '../vault'
import { createRegistryStore } from './registries'

describe('createRegistryStore', () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })

    it('starts with the LocalNet scan registry', async () => {
        const vault = createVault({ iterations: 1000 })
        await vault.create('abcde1')
        const registries = createRegistryStore(vault)

        await expect(registries.forNetwork('canton:localnet')).resolves.toEqual(
            ['http://scan.localhost:4000']
        )
        await expect(
            registries.forNetwork('canton:local-oauth')
        ).resolves.toEqual([])
    })

    it('rejects while the vault is locked', async () => {
        const vault = createVault({ iterations: 1000 })
        await vault.ready
        const registries = createRegistryStore(vault)

        await expect(
            registries.forNetwork('canton:localnet')
        ).rejects.toBeInstanceOf(VaultLockedError)
    })
})
