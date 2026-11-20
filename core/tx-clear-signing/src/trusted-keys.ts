// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TrustedKey } from './signature.ts'

/**
 * The name of the reference key. Its private half is published under `testing/`, so the examples
 * and the tests can sign. It is not a secret. A deployment trusts a descriptor author by listing
 * that author's public key here instead.
 */
export const REFERENCE_SIGNER = 'reference'

/**
 * Public keys whose descriptor signatures `clearSign` accepts. Removing a key is how a signature
 * from it stops being accepted. v1 has no expiry and no revocation record.
 */
export const TRUSTED_KEYS: readonly TrustedKey[] = [
    {
        name: REFERENCE_SIGNER,
        scheme: 'ed25519',
        publicKey: 'RF9nfV7c/KhUJc5wcmkWt6awyV2x8Ij/ueGQb1t9ZhQ=',
    },
]
