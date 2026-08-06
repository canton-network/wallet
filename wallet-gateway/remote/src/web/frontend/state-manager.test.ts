// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { StateManager, stateManager } from './state-manager.js'

const origin = 'http://localhost'

const STORAGE_KEYS = [
    `com.splice.wallet.v1.${origin}.accessToken`,
    `com.splice.wallet.v1.${origin}.networkId`,
    `com.splice.wallet.v1.${origin}.expirationDate`,
    `com.splice.wallet.v1.${origin}.intendedPage`,
] as const

describe('stateManager', async () => {
    beforeEach(async () => {
        await stateManager.clearAuthState(origin)
    })

    afterEach(async () => {
        await stateManager.clearAuthState(origin)
    })

    it('stores and reads accessToken in memory and localStorage', async () => {
        await stateManager.accessToken.set('token-abc', origin)

        expect(await stateManager.accessToken.get(origin)).toBe('token-abc')
        const stored = localStorage.getItem(
            `com.splice.wallet.v1.${origin}.accessToken`
        )
        expect(stored).not.toBeNull()

        expect(stored).not.toBe('token-abc')
        const parsed = JSON.parse(stored as string)
        expect(parsed).toHaveProperty('ciphertext')
        expect(parsed).toHaveProperty('iv')
    })

    it('prefers in-memory accessToken over a stale localStorage value', async () => {
        await stateManager.accessToken.set('memory-token', origin)
        localStorage.setItem(
            `com.splice.wallet.v1.${origin}.accessToken`,
            'storage-token'
        )

        expect(await stateManager.accessToken.get(origin)).toBe('memory-token')
    })

    it('loads accessToken from localStorage when not yet in memory', async () => {
        await stateManager.accessToken.set('stored-token', origin)
        const newInstance = new StateManager()

        expect(await newInstance.accessToken.get(origin)).toBe('stored-token')
    })

    it('clears accessToken from memory and localStorage', async () => {
        await stateManager.accessToken.set('token-abc', origin)
        await stateManager.accessToken.clear(origin)

        expect(await stateManager.accessToken.get(origin)).toBeUndefined()
        expect(
            localStorage.getItem(`com.splice.wallet.v1.${origin}.accessToken`)
        ).toBeNull()
    })

    it('stores networkId and expirationDate', async () => {
        stateManager.networkId.set('net-1', origin)
        stateManager.expirationDate.set('2026-01-01T00:00:00.000Z', origin)

        expect(stateManager.networkId.get(origin)).toBe('net-1')
        expect(stateManager.expirationDate.get(origin)).toBe(
            '2026-01-01T00:00:00.000Z'
        )
        expect(
            localStorage.getItem(`com.splice.wallet.v1.${origin}.networkId`)
        ).toBe('net-1')
    })

    it('stores and clears intendedPage', async () => {
        stateManager.intendedPage.set('/activities', origin)

        expect(stateManager.intendedPage.get(origin)).toBe('/activities')

        stateManager.intendedPage.clear(origin)

        expect(stateManager.intendedPage.get(origin)).toBeUndefined()
    })

    it('clearAuthState removes all auth-related values', async () => {
        await stateManager.accessToken.set('token', origin)
        stateManager.networkId.set('net-1', origin)
        stateManager.expirationDate.set('2026-01-01T00:00:00.000Z', origin)
        stateManager.intendedPage.set('/parties', origin)

        await stateManager.clearAuthState(origin)

        expect(await stateManager.accessToken.get(origin)).toBeUndefined()
        expect(stateManager.networkId.get(origin)).toBeUndefined()
        expect(stateManager.expirationDate.get(origin)).toBeUndefined()
        expect(stateManager.intendedPage.get(origin)).toBeUndefined()
        for (const key of STORAGE_KEYS) {
            expect(localStorage.getItem(key)).toBeNull()
        }
    })
})
