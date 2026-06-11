// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type Mock,
} from 'vitest'
import { WalletEvent } from '@canton-network/core-types'
import type { Provider } from '@canton-network/core-splice-provider'
import type {
    RpcTypes as DappRpcTypes,
    StatusEvent,
} from '@canton-network/core-wallet-dapp-rpc-client'
import * as storage from '../storage'
import { ExtensionAdapter } from './extension-adapter'

type MockProvider = {
    request: Mock<Provider<DappRpcTypes>['request']>
}

const connectedStatus = (): StatusEvent => ({
    provider: { id: 'browser:ext:test' },
    connection: {
        isConnected: true,
        isNetworkConnected: true,
    },
})

const makeMockProvider = (): MockProvider => ({
    request: vi.fn(),
})

const asProvider = (mock: MockProvider): Provider<DappRpcTypes> =>
    mock as unknown as Provider<DappRpcTypes>

describe('ExtensionAdapter', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('exposes configured wallet metadata', () => {
        const adapter = new ExtensionAdapter({
            providerId: 'browser:ext:my-wallet',
            name: 'My Extension',
            icon: 'data:image/png;base64,abc',
            description: 'Test extension',
            target: 'my-wallet',
        })

        expect(adapter.providerId).toBe('browser:ext:my-wallet')
        expect(adapter.getInfo()).toEqual({
            providerId: 'browser:ext:my-wallet',
            name: 'My Extension',
            type: 'browser',
            description: 'Test extension',
            icon: 'data:image/png;base64,abc',
        })
        expect(adapter.target).toBe('my-wallet')
    })

    it('uses defaults when config is omitted', () => {
        const adapter = new ExtensionAdapter()

        expect(adapter.providerId).toBe('browser')
        expect(adapter.getInfo().name).toBe('Browser Extension')
    })

    it('detects via the extension ready/ack handshake', async () => {
        vi.useFakeTimers()
        const postMessageSpy = vi.spyOn(window, 'postMessage')
        const adapter = new ExtensionAdapter({ target: 'ext-target' })

        const detectPromise = adapter.detect()

        expect(postMessageSpy).toHaveBeenCalledWith(
            {
                type: WalletEvent.SPLICE_WALLET_EXT_READY,
                target: 'ext-target',
            },
            '*'
        )

        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type: WalletEvent.SPLICE_WALLET_EXT_ACK,
                    target: 'ext-target',
                },
            })
        )

        await expect(detectPromise).resolves.toBe(true)
    })

    it('ignores ack messages for a different target', async () => {
        vi.useFakeTimers()
        const adapter = new ExtensionAdapter({ target: 'expected-target' })
        const detectPromise = adapter.detect()

        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type: WalletEvent.SPLICE_WALLET_EXT_ACK,
                    target: 'other-target',
                },
            })
        )

        await vi.advanceTimersByTimeAsync(2000)
        await expect(detectPromise).resolves.toBe(false)
    })

    it('restores a connected provider when kernel discovery matches', async () => {
        const adapter = new ExtensionAdapter({
            providerId: 'browser:ext:test',
        })
        const mockProvider = makeMockProvider()
        mockProvider.request.mockResolvedValue(connectedStatus())
        vi.spyOn(adapter, 'provider').mockReturnValue(asProvider(mockProvider))

        storage.setKernelDiscovery({
            walletType: 'extension',
            providerId: 'browser:ext:test',
        })

        await expect(adapter.restore()).resolves.toBe(asProvider(mockProvider))
        expect(mockProvider.request).toHaveBeenCalledWith({ method: 'connect' })
        expect(mockProvider.request).toHaveBeenCalledWith({ method: 'status' })
    })

    it('returns null when the provider is not connected', async () => {
        const adapter = new ExtensionAdapter()
        const mockProvider = makeMockProvider()
        mockProvider.request.mockResolvedValue({
            provider: { id: 'browser' },
            connection: {
                isConnected: false,
                isNetworkConnected: false,
            },
        })
        vi.spyOn(adapter, 'provider').mockReturnValue(asProvider(mockProvider))

        await expect(adapter.restore()).resolves.toBeNull()
    })
})
