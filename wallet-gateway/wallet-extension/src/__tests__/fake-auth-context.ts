// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthContext } from '@canton-network/core-wallet-auth'
import { vi } from 'vitest'
import type { AuthContextStore } from '@/background/auth-context'

/** An auth context store whose `load()` resolves to `context`. */
export function fakeAuthContext(context?: AuthContext) {
    return {
        load: vi.fn<AuthContextStore['load']>(async () => context),
        store: vi.fn<AuthContextStore['store']>(async () => {}),
        clear: vi.fn<AuthContextStore['clear']>(async () => {}),
    } satisfies AuthContextStore
}
