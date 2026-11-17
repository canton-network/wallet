// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Network } from '@canton-network/core-wallet-store'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTokenSdkCache, type TokenSdk, type TokenSdkConfig } from './sdk'

const network = { id: 'canton:localnet' } as Network
const config: TokenSdkConfig = {
    network,
    accessToken: 'token-1',
    registries: ['http://scan.localhost:4000'],
}

describe('createTokenSdkCache', () => {
    let lock: () => void
    let createSdk: ReturnType<
        typeof vi.fn<(config: TokenSdkConfig) => Promise<TokenSdk>>
    >

    function cache() {
        return createTokenSdkCache({
            vault: {
                onLock: (listener) => {
                    lock = listener
                },
            },
            createSdk,
        })
    }

    beforeEach(() => {
        // A new object per build, so the tests can tell builds apart.
        createSdk = vi.fn(async () => ({}) as TokenSdk)
    })

    it('reuses the SDK for the same network, token and registries', async () => {
        const sdks = cache()

        const first = await sdks.get(config)
        const second = await sdks.get({
            ...config,
            registries: [...config.registries],
        })

        expect(second).toBe(first)
        expect(createSdk).toHaveBeenCalledTimes(1)
        expect(createSdk).toHaveBeenCalledWith(config)
    })

    it('builds a new SDK when the token or the registries change', async () => {
        const sdks = cache()

        const first = await sdks.get(config)
        const newToken = await sdks.get({ ...config, accessToken: 'token-2' })
        const newRegistries = await sdks.get({
            ...config,
            accessToken: 'token-2',
            registries: [],
        })

        expect(newToken).not.toBe(first)
        expect(newRegistries).not.toBe(newToken)
        expect(createSdk).toHaveBeenCalledTimes(3)
    })

    it('shares one build between concurrent callers', async () => {
        const sdks = cache()

        const [first, second] = await Promise.all([
            sdks.get(config),
            sdks.get(config),
        ])

        expect(second).toBe(first)
        expect(createSdk).toHaveBeenCalledTimes(1)
    })

    it('doesn’t keep a failed build', async () => {
        createSdk.mockRejectedValueOnce(new Error('ledger down'))
        const sdks = cache()

        await expect(sdks.get(config)).rejects.toThrow('ledger down')
        await expect(sdks.get(config)).resolves.toBeDefined()
        expect(createSdk).toHaveBeenCalledTimes(2)
    })

    it('drops the SDK on lock', async () => {
        const sdks = cache()

        const first = await sdks.get(config)
        lock()
        const second = await sdks.get(config)

        expect(second).not.toBe(first)
        expect(createSdk).toHaveBeenCalledTimes(2)
    })
})
