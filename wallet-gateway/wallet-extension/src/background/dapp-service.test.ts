// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { errorCodes } from '@canton-network/core-rpc-errors'
import type { JsonRpcRequest } from '@canton-network/core-types'
import { createProxyService } from '@webext-core/proxy-service'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { sendMessagesFrom } from '@/__tests__/message-sender.ts'
import { DAPP_RPC_KEY } from '@/shared/service-keys.ts'

import type { DappDispatcher } from './controllers/dapp/dispatch.ts'
import { registerDappService, senderOrigin, senderTab } from './dapp-service.ts'

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

describe('senderTab', () => {
    const tab = { id: 7, windowId: 3 } as Browser.tabs.Tab

    it('names the page by its documentId', () => {
        expect(
            senderTab({ tab, documentId: 'document-1', frameId: 2 })
        ).toEqual({ tabId: 7, windowId: 3, page: 'document-1' })
    })

    it('names the page by tab and frame without a documentId', () => {
        expect(senderTab({ tab, frameId: 2 })?.page).toBe(
            JSON.stringify([7, 2])
        )
        expect(senderTab({ tab, frameId: 0 })?.page).not.toBe(
            senderTab({ tab, frameId: 2 })?.page
        )
    })

    it('has none without a tab', () => {
        expect(senderTab({ documentId: 'document-1' })).toBeUndefined()
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
            'https://dapp.example',
            undefined
        )
    })

    it("passes the sender's tab, for the site approval prompt", async () => {
        sendMessagesFrom({
            id: fakeBrowser.runtime.id,
            origin: 'https://dapp.example',
            url: 'https://dapp.example/page',
            tab: { id: 7, windowId: 3 } as Browser.tabs.Tab,
            documentId: 'document-1',
            frameId: 0,
        })

        await createProxyService(DAPP_RPC_KEY).request(request)

        expect(dispatcher.request).toHaveBeenCalledWith(
            request,
            'https://dapp.example',
            { tabId: 7, windowId: 3, page: 'document-1' }
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
