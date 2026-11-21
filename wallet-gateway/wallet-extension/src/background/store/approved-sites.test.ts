// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { createVault, VaultLockedError } from '../vault'
import { createApprovedSiteStore, sitePrincipal } from './approved-sites'
import { createTestWalletStore } from './test-store'

describe('sitePrincipal', () => {
    /** Alice, signed in to `network` with a token of her own. */
    async function aliceOn(network: string) {
        const context = { userId: 'alice', accessToken: `token-${network}` }
        const store = createTestWalletStore(context)
        await store.setSession({
            id: `session-${network}`,
            origin: 'browserext',
            network,
            accessToken: context.accessToken,
        })
        return sitePrincipal(store, context)
    }

    it('tells equal subjects of different configured providers apart', async () => {
        // The default config signs in to these through different IdPs.
        const oauth = await aliceOn('canton:local-oauth')
        const selfSigned = await aliceOn('canton:localnet')

        expect(oauth).toBeDefined()
        expect(selfSigned).toBeDefined()
        expect(oauth).not.toBe(selfSigned)
    })

    it('is the same on every network of a provider', async () => {
        const context = { userId: 'alice', accessToken: 'token-copy' }
        const store = createTestWalletStore(context)
        const network = await store.getNetwork('canton:local-oauth')
        await store.addNetwork({ ...network, id: 'canton:copy' })
        await store.setSession({
            id: 'session-copy',
            origin: 'browserext',
            network: 'canton:copy',
            accessToken: context.accessToken,
        })

        expect(await sitePrincipal(store, context)).toBe(
            await aliceOn('canton:local-oauth')
        )
    })

    it('is undefined for a token without a session', async () => {
        const context = { userId: 'alice', accessToken: 'token-1' }

        expect(
            await sitePrincipal(createTestWalletStore(context), context)
        ).toBeUndefined()
    })
})

describe('createApprovedSiteStore', () => {
    beforeEach(() => {
        fakeBrowser.reset()
    })

    async function createdVault() {
        const vault = createVault({ iterations: 1000 })
        await vault.create('abcde1')
        return vault
    }

    it('keeps approvals per principal and origin', async () => {
        const sites = createApprovedSiteStore(await createdVault())
        const alice = JSON.stringify(['idp-a', 'u1'])
        const otherAlice = JSON.stringify(['idp-b', 'u1'])

        await sites.approve(alice, 'https://a.example')
        await sites.approve(alice, 'https://b.example')
        await sites.approve('bob', 'https://a.example')
        await sites.revoke(alice, 'https://a.example')

        expect(await sites.isApproved(alice, 'https://a.example')).toBe(false)
        expect(await sites.isApproved(alice, 'https://b.example')).toBe(true)
        expect(await sites.isApproved('bob', 'https://a.example')).toBe(true)
        expect(await sites.isApproved(otherAlice, 'https://b.example')).toBe(
            false
        )
        expect(await sites.isApproved('toString', 'https://a.example')).toBe(
            false
        )
    })

    it('grants nothing from entries of another shape', async () => {
        const vault = await createdVault()
        await vault
            .defineItem<unknown>('approvedSitesV2', { fallback: {} })
            .setValue({ u1: 'https://a.example' })
        const sites = createApprovedSiteStore(vault)

        expect(await sites.isApproved('u1', 'https://a.example')).toBe(false)
    })

    it('does not rewrite the vault to revoke a site that was not approved', async () => {
        const vault = await createdVault()
        const sites = createApprovedSiteStore(vault)
        await sites.approve('alice', 'https://a.example')
        const set = vi.spyOn(fakeBrowser.storage.local, 'set')

        await sites.revoke('alice', 'https://b.example')
        await sites.revoke('bob', 'https://a.example')

        expect(set).not.toHaveBeenCalled()
        await sites.revoke('alice', 'https://a.example')
        expect(set).toHaveBeenCalled()
    })

    it('rejects while the vault is locked', async () => {
        const vault = await createdVault()
        const sites = createApprovedSiteStore(vault)
        await sites.approve('alice', 'https://a.example')
        await vault.lock()

        await expect(
            sites.isApproved('alice', 'https://a.example')
        ).rejects.toBeInstanceOf(VaultLockedError)
    })
})
