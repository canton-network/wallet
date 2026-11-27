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

export type WalletAllocationOptions = {
    grantRights?: boolean
    keyName?: KeyName
}

export interface WalletAllocator {
    createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary,
        options: WalletAllocationOptions
    ): Promise<Wallet>
    allocateParty(
        authContext: AuthContext,
        existingWallet: Wallet,
        options: WalletAllocationOptions
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
    private readonly createInternalAllocator = (
        signingProviderId: SigningProvider
    ): InternalWalletAllocator => {
        return new InternalWalletAllocator(
            this.store,
            this.logger,
            this.partyAllocator,
            signingProviderId
        )
    }

    private readonly createExternalAllocator = (
        signingProviderId: SigningProvider
    ): WalletAllocator => {
        const driver = this.signingDrivers[signingProviderId]

        if (!driver) {
            throw new Error(
                `Signing driver for ${signingProviderId} not available`
            )
        }

        if (signingProviderId === SigningProvider.WALLET_KERNEL) {
            return new KernelWalletAllocator(
                this.store,
                this.logger,
                this.partyAllocator,
                driver
            )
        }

        return new ExternalWalletAllocator(
            this.store,
            this.logger,
            this.partyAllocator,
            driver
        )
    }

    private getAllocator(signingProviderId: SigningProvider): WalletAllocator {
        const driver = this.signingDrivers[signingProviderId]
        const allocatorFactory =
            driver?.partyMode === PartyMode.INTERNAL
                ? this.createInternalAllocator
                : this.createExternalAllocator

        return allocatorFactory(signingProviderId)
    }

    constructor(
        private store: Store,
        private logger: Logger,
        private partyAllocator: PartyAllocationService,
        private signingDrivers: Partial<
            Record<SigningProvider, SigningDriverInterface>
        > = {}
    ) {}

    public async createWallet(
        authContext: AuthContext,
        partyHint: PartyHint,
        primary: Primary,
        signingProviderId: SigningProvider,
        options: WalletAllocationOptions = {}
    ): Promise<Wallet> {
        return this.getAllocator(signingProviderId).createWallet(
            authContext,
            partyHint,
            primary,
            options
        )
    }

    public async allocateParty(
        authContext: AuthContext,
        existingWallet: Wallet,
        signingProviderId: SigningProvider,
        options: WalletAllocationOptions = {}
    ): Promise<void> {
        return this.getAllocator(signingProviderId).allocateParty(
            authContext,
            existingWallet,
            options
        )
    }

    public async getKeys(
        authContext: AuthContext,
        signingProviderId: SigningProvider
    ) {
        return this.getAllocator(signingProviderId).getKeys(authContext)
    }
}
