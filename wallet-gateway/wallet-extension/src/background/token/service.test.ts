// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Wallet } from '@canton-network/core-wallet-store'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthContextStore } from '../auth-context'
import type { RegistryStore } from '../store/registries'
import { createTestWalletStore } from '../store/test-store'
import type { TokenSdk, TokenSdkCache } from './sdk'
import { createTokenService } from './service'

const networkId = 'canton:localnet'
const context: AuthContext = { userId: 'alice', accessToken: 'alice-token' }
const registryUrls = ['http://scan.localhost:4000']

const wallet: Wallet = {
    primary: true,
    status: 'allocated',
    partyId: 'alice::1220',
    hint: 'alice',
    publicKey: 'public-key',
    namespace: '1220',
    networkId,
    signingProviderId: 'wallet-kernel',
    rights: [],
    userId: context.userId,
}

function fakeSdk() {
    return {
        token: {
            assets: vi.fn(async () => [
                {
                    id: 'Amulet',
                    displayName: 'Amulet',
                    symbol: 'CC',
                    registryUrl: new URL('http://scan.localhost:4000'),
                    admin: 'dso::1220',
                },
            ]),
            v1: { utxos: { list: vi.fn(async () => [{ contractId: 'v1' }]) } },
            v2: { utxos: { list: vi.fn(async () => [{ contractId: 'v2' }]) } },
        },
    }
}

describe('createTokenService', () => {
    let sdk: ReturnType<typeof fakeSdk>
    let sdkCache: { get: ReturnType<typeof vi.fn<TokenSdkCache['get']>> }
    let registries: RegistryStore
    let authContext: Pick<AuthContextStore, 'load'>

    function service() {
        const store = createTestWalletStore(context)
        return {
            store,
            service: createTokenService({
                authContext,
                getStore: async () => store,
                registries,
                sdkCache,
            }),
        }
    }

    async function signedIn() {
        const { store, service: tokenService } = service()
        await store.setSession({
            id: 'session-1',
            origin: 'popup',
            network: networkId,
            accessToken: context.accessToken,
        })
        await store.addWallet({ ...wallet })
        return tokenService
    }

    beforeEach(() => {
        sdk = fakeSdk()
        sdkCache = {
            get: vi.fn<TokenSdkCache['get']>(
                async () => sdk as unknown as TokenSdk
            ),
        }
        registries = {
            forNetwork: async (id) => (id === networkId ? registryUrls : []),
        }
        authContext = { load: async () => context }
    })

    it('rejects a party that is not one of the user’s wallets', async () => {
        const tokenService = await signedIn()

        await expect(
            tokenService.token.v1.utxos.list({ partyId: 'mallory::1220' })
        ).rejects.toThrow('Party mallory::1220 does not belong to user')
        await expect(
            tokenService.token.v2.utxos.list({ partyId: 'mallory::1220' })
        ).rejects.toThrow('does not belong to user')
        expect(sdkCache.get).not.toHaveBeenCalled()
    })

    it('lists the holdings of one of the user’s wallets', async () => {
        const tokenService = await signedIn()
        const params = { partyId: wallet.partyId, limit: 10 }

        await expect(tokenService.token.v1.utxos.list(params)).resolves.toEqual(
            [{ contractId: 'v1' }]
        )
        await expect(tokenService.token.v2.utxos.list(params)).resolves.toEqual(
            [{ contractId: 'v2' }]
        )
        expect(sdk.token.v1.utxos.list).toHaveBeenCalledWith(
            expect.objectContaining(params)
        )
        expect(sdk.token.v2.utxos.list).toHaveBeenCalledWith(
            expect.objectContaining(params)
        )
    })

    it('doesn’t pass options it doesn’t expose', async () => {
        const tokenService = await signedIn()

        await tokenService.token.v1.utxos.list({
            partyId: wallet.partyId,
            continueUntilCompletion: true,
        } as never)

        expect(sdk.token.v1.utxos.list).toHaveBeenCalledWith(
            expect.not.objectContaining({ continueUntilCompletion: true })
        )
    })

    it('rejects when nobody is signed in', async () => {
        authContext = { load: async () => undefined }
        const { service: tokenService } = service()

        await expect(tokenService.token.assets()).rejects.toThrow(
            'Not signed in'
        )
        await expect(
            tokenService.token.v1.utxos.list({ partyId: wallet.partyId })
        ).rejects.toThrow('Not signed in')
        expect(sdkCache.get).not.toHaveBeenCalled()
    })

    it('returns asset registry URLs as strings', async () => {
        const tokenService = await signedIn()

        const assets = await tokenService.token.assets()

        expect(assets).toEqual([
            expect.objectContaining({
                id: 'Amulet',
                registryUrl: 'http://scan.localhost:4000/',
            }),
        ])
    })

    it('builds the SDK for the current network, its registries and the user’s token', async () => {
        const tokenService = await signedIn()

        await tokenService.token.assets()

        expect(sdkCache.get).toHaveBeenCalledWith({
            network: expect.objectContaining({ id: networkId }),
            accessToken: context.accessToken,
            registries: registryUrls,
        })
    })
})
