// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import type { JsonRpcRequest } from '@canton-network/core-types'
import { createProxyService } from '@webext-core/proxy-service'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { sendMessagesFrom } from '@/__tests__/message-sender.ts'
import { DAPP_RPC_KEY } from '@/shared/service-keys.ts'

import type { DappDispatcher } from './controllers/dapp/dispatch.ts'
import { registerDappService, senderOrigin } from './dapp-service.ts'

describe('senderOrigin', () => {
    it.each([
        {
            sender: { origin: 'https://dapp.example', url: 'https://other/' },
            expected: 'https://dapp.example',
        },
        {
            sender: { url: 'http://localhost:2000/app?x=1#y' },
            expected: 'http://localhost:2000',
        },
        { sender: { origin: 'chrome-extension://abc' }, expected: undefined },
        { sender: { url: 'file:///tmp/page.html' }, expected: undefined },
        { sender: { origin: 'null' }, expected: undefined },
        { sender: {}, expected: undefined },
        { sender: undefined, expected: undefined },
    ])('$sender gives $expected', ({ sender, expected }) => {
        expect(senderOrigin(sender)).toBe(expected)
    })
})

describe('registerDappService', () => {
    const request: JsonRpcRequest = { jsonrpc: '2.0', id: 1, method: 'status' }
    const dispatcher = {
        request: vi.fn<DappDispatcher['request']>(async ({ id }) => ({
            jsonrpc: '2.0',
            id: id ?? null,
            result: null,
        })),
    }
    let remove: () => void

    beforeEach(() => {
        fakeBrowser.reset()
        dispatcher.request.mockClear()
        remove = registerDappService(dispatcher)
    })

    afterEach(() => {
        remove()
        vi.restoreAllMocks()
    })

    it("uses the sender's origin, not one the caller passes", async () => {
        sendMessagesFrom({
            id: fakeBrowser.runtime.id,
            origin: 'https://dapp.example',
            url: 'https://dapp.example/page',
        })
        const service = createProxyService(DAPP_RPC_KEY) as unknown as {
            request(request: JsonRpcRequest, origin: string): Promise<unknown>
        }

        await service.request(request, 'https://bank.example')

        expect(dispatcher.request).toHaveBeenCalledWith(
            request,
            'https://dapp.example'
        )
    })

    it('refuses a sender without a web origin', async () => {
        sendMessagesFrom({
            id: fakeBrowser.runtime.id,
            url: fakeBrowser.runtime.getURL('/app.html'),
        })

        await expect(
            createProxyService(DAPP_RPC_KEY).request(request)
        ).rejects.toMatchObject({ code: errorCodes.provider.unauthorized })
        expect(dispatcher.request).not.toHaveBeenCalled()
    })
})
