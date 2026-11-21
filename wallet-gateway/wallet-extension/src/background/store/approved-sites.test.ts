// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { jwt } from '@/__tests__/jwt'
import { createVault, VaultLockedError } from '../vault'
import { createApprovedSiteStore, sitePrincipal } from './approved-sites'

describe('sitePrincipal', () => {
    it('tells equal subjects of different issuers apart', () => {
        const a = sitePrincipal(jwt({ iss: 'https://idp-a', sub: 'alice' }))
        const b = sitePrincipal(jwt({ iss: 'https://idp-b', sub: 'alice' }))

        expect(a).toBeDefined()
        expect(b).toBeDefined()
        expect(a).not.toBe(b)
    })

    it.each([
        ['no issuer', jwt({ sub: 'alice' })],
        ['no subject', jwt({ iss: 'https://idp-a' })],
        ['not a JWT', 'token-1'],
    ])('is undefined for a token with %s', (_, token) => {
        expect(sitePrincipal(token)).toBeUndefined()
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
        const alice = sitePrincipal(jwt({ iss: 'https://idp-a', sub: 'u1' }))!
        const otherAlice = sitePrincipal(
            jwt({ iss: 'https://idp-b', sub: 'u1' })
        )!

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
            .defineItem<unknown>('approvedSites', { fallback: {} })
            .setValue({ u1: ['https://a.example'], [`["i","u1"]`]: 'x' })
        const sites = createApprovedSiteStore(vault)

        expect(
            await sites.isApproved(
                sitePrincipal(jwt({ iss: 'i', sub: 'u1' }))!,
                'https://a.example'
            )
        ).toBe(false)
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
