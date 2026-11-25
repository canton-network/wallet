// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { ed25519PublicKey } from './signature.ts'
import { REFERENCE_PRIVATE_KEY } from './testing/reference-key.ts'
import config from './trusted-keys.json'
import {
    loadTrustedKeys,
    REFERENCE_PUBLIC_KEY,
    TRUSTED_KEYS,
    TrustedKeysError,
    TRUSTS_REFERENCE_KEY,
    trustsReferenceKey,
} from './trusted-keys.ts'

const OTHER_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

const key = (name: string, publicKey: string) => ({
    name,
    scheme: 'ed25519',
    publicKey,
})

describe('trusted keys', () => {
    it('loads the shipped config', () => {
        expect(TRUSTED_KEYS).toEqual(config.trustedKeys)
    })

    it('fixes the reference public key to the published private key', () => {
        expect(REFERENCE_PUBLIC_KEY).toBe(
            ed25519PublicKey(REFERENCE_PRIVATE_KEY)
        )
    })

    it('reports that the shipped config trusts the reference key', () => {
        expect(TRUSTS_REFERENCE_KEY).toBe(true)
    })

    it('finds the reference key by its bytes, under any name', () => {
        expect(
            trustsReferenceKey(
                loadTrustedKeys({
                    trustedKeys: [key('renamed', REFERENCE_PUBLIC_KEY)],
                })
            )
        ).toBe(true)
        expect(
            trustsReferenceKey(
                loadTrustedKeys({ trustedKeys: [key('other', OTHER_KEY)] })
            )
        ).toBe(false)
    })

    it('freezes the keys', () => {
        expect(Object.isFrozen(TRUSTED_KEYS)).toBe(true)
        for (const entry of TRUSTED_KEYS) {
            expect(Object.isFrozen(entry)).toBe(true)
        }
    })

    it('accepts an empty list', () => {
        expect(loadTrustedKeys({ trustedKeys: [] })).toEqual([])
    })

    it.each([
        ['a missing list', {}],
        ['an unknown field', { trustedKeys: [], extra: true }],
        [
            'an unknown field in an entry',
            {
                trustedKeys: [
                    { ...key('a', OTHER_KEY), hashAlgorithm: 'sha256' },
                ],
            },
        ],
        ['an empty name', { trustedKeys: [key('', OTHER_KEY)] }],
        [
            'another scheme',
            { trustedKeys: [{ ...key('a', OTHER_KEY), scheme: 'rsa' }] },
        ],
        ['a key of the wrong length', { trustedKeys: [key('a', 'AAAA')] }],
        [
            'a key that is not canonical base64',
            {
                trustedKeys: [
                    key('a', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB='),
                ],
            },
        ],
        [
            'a repeated name',
            {
                trustedKeys: [
                    key('a', OTHER_KEY),
                    key('a', REFERENCE_PUBLIC_KEY),
                ],
            },
        ],
        [
            'a repeated key',
            {
                trustedKeys: [
                    key('a', REFERENCE_PUBLIC_KEY),
                    key('b', REFERENCE_PUBLIC_KEY),
                ],
            },
        ],
    ])('rejects a config with %s', (_name, json) => {
        expect(() => loadTrustedKeys(json)).toThrow(TrustedKeysError)
    })
})
