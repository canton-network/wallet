// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { stateManager } from './state-manager.js'

const STORAGE_KEYS = [
    'com.splice.wallet.accessToken',
    'com.splice.wallet.networkId',
    'com.splice.wallet.expirationDate',
    'com.splice.wallet.intendedPage',
] as const

describe('stateManager', () => {
    beforeEach(() => {
        stateManager.clearAuthState()
    })

    afterEach(() => {
        stateManager.clearAuthState()
    })

    it('stores and reads accessToken in memory and localStorage', () => {
        stateManager.accessToken.set('token-abc')

        expect(stateManager.accessToken.get()).toBe('token-abc')
        expect(localStorage.getItem('com.splice.wallet.accessToken')).toBe(
            'token-abc'
        )
    })

    it('prefers in-memory accessToken over a stale localStorage value', () => {
        stateManager.accessToken.set('memory-token')
        localStorage.setItem('com.splice.wallet.accessToken', 'storage-token')

        expect(stateManager.accessToken.get()).toBe('memory-token')
    })

    it('loads accessToken from localStorage when not yet in memory', () => {
        localStorage.setItem('com.splice.wallet.accessToken', 'stored-token')

        expect(stateManager.accessToken.get()).toBe('stored-token')
    })

    it('clears accessToken from memory and localStorage', () => {
        stateManager.accessToken.set('token-abc')
        stateManager.accessToken.clear()

        expect(stateManager.accessToken.get()).toBeUndefined()
        expect(localStorage.getItem('com.splice.wallet.accessToken')).toBeNull()
    })

    it('stores networkId and expirationDate', () => {
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

    it('stores and clears intendedPage', () => {
        stateManager.intendedPage.set('/activities')

        expect(stateManager.intendedPage.get()).toBe('/activities')

        stateManager.intendedPage.clear()

        expect(stateManager.intendedPage.get()).toBeUndefined()
    })

    it('clearAuthState removes all auth-related values', () => {
        stateManager.accessToken.set('token')
        stateManager.networkId.set('net-1')
        stateManager.expirationDate.set('2026-01-01T00:00:00.000Z')
        stateManager.intendedPage.set('/parties')

        stateManager.clearAuthState()

        expect(stateManager.accessToken.get()).toBeUndefined()
        expect(stateManager.networkId.get()).toBeUndefined()
        expect(stateManager.expirationDate.get()).toBeUndefined()
        expect(stateManager.intendedPage.get()).toBeUndefined()
        for (const key of STORAGE_KEYS) {
            expect(localStorage.getItem(key)).toBeNull()
        }
    })
})
