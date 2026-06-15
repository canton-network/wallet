// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Logger } from 'pino'
import type { SDKInterface } from '@canton-network/wallet-sdk'
import { Splice } from '@daml.js/splice-test-token-v1-1.0.0'
import { buildTransferTokenCommand } from './commands.js'
import type { SigningParty } from './setup.js'

const TestTokenV1 = Splice.Testing.Tokens.TestTokenV1

const DEFAULT_TRANSFER_VALIDITY_MS = 24 * 60 * 60 * 1000

const DEFAULT_POLL_TIMEOUT_MS = 30_000
const DEFAULT_POLL_INTERVAL_MS = 500

type TokenHolding = Awaited<
    ReturnType<SDKInterface<'token'>['ledger']['acs']['read']>
>[number]

/** Finds the `TokenRules` administered by `adminPartyId` on the given synchronizer. */
async function findTokenRulesOnSynchronizer(
    sdk: SDKInterface<'token'>,
    adminPartyId: string,
    synchronizerId: string
): Promise<TokenHolding> {
    const contracts = await sdk.ledger.acs.read({
        templateIds: [TestTokenV1.TokenRules.templateId],
        parties: [adminPartyId],
        filterByParty: true,
    })
    const tokenRules = contracts.find(
        (c) => c.synchronizerId === synchronizerId
    )
    if (!tokenRules)
        throw new Error(
            `TokenRules not found on synchronizer ${synchronizerId}`
        )
    return tokenRules
}

/** Reads the holding amount off a Token contract. */
function readHoldingAmount(holding: TokenHolding): string {
    const amount = (
        holding as unknown as {
            createArgument: Splice.Testing.Tokens.TestTokenV1.Token
        }
    ).createArgument?.holding?.amount
    if (!amount) throw new Error('Cannot read amount from Token holding')
    return amount
}

/**
 * Reassigns a holding onto the target synchronizer (no-op if already there) and
 * self-transfers `amount` of it via the admin's `TokenRules`.
 */
async function selfTransferHolding(args: {
    sdk: SDKInterface<'token'>
    owner: SigningParty
    adminPartyId: string
    synchronizerId: string
    tokenRules: TokenHolding
    holding: TokenHolding
    amount: string
    validityMs: number
}): Promise<void> {
    const { sdk, owner, adminPartyId, synchronizerId, tokenRules, holding } =
        args

    if (holding.synchronizerId !== synchronizerId) {
        await sdk.ledger.internal.reassign({
            submitter: owner.partyId,
            contractId: holding.contractId,
            source: holding.synchronizerId,
            target: synchronizerId,
            skipIfAlreadyOn: true,
        })
    }

    await sdk.ledger
        .prepare({
            partyId: owner.partyId,
            commands: [
                buildTransferTokenCommand({
                    tokenRulesCid: tokenRules.contractId,
                    expectedAdmin: adminPartyId,
                    sender: owner.partyId,
                    receiver: owner.partyId,
                    amount: args.amount,
                    admin: adminPartyId,
                    inputHoldingCids: [holding.contractId],
                    requestedAt: new Date(Date.now()).toISOString(),
                    executeBefore: new Date(
                        Date.now() + args.validityMs
                    ).toISOString(),
                }),
            ],
            disclosedContracts: [
                {
                    templateId: tokenRules.templateId,
                    contractId: tokenRules.contractId,
                    createdEventBlob: tokenRules.createdEventBlob!,
                    synchronizerId: tokenRules.synchronizerId,
                },
            ],
            synchronizerId,
        })
        .sign(owner.privateKey)
        .execute({ partyId: owner.partyId })
}

/** Polls for the owner's first Token holding to appear, up to a timeout. */
async function waitForFirstHolding(
    sdk: SDKInterface<'token'>,
    ownerPartyId: string,
    timeoutMs: number,
    intervalMs: number
): Promise<TokenHolding> {
    const deadline = Date.now() + timeoutMs
    for (;;) {
        const holdings = await sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [ownerPartyId],
            filterByParty: true,
        })
        if (holdings[0]) return holdings[0]
        if (Date.now() >= deadline)
            throw new Error(
                `Token holding not found for ${ownerPartyId} within ${timeoutMs}ms`
            )
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
}

