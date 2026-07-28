// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { StateManager, stateManager } from './state-manager.js'

const STORAGE_KEYS = [
    'com.splice.wallet.accessToken',
    'com.splice.wallet.networkId',
    'com.splice.wallet.expirationDate',
    'com.splice.wallet.intendedPage',
] as const

describe('stateManager', async () => {
    beforeEach(async () => {
        await stateManager.clearAuthState()
    })

    afterEach(async () => {
        await stateManager.clearAuthState()
    })

    it('stores and reads accessToken in memory and localStorage', async () => {
        await stateManager.accessToken.set('token-abc')

        expect(await stateManager.accessToken.get()).toBe('token-abc')
        const stored = localStorage.getItem('com.splice.wallet.accessToken')
        expect(stored).not.toBeNull()

        expect(stored).not.toBe('token-abc')
        const parsed = JSON.parse(stored as string)
        expect(parsed).toHaveProperty('ciphertext')
        expect(parsed).toHaveProperty('iv')
    })

    it('prefers in-memory accessToken over a stale localStorage value', async () => {
        await stateManager.accessToken.set('memory-token')
        localStorage.setItem('com.splice.wallet.accessToken', 'storage-token')

        expect(await stateManager.accessToken.get()).toBe('memory-token')
    })

    it('loads accessToken from localStorage when not yet in memory', async () => {
        await stateManager.accessToken.set('stored-token')
        const newInstance = new StateManager()

        expect(await newInstance.accessToken.get()).toBe('stored-token')
    })

    it('clears accessToken from memory and localStorage', async () => {
        await stateManager.accessToken.set('token-abc')
        await stateManager.accessToken.clear()

        expect(await stateManager.accessToken.get()).toBeUndefined()
        expect(localStorage.getItem('com.splice.wallet.accessToken')).toBeNull()
    })

    it('stores networkId and expirationDate', async () => {
        stateManager.networkId.set('net-1')
        stateManager.expirationDate.set('2026-01-01T00:00:00.000Z')

        expect(stateManager.networkId.get()).toBe('net-1')
        expect(stateManager.expirationDate.get()).toBe(
            '2026-01-01T00:00:00.000Z'
        )
        expect(localStorage.getItem('com.splice.wallet.networkId')).toBe(
            'net-1'
        )
    })

    it('stores and clears intendedPage', async () => {
        stateManager.intendedPage.set('/activities')

        expect(stateManager.intendedPage.get()).toBe('/activities')

        stateManager.intendedPage.clear()

        expect(stateManager.intendedPage.get()).toBeUndefined()
    })

    it('clearAuthState removes all auth-related values', async () => {
        await stateManager.accessToken.set('token')
        stateManager.networkId.set('net-1')
        stateManager.expirationDate.set('2026-01-01T00:00:00.000Z')
        stateManager.intendedPage.set('/parties')

        await stateManager.clearAuthState()

        expect(await stateManager.accessToken.get()).toBeUndefined()
        expect(stateManager.networkId.get()).toBeUndefined()
        expect(stateManager.expirationDate.get()).toBeUndefined()
        expect(stateManager.intendedPage.get()).toBeUndefined()
        for (const key of STORAGE_KEYS) {
            expect(localStorage.getItem(key)).toBeNull()
        }
    })
})
