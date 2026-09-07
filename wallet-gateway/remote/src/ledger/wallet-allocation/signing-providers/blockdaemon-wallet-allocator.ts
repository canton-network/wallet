// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserId } from '@canton-network/core-wallet-auth'
import { Store, UpdateWallet, Wallet } from '@canton-network/core-wallet-store'
import {
    SigningDriverInterface,
    SigningProvider,
} from '@canton-network/core-signing-lib'
import { Logger } from 'pino'
import { PartyAllocationService } from '../../party-allocation-service.js'
import { PartyHint, Primary } from '../../../user-api/rpc-gen/typings.js'
import { WALLET_DISABLED_REASON } from '@canton-network/core-types'
import { WalletAllocator } from '../wallet-allocation-service.js'
import { handleSigningProviderError } from '../wallet-allocation-service.js'

export class BlockdaemonWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private logger: Logger,
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
        primary: Primary = false
    ): Promise<Wallet> {
        const driver = this.signingDriver.controller(email)

        const key = await driver.createKey({
            name: partyHint,
        })
        if ('error' in key) {
            throw new Error(`Failed to create key: ${key.error_description}`)
        }

        const namespace = this.partyAllocator.createFingerprintFromKey(
            key.publicKey
        )
        const transactions =
            await this.partyAllocator.generateTopologyTransactions(
                partyHint,
                key.publicKey
            )
        const topologyTransactions = transactions.topologyTransactions ?? []
        topologyTransactions.forEach((tx, idx) => {
            this.logger.info(
                `BLOCKDAEMON: topologyTransaction[${idx}] length=${tx.length} preview=${tx.substring(0, 100)}...`
            )
        })

        const internalTxId = crypto
            .randomUUID()
            .replace(/-/g, '')
            .substring(0, 16)
        const txPayload = JSON.stringify(topologyTransactions)

        const { status, txId } = await driver
            .signTransaction({
                tx: Buffer.from(txPayload).toString('base64'),
                txHash: transactions.multiHash,
                keyIdentifier: {
                    publicKey: key.publicKey,
                },
                internalTxId,
            })
            .then(handleSigningProviderError)

        const network = await this.store.getCurrentNetwork()
        const walletBase: Omit<Wallet, 'status'> = {
            partyId: `${partyHint}::${namespace}`,
            hint: partyHint,
            namespace,
            signingProviderId: SigningProvider.BLOCKDAEMON,
            networkId: network.id,
            userId,
            primary,
            publicKey: key.publicKey,
            externalTxId: txId,
            topologyTransactions: topologyTransactions.join(', '),
            rights: [],
        }
        let wallet: Wallet

        if (status === 'signed') {
            const { signature } = await driver
                .getTransaction({
                    userId,
                    txId,
                })
                .then(handleSigningProviderError)
            if (!signature) {
                throw new Error(
                    'Transaction signed but no signature found in result'
                )
            }
            const partyId =
                await this.partyAllocator.allocatePartyWithExistingWallet(
                    namespace,
                    topologyTransactions,
                    signature,
                    userId
                )
            wallet = {
                ...walletBase,
                partyId,
                status: 'allocated',
            }
        } else if (status === 'pending') {
            wallet = {
                ...walletBase,
                status: 'initialized',
                reason: WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_PENDING,
            }
        } else {
            const reason =
                status === 'rejected'
                    ? WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_REJECTED
                    : WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_FAILED
            wallet = {
                ...walletBase,
                status: 'removed',
                disabled: true,
                reason,
            }
        }

        await this.store.addWallet(wallet)
        return wallet
    }

    async allocateParty(
        userId: UserId,
        email: string | undefined,
        existingWallet: Wallet
    ): Promise<void> {
        if (
            !existingWallet.externalTxId ||
            !existingWallet.topologyTransactions
        ) {
            throw new Error(
                'Existing wallet is missing field externalTxId or topologyTransactions'
            )
        }
        const driver = this.signingDriver.controller(email)

        const { signature, status, metadata } = await driver
            .getTransaction({
                txId: existingWallet.externalTxId,
            })
            .then(handleSigningProviderError)

        let walletUpdate: UpdateWallet = {
            partyId: existingWallet.partyId,
            networkId: existingWallet.networkId,
        }
        if (status === 'signed') {
            if (!signature) {
                throw new Error(
                    'Transaction signed but no signature found in result'
                )
            }
            const partyId =
                await this.partyAllocator.allocatePartyWithExistingWallet(
                    existingWallet.namespace,
                    existingWallet.topologyTransactions.split(', '),
                    signature,
                    userId
                )
            walletUpdate = {
                ...walletUpdate,
                partyId,
                status: 'allocated',
                reason: '',
            }
        } else if (status === 'pending') {
            walletUpdate = {
                ...walletUpdate,
                status: 'initialized',
                reason: WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_PENDING,
            }
        } else {
            this.logger.warn(
                `Topology transaction for wallet ${existingWallet.partyId} was ${status} with ${JSON.stringify(metadata)}`
            )
            const reason =
                status === 'rejected'
                    ? WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_REJECTED
                    : WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_FAILED
            walletUpdate = {
                ...walletUpdate,
                status: 'removed',
                disabled: true,
                reason,
            }
        }

        return this.store.updateWallet(walletUpdate)
    }
}
