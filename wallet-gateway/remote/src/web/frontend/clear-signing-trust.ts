// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TRUSTS_REFERENCE_KEY } from '@canton-network/core-tx-clear-signing'

export const REFERENCE_KEY_WARNING =
    'This gateway trusts the reference clear-signing key. Its private key is public, so descriptors signed with it can be forged. Remove it from trusted-keys.json in core-tx-clear-signing before relying on clear signing.'

/**
 * Whether the clear-signing module bundled into this page trusts the reference key. It is the same
 * module the approve page describes transactions with, so this is the trust set in effect.
 */
export function trustsReferenceKey(): boolean {
    return TRUSTS_REFERENCE_KEY
}
