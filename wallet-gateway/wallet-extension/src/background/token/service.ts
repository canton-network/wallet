// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Store } from '@canton-network/core-wallet-store'
import type { RegistryInstrument } from '@canton-network/core-wallet-ui-components/react/token'
import type { AssetBody } from '@canton-network/wallet-sdk'

import type { AuthContextStore } from '../auth-context.ts'
import type { RegistryStore } from '../store/registries.ts'
import { registryInstruments } from './instruments.ts'
import type { TokenSdk, TokenSdkConfig } from './sdk.ts'

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
        /** The instruments of the current network's registries. */
        instruments(): Promise<RegistryInstrument[]>
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
    /** `createTokenSdk`. Tests pass a fake. */
    createSdk: (config: TokenSdkConfig) => Promise<TokenSdk>
}

/**
 * Every method needs a signed-in user and builds the SDK for the current
 * network. A method that takes a `partyId` only accepts the user's wallets.
 */
interface SignedIn {
    context: AuthContext
    store: Store
}

export function createTokenService({
    authContext,
    getStore,
    registries,
    createSdk,
}: TokenServiceDeps): TokenService {
    /**
     * The SDK for `user` and its current network. Callers load the user once
     * and pass it, so a sign-in that happens meanwhile can't mix one user's
     * ownership check with another user's token.
     */
    async function sdkFor({ context, store }: SignedIn): Promise<TokenSdk> {
        const network = await store.getCurrentNetwork()
        return createSdk({
            network,
            accessToken: context.accessToken,
            registries: await registries.forNetwork(network.id),
        })
    }

    /**
     * The SDK, once `partyId` is one of the user's wallets. Messaging doesn't
     * check types, so a missing or non-string `partyId` is rejected here.
     */
    async function sdkForParty(partyId: unknown): Promise<TokenSdk> {
        const user = await signedIn()
        const { store } = user
        if (typeof partyId !== 'string' || partyId === '') {
            throw new Error('A partyId is required')
        }
        const wallets = await store.getWallets()
        if (!wallets.some((wallet) => wallet.partyId === partyId)) {
            throw new Error(`Party ${partyId} does not belong to user`)
        }
        return sdkFor(user)
    }

    async function signedIn(): Promise<SignedIn> {
        const context = await authContext.load()
        if (!context) throw new Error('Not signed in')
        return { context, store: await getStore() }
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
                const sdk = await sdkFor(await signedIn())
                const assets = await sdk.token.assets()
                return assets.map((asset) => ({
                    ...asset,
                    registryUrl: asset.registryUrl.toString(),
                }))
            },
            async instruments() {
                const { store } = await signedIn()
                const network = await store.getCurrentNetwork()
                const urls = await registries.forNetwork(network.id)
                const lists = await Promise.all(urls.map(registryInstruments))
                return lists.flat()
            },
            v1: {
                utxos: {
                    async list(params) {
                        const sdk = await sdkForParty(params?.partyId)
                        return sdk.token.v1.utxos.list(holdingsParams(params))
                    },
                },
            },
            v2: {
                utxos: {
                    async list(params) {
                        const sdk = await sdkForParty(params?.partyId)
                        return sdk.token.v2.utxos.list(holdingsParams(params))
                    },
                },
            },
        },
    }
}
