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
        appSynchronizerId,
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

    // Re-point the allocation factory (and its disclosed contract) at the
    // TokenRules instance that lives on the app-synchronizer, and prepare the
    // allocation there too. Bob's input Token already lives on the
    // app-synchronizer, so co-locating the factory on the same synchronizer means
    // no reassignment is needed to create the allocation.
    //
    // The resulting TokenAllocation has `observer settlement.executor`
    // (= TradingApp), which is hosted on the app-user participant — connected to
    // both synchronizers. Settlement (the next step) is submitted via app-user, so
    // it can automatically reassign this app-synchronizer allocation to global
    // (TradingApp is a stakeholder of the allocation, satisfying the
    // submitter-must-be-stakeholder rule for reassignment).
    const appTokenRules = (
        await appProviderSdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [tokenAdmin.partyId],
            filterByParty: true,
        })
    ).find((c) => c.synchronizerId === appSynchronizerId)
    if (!appTokenRules)
        throw new Error('TokenRules not found on app synchronizer')

    const originalFactoryId =
        'ExerciseCommand' in command
            ? command.ExerciseCommand.contractId
            : undefined
    if ('ExerciseCommand' in command)
        command.ExerciseCommand.contractId = appTokenRules.contractId

    const disclosedOnApp = disclosedFromHelper.map((dc) =>
        dc.contractId === originalFactoryId
            ? {
                  templateId: appTokenRules.templateId,
                  contractId: appTokenRules.contractId,
                  createdEventBlob: appTokenRules.createdEventBlob!,
                  synchronizerId: appTokenRules.synchronizerId,
              }
            : dc
    )

    await appProviderSdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [command],
            disclosedContracts: disclosedOnApp,
            synchronizerId: appSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        'Bob: TestToken allocated for leg-1 (app-synchronizer, single-party) via registry allocation-factory'
    )
    return { legId }
}
