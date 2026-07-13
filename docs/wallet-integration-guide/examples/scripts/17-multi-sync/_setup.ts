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
    // One SDK instance per party. Alice, TradingApp + Charlie are hosted on the
    // app-user participant; Bob + TokenAdmin on the app-provider participant. Each
    // party still gets its own wallet SDK so submissions are made through the
    // party's own client, mirroring a real multi-wallet deployment.
    aliceSdk: SDKInterface<'token' | 'amulet' | 'asset'>
    tradingAppSdk: SDKInterface<'token'>
    bobSdk: SDKInterface<'token'>
    tokenAdminSdk: SDKInterface<'token'>
    charlieSdk: SDKInterface<'token'>
    svSdk: SDKInterface<'token'>
    alice: PartyInfo
    bob: PartyInfo
    tradingApp: PartyInfo
    tokenAdmin: PartyInfo
    charlie: PartyInfo
    globalSynchronizerId: string
    appSynchronizerId: string
    synchronizers: SynchronizerMap
    amuletAdmin: string
}

/**
 * Bootstraps a fresh multi-synchronizer environment:
 *   - Creates one SDK instance per party (alice, tradingApp, charlie on the
 *     app-user participant; bob, tokenAdmin on the app-provider participant) plus an sv SDK
 *   - Discovers global + app synchronizer IDs from the app-user participant
 *   - Allocates alice (app-user), bob (app-provider), tradingApp (app-user), tokenAdmin (app-provider), charlie (app-user) on global synchronizer
 *     while simultaneously registering alice, bob, tradingApp, tokenAdmin, and charlie on app-synchronizer
 *   - tradingApp is hosted on the app-user participant, which is connected to both synchronizers
 *   - Resolves the Amulet admin party ID from the registry metadata API
 */
export async function setupMultiSyncTrade(
    logger: Logger
): Promise<MultiSyncSetup> {
    const [aliceSdk, tradingAppSdk, charlieSdk, bobSdk, tokenAdminSdk, svSdk] =
        await Promise.all([
            SDK.create({
                auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
                ledgerClientUrl:
                    localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
                amulet: AMULET_NAMESPACE_CONFIG,
                token: TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES,
                asset: ASSET_CONFIG,
            }),
            SDK.create({
                auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
                ledgerClientUrl:
                    localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
                token: TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES,
            }),
            SDK.create({
                auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
                ledgerClientUrl:
                    localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
                token: TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES,
            }),
            SDK.create({
                auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
                ledgerClientUrl:
                    localNetStaticConfig.LOCALNET_APP_PROVIDER_LEDGER_URL,
                token: TOKEN_NAMESPACE_CONFIG_WITH_REGISTRIES,
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

    const connectedSyncResponse = await aliceSdk.ledger.connectedSynchronizers()
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
            'App synchronizer not found — start localnet in multi-sync mode (the default; do not pass --no-multi-sync).'
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

    const here = path.dirname(fileURLToPath(import.meta.url))
    const [testTokenV1Dar, tradingAppDar] = await Promise.all([
        readTestTokenV1Dar(),
        fs.readFile(path.join(here, LOCALNET_PATH, TRADING_APP_DAR_LOCALNET)),
    ])

    await Promise.all([
        // Vetting is per (participant, synchronizer). aliceSdk represents the
        // app-user participant and bobSdk the app-provider participant, so
        // vetting through one SDK per participant covers every party hosted there.
        ...[testTokenV1Dar, tradingAppDar].flatMap((dar) =>
            [aliceSdk, bobSdk].flatMap((sdk) =>
                [globalSynchronizerId, appSynchronizerId].map((sid) =>
                    sdk.ledger.dar.uploadAndVet(dar, sid)
                )
            )
        ),
        ...[testTokenV1Dar, tradingAppDar].map((dar) =>
            svSdk.ledger.dar.uploadAndVet(dar, globalSynchronizerId)
        ),
    ])
    logger.info(
        'DARs vetted: app-user participant node + app-provider participant node have TestTokenV1 + trading-app on both synchronizers; sv has both on global only'
    )

    const aliceKey = aliceSdk.keys.generate()
    const bobKey = bobSdk.keys.generate()
    const tradingAppKey = tradingAppSdk.keys.generate()
    const tokenAdminKey = tokenAdminSdk.keys.generate()
    const charlieKey = charlieSdk.keys.generate()

    const [
        allocatedAlice,
        allocatedBob,
        allocatedTradingApp,
        allocatedTokenAdmin,
        allocatedCharlie,
    ] = await Promise.all([
        aliceSdk.party.external
            .create(aliceKey.publicKey, {
                partyHint: 'Alice',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(aliceKey.privateKey)
            .execute(),
        bobSdk.party.external
            .create(bobKey.publicKey, {
                partyHint: 'Bob',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(bobKey.privateKey)
            .execute(),
        tradingAppSdk.party.external
            .create(tradingAppKey.publicKey, {
                partyHint: 'TradingApp',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(tradingAppKey.privateKey)
            .execute(),
        tokenAdminSdk.party.external
            .create(tokenAdminKey.publicKey, {
                partyHint: 'TokenAdmin',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(tokenAdminKey.privateKey)
            .execute(),
        charlieSdk.party.external
            .create(charlieKey.publicKey, {
                partyHint: 'Charlie',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(charlieKey.privateKey)
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
    const charlie: PartyInfo = { ...allocatedCharlie, keyPair: charlieKey }

    logger.info(
        `Parties allocated on global-synchronizer and registered on app-synchronizer — alice: ${alice.partyId} (app-user), bob: ${bob.partyId} (app-provider), tradingApp: ${tradingApp.partyId} (app-user, both synchronizers), tokenAdmin: ${tokenAdmin.partyId} (app-provider), charlie: ${charlie.partyId} (app-user)`
    )

    const { admin: amuletAdmin } = await aliceSdk.asset.find('Amulet')
    logger.info(`Amulet asset discovered — admin: ${amuletAdmin}`)

    return {
        aliceSdk,
        tradingAppSdk,
        bobSdk,
        tokenAdminSdk,
        charlieSdk,
        svSdk,
        alice,
        bob,
        tradingApp,
        tokenAdmin,
        charlie,
        globalSynchronizerId,
        appSynchronizerId,
        synchronizers,
        amuletAdmin,
    }
}
