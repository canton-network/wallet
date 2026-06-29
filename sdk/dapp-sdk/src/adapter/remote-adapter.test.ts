// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletEvent } from '@canton-network/core-types'
import { popup } from '@canton-network/core-wallet-ui-components'
import type { EventListener } from '@canton-network/core-splice-provider'
import type {
    PrepareExecuteParams,
    StatusEvent,
} from '@canton-network/core-wallet-dapp-rpc-client'
import * as storage from '../storage'
import { clearAllLocalState } from '../util'
import { RemoteAdapter } from './remote-adapter'

const RPC_URL = 'https://gateway.example.com'

const {
    mockDappAsyncProvider,
    mockController,
    DappAsyncProviderMock,
    dappSDKControllerMock,
} = vi.hoisted(() => {
    const listeners = new Map<string, EventListener<unknown>[]>()

    const mockDappAsyncProvider = {
        on: vi.fn((event: string, listener: EventListener<unknown>) => {
            const current = listeners.get(event) ?? []
            current.push(listener)
            listeners.set(event, current)
        }),
        emit: vi.fn((event: string, ...payload: unknown[]) => {
            for (const listener of listeners.get(event) ?? []) {
                listener(...payload)
            }
            return true
        }),
        removeListener: vi.fn(),
        // only a helper for testing
        emitToListeners(event: string, ...payload: unknown[]) {
            for (const listener of listeners.get(event) ?? []) {
                listener(...payload)
            }
        },
    }

    const mockController = {
        status: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        isConnected: vi.fn(),
        ledgerApi: vi.fn(),
        prepareExecute: vi.fn(),
        listAccounts: vi.fn(),
        prepareExecuteAndWait: vi.fn(),
        getPrimaryAccount: vi.fn(),
        getActiveNetwork: vi.fn(),
        signMessage: vi.fn(),
    }

    class DappAsyncProviderMock {
        on = mockDappAsyncProvider.on
        emit = mockDappAsyncProvider.emit
        removeListener = mockDappAsyncProvider.removeListener
    }

    return {
        mockDappAsyncProvider,
        mockController,
        DappAsyncProviderMock,
        dappSDKControllerMock: vi.fn(() => mockController),
    }
})

vi.mock('@canton-network/core-provider-dapp', () => ({
    DappAsyncProvider: DappAsyncProviderMock,
}))

vi.mock('../sdk-controller', () => ({
    dappSDKController: dappSDKControllerMock,
}))

vi.mock('../util', () => ({
    clearAllLocalState: vi.fn(),
}))

vi.mock('@canton-network/core-wallet-ui-components', () => ({
    popup: {
        close: vi.fn(),
    },
}))

const kernelSession = (): StatusEvent => ({
    provider: {
        id: 'remote-gateway',
        providerType: 'remote',
        url: RPC_URL,
    },
    connection: {
        isConnected: true,
        isNetworkConnected: true,
    },
    session: {
        accessToken: 'test-token',
        userId: 'test-user',
    },
})

