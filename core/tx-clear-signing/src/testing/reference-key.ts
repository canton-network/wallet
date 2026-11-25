// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { signDescriptor } from '../signature.ts'

/**
 * The reference Ed25519 private key, as a JWK.
 *
 * The private key is in this repository on purpose, so the examples and the tests can produce
 * signatures. The shipped `trusted-keys.json` trusts its public key, so those signatures verify. It
 * demonstrates the mechanism. A deployment that relies on descriptor wording removes it from that
 * file; while it is there, `TRUSTS_REFERENCE_KEY` is true and the gateway shows a warning.
 */
export const REFERENCE_PRIVATE_KEY: JsonWebKey = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'RF9nfV7c_KhUJc5wcmkWt6awyV2x8Ij_ueGQb1t9ZhQ',
    d: 'm5ybDMRn78Vt_iTcu5wJCPNZal303fK6klrXeiCCyHk',
}

/** Signs `json` with the reference key, appending one `ed25519` signature. */
export function signWithReferenceKey(
    json: unknown
): Promise<Record<string, unknown>> {
    return signDescriptor(json, REFERENCE_PRIVATE_KEY)
}
