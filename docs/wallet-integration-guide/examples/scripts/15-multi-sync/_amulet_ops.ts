// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { AMULET_TEMPLATE_ID } from '@canton-network/core-amulet-service'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import type { MultiSyncSetup } from './_setup.js'
import { ALICE_AMULET_TAP_AMOUNT } from './_constants.js'

export { AMULET_TEMPLATE_ID }

export async function mintAmuletForAlice(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<void> {
    const { appUserSdk, alice, globalSynchronizerId } = setup
    const [aliceTapCreateCommand, aliceTapCreateDisclosedContracts] =
        await appUserSdk.amulet.tap(alice.partyId, ALICE_AMULET_TAP_AMOUNT)

    await appUserSdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: aliceTapCreateCommand,
            disclosedContracts: aliceTapCreateDisclosedContracts,
            synchronizerId: globalSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info(
        `Alice: Amulet minted (${ALICE_AMULET_TAP_AMOUNT}) on global synchronizer`
    )
}

export async function allocateAmuletForAlice(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<string> {
    const {
        appUserSdk,
        tokenNamespaceAppUser,
        alice,
        globalSynchronizerId,
        amuletAdmin,
    } = setup

    const pendingRequests =
        await tokenNamespaceAppUser.allocation.request.pending(alice.partyId)
    const requestView = pendingRequests[0].interfaceViewValue!
    const legId = Object.keys(requestView.transferLegs).find(
        (key) => requestView.transferLegs[key].sender === alice.partyId
    )!
    if (!legId) throw new Error('No transfer leg found for Alice')

    const amuletHoldings = await appUserSdk.ledger.acs.read({
        templateIds: [AMULET_TEMPLATE_ID],
        parties: [alice.partyId],
        filterByParty: true,
    })
    const amuletHoldingCid = amuletHoldings[0]?.contractId
    if (!amuletHoldingCid) throw new Error('Amulet holding not found for Alice')

    const [command, disclosedContracts] =
        await tokenNamespaceAppUser.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: 'Amulet',
                displayName: 'Amulet',
                symbol: 'CC',
                registryUrl: localNetStaticConfig.LOCALNET_REGISTRY_API_URL,
                admin: amuletAdmin,
            },
            inputUtxos: [amuletHoldingCid],
            requestedAt: new Date().toISOString(),
        })

    await appUserSdk.ledger
        .prepare({
            partyId: alice.partyId,
            commands: [command],
            disclosedContracts,
            synchronizerId: globalSynchronizerId,
        })
        .sign(alice.keyPair.privateKey)
        .execute({ partyId: alice.partyId })

    logger.info('Alice: Amulet allocated for leg-0 (global synchronizer)')
    return legId
}
