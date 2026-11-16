// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest'
import { VaultErrorName, type VaultStatus } from '@/shared/vault-protocol'
import { requireUnlocked } from './require-unlocked'

describe('requireUnlocked', () => {
    function lockedService(status: VaultStatus) {
        const list = vi.fn(async (limit: number) => [limit])
        const assets = vi.fn(async () => ['asset'])
        const service = requireUnlocked(
            { ready: Promise.resolve(), status: () => status },
            { assets, v1: { utxos: { list } } }
        )
        return { service, list, assets }
    }

    it('rejects nested methods while the vault is locked', async () => {
        const { service, list, assets } = lockedService('locked')

        await expect(service.assets()).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
        await expect(service.v1.utxos.list(1)).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
        expect(assets).not.toHaveBeenCalled()
        expect(list).not.toHaveBeenCalled()
    })

    it('calls nested methods while the vault is unlocked', async () => {
        const { service, list } = lockedService('unlocked')

        await expect(service.assets()).resolves.toEqual(['asset'])
        await expect(service.v1.utxos.list(2)).resolves.toEqual([2])
        expect(list).toHaveBeenCalledWith(2)
    })
})
