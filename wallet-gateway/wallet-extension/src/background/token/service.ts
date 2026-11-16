// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { Store } from '@canton-network/core-wallet-store'
import type { AssetBody } from '@canton-network/wallet-sdk'
import type { AuthContextStore } from '../auth-context'
import type { RegistryStore } from '../store/registries'
import type { TokenSdk, TokenSdkCache } from './sdk'

/** An asset as the pages receive it: messaging turns a `URL` into a string. */
export type TokenAsset = Omit<AssetBody, 'registryUrl'> & {
    registryUrl: string
}

/** The SDK's holdings parameters, without `continueUntilCompletion`. */
export type ListHoldingsParams = {
    partyId: PartyId
    includeLocked?: boolean
    limit?: number
    offset?: number
}

type Holdings<V extends 'v1' | 'v2'> = Awaited<
    ReturnType<TokenSdk['token'][V]['utxos']['list']>
>

/**
 * The read-only token API for the extension pages, with the SDK's nesting.
 * The SDK itself stays in the background: it also has the ledger, party and
 * keys APIs, and holds the user's token.
 */
export type TokenService = {
    token: {
        assets(): Promise<TokenAsset[]>
        v1: {
            utxos: {
                list(params: ListHoldingsParams): Promise<Holdings<'v1'>>
            }
        }
        v2: {
            utxos: {
                list(params: ListHoldingsParams): Promise<Holdings<'v2'>>
            }
        }
    }
}

export interface TokenServiceDeps {
    authContext: Pick<AuthContextStore, 'load'>
    getStore: () => Promise<Store>
    registries: RegistryStore
    sdkCache: TokenSdkCache
}

/**
 * Every method needs a signed-in user and builds the SDK for the current
 * network. A method that takes a `partyId` only accepts the user's wallets.
 */
export function createTokenService({
    authContext,
    getStore,
    registries,
    sdkCache,
}: TokenServiceDeps): TokenService {
    async function sdkFor(partyId?: PartyId): Promise<TokenSdk> {
        const context = await authContext.load()
        if (!context) throw new Error('Not signed in')
        const store = await getStore()
        if (partyId !== undefined) {
            const wallets = await store.getWallets()
            if (!wallets.some((wallet) => wallet.partyId === partyId)) {
                throw new Error(`Party ${partyId} does not belong to user`)
            }
        }
        const network = await store.getCurrentNetwork()
        return sdkCache.get({
            network,
            accessToken: context.accessToken,
            registries: await registries.forNetwork(network.id),
        })
    }

    // Spell out the fields, so that a caller can't pass options the
    // service doesn't expose.
    const holdingsParams = ({
        partyId,
        includeLocked,
        limit,
        offset,
    }: ListHoldingsParams): ListHoldingsParams => ({
        partyId,
        includeLocked,
        limit,
        offset,
    })

    return {
        token: {
            async assets() {
                const assets = await (await sdkFor()).token.assets()
                return assets.map((asset) => ({
                    ...asset,
                    registryUrl: asset.registryUrl.toString(),
                }))
            },
            v1: {
                utxos: {
                    async list(params) {
                        const sdk = await sdkFor(params.partyId)
                        return sdk.token.v1.utxos.list(holdingsParams(params))
                    },
                },
            },
            v2: {
                utxos: {
                    async list(params) {
                        const sdk = await sdkFor(params.partyId)
                        return sdk.token.v2.utxos.list(holdingsParams(params))
                    },
                },
            },
        },
    }
}
