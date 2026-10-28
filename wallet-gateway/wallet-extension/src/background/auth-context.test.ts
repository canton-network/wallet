// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { createAuthContextStore } from './auth-context'
import { createVault, type Vault, VaultLockedError } from './vault'

const PASSWORD = 'first password 1'
const base64url = (value: object) =>
    btoa(JSON.stringify(value))
        .replace(/=+$/, '')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
// Unsigned: the store only reads the subject.
const TOKEN = `${base64url({ alg: 'none' })}.${base64url({ sub: 'alice' })}.signature`
const CONTEXT = { userId: 'alice', accessToken: TOKEN }

async function createdVault(): Promise<Vault> {
    const vault = createVault({ iterations: 1000 })
    await vault.ready
    await vault.create(PASSWORD)
    return vault
}

describe('createAuthContextStore', () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })

    it('keeps the context through a lock and loses it on reset', async () => {
        const vault = await createdVault()
        const authContext = createAuthContextStore(vault)
        await authContext.store(TOKEN)

        await vault.lock()
        await expect(authContext.load()).rejects.toThrow(VaultLockedError)

        await vault.unlock(PASSWORD)
        expect(await authContext.load()).toEqual(CONTEXT)

        await vault.reset()
        await vault.create(PASSWORD)
        expect(await authContext.load()).toBeUndefined()
    })

    it('never writes the token to storage in plaintext', async () => {
        const authContext = createAuthContextStore(await createdVault())

        await authContext.store(TOKEN)

        const stored = JSON.stringify([
            await fakeBrowser.storage.local.get(),
            await fakeBrowser.storage.session.get(),
        ])
        expect(stored).not.toContain(TOKEN)
        expect(stored).not.toContain('authContext')
    })
})
