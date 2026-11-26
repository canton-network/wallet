// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type SigningDriverInterface,
    SigningProvider,
} from '@canton-network/core-signing-lib'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import { getSigningController } from '@canton-network/core-wallet-services'
import type {
    Store,
    UpdateWallet,
    Wallet,
} from '@canton-network/core-wallet-store'
import type { Logger } from 'pino'

import type { PartyHint, Primary } from '../../../user-api/rpc-gen/typings.ts'
import type { PartyAllocationService } from '../../party-allocation-service.ts'
import {
    handleSigningProviderError,
    type WalletAllocator,
} from '../wallet-allocation-service.ts'

export class KernelWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private _logger: Logger,
        private partyAllocator: PartyAllocationService,
        protected signingDriver: SigningDriverInterface
    ) {}

    async getKeys(authContext: AuthContext) {
        if (!this.signingDriver) return null
        const driver = getSigningController(this.signingDriver, authContext)
        return await driver.getKeys().then(handleSigningProviderError)
    }

    async createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary = false
    ): Promise<Wallet> {
        const driver = getSigningController(this.signingDriver, authContext)
        const key = await driver
            .createKey({
                name: partyHint,
            })
            .then(handleSigningProviderError)

        const party = await this.partyAllocator.allocateParty(
            authContext.userId,
            partyHint,
            key.publicKey,
            async (hash) => {
                const { signature } = await driver
                    .signTransaction({
                        tx: '',
                        txHash: hash,
                        extraParams: { txPurpose: 'topology' },
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
        )

        const network = await this.store.getCurrentNetwork()
        const wallet: Wallet = {
            partyId: party.partyId,
            hint: party.hint,
            namespace: party.namespace,
            signingProviderId: SigningProvider.WALLET_KERNEL,
            networkId: network.id,
            userId: authContext.userId,
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
        authContext: AuthContext,
        existingWallet: Wallet
    ): Promise<void> {
        const driver = getSigningController(this.signingDriver, authContext)
        const signingCallback = async (hash: string) => {
            const result = await driver
                .signTransaction({
                    tx: '',
                    txHash: hash,
                    extraParams: { txPurpose: 'topology' },
                    keyIdentifier: { publicKey: existingWallet.publicKey },
                })
                .then(handleSigningProviderError)

            if (!result.signature) {
                throw new Error('No signature returned from signing driver')
            }
            return result.signature
        }

        const party = await this.partyAllocator.allocateParty(
            authContext.userId,
            existingWallet.hint,
            existingWallet.publicKey,
            signingCallback
        )

        const network = await this.store.getCurrentNetwork()
        const walletUpdate: UpdateWallet = {
            networkId: network.id,
            partyId: party.partyId,
            status: 'allocated',
        }

        return this.store.updateWallet(walletUpdate)
    }
}
