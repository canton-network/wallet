// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Keys,
    SigningDriverInterface,
    Error as SigningError,
} from '@canton-network/core-signing-lib'
import { UserId } from '@canton-network/core-wallet-auth'
import { Wallet } from '@canton-network/core-wallet-store'
import { Primary } from '../../../dapp-api/rpc-gen/typings'
import { KeyName, PartyHint } from '../../../user-api/rpc-gen/typings'

export abstract class WalletAllocator {
    abstract createWallet(
        userId: UserId,
        email: string | undefined,
        partyHint: PartyHint,
        primary: Primary,
        vaultName?: KeyName | undefined
    ): Promise<Wallet>
    abstract allocateParty(
        userId: UserId,
        email: string | undefined,
        existingWallet: Wallet
    ): Promise<void>

    constructor(protected signingDriver: SigningDriverInterface | null) {}

    protected handleSigningError<T extends object>(
        result: SigningError | T
    ): T {
        if ('error' in result) {
            throw new Error(
                `Error from signing driver: ${result.error_description}`
            )
        }
        return result
    }

    async getKeys(userId: UserId): Promise<Keys | null> {
        if (!this.signingDriver) return null
        const driver = this.signingDriver.controller(userId)
        return await driver.getKeys().then(this.handleSigningError)
    }
}
