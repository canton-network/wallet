// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SigningDriverInterface } from '@canton-network/core-signing-lib'
import { WALLET_DISABLED_REASON } from '@canton-network/core-types'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import { getSigningController } from '@canton-network/core-wallet-services'
import type {
    Store,
    UpdateWallet,
    Wallet,
} from '@canton-network/core-wallet-store'
import type { Logger } from 'pino'

import type {
    Key,
    KeyName,
    PartyHint,
    Primary,
} from '../../../user-api/rpc-gen/typings.ts'
import type { PartyAllocationService } from '../../party-allocation-service.ts'
import {
    handleSigningProviderError,
    type WalletAllocator,
} from '../wallet-allocation-service.ts'
import { finalizeWallet } from './utils.ts'

type GetOrCreateKeyOptions = { keyName?: KeyName; partyHint: PartyHint }

export class ExternalWalletAllocator implements WalletAllocator {
    constructor(
        private store: Store,
        private logger: Logger,
        private partyAllocator: PartyAllocationService,
        protected signingDriver: SigningDriverInterface
    ) {}

    async getKeys(authContext: AuthContext) {
        if (!this.signingDriver) return null
        const driver = getSigningController(this.signingDriver, authContext)
        return await driver.getKeys().then(handleSigningProviderError)
    }

    async getOrCreateKey(
        authContext: AuthContext,
        opts: GetOrCreateKeyOptions
    ): Promise<Key> {
        const driver = getSigningController(this.signingDriver, authContext)

        if (opts.keyName) {
            const keys = await driver.getKeys().then(handleSigningProviderError)
            const key = keys?.keys?.find((k) => k.name === opts.keyName)

            if (!key) {
                const message = `Driver did not return a key with name ${opts.keyName}`

                this.logger.warn(message)
                throw new Error(message)
            }
            return key
        } else {
            const key = await driver
                .createKey({ name: opts.partyHint })
                .then(handleSigningProviderError)

            return key
        }
    }

    async createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary = false,
        keyName?: KeyName | undefined
    ): Promise<Wallet> {
        const driver = getSigningController(this.signingDriver, authContext)

        const key = await this.getOrCreateKey(authContext, {
            keyName,
            partyHint,
        })

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
            this.logger.debug(
                `${this.signingDriver.signingProvider}: topologyTransaction[${idx}] length=${tx.length} preview=${tx.substring(0, 100)}...`
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
                txPurpose: 'topology',
                keyIdentifier: { id: key.id, publicKey: key.publicKey },
                internalTxId,
            })
            .then(handleSigningProviderError)

        const network = await this.store.getCurrentNetwork()
        const walletBase: Omit<Wallet, 'status'> = {
            partyId: `${partyHint}::${namespace}`,
            hint: partyHint,
            namespace,
            signingProviderId: this.signingDriver.signingProvider,
            networkId: network.id,
            userId: authContext.userId,
            primary,
            publicKey: key.publicKey,
            externalTxId: txId,
            topologyTransactions: topologyTransactions.join(', '),
            rights: [],
        }

        const wallet = await finalizeWallet(
            walletBase,
            authContext.userId,
            status,
            txId,
            topologyTransactions,
            namespace,
            driver,
            this.partyAllocator
        )

        await this.store.addWallet(wallet)
        return wallet
    }

    async allocateParty(
        authContext: AuthContext,
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
        const driver = getSigningController(this.signingDriver, authContext)

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
                    authContext.userId
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