describe('RemoteAdapter', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
        mockController.status.mockResolvedValue(kernelSession())
        mockController.connect.mockResolvedValue(kernelSession().connection)
        mockController.disconnect.mockResolvedValue(null)
        mockController.isConnected.mockResolvedValue(kernelSession().connection)
        mockController.listAccounts.mockResolvedValue([])
        mockController.prepareExecute.mockResolvedValue(null)
        mockController.prepareExecuteAndWait.mockResolvedValue({
            tx: { commandId: 'cmd-1', status: 'executed' },
        })
        mockController.signMessage.mockResolvedValue({ signature: 'sig' })
        mockController.ledgerApi.mockResolvedValue({ ok: true })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('derives providerId from rpcUrl by default', () => {
        const adapter = new RemoteAdapter({
            name: 'Gateway',
            rpcUrl: RPC_URL,
        })

        expect(adapter.providerId).toBe(`remote:${RPC_URL}`)
        expect(adapter.getInfo()).toEqual({
            providerId: `remote:${RPC_URL}`,
            name: 'Gateway',
            type: 'remote',
            description: undefined,
            icon: undefined,
            url: RPC_URL,
            reuseGlobalWalletPopup: true,
        })
    })

    it('always reports the gateway as available', async () => {
        await expect(
            new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL }).detect()
        ).resolves.toBe(true)
    })

    it('creates a mapped provider backed by DappAsyncProvider', async () => {
        storage.setKernelSession(kernelSession())

        const adapter = new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL })
        const provider = adapter.provider()

        expect(dappSDKControllerMock).not.toHaveBeenCalled()

        await provider.request({ method: 'status' })

        expect(dappSDKControllerMock).toHaveBeenCalledTimes(1)
        expect(provider.request).toBeTypeOf('function')
    })

    it('routes RPC calls through dappSDKController', async () => {
        const adapter = new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL })
        const provider = adapter.provider()

        mockController.status.mockResolvedValueOnce(kernelSession())
        await expect(provider.request({ method: 'status' })).resolves.toEqual(
            kernelSession()
        )

        mockController.connect.mockResolvedValueOnce(kernelSession().connection)
        await expect(provider.request({ method: 'connect' })).resolves.toEqual(
            kernelSession().connection
        )

        mockController.disconnect.mockResolvedValueOnce(null)
        await expect(
            provider.request({ method: 'disconnect' })
        ).resolves.toBeNull()

        mockController.listAccounts.mockResolvedValueOnce([])
        await expect(
            provider.request({ method: 'listAccounts' })
        ).resolves.toEqual([])

        const prepareExecuteParams: PrepareExecuteParams = { commands: [] }
        mockController.prepareExecute.mockResolvedValueOnce(null)
        await expect(
            provider.request({
                method: 'prepareExecute',
                params: prepareExecuteParams,
            })
        ).resolves.toBeNull()

        mockController.prepareExecuteAndWait.mockResolvedValueOnce({
            tx: { commandId: 'cmd-1', status: 'executed' },
        })
        await expect(
            provider.request({
                method: 'prepareExecuteAndWait',
                params: prepareExecuteParams,
            })
        ).resolves.toEqual({
            tx: { commandId: 'cmd-1', status: 'executed' },
        })

        mockController.signMessage.mockResolvedValueOnce({ signature: 'sig' })
        await expect(
            provider.request({
                method: 'signMessage',
                params: { message: 'hello' },
            })
        ).resolves.toEqual({ signature: 'sig' })

        mockController.ledgerApi.mockResolvedValueOnce({ ok: true })
        await expect(
            provider.request({
                method: 'ledgerApi',
                params: {
                    requestMethod: 'get',
                    resource: '/v2/state/active-contracts',
                },
            })
        ).resolves.toEqual({ ok: true })
    })

    it('forwards provider events to the remote provider', () => {
        const adapter = new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL })
        const provider = adapter.provider()
        const listener = vi.fn<EventListener<StatusEvent>>()

        provider.on('statusChanged', listener)
        provider.emit('statusChanged', kernelSession())

        expect(mockDappAsyncProvider.on).toHaveBeenCalledWith(
            'statusChanged',
            listener
        )
        expect(mockDappAsyncProvider.emit).toHaveBeenCalledWith(
            'statusChanged',
            kernelSession()
        )
    })

    it('persists kernel session when statusChanged includes a session', () => {
        const adapter = new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL })
        adapter.provider()

        mockDappAsyncProvider.emitToListeners('statusChanged', kernelSession())

        expect(storage.getKernelSession()).toEqual(kernelSession())
    })

    it('clears local state when statusChanged reports a disconnect', () => {
        const adapter = new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL })
        adapter.provider()

        mockDappAsyncProvider.emitToListeners('statusChanged', {
            provider: { id: 'remote-gateway' },
            connection: {
                isConnected: false,
                isNetworkConnected: false,
            },
        })

        expect(clearAllLocalState).toHaveBeenCalledWith({ closePopup: true })
    })

    it('clears local state when the wallet gateway logs out', () => {
        const adapter = new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL })
        adapter.provider()

        window.dispatchEvent(
            new MessageEvent('message', {
                data: { type: WalletEvent.SPLICE_WALLET_LOGOUT },
            })
        )

        expect(clearAllLocalState).toHaveBeenCalledWith({ closePopup: true })
    })

    it('closes the popup on teardown', () => {
        new RemoteAdapter({ name: 'Gateway', rpcUrl: RPC_URL }).teardown()

        expect(popup.close).toHaveBeenCalled()
    })

    describe('restore', () => {
        it('returns null when discovery does not match this gateway', async () => {
            storage.setKernelDiscovery({
                walletType: 'remote',
                url: 'https://other.gateway.test',
            })
            storage.setKernelSession(kernelSession())

            const adapter = new RemoteAdapter({
                name: 'Gateway',
                rpcUrl: RPC_URL,
            })
            await expect(adapter.restore()).resolves.toBeNull()
        })

        it('returns null when no kernel session is stored', async () => {
            storage.setKernelDiscovery({
                walletType: 'remote',
                url: RPC_URL,
            })

            const adapter = new RemoteAdapter({
                name: 'Gateway',
                rpcUrl: RPC_URL,
            })
            await expect(adapter.restore()).resolves.toBeNull()
        })

        it('returns the provider when the stored session is still connected', async () => {
            storage.setKernelDiscovery({
                walletType: 'remote',
                url: RPC_URL,
            })
            storage.setKernelSession(kernelSession())

            const adapter = new RemoteAdapter({
                name: 'Gateway',
                rpcUrl: RPC_URL,
            })
            const restored = await adapter.restore()

            expect(restored).not.toBeNull()
            expect(restored?.request).toBeTypeOf('function')
            expect(mockController.status).toHaveBeenCalled()
        })
    })
})
