// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface, TokenNamespace } from '@canton-network/wallet-sdk'
import type { LedgerCommonSchemas } from '@canton-network/core-ledger-client-types'
import { buildSettleOtcTradeCommand, type SigningParty } from './commands.js'

type DisclosedContract = LedgerCommonSchemas['DisclosedContract']

export interface ContextLeg {
    tokenNamespace: TokenNamespace
    ownerPartyId: string
    legId: string
    registryUrl: URL | string
}

/**
 * A settlement leg supplied pre-resolved: the allocation contract id plus the
 * disclosed contract needed for the venue's participant to see it.
 */
export interface DisclosedLeg {
    legId: string
    allocationCid: string
    disclosedContract: DisclosedContract
}

export interface SettleOtcTradeParams {
    venueSdk: SDKInterface<'token'>
    venue: SigningParty
    otcTradeCid: string
    contextLeg: ContextLeg
    disclosedLeg: DisclosedLeg
    globalSynchronizerId: string
    onSettlementFailure?: (contextLegAllocationCid: string) => Promise<void>
    logger?: Logger
}

/**
 * Settles a two-leg OTC trade by exercising `OTCTrade_Settle` on the venue's
 * participant. One leg's allocation is located and its registry choice context
 * resolved here; the other leg is supplied pre-disclosed by the caller.
 *
 * If settlement fails and `onSettlementFailure` is provided, it is invoked for
 * compensation before the original error is re-thrown.
 */
export async function settleOtcTrade(
    params: SettleOtcTradeParams
): Promise<void> {
    const {
        venueSdk,
        venue,
        otcTradeCid,
        contextLeg,
        disclosedLeg,
        globalSynchronizerId,
        onSettlementFailure,
        logger,
    } = params

    const ownerAllocations = await contextLeg.tokenNamespace.allocation.pending(
        contextLeg.ownerPartyId
    )
    const contextAllocation = ownerAllocations.find(
        (a) =>
            a.interfaceViewValue.allocation.transferLegId === contextLeg.legId
    )
    if (!contextAllocation)
        throw new Error('Allocation not found for context leg')

    const contextExecCtx =
        await contextLeg.tokenNamespace.allocation.context.execute({
            allocationCid: contextAllocation.contractId,
            registryUrl: contextLeg.registryUrl,
        })

    const allocationsWithContext = {
        [contextLeg.legId]: {
            _1: contextAllocation.contractId,
            _2: {
                context: {
                    ...(contextExecCtx.choiceContextData ?? {}),
                    values:
                        (contextExecCtx.choiceContextData?.values as Record<
                            string,
                            unknown
                        >) ?? {},
                },
                meta: { values: {} },
            },
        },
        [disclosedLeg.legId]: {
            _1: disclosedLeg.allocationCid,
            _2: { context: { values: {} }, meta: { values: {} } },
        },
    }

    const disclosedContracts = [
        ...(contextExecCtx.disclosedContracts ?? []).map((c) => ({
            ...c,
            synchronizerId: '',
        })),
        disclosedLeg.disclosedContract,
    ]

    try {
        await venueSdk.ledger
            .prepare({
                partyId: venue.partyId,
                commands: [
                    buildSettleOtcTradeCommand({
                        tradeCid: otcTradeCid,
                        allocationsWithContext,
                    }),
                ],
                disclosedContracts,
                synchronizerId: globalSynchronizerId,
            })
            .sign(venue.privateKey)
            .execute({ partyId: venue.partyId })
    } catch (settleError) {
        logger?.error(
            { err: settleError },
            'Settlement failed — running compensation if provided'
        )
        if (onSettlementFailure) {
            try {
                await onSettlementFailure(contextAllocation.contractId)
            } catch (compensationError) {
                logger?.error(
                    { err: compensationError },
                    'Compensation failed — manual intervention required to withdraw allocations'
                )
            }
        }
        throw settleError
    }

    logger?.info('Venue: OTCTrade settled — holdings transferred')
}
