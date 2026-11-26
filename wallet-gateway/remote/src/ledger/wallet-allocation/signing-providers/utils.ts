// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SigningDriverInterface } from '@canton-network/core-signing-lib'
import { WALLET_DISABLED_REASON } from '@canton-network/core-types'
import type { UserId } from '@canton-network/core-wallet-auth'
import type { Wallet } from '@canton-network/core-wallet-store'

import type { PartyAllocationService } from '../../party-allocation-service.ts'
import { handleSigningProviderError } from '../wallet-allocation-service.ts'

export async function finalizeWallet(
    walletBase: Omit<Wallet, 'status'>,
    userId: UserId,
    status: string,
    txId: string,
    topologyTransactions: string[],
    namespace: string,
    driver: ReturnType<SigningDriverInterface['controller']>,
    partyAllocator: PartyAllocationService
): Promise<Wallet> {
    if (status === 'signed') {
        const { signature } = await driver
            .getTransaction({ txId })
            .then(handleSigningProviderError)
        if (!signature) {
            throw new Error(
                'Transaction signed but no signature found in result'
            )
        }
        const partyId = await partyAllocator.allocatePartyWithExistingWallet(
            namespace,
            topologyTransactions,
            signature,
            userId
        )
        return { ...walletBase, partyId, status: 'allocated' }
    }

    if (status === 'pending') {
        return {
            ...walletBase,
            status: 'initialized',
            reason: WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_PENDING,
        }
    }

    const reason =
        status === 'rejected'
            ? WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_REJECTED
            : WALLET_DISABLED_REASON.TOPOLOGY_TRANSACTION_FAILED

    return {
        ...walletBase,
        status: 'removed',
        disabled: true,
        reason,
    }
}
