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
    type TokenNamespace,
} from '@canton-network/wallet-sdk'
import type { KeyPair } from '@canton-network/core-signing-lib'
import type { GenerateTransactionResponse } from '@canton-network/core-ledger-client'
import { readTestTokenV1Dar } from '@canton-network/core-test-token/setup'
import {
    AMULET_NAMESPACE_CONFIG,
    ASSET_CONFIG,
    TOKEN_NAMESPACE_CONFIG,
    TOKEN_PROVIDER_CONFIG_DEFAULT,
    resolveGlobalSynchronizerId,
} from '../utils/index.js'
import type { SynchronizerMap } from '../utils/index.js'
import { TEST_TOKEN_REGISTRY_URL } from './_constants.js'

// Token namespace config that also points the SDK at the local TestToken
// registry (in addition to the Amulet scan-proxy registry). This lets the
// wallet SDK resolve TestToken via the CIP-56 metadata API and fetch its
// transfer/allocation choice contexts over HTTP.
const TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES = {
    ...TOKEN_NAMESPACE_CONFIG,
    registries: [
        ...(TOKEN_NAMESPACE_CONFIG.registries as URL[]),
        TEST_TOKEN_REGISTRY_URL,
    ],
}

export type PartyInfo = Omit<
    GenerateTransactionResponse,
    'topologyTransactions'
> & {
    topologyTransactions?: string[] | undefined
    keyPair: KeyPair
}

const LOCALNET_PATH = '../../../../../.localnet'
const TRADING_APP_DAR_LOCALNET = '/dars/splice-token-test-trading-app-1.0.0.dar'

export interface MultiSyncSetup {
    appUserSdk: SDKInterface<'token' | 'amulet' | 'asset'>
    appProviderSdk: SDKInterface<'token'>
    svSdk: SDKInterface<'token'>
    appUserTokenNamespace: TokenNamespace
    appProviderTokenNamespace: TokenNamespace
    alice: PartyInfo
    bob: PartyInfo
    tradingApp: PartyInfo
    tokenAdmin: PartyInfo
    globalSynchronizerId: string
    testTokenSynchronizerId: string
    synchronizers: SynchronizerMap
    amuletAdmin: string
    testTokenRegistryUrl: URL
}

/**
 * Bootstraps a fresh multi-synchronizer environment:
 *   - Creates SDK instances for the app-user, app-provider, and sv participants
 *   - Discovers global + app synchronizer IDs from the app-user participant
 *   - Allocates alice (app-user), bob (app-provider), tradingApp (app-user), tokenAdmin (app-provider) on global synchronizer
 *     while simultaneously registering alice, bob, tradingApp, and tokenAdmin on app-synchronizer
 *   - tradingApp is hosted on the app-user participant, which is connected to both synchronizers
 *   - Resolves the Amulet admin party ID from the registry metadata API
 */
