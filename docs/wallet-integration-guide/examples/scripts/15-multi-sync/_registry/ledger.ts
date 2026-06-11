// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Ledger access helpers for the TestToken registry server.
 *
 * Reads `TokenRules` contracts visible to the tokenAdmin party from the
 * app-provider participant (P2). P2 hosts tokenAdmin on both synchronizers
 * (global + app), so it returns the TokenRules contract for either one. Results
 * are cached for a short TTL to avoid hammering the ledger on every incoming
 * HTTP request.
 */

import { LedgerClient } from '@canton-network/core-ledger-client'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import type { Logger } from 'pino'

export const TOKEN_RULES_TEMPLATE_ID =
    '#splice-test-token-v1:Splice.Testing.Tokens.TestTokenV1:TokenRules'

export interface TokenRulesContract {
    contractId: string
    templateId: string
    createdEventBlob: string
    synchronizerId: string
}

interface Cache {
    contracts: TokenRulesContract[]
    expireAt: number
}

let cache: Cache | null = null
const CACHE_TTL_MS = 5_000

export function buildLedgerClient(
    ledgerUrl: URL,
    logger: Logger
): LedgerClient {
    const accessTokenProvider = new AuthTokenProvider(
        {
            method: 'self_signed',
            issuer: 'unsafe-auth',
            credentials: {
                clientId: 'ledger-api-user',
                clientSecret: 'unsafe',
                audience: 'https://canton.network.global',
                scope: '',
            },
        },
        logger
    )

    return new LedgerClient({ baseUrl: ledgerUrl, logger, accessTokenProvider })
}

interface JsActiveContractEntry {
    JsActiveContract: {
        createdEvent: {
            contractId: string
            templateId: string
            createdEventBlob: string
        }
        synchronizerId: string
    }
}

/**
 * Reads `TokenRules` contracts visible to `tokenAdminPartyId` from the configured
 * participant. Caches results for a short TTL.
 */
export async function readTokenRules(
    client: LedgerClient,
    tokenAdminPartyId: string,
    logger: Logger
): Promise<TokenRulesContract[]> {
    const now = Date.now()
    if (cache && now < cache.expireAt) {
        logger.debug('TokenRules cache hit')
        return cache.contracts
    }

    logger.debug('Fetching TokenRules from ledger ACS…')

    // `get` initializes the client (negotiates the ledger API version) before the
    // subsequent `post`, which does not init on its own.
    const ledgerEnd = await client.get('/v2/state/ledger-end')
    const offset = ledgerEnd.offset ?? 0

    const body = {
        filter: {
            filtersByParty: {
                [tokenAdminPartyId]: {
                    cumulative: [
                        {
                            identifierFilter: {
                                TemplateFilter: {
                                    value: {
                                        templateId: TOKEN_RULES_TEMPLATE_ID,
                                        includeCreatedEventBlob: true,
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
        verbose: false,
        activeAtOffset: offset,
    }

    const rawAcs = await client.post(
        '/v2/state/active-contracts',
        // The generated request type is far stricter than what we need to send.
        body as unknown as Parameters<typeof client.post>[1],
        { query: { limit: 100 } }
    )

    const contracts: TokenRulesContract[] = (
        rawAcs as unknown as Array<{ contractEntry?: unknown }>
    )
        .filter(
            (entry) =>
                entry.contractEntry != null &&
                'JsActiveContract' in (entry.contractEntry as object)
        )
        .map((entry) => {
            const jsAC = (entry.contractEntry as JsActiveContractEntry)
                .JsActiveContract
            return {
                contractId: jsAC.createdEvent.contractId,
                templateId: jsAC.createdEvent.templateId,
                createdEventBlob: jsAC.createdEvent.createdEventBlob,
                synchronizerId: jsAC.synchronizerId,
            }
        })

    logger.debug(
        { count: contracts.length },
        'TokenRules contracts fetched from ledger'
    )

    cache = { contracts, expireAt: now + CACHE_TTL_MS }
    return contracts
}

export function invalidateCache(): void {
    cache = null
}
