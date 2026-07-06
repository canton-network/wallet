// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import { localNetStaticConfig } from '@canton-network/wallet-sdk'
import type { MultiSyncSetup } from './_setup.js'
import { ALICE_AMULET_TAP_AMOUNT } from './_constants.js'

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
        appUserTokenNamespace,
        alice,
        globalSynchronizerId,
        amuletAdmin,
    } = setup

    const pendingRequests =
        await appUserTokenNamespace.allocation.request.pending(alice.partyId)
    const requestView = pendingRequests[0].interfaceViewValue!
    const legId = Object.keys(requestView.transferLegs).find(
        (key) => requestView.transferLegs[key].sender === alice.partyId
    )!
    if (!legId) throw new Error('No transfer leg found for Alice')

    const amuletHoldings = await appUserTokenNamespace.utxos.list({
        partyId: alice.partyId,
        includeLocked: false,
    })
    const amuletHoldingCid = amuletHoldings.find(
        (holding) =>
            holding.interfaceViewValue.instrumentId.id === 'Amulet' &&
            holding.interfaceViewValue.instrumentId.admin === amuletAdmin
    )?.contractId
    if (!amuletHoldingCid) throw new Error('Amulet holding not found for Alice')

    const [command, disclosedContracts] =
        await appUserTokenNamespace.allocation.instruction.create({
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
