// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO see if I can fit it into token-provider structure
import {
    CompactJWSHeaderParameters,
    JWTPayload,
    base64url,
    calculateJwkThumbprint,
} from 'jose'

export function prepareJwsForSigning(
    header: CompactJWSHeaderParameters,
    payload: JWTPayload
) {
    const encoder = new TextEncoder()

    const encodedHeader = base64url.encode(
        encoder.encode(JSON.stringify(header))
    )

    const encodedPayload = base64url.encode(
        encoder.encode(JSON.stringify(payload))
    )

    return `${encodedHeader}.${encodedPayload}`
}

export function appendJwsBase64Signature(
    jwSHeaderAndPayload: string,
    base64Signature: string
) {
    const signatureBytes = Uint8Array.from(atob(base64Signature), (c) =>
        c.charCodeAt(0)
    )
    const base64UrlSignature = base64url.encode(signatureBytes)

    return `${jwSHeaderAndPayload}.${base64UrlSignature}`
}

// RFC 7638 JWK thumbprint for a public key
export async function getKeyId(publicKeyBase64: string): Promise<string> {
    const raw = Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0))
    return calculateJwkThumbprint(
        {
            kty: 'OKP',
            crv: 'Ed25519',
            x: base64url.encode(raw),
        },
        'sha256'
    )
}
