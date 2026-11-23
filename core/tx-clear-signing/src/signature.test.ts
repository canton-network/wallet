// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { toBase64 } from './bytes.ts'
import { canonicalize } from './canonical-json.ts'
import {
    ed25519PublicKey,
    signDescriptor,
    signingMessage,
    verifySignatures,
    type DescriptorSignature,
} from './signature.ts'
import { REFERENCE_PRIVATE_KEY } from './testing/reference-key.ts'
import { REFERENCE_SIGNER, TRUSTED_KEYS } from './trusted-keys.ts'

const descriptor = {
    $schema: 'https://example.org/canton-clear-signing/v1/schema.json',
    $comment: 'a note',
    context: {
        template: { packageId: 'ab', moduleName: 'M', entityName: 'E' },
    },
    metadata: { version: '1.0.0', publisher: 'test', name: 'Example' },
    display: { create: { intent: 'Create it' } },
}

async function otherKey(): Promise<JsonWebKey> {
    const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
        'sign',
        'verify',
    ])
    return crypto.subtle.exportKey('jwk', pair.privateKey)
}

function signaturesOf(json: Record<string, unknown>): DescriptorSignature[] {
    return json.signatures as DescriptorSignature[]
}

describe('descriptor signatures', () => {
    it('trusts the reference public key', () => {
        expect(TRUSTED_KEYS).toEqual([
            {
                name: REFERENCE_SIGNER,
                scheme: 'ed25519',
                publicKey: ed25519PublicKey(REFERENCE_PRIVATE_KEY),
            },
        ])
    })

    it('verifies a signature from the reference key', async () => {
        const signed = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        await expect(verifySignatures(signed, TRUSTED_KEYS)).resolves.toEqual({
            ok: true,
            signers: [REFERENCE_SIGNER],
        })
    })

    it('covers the canonical descriptor, including $comment, and not the signatures', async () => {
        const signed = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        const commented = { ...descriptor, $comment: 'a different note' }
        const resigned = {
            ...commented,
            signatures: signaturesOf(signed),
        }
        const verified = await verifySignatures(resigned, TRUSTED_KEYS)
        expect(verified.ok).toBe(false)

        const withSignature = await signingMessage(signed)
        const withoutSignature = await signingMessage(descriptor)
        expect(withSignature).toEqual(withoutSignature)
        expect(withoutSignature).toEqual(
            new TextEncoder().encode(canonicalize(descriptor))
        )
    })

    it('does not depend on key order', async () => {
        const reversed = {
            display: descriptor.display,
            metadata: descriptor.metadata,
            context: descriptor.context,
            $comment: descriptor.$comment,
            $schema: descriptor.$schema,
        }
        expect(await signingMessage(descriptor)).toEqual(
            await signingMessage(reversed)
        )
    })

    it('rejects a tampered signature', async () => {
        const signed = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        const [entry] = signaturesOf(signed)
        if (!entry) throw new Error('expected a signature')
        const bytes = Uint8Array.from(atob(entry.signature), (c) =>
            c.charCodeAt(0)
        )
        bytes[0] = bytes[0]! ^ 0xff
        const tampered = {
            ...signed,
            signatures: [{ ...entry, signature: toBase64(bytes) }],
        }
        const verified = await verifySignatures(tampered, TRUSTED_KEYS)
        expect(verified).toEqual({
            ok: false,
            problems: ['signatures[0]: signature does not verify'],
        })
    })

    it('rejects a signature or public key that is not canonical base64', async () => {
        const signed = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        const [entry] = signaturesOf(signed)
        if (!entry) throw new Error('expected a signature')
        // The next character sets a padding bit: the same bytes to a lenient decoder, a second
        // encoding to the strict one.
        const setPaddingBit = (b64: string, at: number): string =>
            b64.slice(0, at) +
            String.fromCharCode(b64.charCodeAt(at) + 1) +
            b64.slice(at + 1)
        for (const changed of [
            { ...entry, signature: setPaddingBit(entry.signature, 85) },
            { ...entry, publicKey: setPaddingBit(entry.publicKey, 42) },
        ]) {
            const verified = await verifySignatures(
                { ...signed, signatures: [changed] },
                TRUSTED_KEYS
            )
            expect(verified).toEqual({
                ok: false,
                problems: ['signatures[0]: signature could not be decoded'],
            })
        }
    })

    it('rejects a key that is not trusted, and accepts it when no list is given', async () => {
        const signed = await signDescriptor(descriptor, await otherKey())
        const untrusted = await verifySignatures(signed, TRUSTED_KEYS)
        expect(untrusted).toEqual({
            ok: false,
            problems: ['signatures[0]: public key is not trusted'],
        })
        const embedded = await verifySignatures(signed)
        expect(embedded.ok).toBe(true)
        if (embedded.ok) {
            expect(embedded.signers).toEqual([
                signaturesOf(signed)[0]?.publicKey,
            ])
        }
    })

    it('requires every signature to verify and every key to be trusted', async () => {
        const signed = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        const foreign = await signDescriptor(signed, await otherKey())
        const verified = await verifySignatures(foreign, TRUSTED_KEYS)
        expect(verified.ok).toBe(false)
        if (!verified.ok) {
            expect(verified.problems).toEqual([
                'signatures[1]: public key is not trusted',
            ])
        }

        const broken = {
            ...signed,
            signatures: [
                ...signaturesOf(signed),
                {
                    ...signaturesOf(signed)[0],
                    signature: `${'A'.repeat(86)}==`,
                },
            ],
        }
        const both = await verifySignatures(broken, TRUSTED_KEYS)
        expect(both).toEqual({
            ok: false,
            problems: ['signatures[1]: signature does not verify'],
        })
    })

    it('accepts the same signatures in either order', async () => {
        const first = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        const second = await signDescriptor(first, REFERENCE_PRIVATE_KEY)
        const entries = signaturesOf(second)
        const swapped = { ...second, signatures: [...entries].reverse() }
        await expect(verifySignatures(swapped, TRUSTED_KEYS)).resolves.toEqual({
            ok: true,
            signers: [REFERENCE_SIGNER, REFERENCE_SIGNER],
        })
    })

    it('rejects a signature that sets hashAlgorithm', async () => {
        const signed = await signDescriptor(descriptor, REFERENCE_PRIVATE_KEY)
        const withHash = {
            ...signed,
            signatures: [
                { ...signaturesOf(signed)[0], hashAlgorithm: 'sha-256' },
            ],
        }
        await expect(verifySignatures(withHash, TRUSTED_KEYS)).resolves.toEqual(
            {
                ok: false,
                problems: ['signatures[0]: hashAlgorithm is not supported'],
            }
        )
    })

    it('rejects a descriptor with no signature', async () => {
        await expect(
            verifySignatures(descriptor, TRUSTED_KEYS)
        ).resolves.toEqual({
            ok: false,
            problems: ['descriptor has no signatures'],
        })
        await expect(
            verifySignatures({ ...descriptor, signatures: [] }, TRUSTED_KEYS)
        ).resolves.toEqual({
            ok: false,
            problems: ['descriptor has no signatures'],
        })
    })

    it('reports a malformed signature entry', async () => {
        const verified = await verifySignatures(
            {
                ...descriptor,
                signatures: [
                    {
                        scheme: 'rsa',
                        signature: 'nope',
                        publicKey: 'nope',
                        note: 'x',
                    },
                ],
            },
            TRUSTED_KEYS
        )
        expect(verified.ok).toBe(false)
        if (!verified.ok) {
            expect(verified.problems).toEqual([
                "signatures[0]: unexpected field 'note'",
                "signatures[0]: scheme must be 'ed25519'",
                'signatures[0]: signature must be 64 bytes of base64',
                'signatures[0]: publicKey must be 32 bytes of base64',
            ])
        }
    })

    it('keeps an own __proto__ member in the signed bytes', () => {
        const json: Record<string, unknown> = { a: 1, signatures: [] }
        Object.defineProperty(json, '__proto__', {
            value: 'x',
            writable: true,
            enumerable: true,
            configurable: true,
        })
        expect(new TextDecoder().decode(signingMessage(json))).toBe(
            '{"__proto__":"x","a":1}'
        )
        expect(Object.getPrototypeOf(json)).toBe(Object.prototype)
    })
})
