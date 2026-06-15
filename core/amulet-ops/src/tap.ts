// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { PrivateKey } from '@canton-network/core-signing-lib'
import type { SDKInterface } from '@canton-network/wallet-sdk'

export interface SigningParty {
    partyId: string
    privateKey: PrivateKey
}

export interface MintAmuletParams {
    sdk: SDKInterface<'amulet'>
    receiver: SigningParty
    amount: string
    synchronizerId: string
    logger?: Logger
}

/**
 * Taps (mints) `amount` Amulet into `receiver`'s wallet on `synchronizerId`.
 *
 * Builds the tap command via the SDK's `amulet` namespace, then prepares, signs,
 * and executes it as a single-party submission by the receiver.
 */
export async function mintAmulet(params: MintAmuletParams): Promise<void> {
    const { sdk, receiver, amount, synchronizerId, logger } = params

    const [tapCommand, disclosedContracts] = await sdk.amulet.tap(
        receiver.partyId,
        amount
    )

    await sdk.ledger
        .prepare({
            partyId: receiver.partyId,
            commands: tapCommand,
            disclosedContracts,
            synchronizerId,
        })
        .sign(receiver.privateKey)
        .execute({ partyId: receiver.partyId })

    logger?.info(`Amulet minted (${amount}) for receiver on synchronizer`)
}
