// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'
import {
    createKeyPair,
    getPublicKeyFromPrivate,
    signMessage,
    signTransactionHash,
    verifySignedTxHash,
} from './index'

const TX_HASH =
    '88beb0783e394f6128699bad42906374ab64197d260db05bb0cfeeb518ba3ac2'

describe('getPublicKeyFromPrivate', () => {
    it('derives the matching public key', () => {
        const { publicKey, privateKey } = createKeyPair()

        expect(getPublicKeyFromPrivate(privateKey)).toBe(publicKey)
    })
})

describe('signTransactionHash', () => {
    it('produces a signature that verifySignedTxHash accepts', () => {
        const { publicKey, privateKey } = createKeyPair()
        const signature = signTransactionHash(TX_HASH, privateKey)

        expect(verifySignedTxHash(TX_HASH, publicKey, signature)).toBe(true)
    })

    it('is rejected by verifySignedTxHash with a different public key', () => {
        const { privateKey } = createKeyPair()
        const { publicKey: otherPublicKey } = createKeyPair()
        const signature = signTransactionHash(TX_HASH, privateKey)

        expect(verifySignedTxHash(TX_HASH, otherPublicKey, signature)).toBe(
            false
        )
    })
})

describe('signMessage', () => {
    it('signs a UTF-8 message with the private key', () => {
        const message = 'message'
        const { publicKey, privateKey } = createKeyPair()
        const signature = signMessage(message, privateKey)

        expect(
            nacl.sign.detached.verify(
                new TextEncoder().encode(message),
                naclUtil.decodeBase64(signature),
                naclUtil.decodeBase64(publicKey)
            )
        ).toBe(true)
    })
})

describe('verifySignedTxHash', () => {
    it('rejects an invalid signature', () => {
        const { publicKey } = createKeyPair()
        const invalidSignature = naclUtil.encodeBase64(
            Uint8Array.from({ length: nacl.sign.signatureLength }, () => 0)
        )

        expect(verifySignedTxHash(TX_HASH, publicKey, invalidSignature)).toBe(
            false
        )
    })
})
