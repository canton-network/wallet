// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { PrivateKey } from '@canton-network/core-signing-lib'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import { Splice } from '@daml.js/splice-test-token-v1-1.0.0'

const TestTokenV1 = Splice.Testing.Tokens.TestTokenV1

/** The instrument the TestToken DAR mints holdings for. */
const TEST_TOKEN_INSTRUMENT = {
    id: 'TestToken',
    displayName: 'TestToken',
    symbol: 'TT',
} as const

export interface AllocateTestTokenParams {
    /** SDK for the participant hosting the sender (must have the `token` namespace). */
    sdk: SDKInterface<'token'>
    /** The party allocating its TestToken holding, plus the key used to sign. */
    sender: { partyId: string; privateKey: PrivateKey }
    /** The party that administers the TestToken (the `TokenRules` admin). */
    adminPartyId: string
    /** Synchronizer the TokenRules live on and the allocation is submitted to. */
    globalSynchronizerId: string
    logger?: Logger
}

/**
 * Allocates the sender's TestToken holding against its leg of a pending token
 * allocation request.
 *
 * Looks up the sender's transfer leg in the pending allocation request, reassigns
 * its TestToken holding onto the target synchronizer (no-op if already there),
 * builds the allocation instruction against the `TokenRules` on that synchronizer,
 * and submits it signed by the sender.
 *
 * The TestToken-specific knowledge (the `Token` / `TokenRules` template IDs and the
 * `TestToken`/`TT` instrument descriptor) lives here; everything else is supplied
 * by the caller so the same flow works for any environment.
 *
 * @returns The transfer-leg id that was allocated.
 */
export async function allocateTestToken(
    params: AllocateTestTokenParams
): Promise<{ legId: string }> {
    const { sdk, sender, adminPartyId, globalSynchronizerId, logger } = params
    const token = sdk.token

    const pendingRequests = await token.allocation.request.pending(
        sender.partyId
    )
    const requestView = pendingRequests[0].interfaceViewValue!
    const legId = Object.keys(requestView.transferLegs).find(
        (key) => requestView.transferLegs[key].sender === sender.partyId
    )!
    if (!legId) throw new Error('No transfer leg found for sender')

    const [tokenHoldings, tokenRulesContracts] = await Promise.all([
        sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [sender.partyId],
            filterByParty: true,
        }),
        sdk.ledger.acs.read({
            templateIds: [TestTokenV1.TokenRules.templateId],
            parties: [adminPartyId],
            filterByParty: true,
        }),
    ])

    const tokenHolding = tokenHoldings[0]
    if (!tokenHolding) throw new Error('Token holding not found for sender')
    const tokenRulesOnGlobal = tokenRulesContracts.find(
        (c) => c.synchronizerId === globalSynchronizerId
    )
    if (!tokenRulesOnGlobal)
        throw new Error('TokenRules not found on global synchronizer')

    await sdk.ledger.internal.reassign({
        submitter: sender.partyId,
        contractId: tokenHolding.contractId,
        source: tokenHolding.synchronizerId,
        target: globalSynchronizerId,
        skipIfAlreadyOn: true,
    })

    const [command, disclosedFromHelper] =
        await token.allocation.instruction.create({
            allocationSpecification: {
                settlement: requestView.settlement,
                transferLegId: legId,
                transferLeg: requestView.transferLegs[legId],
            },
            asset: {
                id: TEST_TOKEN_INSTRUMENT.id,
                displayName: TEST_TOKEN_INSTRUMENT.displayName,
                symbol: TEST_TOKEN_INSTRUMENT.symbol,
                registryUrl: new URL('http://unused.invalid'),
                admin: adminPartyId,
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

    await sdk.ledger
        .prepare({
            partyId: sender.partyId,
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
        .sign(sender.privateKey)
        .execute({ partyId: sender.partyId })

    logger?.info(
        'TestToken allocated for sender leg (global synchronizer, single-party)'
    )
    return { legId }
}
