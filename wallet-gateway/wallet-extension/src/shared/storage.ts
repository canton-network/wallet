// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { storage } from 'wxt/utils/storage'

import type { VaultStatus } from './vault-protocol.ts'

/**
 * The vault's status, for pages to watch. Not secret. The background writes it
 * after every change; ask the background (`vault.getStatus`) for the current
 * value, since this item is unset until the background has started.
 */
export const vaultStatusItem = storage.defineItem<VaultStatus>(
    'session:vaultStatus',
    { fallback: 'locked' }
)
