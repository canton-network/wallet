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
    const { p2Sdk, tokenNamespaceP2, bob, tokenAdmin, globalSynchronizerId } =
        setup

    const pendingRequests = await tokenNamespaceP2.allocation.request.pending(
        bob.partyId
    )
    const requestView = pendingRequests[0].interfaceViewValue!
    const legId = Object.keys(requestView.transferLegs).find(
        (key) => requestView.transferLegs[key].sender === bob.partyId
    )!
    if (!legId) throw new Error('No transfer leg found for Bob')

    const [tokenHoldings, tokenRulesContracts] = await Promise.all([
        p2Sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [bob.partyId],
            filterByParty: true,
        }),
        p2Sdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [tokenAdmin.partyId],
            filterByParty: true,
        }),
    ])

    const tokenHolding = tokenHoldings[0]
    if (!tokenHolding) throw new Error('Token holding not found for Bob')
    const tokenRulesOnGlobal = tokenRulesContracts.find(
        (c) => c.synchronizerId === globalSynchronizerId
    )
    if (!tokenRulesOnGlobal)
        throw new Error('TokenRules not found on global synchronizer')

    await p2Sdk.ledger.internal.reassign({
        submitter: bob.partyId,
        contractId: tokenHolding.contractId,
        source: tokenHolding.synchronizerId,
        target: globalSynchronizerId,
        skipIfAlreadyOn: true,
    })

    const [command, disclosedFromHelper] =
        await tokenNamespaceP2.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: 'TestToken',
                displayName: 'TestToken',
                symbol: 'TT',
                registryUrl: new URL('http://unused.invalid'),
                admin: tokenAdmin.partyId,
            },
            inputUtxos: [tokenHolding.contractId],
            requestedAt: new Date(Date.now()).toISOString(),
            prefetchedRegistryChoiceContext: {
                factoryId: tokenRulesOnGlobal.contractId,
                choiceContext: {
                    choiceContextData: {} as Record<string, never>,
                    disclosedContracts: [],
                },
            },
        })

    await p2Sdk.ledger
        .prepare({
            partyId: bob.partyId,
            commands: [command],
            disclosedContracts: [
                ...disclosedFromHelper,
                {
                    templateId: tokenRulesOnGlobal.templateId,
                    contractId: tokenRulesOnGlobal.contractId,
                    createdEventBlob: tokenRulesOnGlobal.createdEventBlob!,
                    synchronizerId: tokenRulesOnGlobal.synchronizerId,
                },
            ],
            synchronizerId: globalSynchronizerId,
        })
        .sign(bob.keyPair.privateKey)
        .execute({ partyId: bob.partyId })

    logger.info(
        'Bob: TestToken allocated for leg-1 (global synchronizer, single-party)'
    )
    return { legId }
}
