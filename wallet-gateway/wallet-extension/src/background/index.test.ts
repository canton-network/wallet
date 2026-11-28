// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import { createProxyService } from '@webext-core/proxy-service'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { appPageSender, sendMessagesFrom } from '@/__tests__/message-sender.ts'
import { authMessenger } from '@/shared/auth-protocol.ts'
import {
    DAPP_RPC_KEY,
    TOKEN_RPC_KEY,
    USER_RPC_KEY,
} from '@/shared/service-keys.ts'
import { VaultErrorName, vaultMessenger } from '@/shared/vault-protocol.ts'

import { startBackground } from './index.ts'
import { createVault } from './vault/index.ts'

const contentScriptSender = {
    id: fakeBrowser.runtime.id,
    origin: 'https://dapp.example',
    url: 'https://dapp.example/',
}

describe('startBackground', () => {
    beforeEach(() => {
        fakeBrowser.reset()
        // The fake browser doesn't implement runtime.onConnect.
        vi.spyOn(
            fakeBrowser.runtime.onConnect,
            'addListener'
        ).mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
        // The messengers are singletons that allow one listener per message.
        vaultMessenger.removeAllListeners()
        authMessenger.removeAllListeners()
    })

    it('adds every listener before its first await', () => {
        const onMessage = vi.spyOn(fakeBrowser.runtime.onMessage, 'addListener')
        const onInstalled = vi.spyOn(
            fakeBrowser.runtime.onInstalled,
            'addListener'
        )

        // Nothing awaits between the call and the checks, so only listeners
        // added synchronously are counted.
        startBackground()

        // The page presence ports, the site approval ports and the
        // notification ports
        expect(fakeBrowser.runtime.onConnect.addListener).toHaveBeenCalledTimes(
            3
        )
        // The vault service, the auth service, the dApp dispatcher, the user
        // controller, the token service, the site approval service and the
        // open-UI handler
        expect(onMessage).toHaveBeenCalledTimes(7)
        expect(onInstalled).toHaveBeenCalledTimes(1)
    })

    it('answers dApp requests from the content script', async () => {
        startBackground()
        sendMessagesFrom(contentScriptSender)
        const dispatcher = createProxyService(DAPP_RPC_KEY)

        await expect(
            dispatcher.request({ jsonrpc: '2.0', id: 1, method: 'isConnected' })
        ).resolves.toEqual({
            jsonrpc: '2.0',
            id: 1,
            result: {
                isConnected: false,
                reason: 'Locked',
                isNetworkConnected: false,
                networkReason: 'Locked',
            },
        })
        await expect(
            dispatcher.request({ jsonrpc: '2.0', id: 2, method: 'constructor' })
        ).resolves.toMatchObject({
            id: 2,
            error: { code: errorCodes.rpc.methodNotFound },
        })
    })

    it('answers user API requests from the extension pages', async () => {
        const vault = createVault({ iterations: 1000 })
        startBackground({ vault })
        sendMessagesFrom(appPageSender())
        const user = createProxyService(USER_RPC_KEY)

        await expect(user.listNetworks()).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
        await vault.create('abcde1')
        await expect(user.listNetworks()).resolves.toEqual({
            networks: [
                expect.objectContaining({
                    id: 'canton:local-oauth',
                    name: 'Local (OAuth IDP)',
                }),
                expect.objectContaining({
                    id: 'canton:localnet',
                    name: 'LocalNet',
                }),
            ],
        })
    })

    it('answers token requests only while unlocked and signed in', async () => {
        const vault = createVault({ iterations: 1000 })
        startBackground({ vault })
        sendMessagesFrom(appPageSender())
        const token = createProxyService(TOKEN_RPC_KEY)

        await expect(token.token.assets()).rejects.toMatchObject({
            name: VaultErrorName.Locked,
        })
        await vault.create('abcde1')
        await expect(
            token.token.v1.utxos.list({ partyId: 'alice::1220' })
        ).rejects.toThrow('Not signed in')
    })

    it('answers only the dApp dispatcher from the content script', async () => {
        const vault = createVault({ iterations: 1000 })
        startBackground({ vault })
        await vault.create('abcde1')
        sendMessagesFrom(contentScriptSender)

        await expect(
            createProxyService(USER_RPC_KEY).listNetworks()
        ).rejects.toThrow('is only for the extension pages')
        await expect(
            createProxyService(TOKEN_RPC_KEY).token.assets()
        ).rejects.toThrow('is only for the extension pages')
        await expect(
            createProxyService(DAPP_RPC_KEY).request({
                jsonrpc: '2.0',
                id: 1,
                method: 'isConnected',
            })
        ).resolves.toMatchObject({ id: 1, result: { isConnected: false } })
    })
})
