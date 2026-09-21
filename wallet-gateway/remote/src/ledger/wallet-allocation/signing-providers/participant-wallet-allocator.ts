// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UserId } from '@canton-network/core-wallet-auth'
import type { Network, Store, Wallet } from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { Logger } from 'pino'
import type { PartyAllocationService } from '../../party-allocation-service.js'
import type { PartyHint, Primary } from '../../../user-api/rpc-gen/typings.js'
import type { WalletAllocator } from '../wallet-allocation-service.js'

export class ParticipantWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private logger: Logger,
        private partyAllocator: PartyAllocationService
    ) {}

    async getKeys() {
        throw new Error('Method not implemented')
    }

    async createWallet(
        userId: UserId,
        email: string | undefined,
        partyHint: PartyHint,
        primary: Primary = false,
        _vaultName?: undefined,
        network?: Network
    ): Promise<Wallet> {
        const party = await this.partyAllocator.allocateParty(userId, partyHint)
        const targetNetwork = network ?? (await this.store.getCurrentNetwork())
        const wallet: Wallet = {
            partyId: party.partyId,
            hint: party.hint,
            namespace: party.namespace,
            signingProviderId: SigningProvider.PARTICIPANT,
            networkId: targetNetwork.id,
            userId,
            status: 'allocated',
            primary,
            publicKey: party.namespace,
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
        existingWallet: Wallet
    ): Promise<void> {
        const party = await this.partyAllocator.allocateParty(
            userId,
            existingWallet.hint
        )
        return await this.store.updateWallet({
            partyId: party.partyId,
            networkId: existingWallet.networkId,
            status: 'allocated',
        })
    }
}
