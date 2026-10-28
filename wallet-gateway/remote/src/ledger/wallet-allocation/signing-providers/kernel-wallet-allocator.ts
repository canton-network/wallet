// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UserId } from '@canton-network/core-wallet-auth'
import type {
    Store,
    UpdateWallet,
    Wallet,
} from '@canton-network/core-wallet-store'
import {
    type SigningDriverInterface,
    SigningProvider,
} from '@canton-network/core-signing-lib'
import type { Logger } from 'pino'
import type { PartyAllocationService } from '../../party-allocation-service.js'
import type { PartyHint, Primary } from '../../../user-api/rpc-gen/typings.js'
import {
    handleSigningProviderError,
    type WalletAllocationOptions,
    type WalletAllocator,
} from '../wallet-allocation-service.js'

export class KernelWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private _logger: Logger,
        private partyAllocator: PartyAllocationService,
        protected signingDriver: SigningDriverInterface
    ) {}

    async getKeys(userId: UserId) {
        if (!this.signingDriver) return null
        const driver = this.signingDriver.controller(userId)
        return await driver.getKeys().then(handleSigningProviderError)
    }

    async createWallet(
        userId: UserId,
        email: string | undefined,
        partyHint: PartyHint,
        primary: Primary = false,
        options: WalletAllocationOptions = {}
    ): Promise<Wallet> {
        const driver = this.signingDriver.controller(userId)
        const key = await driver
            .createKey({
                name: partyHint,
            })
            .then(handleSigningProviderError)

        const signingCallback = async (hash: string) => {
            const { signature } = await driver
                .signTransaction({
                    tx: '',
                    txHash: hash,
                    keyIdentifier: {
                        publicKey: key.publicKey,
                    },
                })
                .then(handleSigningProviderError)

            if (!signature) {
                throw new Error('No signature returned from signing driver')
            }

            return signature
        }
        const party =
            options.grantRights === false
                ? await this.partyAllocator.allocateParty(
                      partyHint,
                      key.publicKey,
                      signingCallback
                  )
                : await this.partyAllocator.allocatePartyAndGrantRights(
                      userId,
                      partyHint,
                      key.publicKey,
                      signingCallback
                  )

        const network = await this.store.getCurrentNetwork()
        const wallet: Wallet = {
            partyId: party.partyId,
            hint: party.hint,
            namespace: party.namespace,
            signingProviderId: SigningProvider.WALLET_KERNEL,
            networkId: network.id,
            userId,
            status: 'allocated',
            primary,
            publicKey: key.publicKey,
            externalTxId: '',
            topologyTransactions: '',
            rights: [],
        }
        await this.store.addWallet(wallet)
        return wallet
    }

    async allocateParty(
        userId: UserId,
        email: string | undefined,
        existingWallet: Wallet,
        options: WalletAllocationOptions
    ): Promise<void> {
        const driver = this.signingDriver.controller(userId)
        const signingCallback = async (hash: string) => {
            const result = await driver
                .signTransaction({
                    tx: '',
                    txHash: hash,
                    keyIdentifier: { publicKey: existingWallet.publicKey },
                })
                .then(handleSigningProviderError)

            if (!result.signature) {
                throw new Error('No signature returned from signing driver')
            }
            return result.signature
        }

        const party =
            options.grantRights === false
                ? await this.partyAllocator.allocateParty(
                      existingWallet.hint,
                      existingWallet.publicKey,
                      signingCallback
                  )
                : await this.partyAllocator.allocatePartyAndGrantRights(
                      userId,
                      existingWallet.hint,
                      existingWallet.publicKey,
                      signingCallback
                  )

        const network = await this.store.getCurrentNetwork()
        const updateWallet: UpdateWallet = {
            networkId: network.id,
            partyId: party.partyId,
            status: 'allocated',
        }

        return await this.store.updateWallet(updateWallet)
    }
}