export interface SelfTransferTestTokenParams {
    sdk: SDKInterface<'token'>
    owner: SigningParty
    adminPartyId: string
    adminSdk?: SDKInterface<'token'>
    synchronizerId: string
    amount: string
    transferValidityMs?: number
    waitForHolding?: { timeoutMs?: number; intervalMs?: number } | false
    logger?: Logger
}

/**
 * Self-transfers `amount` of the owner's first TestToken holding onto
 * `synchronizerId`, reassigning the holding there first if needed.
 *
 * By default it waits for the holding to appear (useful right after a
 * settlement), then runs the transfer via the admin's `TokenRules`.
 */
export async function selfTransferTestToken(
    params: SelfTransferTestTokenParams
): Promise<void> {
    const { sdk, owner, adminPartyId, synchronizerId, amount, logger } = params
    const validityMs = params.transferValidityMs ?? DEFAULT_TRANSFER_VALIDITY_MS

    let holding: TokenHolding
    if (params.waitForHolding === false) {
        const holdings = await sdk.ledger.acs.read({
            templateIds: [TestTokenV1.Token.templateId],
            parties: [owner.partyId],
            filterByParty: true,
        })
        if (!holdings[0])
            throw new Error(`Token holding not found for ${owner.partyId}`)
        holding = holdings[0]
    } else {
        holding = await waitForFirstHolding(
            sdk,
            owner.partyId,
            params.waitForHolding?.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS,
            params.waitForHolding?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
        )
    }

    const tokenRules = await findTokenRulesOnSynchronizer(
        params.adminSdk ?? sdk,
        adminPartyId,
        synchronizerId
    )

    await selfTransferHolding({
        sdk,
        owner,
        adminPartyId,
        synchronizerId,
        tokenRules,
        holding,
        amount,
        validityMs,
    })

    logger?.info(
        `${amount} TestToken self-transferred on synchronizer ${synchronizerId}`
    )
}

export interface SelfTransferAllTestTokensParams {
    sdk: SDKInterface<'token'>
    owner: SigningParty
    adminPartyId: string
    adminSdk?: SDKInterface<'token'>
    synchronizerId: string
    transferValidityMs?: number
    logger?: Logger
}

/**
 * Self-transfers every TestToken holding the owner currently has onto
 * `synchronizerId`, each at its full holding amount (reassigning to the target
 * synchronizer first if needed). No-op when the owner has no holdings.
 *
 * @returns The number of holdings transferred.
 */
export async function selfTransferAllTestTokens(
    params: SelfTransferAllTestTokensParams
): Promise<number> {
    const { sdk, owner, adminPartyId, synchronizerId, logger } = params
    const validityMs = params.transferValidityMs ?? DEFAULT_TRANSFER_VALIDITY_MS

    const holdings = await sdk.ledger.acs.read({
        templateIds: [TestTokenV1.Token.templateId],
        parties: [owner.partyId],
        filterByParty: true,
    })
    if (holdings.length === 0) {
        logger?.info(`${owner.partyId}: no TestToken holdings to self-transfer`)
        return 0
    }

    const tokenRules = await findTokenRulesOnSynchronizer(
        params.adminSdk ?? sdk,
        adminPartyId,
        synchronizerId
    )

    for (const holding of holdings) {
        await selfTransferHolding({
            sdk,
            owner,
            adminPartyId,
            synchronizerId,
            tokenRules,
            holding,
            amount: readHoldingAmount(holding),
            validityMs,
        })
    }

    logger?.info(
        `${owner.partyId}: ${holdings.length} TestToken holding(s) self-transferred on synchronizer ${synchronizerId}`
    )
    return holdings.length
}
