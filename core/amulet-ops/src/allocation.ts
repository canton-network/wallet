// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import { AMULET_TEMPLATE_ID } from '@canton-network/core-amulet-service'
import type { SigningParty } from './tap.js'

const AMULET_INSTRUMENT = {
    id: 'Amulet',
    displayName: 'Amulet',
    symbol: 'CC',
} as const

export interface AllocateAmuletParams {
    sdk: SDKInterface<'token'>
    sender: SigningParty
    adminPartyId: string
    registryUrl: URL
    globalSynchronizerId: string
    logger?: Logger
}

/**
 * Allocates the sender's Amulet holding against its leg of a pending token
 * allocation request.
 *
 * Looks up the sender's transfer leg in the pending allocation request, reads its
 * Amulet holding, builds the allocation instruction for the Amulet instrument, and
 * submits it signed by the sender.
 *
 * @returns The transfer-leg id that was allocated.
 */
export async function allocateAmulet(
    params: AllocateAmuletParams
): Promise<string> {
    const {
        sdk,
        sender,
        adminPartyId,
        registryUrl,
        globalSynchronizerId,
        logger,
    } = params
    const token = sdk.token

    const pendingRequests = await token.allocation.request.pending(
        sender.partyId
    )
    const requestView = pendingRequests[0].interfaceViewValue!
    const legId = Object.keys(requestView.transferLegs).find(
        (key) => requestView.transferLegs[key].sender === sender.partyId
    )!
    if (!legId) throw new Error('No transfer leg found for sender')

    const amuletHoldings = await sdk.ledger.acsReader.readJsContracts({
        templateIds: [AMULET_TEMPLATE_ID],
        parties: [sender.partyId],
        filterByParty: true,
    })
    const amuletHoldingCid = amuletHoldings[0]?.contractId
    if (!amuletHoldingCid)
        throw new Error('Amulet holding not found for sender')

    const [command, disclosedContracts] =
        await token.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: AMULET_INSTRUMENT.id,
                displayName: AMULET_INSTRUMENT.displayName,
                symbol: AMULET_INSTRUMENT.symbol,
                registryUrl,
                admin: adminPartyId,
            },
            inputUtxos: [amuletHoldingCid],
            requestedAt: new Date().toISOString(),
        })

    await sdk.ledger
        .prepare({
            partyId: sender.partyId,
            commands: [command],
            disclosedContracts,
            synchronizerId: globalSynchronizerId,
        })
        .sign(sender.privateKey)
        .execute({ partyId: sender.partyId })

    logger?.info('Amulet allocated for sender leg (global synchronizer)')
    return legId
}
