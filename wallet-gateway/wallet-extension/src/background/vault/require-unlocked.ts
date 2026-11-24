// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { VaultLockedError } from './errors.ts'
import type { VaultLockState } from './vault.ts'

/** An object of async methods, nested in plain objects to any depth. */
export type LockableService = {
    [name: string]: ((...args: never[]) => Promise<unknown>) | LockableService
}

/**
 * Puts a service behind the vault lock: each of its methods, at any depth,
 * waits for the vault's restore, then rejects with `VaultLockedError` unless
 * the vault is unlocked. The services the pages call need this on top of the
 * pages' guard: `registerTrustedService` checks who calls, this checks that
 * the vault is open.
 */
export function requireUnlocked<T extends LockableService>(
    vault: VaultLockState,
    service: T
): T {
    return Object.fromEntries(
        Object.entries(service).map(([name, member]) => [
            name,
            typeof member === 'function'
                ? async (...args: Parameters<typeof member>) => {
                      await vault.ready
                      if (vault.status() !== 'unlocked')
                          throw new VaultLockedError()
                      return member(...args)
                  }
                : requireUnlocked(vault, member),
        ])
    ) as T
}
