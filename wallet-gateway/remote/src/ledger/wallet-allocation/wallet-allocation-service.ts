// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type Error as SigningProviderError,
    type Keys,
    type SigningDriverInterface,
    SigningProvider,
    PartyMode,
} from '@canton-network/core-signing-lib'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Store, Wallet } from '@canton-network/core-wallet-store'
import type { Logger } from 'pino'

import type {
    KeyName,
    PartyHint,
    Primary,
} from '../../user-api/rpc-gen/typings.ts'
import type { PartyAllocationService } from '../party-allocation-service.ts'
import { ExternalWalletAllocator } from './signing-providers/external-wallet-allocator.ts'
import { InternalWalletAllocator } from './signing-providers/internal-wallet-allocator.ts'
import { KernelWalletAllocator } from './signing-providers/kernel-wallet-allocator.ts'

export interface WalletAllocator {
    createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary,
        vaultName?: KeyName
    ): Promise<Wallet>
    allocateParty(
        authContext: AuthContext,
        existingWallet: Wallet
    ): Promise<void>
    getKeys(authContext: AuthContext): Promise<Keys | null | void>
}

export function handleSigningProviderError<T extends object>(
    result: SigningProviderError | T
): T {
    if ('error' in result) {
        throw new Error(
            `Error from signing driver: ${result.error_description}`
        )
    }
    return result
}

export class WalletAllocationService {
    private readonly kernelAllocator?: KernelWalletAllocator

    private readonly createExternalAllocator: (
        signingProviderId: SigningProvider
    ) => ExternalWalletAllocator

    private readonly createInternalAllocator: (
        signingProviderId: SigningProvider
    ) => InternalWalletAllocator

    private getAllocator(signingProviderId: SigningProvider): WalletAllocator {
        const driver = this.signingDrivers[signingProviderId]
        let allocator: WalletAllocator | undefined

        if (driver?.partyMode === PartyMode.INTERNAL) {
            allocator = this.createInternalAllocator(signingProviderId)
        } else {
            if (signingProviderId === SigningProvider.WALLET_KERNEL) {
                allocator = this.kernelAllocator
            } else {
                allocator = this.createExternalAllocator(signingProviderId)
            }
        }

        if (!allocator) {
            throw new Error(
                `Signing driver for ${signingProviderId} not available`
            )
        }

        return allocator
    }

    constructor(
        store: Store,
        logger: Logger,
        partyAllocator: PartyAllocationService,
        private signingDrivers: Partial<
            Record<SigningProvider, SigningDriverInterface>
        > = {}
    ) {
        this.createExternalAllocator = (signingProviderId: SigningProvider) => {
            const driver = signingDrivers[signingProviderId]

            if (!driver) {
                throw new Error(
                    `Signing driver for ${signingProviderId} not available`
                )
            }

            return new ExternalWalletAllocator(
                store,
                logger,
                partyAllocator,
                driver
            )
        }

        this.createInternalAllocator = (signingProviderId: SigningProvider) =>
            new InternalWalletAllocator(
                store,
                logger,
                partyAllocator,
                signingProviderId
            )

        const kernelDriver = signingDrivers[SigningProvider.WALLET_KERNEL]
        if (kernelDriver) {
            this.kernelAllocator = new KernelWalletAllocator(
                store,
                logger,
                partyAllocator,
                kernelDriver
            )
        }
    }

    public async createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary,
        signingProviderId: SigningProvider,
        keyName?: KeyName
    ): Promise<Wallet> {
        return this.getAllocator(signingProviderId).createWallet(
            authContext,
            partyHint,
            primary,
            keyName
        )
    }

    public async allocateParty(
        authContext: AuthContext,
        existingWallet: Wallet,
        signingProviderId: SigningProvider
    ): Promise<void> {
        const allocator = this.getAllocator(signingProviderId)
        return allocator.allocateParty(authContext, existingWallet)
    }

    public async getKeys(
        authContext: AuthContext,
        signingProviderId: SigningProvider
    ) {
        const allocator = this.getAllocator(signingProviderId)
        return allocator.getKeys(authContext)
    }
}
