// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface, TokenNamespace } from '@canton-network/wallet-sdk'
import type { SigningParty } from './commands.js'

export type AllocationWithdrawParams = Parameters<
    TokenNamespace['allocation']['withdraw']
>[0]

export interface AllocationWithdrawal {
    sdk: SDKInterface<'token'>
    owner: SigningParty
    withdrawParams: AllocationWithdrawParams
    logMessage?: string
}

export interface WithdrawAllocationsParams {
    withdrawals: AllocationWithdrawal[]
    globalSynchronizerId: string
    logger?: Logger
}

/**
 * Withdraws each allocation in parallel, returning the held funds to its owner.
 *
 * Useful as compensation when an OTC settlement fails: build one
 * {@link AllocationWithdrawal} per locked allocation and the held holdings are
 * released back to their respective parties. The asset descriptors are supplied
 * by the caller, so this stays asset-agnostic.
 */
export async function withdrawAllocations(
    params: WithdrawAllocationsParams
): Promise<void> {
    const { withdrawals, globalSynchronizerId, logger } = params

    await Promise.all(
        withdrawals.map(async ({ sdk, owner, withdrawParams, logMessage }) => {
            const [cmd, disclosed] =
                await sdk.token.allocation.withdraw(withdrawParams)
            await sdk.ledger
                .prepare({
                    partyId: owner.partyId,
                    commands: [cmd],
                    disclosedContracts: disclosed,
                    synchronizerId: globalSynchronizerId,
                })
                .sign(owner.privateKey)
                .execute({ partyId: owner.partyId })
            if (logMessage) logger?.info(logMessage)
        })
    )
}
