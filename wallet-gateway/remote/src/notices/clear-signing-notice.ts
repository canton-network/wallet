// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ServerNotices } from './server-notices.ts'

export const REFERENCE_KEY_NOTICE_ID = 'clear-signing-reference-key'

/**
 * Warns administrators while the bundled clear-signing config still trusts the reference key, whose
 * private key is public.
 */
export function reportClearSigningTrust(
    notices: ServerNotices,
    trustsReferenceKey: boolean
): void {
    if (!trustsReferenceKey) return
    notices.report({
        id: REFERENCE_KEY_NOTICE_ID,
        severity: 'warning',
        message:
            'Clear signing trusts the reference key, whose private key is public: descriptors signed with it can be forged. Remove it from trusted-keys.json in core-tx-clear-signing and rebuild.',
    })
}
