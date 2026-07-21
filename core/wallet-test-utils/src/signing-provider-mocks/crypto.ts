// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateKeyPairSync } from 'node:crypto'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

export interface MockEd25519KeyPair {
    publicKeyBase64: string
    publicKeyHex: string
    secretKeyBase64: string
}

/** Matches Canton topology signing (`core-signing-lib` / offline wallet flows). */
export function signTransactionHash(
    txHashBase64: string,
    secretKeyBase64: string
): string {
    const decodedKey = naclUtil.decodeBase64(secretKeyBase64)

    return naclUtil.encodeBase64(
        nacl.sign.detached(naclUtil.decodeBase64(txHashBase64), decodedKey)
    )
}

export function verifySignedTxHash(
    txHashBase64: string,
    publicKeyBase64: string,
    signatureBase64: string
): boolean {
    return nacl.sign.detached.verify(
        naclUtil.decodeBase64(txHashBase64),
        naclUtil.decodeBase64(signatureBase64),
        naclUtil.decodeBase64(publicKeyBase64)
    )
}

export function normalizeHex(hex: string): string {
    return hex.startsWith('0x') ? hex.slice(2) : hex
}

export function toPrefixedHex(hex: string): string {
    return hex.startsWith('0x') ? hex : `0x${hex}`
}

export function hexToBase64(hex: string): string {
    return Buffer.from(normalizeHex(hex), 'hex').toString('base64')
}

export function base64ToHex(base64: string): string {
    return Buffer.from(base64, 'base64').toString('hex')
}

export function createMockEd25519KeyPair(): MockEd25519KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519')
    const spkiDer = publicKey.export({ type: 'spki', format: 'der' })
    const publicKeyBytes = Buffer.from(spkiDer).subarray(-32)
    const pkcs8 = privateKey.export({ type: 'pkcs8', format: 'der' })
    const seed = pkcs8.subarray(-32)
    const keyPair = nacl.sign.keyPair.fromSeed(seed)

    return {
        publicKeyBase64: publicKeyBytes.toString('base64'),
        publicKeyHex: publicKeyBytes.toString('hex'),
        secretKeyBase64: naclUtil.encodeBase64(keyPair.secretKey),
    }
}

export function signMultiHashBase64(
    txHashBase64: string,
    key: MockEd25519KeyPair
): string {
    return signTransactionHash(txHashBase64, key.secretKeyBase64)
}

export function signMultiHashHex(
    messageHex: string,
    key: MockEd25519KeyPair
): string {
    const multiHashBase64 = hexToBase64(messageHex)
    return base64ToHex(
        signTransactionHash(multiHashBase64, key.secretKeyBase64)
    )
}

export function signMultiHashHexPrefixed(
    messageHex: string,
    key: MockEd25519KeyPair
): string {
    return toPrefixedHex(signMultiHashHex(messageHex, key))
}
