// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import type { Logger } from 'pino'
import {
    localNetStaticConfig,
    SDK,
    type SDKInterface,
    type SDKContext,
    type TokenNamespace,
    vetPackage,
} from '@canton-network/wallet-sdk'
import type { KeyPair } from '@canton-network/core-signing-lib'
import type { GenerateTransactionResponse } from '@canton-network/core-ledger-client'
import { ScanProxyClient } from '@canton-network/wallet-sdk'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import {
    AMULET_NAMESPACE_CONFIG,
    TOKEN_NAMESPACE_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
    resolveGlobalSynchronizerId,
} from '../utils/index.js'
import type { SynchronizerMap } from '../utils/index.js'
import {
    LOCALNET_BOB_LEDGER_URL,
    LOCALNET_TRADING_APP_LEDGER_URL,
    PARTY_HINT_ALICE,
    PARTY_HINT_BOB,
    PARTY_HINT_TRADING_APP,
    PARTY_HINT_TOKEN_ADMIN,
} from './_config.js'

export type PartyInfo = Omit<
    GenerateTransactionResponse,
    'topologyTransactions'
> & {
    topologyTransactions?: string[] | undefined
    keyPair: KeyPair
}

const TEST_TOKEN_V1_DAR = 'splice-test-token-v1-1.0.0.dar'
const TRADING_APP_DAR_RELATIVE_PATH =
    '../../../../../.localnet/dars/splice-token-test-trading-app-1.0.1.dar'

export interface MultiSyncSetup {
    p1Sdk: SDKInterface<'token' | 'amulet'>
    p2Sdk: SDKInterface<'token'>
    p3Sdk: SDKInterface<'token'>
    p1SdkCtx: SDKContext
    p2SdkCtx: SDKContext
    p3SdkCtx: SDKContext
    tokenNamespaceP1: TokenNamespace
    tokenNamespaceP2: TokenNamespace
    alice: PartyInfo
    bob: PartyInfo
    tradingApp: PartyInfo
    tokenAdmin: PartyInfo
    globalSynchronizerId: string
    appSynchronizerId: string
    synchronizers: SynchronizerMap
    scanProxy: ScanProxyClient
    amuletAdmin: string
}

/**
 * Allocates a party on all provided synchronizers in parallel.
 * The first synchronizer in the array is the primary — its result is returned.
 * Subsequent synchronizers are registered without granting user rights.
 */
async function createOnSynchronizers(
    sdk: SDKInterface<'token'>,
    keyPair: KeyPair,
    partyHint: string,
    synchronizerIds: [string, ...string[]]
): Promise<GenerateTransactionResponse> {
    const [primary, ...secondaries] = synchronizerIds
    const result = await sdk.party.external
        .create(keyPair.publicKey, { partyHint, synchronizerId: primary })
        .sign(keyPair.privateKey)
        .execute()
    for (const synchronizerId of secondaries) {
        await sdk.party.external
            .create(keyPair.publicKey, { partyHint, synchronizerId })
            .sign(keyPair.privateKey)
            .execute({ grantUserRights: false })
    }
    return result
}

/**
 * Bootstraps a fresh multi-synchronizer environment:
 *   - Creates SDK instances for P1 (app-user), P2 (app-provider), P3 (sv)
 *   - Discovers global + app synchronizer IDs from P1
 *   - Allocates alice (P1), bob (P2), tradingApp (P3), tokenAdmin (P2) on global synchronizer
 *     while simultaneously registering alice, bob, and tokenAdmin on app-synchronizer
 *   - tradingApp is global-only
 *   - Connects the scan proxy and returns the Amulet admin party ID
 */
