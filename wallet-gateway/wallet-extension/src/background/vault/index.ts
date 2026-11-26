// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type { VaultStatus } from '@/shared/vault-protocol.ts'
export {
    CorruptVaultError,
    InvalidPasswordError,
    VaultExistsError,
    VaultLockedError,
    VaultNotFoundError,
    WeakPasswordError,
} from './errors.ts'
export { type LockableService, requireUnlocked } from './require-unlocked.ts'
export {
    createVault,
    type Vault,
    type VaultItem,
    type VaultLockState,
} from './vault.ts'
