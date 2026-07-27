// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    encryptString,
    decryptString,
    destroyTokenKey,
} from './access-token-utils'

describe('access token utils', () => {
    beforeEach(async () => {
        await destroyTokenKey()
    })

    it('should successfully encrypt and decrypt a plaintext string', async () => {
        const originalText = 'test'

        const encrypted = await encryptString(originalText)
        expect(typeof encrypted).toBe('string')
        expect(encrypted).not.toBe(originalText)

        const parsed = JSON.parse(encrypted)
        expect(parsed).toHaveProperty('ciphertext')
        expect(parsed).toHaveProperty('iv')
        expect(Array.isArray(parsed.ciphertext)).toBe(true)
        expect(Array.isArray(parsed.iv)).toBe(true)

        const decrypted = await decryptString(encrypted)
        expect(decrypted).toBe(originalText)
    })

    it('should generate different ciphertexts for the same plaintext', async () => {
        const text = 'same-plaintext'

        const encrypted1 = await encryptString(text)
        const encrypted2 = await encryptString(text)

        expect(encrypted1).not.toBe(encrypted2)

        expect(await decryptString(encrypted1)).toBe(text)
        expect(await decryptString(encrypted2)).toBe(text)
    })

    it('should reuse the cached key across multiple encryption/decryption cycles', async () => {
        const text1 = 'message1'
        const encrypted1 = await encryptString(text1)

        const generateKeySpy = vi.spyOn(crypto.subtle, 'generateKey')

        const text2 = 'message2'
        const encrypted2 = await encryptString(text2)

        expect(generateKeySpy).not.toHaveBeenCalled()
        expect(await decryptString(encrypted1)).toBe(text1)
        expect(await decryptString(encrypted2)).toBe(text2)

        generateKeySpy.mockRestore()
    })

    it('should destroy the token key and force a new key generation', async () => {
        const text = 'test-destruction'
        await encryptString(text)

        await destroyTokenKey()

        const generateKeySpy = vi.spyOn(crypto.subtle, 'generateKey')

        const newText = 'after-destruction'
        const encrypted = await encryptString(newText)

        expect(generateKeySpy).toHaveBeenCalled()
        expect(await decryptString(encrypted)).toBe(newText)

        generateKeySpy.mockRestore()
    })

    it('should fail to decrypt malformed or tampered strings', async () => {
        const encrypted = await encryptString('secret')
        const parsed = JSON.parse(encrypted)

        parsed.ciphertext[0] = (parsed.ciphertext[0] + 1) % 255
        const tamperedString = JSON.stringify(parsed)

        await expect(decryptString(tamperedString)).rejects.toThrow()
    })
})
