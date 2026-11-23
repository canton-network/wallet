// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LedgerTypes } from '@canton-network/core-ledger-client-types'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import type { Network } from '@canton-network/core-wallet-store'
import {
    LedgerProvider,
    SDK,
    type SDKInterface,
    type SDKOptions,
} from '@canton-network/wallet-sdk'

import type { Vault } from '../vault/index.ts'

/** The wallet SDK with its `token` namespace. */
export type TokenSdk = SDKInterface<'token'>

/** What the SDK is built for. */
export interface TokenSdkConfig {
    network: Network
    accessToken: string
    registries: string[]
}

/** Builds the wallet SDK for a network and user. */
export async function createTokenSdk({
    network,
    accessToken,
    registries,
}: TokenSdkConfig): Promise<TokenSdk> {
    const ledgerProvider = new LedgerProvider({
        baseUrl: network.ledgerApi.baseUrl,
        accessTokenProvider: AuthTokenProvider.fromToken(accessToken),
    })
    // The type arguments say the provider speaks the ledger API, where the
    // default is the dApp API, and that `token` is configured.
    return SDK.create<LedgerTypes, SDKOptions<'token'>>({
        ledgerProvider,
        // Without a default the SDK throws when the participant is connected
        // to several synchronizers, as LocalNet's are. Pick as
        // LedgerClient.getSynchronizerId() does: `global`, else the first.
        synchronizerId:
            network.synchronizerId ??
            ((synchronizers) =>
                (
                    synchronizers.find(
                        (s) => s.synchronizerAlias === 'global'
                    ) ?? synchronizers[0]!
                ).synchronizerId),
        token: {
            registries,
            auth: { method: 'static', token: accessToken },
            // Registries are public. Without 'none' the SDK falls back to
            // `auth` and sends the user's ledger token to every registry URL.
            registryAuth: 'none',
        },
    })
}

export interface TokenSdkCache {
    /** The SDK for `config`, built on first use and reused while it matches. */
    get(config: TokenSdkConfig): Promise<TokenSdk>
}

/**
 * Keeps one SDK, keyed by network id, access token and registry URLs. A
 * different key builds a new one. Concurrent callers share a build, a failed
 * build isn't kept, and a lock drops the SDK.
 *
 * Tests pass a fake `createSdk`.
 */
export function createTokenSdkCache({
    vault,
    createSdk = createTokenSdk,
}: {
    vault: Pick<Vault, 'onLock'>
    createSdk?: (config: TokenSdkConfig) => Promise<TokenSdk>
}): TokenSdkCache {
    let cached: { key: string; sdk: Promise<TokenSdk> } | undefined
    vault.onLock(() => {
        cached = undefined
    })

    return {
        get(config) {
            const key = JSON.stringify([
                config.network.id,
                config.accessToken,
                config.registries,
            ])
            if (cached?.key === key) return cached.sdk

            const entry = { key, sdk: createSdk(config) }
            cached = entry
            entry.sdk.catch(() => {
                if (cached === entry) cached = undefined
            })
            return entry.sdk
        },
    }
}
