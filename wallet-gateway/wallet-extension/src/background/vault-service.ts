// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { logger } from '@/shared/logger'
import { vaultMessenger } from '@/shared/vault-protocol'
import { isTrustedSender, type Sender } from './trusted-service'
import type { Vault } from './vault'

const log = logger.getChild('vault')

/**
 * Answers the vault messages of the extension pages. Must be called
 * synchronously during background start-up, so a message that wakes the
 * service worker is handled. Passwords are never logged.
 */
export function registerVaultService(vault: Vault): void {
    function assertTrusted(type: string, sender: Sender): void {
        if (isTrustedSender(sender)) return
        log.warn('Refused {type} from an untrusted sender', { type })
        throw new Error(`${type} is only for the extension pages.`)
    }

    vaultMessenger.onMessage('vault.getStatus', async ({ type, sender }) => {
        assertTrusted(type, sender)
        // Right after a background start, the status is only reliable once
        // the restore has finished.
        await vault.ready
        return vault.status()
    })
    vaultMessenger.onMessage('vault.create', async ({ type, sender, data }) => {
        assertTrusted(type, sender)
        await vault.create(data.password)
    })
    vaultMessenger.onMessage('vault.unlock', async ({ type, sender, data }) => {
        assertTrusted(type, sender)
        await vault.unlock(data.password)
    })
    vaultMessenger.onMessage('vault.lock', async ({ type, sender }) => {
        assertTrusted(type, sender)
        await vault.lock()
    })
}
