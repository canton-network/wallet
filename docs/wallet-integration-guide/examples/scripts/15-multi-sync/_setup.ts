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
import { TEST_TOKEN_REGISTRY_URL } from './_constants.js'

// Token namespace config that also points the SDK at the local TestToken
// registry (in addition to the Amulet scan-proxy registry). This lets the
// wallet SDK resolve TestToken via the CIP-56 metadata API and fetch its
// transfer/allocation choice contexts over HTTP.
const TOKEN_NAMESPACE_CONFIG_WITH_TEST_TOKEN = {
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

const TEST_TOKEN_V1_DAR =
    '../../../../../damljs/splice-test-token-v1/.daml/dist/splice-test-token-v1-1.0.0.dar'
const LOCALNET_PATH = '../../../../../.localnet'
const TRADING_APP_DAR_LOCALNET = '/dars/splice-token-test-trading-app-1.0.0.dar'

/**
 * Vet a DAR, tolerating the case where a package with the same name+version is
 * already vetted on the participant.
 *
 * On a persistent localnet, a previous build of a DAR (e.g. `splice-test-token-v1`)
 * may already be vetted. Re-running the example after rebuilding the DAR produces a
 * different package hash for the same name+version, which Canton rejects with
 * `KNOWN_PACKAGE_VERSION`. Since the already-vetted package is resolved by
 * package-name at command-submission time, it is safe to reuse it and continue.
 */
async function vetPackageIdempotent(
    ledgerProvider: Parameters<typeof vetPackage>[0],
    dar: Uint8Array,
    synchronizerId: string,
    logger: Logger
): Promise<void> {
    try {
        await vetPackage(ledgerProvider, dar, synchronizerId)
    } catch (e) {
        const code = (e as { code?: string })?.code
        const message = `${(e as { cause?: unknown })?.cause ?? (e as Error)?.message ?? e}`
        if (
            code === 'KNOWN_PACKAGE_VERSION' ||
            message.includes('same name and version')
        ) {
            logger.warn(
                'A package with the same name+version is already vetted; reusing the existing package.'
            )
            return
        }
        throw e
    }
}

export interface MultiSyncSetup {
    appUserSdk: SDKInterface<'token' | 'amulet'>
    appProviderSdk: SDKInterface<'token'>
    svSdk: SDKInterface<'token'>
    appUserCtx: SDKContext
    appProviderCtx: SDKContext
    svCtx: SDKContext
    tokenNamespaceAppUser: TokenNamespace
    tokenNamespaceAppProvider: TokenNamespace
    alice: PartyInfo
    bob: PartyInfo
    tradingApp: PartyInfo
    tokenAdmin: PartyInfo
    globalSynchronizerId: string
    appSynchronizerId: string
    synchronizers: SynchronizerMap
    scanProxy: ScanProxyClient
    amuletAdmin: string
    testTokenRegistryUrl: URL
}

/**
 * Bootstraps a fresh multi-synchronizer environment:
 *   - Creates SDK instances for the app-user, app-provider, and sv participants
 *   - Discovers global + app synchronizer IDs from the app-user participant
 *   - Allocates alice (app-user), bob (app-provider), tradingApp (sv), tokenAdmin (app-provider) on global synchronizer
 *     while simultaneously registering alice, bob, and tokenAdmin on app-synchronizer
 *   - tradingApp is global-only
 *   - Connects the scan proxy and returns the Amulet admin party ID
 */
export async function setupMultiSyncTrade(
    logger: Logger
): Promise<MultiSyncSetup> {
    const [appUserSdk, appProviderSdk, svSdk] = await Promise.all([
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: localNetStaticConfig.LOCALNET_APP_USER_LEDGER_URL,
            amulet: AMULET_NAMESPACE_CONFIG,
            token: TOKEN_NAMESPACE_CONFIG_WITH_TEST_TOKEN,
        }),
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl:
                localNetStaticConfig.LOCALNET_APP_PROVIDER_LEDGER_URL,
            token: TOKEN_NAMESPACE_CONFIG_WITH_TEST_TOKEN,
        }),
        SDK.create({
            auth: TOKEN_PROVIDER_CONFIG_DEFAULT,
            ledgerClientUrl: localNetStaticConfig.LOCALNET_SV_LEDGER_URL,
            token: TOKEN_NAMESPACE_CONFIG,
        }),
    ])

    const appUserCtx = (
        appUserSdk.ledger as unknown as { sdkContext: SDKContext }
    ).sdkContext
    const appProviderCtx = (
        appProviderSdk.ledger as unknown as { sdkContext: SDKContext }
    ).sdkContext
    const svCtx = (svSdk.ledger as unknown as { sdkContext: SDKContext })
        .sdkContext

    const connectedSyncResponse =
        await appUserSdk.ledger.connectedSynchronizers({})
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
        fs.readFile(path.join(here, TEST_TOKEN_V1_DAR)),
        fs.readFile(path.join(here, LOCALNET_PATH, TRADING_APP_DAR_LOCALNET)),
    ])

    await Promise.all([
        // app-user + app-provider vet both DARs on the global and app synchronizers.
        ...[testTokenV1Dar, tradingAppDar].flatMap((dar) =>
            [appUserCtx, appProviderCtx].flatMap((ctx) =>
                [globalSynchronizerId, appSynchronizerId].map((sid) =>
                    vetPackageIdempotent(ctx.ledgerProvider, dar, sid, logger)
                )
            )
        ),
        ...[testTokenV1Dar, tradingAppDar].map((dar) =>
            vetPackageIdempotent(
                svCtx.ledgerProvider,
                dar,
                globalSynchronizerId,
                logger
            )
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
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(aliceKey.privateKey)
            .execute(),
        appProviderSdk.party.external
            .create(bobKey.publicKey, {
                partyHint: 'Bob',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
            })
            .sign(bobKey.privateKey)
            .execute(),
        svSdk.party.external
            .create(tradingAppKey.publicKey, {
                partyHint: 'TradingApp',
                synchronizerId: globalSynchronizerId,
            })
            .sign(tradingAppKey.privateKey)
            .execute(),
        appProviderSdk.party.external
            .create(tokenAdminKey.publicKey, {
                partyHint: 'TokenAdmin',
                synchronizerId: globalSynchronizerId,
                additionalSynchronizerIds: [appSynchronizerId],
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
        `Parties allocated on global-synchronizer and registered on app-synchronizer — alice: ${alice.partyId} (app-user), bob: ${bob.partyId} (app-provider), tradingApp: ${tradingApp.partyId} (sv), tokenAdmin: ${tokenAdmin.partyId} (app-provider)`
    )

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
        appUserSdk,
        appProviderSdk,
        svSdk,
        appUserCtx,
        appProviderCtx,
        svCtx,
        tokenNamespaceAppUser: appUserSdk.token,
        tokenNamespaceAppProvider: appProviderSdk.token,
        alice,
        bob,
        tradingApp,
        tokenAdmin,
        globalSynchronizerId,
        appSynchronizerId,
        synchronizers,
        scanProxy,
        amuletAdmin,
        testTokenRegistryUrl: TEST_TOKEN_REGISTRY_URL,
    }
}