export async function setupMultiSyncTrade(
    logger: Logger
): Promise<MultiSyncSetup> {
    // Create three SDK instances — one per participant node
    const [p1Sdk, p2Sdk, p3Sdk] = await Promise.all([
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
            amulet: AMULET_NAMESPACE_CONFIG,
            token: TOKEN_NAMESPACE_CONFIG,
        }),
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: LOCALNET_BOB_LEDGER_URL,
            token: TOKEN_NAMESPACE_CONFIG,
        }),
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: LOCALNET_TRADING_APP_LEDGER_URL,
            token: TOKEN_NAMESPACE_CONFIG,
        }),
    ])

    const p1SdkCtx = (p1Sdk.ledger as unknown as { sdkContext: SDKContext })
        .sdkContext
    const p2SdkCtx = (p2Sdk.ledger as unknown as { sdkContext: SDKContext })
        .sdkContext
    const p3SdkCtx = (p3Sdk.ledger as unknown as { sdkContext: SDKContext })
        .sdkContext

    // Discover synchronizer IDs from P1 (they are topology-wide, not per-participant)
    const connectedSyncResponse = await p1Sdk.ledger.connectedSynchronizers({})
    const allSynchronizers = connectedSyncResponse.connectedSynchronizers ?? []
    if (allSynchronizers.length < 2)
        throw new Error(
            `Expected at least 2 connected synchronizers (global + app), found ${allSynchronizers.length}`
        )

    const globalSynchronizerId = resolveGlobalSynchronizerId(allSynchronizers)
    const appSynchronizerId = allSynchronizers.find(
        (s) => s.synchronizerAlias === 'app-synchronizer'
    )?.synchronizerId

    if (!appSynchronizerId)
        throw new Error(
            'App synchronizer not found — start localnet with --multi-sync to enable it.'
        )

    logger.info(
        `Connected synchronizers: ${allSynchronizers.map((s) => s.synchronizerAlias).join(', ')}`
    )
    logger.info(
        `Synchronizer IDs — global: ${globalSynchronizerId}, app: ${appSynchronizerId}`
    )

    const synchronizers: SynchronizerMap = {
        globalSynchronizerId,
        appSynchronizerId,
    }

    // Load and vet the TestTokenV1 + trading-app DARs.
    // TestTokenV1 is bundled alongside this script; the trading-app DAR is
    // pulled from the localnet bundle. Splice does not auto-upload the
    // trading-app DAR, so we upload and vet it explicitly here.
    const here = path.dirname(fileURLToPath(import.meta.url))
    const [testTokenV1Dar, tradingAppDar] = await Promise.all([
        fs.readFile(path.join(here, TEST_TOKEN_V1_DAR)),
        fs.readFile(path.join(here, TRADING_APP_DAR_RELATIVE_PATH)),
    ])

    // P1 and P2 vet on both synchronizers; P3 (sv) is global-only
    await Promise.all(
        [testTokenV1Dar, tradingAppDar].flatMap((dar) => [
            ...[p1SdkCtx, p2SdkCtx].flatMap((ctx) =>
                [globalSynchronizerId, appSynchronizerId].map((sid) =>
                    vetPackage(ctx.ledgerProvider, dar, sid)
                )
            ),
            vetPackage(p3SdkCtx.ledgerProvider, dar, globalSynchronizerId),
        ])
    )
    logger.info(
        'TestTokenV1 + trading-app DARs vetted: P1+P2 on both synchronizers, P3 on global only'
    )

    // Allocate parties on global synchronizer and simultaneously register
    // alice, bob, and tokenAdmin on app-synchronizer — one promise per party.
    // tokenAdmin is on P2 (app-provider), not P3 (sv), because sv is global-only
    const aliceKey = p1Sdk.keys.generate()
    const bobKey = p1Sdk.keys.generate()
    const tradingAppKey = p1Sdk.keys.generate()
    const tokenAdminKey = p2Sdk.keys.generate()

    const [
        allocatedAlice,
        allocatedBob,
        allocatedTradingApp,
        allocatedTokenAdmin,
    ] = await Promise.all([
        createOnSynchronizers(p1Sdk, aliceKey, PARTY_HINT_ALICE, [
            globalSynchronizerId,
            appSynchronizerId,
        ]),
        createOnSynchronizers(p2Sdk, bobKey, PARTY_HINT_BOB, [
            globalSynchronizerId,
            appSynchronizerId,
        ]),
        createOnSynchronizers(p3Sdk, tradingAppKey, PARTY_HINT_TRADING_APP, [
            globalSynchronizerId,
        ]),
        createOnSynchronizers(p2Sdk, tokenAdminKey, PARTY_HINT_TOKEN_ADMIN, [
            globalSynchronizerId,
            appSynchronizerId,
        ]),
    ])

    const alice: PartyInfo = { ...allocatedAlice, keyPair: aliceKey }
    const bob: PartyInfo = { ...allocatedBob, keyPair: bobKey }
    const tradingApp: PartyInfo = {
        ...allocatedTradingApp,
        keyPair: tradingAppKey,
    }
    const tokenAdmin: PartyInfo = {
        ...allocatedTokenAdmin,
        keyPair: tokenAdminKey,
    }

    logger.info(
        `Parties allocated on global-synchronizer and registered on app-synchronizer — alice: ${alice.partyId} (P1), bob: ${bob.partyId} (P2), tradingApp: ${tradingApp.partyId} (P3), tokenAdmin: ${tokenAdmin.partyId} (P2)`
    )

    // Connect scan proxy and discover Amulet admin
    const auth = new AuthTokenProvider(TOKEN_PROVIDER_CONFIG_DEFAULT, logger)
    const scanProxy = new ScanProxyClient(
        localNetStaticConfig.LOCALNET_APP_VALIDATOR_URL,
        logger,
        auth
    )
    const amuletRules = await scanProxy.getAmuletRules()
    const amuletAdmin = (amuletRules.payload as Record<string, unknown>)[
        'dso'
    ] as string
    logger.info(`Amulet asset discovered — admin: ${amuletAdmin}`)

    return {
        p1Sdk,
        p2Sdk,
        p3Sdk,
        p1SdkCtx,
        p2SdkCtx,
        p3SdkCtx,
        tokenNamespaceP1: p1Sdk.token,
        tokenNamespaceP2: p2Sdk.token,
        alice,
        bob,
        tradingApp,
        tokenAdmin,
        globalSynchronizerId,
        appSynchronizerId,
        synchronizers,
        scanProxy,
        amuletAdmin,
    }
}