export async function setupMultiSyncTrade(
    logger: Logger
): Promise<MultiSyncSetup> {
    const [appUserSdk, appProviderSdk, svSdk] = await Promise.all([
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
            amulet: AMULET_NAMESPACE_CONFIG,
            token: TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES,
            asset: ASSET_CONFIG,
        }),
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl:
                localNetStaticConfig.LOCALNET_APP_PROVIDER_LEDGER_URL,
            token: TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES,
        }),
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: localNetStaticConfig.LOCALNET_SV_LEDGER_URL,
            token: TOKEN_NAMESPACE_CONFIG,
        }),
    ])

    const connectedSyncResponse =
        await appUserSdk.ledger.connectedSynchronizers({})
    const allSynchronizers = connectedSyncResponse.connectedSynchronizers ?? []
    if (allSynchronizers.length < 2)
        throw new Error(
            `Expected at least 2 connected synchronizers (global + app), found ${allSynchronizers.length}`
        )

    const globalSynchronizerId = resolveGlobalSynchronizerId(allSynchronizers)
    const testTokenSynchronizerId = allSynchronizers.find(
        (s) => s.synchronizerAlias === 'app-synchronizer'
    )?.synchronizerId

    if (!testTokenSynchronizerId)
        throw new Error(
            'App synchronizer not found — start localnet in multi-sync mode (the default; do not pass --no-multi-sync).'
        )

    logger.info(
        `Connected synchronizers: ${allSynchronizers.map((s) => s.synchronizerAlias).join(', ')}`
    )
    logger.info(
        `Synchronizer IDs — global: ${globalSynchronizerId}, app: ${testTokenSynchronizerId}`
    )

    const synchronizers: SynchronizerMap = {
        globalSynchronizerId,
        testTokenSynchronizerId,
    }

    const here = path.dirname(fileURLToPath(import.meta.url))
    const [testTokenV1Dar, tradingAppDar] = await Promise.all([
        readTestTokenV1Dar(),
        fs.readFile(path.join(here, LOCALNET_PATH, TRADING_APP_DAR_LOCALNET)),
    ])

    await Promise.all([
        // app-user + app-provider vet both DARs on the global and app synchronizers.
        ...[testTokenV1Dar, tradingAppDar].flatMap((dar) =>
            [appUserSdk, appProviderSdk].flatMap((sdk) =>
                [globalSynchronizerId, testTokenSynchronizerId].map((sid) =>
                    sdk.ledger.dar.vet(dar, sid)
                )
            )
        ),
        ...[testTokenV1Dar, tradingAppDar].map((dar) =>
            svSdk.ledger.dar.vet(dar, globalSynchronizerId)
        ),
    ])
    logger.info(
        'DARs vetted: app-user + app-provider have TestTokenV1 + trading-app on both synchronizers; sv has both on global only'
    )

    const aliceKey = appUserSdk.keys.generate()
    const bobKey = appUserSdk.keys.generate()
    const tradingAppKey = appUserSdk.keys.generate()
    const tokenAdminKey = appProviderSdk.keys.generate()

    const [
        allocatedAlice,
        allocatedBob,
        allocatedTradingApp,
        allocatedTokenAdmin,
    ] = await Promise.all([
        appUserSdk.party.external
            .create(aliceKey.publicKey, {
                partyHint: 'Alice',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [testTokenSynchronizerId],
            })
            .sign(aliceKey.privateKey)
            .execute(),
        appProviderSdk.party.external
            .create(bobKey.publicKey, {
                partyHint: 'Bob',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [testTokenSynchronizerId],
            })
            .sign(bobKey.privateKey)
            .execute(),
        appUserSdk.party.external
            .create(tradingAppKey.publicKey, {
                partyHint: 'TradingApp',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [testTokenSynchronizerId],
            })
            .sign(tradingAppKey.privateKey)
            .execute(),
        appProviderSdk.party.external
            .create(tokenAdminKey.publicKey, {
                partyHint: 'TokenAdmin',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [testTokenSynchronizerId],
            })
            .sign(tokenAdminKey.privateKey)
            .execute(),
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
        `Parties allocated on global-synchronizer and registered on app-synchronizer — alice: ${alice.partyId} (app-user), bob: ${bob.partyId} (app-provider), tradingApp: ${tradingApp.partyId} (app-user, both synchronizers), tokenAdmin: ${tokenAdmin.partyId} (app-provider)`
    )

    const { admin: amuletAdmin } = await appUserSdk.asset.find('Amulet')
    logger.info(`Amulet asset discovered — admin: ${amuletAdmin}`)

    return {
        appUserSdk,
        appProviderSdk,
        svSdk,
        appUserTokenNamespace: appUserSdk.token,
        appProviderTokenNamespace: appProviderSdk.token,
        alice,
        bob,
        tradingApp,
        tokenAdmin,
        globalSynchronizerId,
        testTokenSynchronizerId,
        synchronizers,
        amuletAdmin,
        testTokenRegistryUrl: TEST_TOKEN_REGISTRY_URL,
    }
}
