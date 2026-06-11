// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import * as SpliceTestTokenV1 from '@canton-network/core-test-token'
import type { MultiSyncSetup } from './_setup.js'

const TestTokenV1 = SpliceTestTokenV1.Splice.Testing.Tokens.TestTokenV1

export async function allocateTokenForBob(
    setup: MultiSyncSetup,
    logger: Logger
): Promise<{ legId: string }> {
    const {
        appProviderSdk,
        tokenNamespaceAppProvider,
        bob,
        tokenAdmin,
        globalSynchronizerId,
        testTokenRegistryUrl,
    } = setup

    const pendingRequests =
        await tokenNamespaceAppProvider.allocation.request.pending(bob.partyId)
    const requestView = pendingRequests[0].interfaceViewValue!
    const legId = Object.keys(requestView.transferLegs).find(
        (key) => requestView.transferLegs[key].sender === bob.partyId
    )!
    if (!legId) throw new Error('No transfer leg found for Bob')

    const tokenHoldings = await appProviderSdk.ledger.acs.read({
        templateIds: [TestTokenV1.Token.templateId],
        parties: [bob.partyId],
        filterByParty: true,
    })

    const tokenHolding = tokenHoldings[0]
    if (!tokenHolding) throw new Error('Token holding not found for Bob')

    await appProviderSdk.ledger.internal.reassign({
        submitter: bob.partyId,
        contractId: tokenHolding.contractId,
        source: tokenHolding.synchronizerId,
        target: globalSynchronizerId,
        skipIfAlreadyOn: true,
    })

    // Fetch the AllocationFactory + choice context from the TestToken registry's
    // allocation-instruction-v1 API. The registry returns the global-synchronizer
    // TokenRules contract as the factory (disclosed in `disclosedFromHelper`).
    const [command, disclosedFromHelper] =
        await tokenNamespaceAppProvider.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: 'TestToken',
                displayName: 'TestToken',
                symbol: 'TT',
                registryUrl: testTokenRegistryUrl,
                admin: tokenAdmin.partyId,
            },
            inputUtxos: [tokenHolding.contractId],
            requestedAt: new Date(Date.now()).toISOString(),
        })

    await appProviderSdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [command],
            disclosedContracts: disclosedFromHelper,
            synchronizerId: globalSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        'Bob: TestToken allocated for leg-1 (global synchronizer, single-party) via registry allocation-factory'
    )
    return { legId }
}
