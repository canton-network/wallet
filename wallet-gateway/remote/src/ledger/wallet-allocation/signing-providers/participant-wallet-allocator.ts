// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthContext } from '@canton-network/core-wallet-auth'
import { Store, Wallet } from '@canton-network/core-wallet-store'
import { SigningProvider } from '@canton-network/core-signing-lib'
import { Logger } from 'pino'
import { PartyAllocationService } from '../../party-allocation-service.js'
import { PartyHint, Primary } from '../../../user-api/rpc-gen/typings.js'
import type { WalletAllocator } from '../wallet-allocation-service.js'

export class ParticipantWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private logger: Logger,
        private partyAllocator: PartyAllocationService
    ) {}

    async createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary = false
    ): Promise<Wallet> {
        const party = await this.partyAllocator.allocateParty(
            authContext.userId,
            partyHint
        )
        const network = await this.store.getCurrentNetwork()
        const wallet: Wallet = {
            partyId: party.partyId,
            hint: party.hint,
            namespace: party.namespace,
            signingProviderId: SigningProvider.PARTICIPANT,
            networkId: network.id,
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
        authContext: AuthContext,
        existingWallet: Wallet
    ): Promise<void> {
        const party = await this.partyAllocator.allocateParty(
            authContext.userId,
            existingWallet.hint
        )
        const network = await this.store.getCurrentNetwork()
        return await this.store.updateWallet({
            partyId: party.partyId,
            networkId: network.id,
            status: 'allocated',
        })
    }
}
