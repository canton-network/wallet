// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserId } from '@canton-network/core-wallet-auth'
import { Store, Wallet } from '@canton-network/core-wallet-store'
import {
    isRpcError,
    SigningDriverInterface,
    SigningProvider,
} from '@canton-network/core-signing-lib'
import { Logger } from 'pino'
import {
    PartyHint,
    Primary,
    VaultName,
} from '../../../user-api/rpc-gen/typings.js'
import type { WalletAllocator } from '../wallet-allocation-service.js'

/**
 * Imports Canton parties already provisioned in Taurus-PROTECT (via the gateway's listAccounts).
 * The party is hosted externally — no topology transaction, no hash signing; createWallet just records it.
 */
export class TaurusProtectWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private logger: Logger,
        private signingDriver: SigningDriverInterface
    ) {}

    async createWallet(
        userId: UserId,
        email: string | undefined,
        partyHint: PartyHint,
        primary: Primary = false,
        vaultName?: VaultName | undefined
    ): Promise<Wallet> {
        const keys = await this.listParties(userId)

        // Prefixes are not unique (Canton uniqueness is prefix::fingerprint),
        // so a silent first-match could custody the wrong party.
        const selector = vaultName ?? partyHint
        const label = vaultName === undefined ? 'hint' : 'vault'
        const matches = keys.filter((k) => k.name === selector)
        if (matches.length > 1) {
            throw new Error(
                `Ambiguous Taurus-PROTECT ${label} "${selector}": ${matches
                    .map((k) => k.id)
                    .join(', ')}`
            )
        }
        const key = matches[0]
        if (!key) {
            throw new Error(
                `No Taurus-PROTECT party found for ${label} "${selector}"`
            )
        }

        const partyId = key.id
        const namespace = partyId.includes('::')
            ? partyId.slice(partyId.indexOf('::') + 2)
            : partyId
        const network = await this.store.getCurrentNetwork()
        const wallet: Wallet = {
            partyId,
            hint: partyHint,
            namespace,
            signingProviderId: SigningProvider.TAURUS_PROTECT,
            networkId: network.id,
            status: 'allocated',
            primary,
            publicKey: key.publicKey,
            externalTxId: '',
            topologyTransactions: '',
            rights: [],
        }
        this.logger.info(
            { partyId, hint: partyHint },
            'Imported Taurus-PROTECT party'
        )
        await this.store.addWallet(wallet)
        return wallet
    }

    async allocateParty(
        _userId: UserId,
        _email: string | undefined,
        existingWallet: Wallet
    ): Promise<void> {
        // Taurus-PROTECT parties are provisioned externally; nothing to allocate, just confirm the wallet is active.
        const network = await this.store.getCurrentNetwork()
        await this.store.updateWallet({
            partyId: existingWallet.partyId,
            networkId: network.id,
            status: 'allocated',
        })
    }

    // Taurus-PROTECT has no vaults; the selectable unit is the provisioned party, named by its prefix.
    async getVaults(userId: UserId): Promise<{ vaults: string[] }> {
        const keys = await this.listParties(userId)
        return { vaults: keys.map((key) => key.name) }
    }

    private async listParties(userId: UserId) {
        const driver = this.signingDriver.controller(userId)
        const keysResult = await driver.getKeys()
        if (isRpcError(keysResult)) {
            throw new Error(
                `Failed to list Taurus-PROTECT parties: ${keysResult.error_description}`
            )
        }
        return keysResult.keys
    }
}
