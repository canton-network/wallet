// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineExtensionMessaging } from '@webext-core/messaging'
import {
    createProxyService,
    type ProxyServiceKey,
} from '@webext-core/proxy-service'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { appPageSender, sendMessagesFrom } from '@/__tests__/message-sender'
import { isTrustedSender, registerTrustedService } from './trusted-service'

describe('isTrustedSender', () => {
    const id = 'test-extension-id'

    it.each([
        {
            sender: 'the popup',
            url: `chrome-extension://${id}/popup.html`,
            trusted: true,
        },
        {
            sender: 'the app page',
            url: `chrome-extension://${id}/app.html?x=1#/unlock`,
            trusted: true,
        },
        {
            sender: 'a content script on a dApp page',
            url: 'https://dapp.example/popup.html',
            trusted: false,
        },
    ])('$sender → $trusted', ({ url, trusted }) => {
        expect(isTrustedSender({ id, url })).toBe(trusted)
    })
})

class CodedError extends Error {
    override name = 'CodedError'
    code = 4001
}

function createService() {
    return {
        ping: vi.fn(async () => 'pong'),
        fail: async () => {
            throw new CodedError('Refused by the service')
        },
        token: {
            label: 'nested',
            describe: vi.fn(async function (
                this: { label: string },
                a: number,
                b: string
            ) {
                return `${this.label}:${a}:${b}`
            }),
        },
    }
}

type TestService = ReturnType<typeof createService>

const KEY = 'test-service' as ProxyServiceKey<TestService>

describe('registerTrustedService', () => {
    let service: TestService
    let unregister: () => void

    beforeEach(() => {
        fakeBrowser.reset()
        service = createService()
        unregister = registerTrustedService(KEY, service)
    })

    afterEach(() => {
        unregister()
        vi.restoreAllMocks()
    })

    /** Sends a message the way `createProxyService` does, with any data. */
    function send(data: unknown) {
        return defineExtensionMessaging<
            Record<string, (data: unknown) => unknown>
        >().sendMessage(`proxy-service.${KEY}`, data)
    }

    it.each([
        { page: 'app.html', path: '/app.html?x=1#/wallets' },
        { page: 'popup.html', path: '/popup.html#/' },
    ])('answers $page', async ({ path }) => {
        sendMessagesFrom({
            id: fakeBrowser.runtime.id,
            url: fakeBrowser.runtime.getURL(path),
        })

        await expect(createProxyService(KEY).ping()).resolves.toBe('pong')
    })

    it.each<{ name: string; sender: () => Browser.runtime.MessageSender }>([
        {
            name: 'a content script',
            sender: () => ({
                id: fakeBrowser.runtime.id,
                url: 'https://dapp.example/app.html',
            }),
        },
        {
            name: 'another extension',
            sender: () => ({
                id: 'other-extension-id',
                url: 'chrome-extension://other-extension-id/app.html',
            }),
        },
        {
            name: 'a sender without a url',
            sender: () => ({ id: fakeBrowser.runtime.id }),
        },
        { name: 'an empty sender', sender: () => ({}) },
    ])('refuses $name', async ({ sender }) => {
        sendMessagesFrom(sender())

        await expect(createProxyService(KEY).ping()).rejects.toThrow(
            'is only for the extension pages'
        )
        expect(service.ping).not.toHaveBeenCalled()
    })

    describe('from the app page', () => {
        beforeEach(() => sendMessagesFrom(appPageSender()))

        it.each([
            { name: 'an empty path', path: [], error: 'Invalid method path' },
            { name: 'a null path', path: null, error: 'Invalid method path' },
            {
                name: 'a non-array path',
                path: 'ping',
                error: 'Invalid method path',
            },
            {
                name: 'a non-string segment',
                path: ['token', 1],
                error: 'Invalid method path',
            },
            {
                name: 'constructor',
                path: ['constructor'],
                error: 'Unknown method constructor',
            },
            {
                name: 'a nested constructor',
                path: ['token', 'constructor'],
                error: 'Unknown method token.constructor',
            },
            {
                name: '__proto__',
                path: ['__proto__'],
                error: 'Unknown method __proto__',
            },
            {
                name: 'toString',
                path: ['toString'],
                error: 'Unknown method toString',
            },
            {
                name: 'a property that is no method',
                path: ['token', 'label'],
                error: 'Unknown method token.label',
            },
            {
                name: 'an object',
                path: ['token'],
                error: 'Unknown method token',
            },
            {
                name: 'an unknown name',
                path: ['token', 'missing', 'deeper'],
                error: 'Unknown method token.missing.deeper',
            },
        ])('refuses $name', async ({ path, error }) => {
            await expect(send({ path, args: [] })).rejects.toThrow(error)
        })

        it('refuses arguments that are no array', async () => {
            await expect(send({ path: ['ping'], args: 'x' })).rejects.toThrow(
                'Invalid method arguments'
            )
            expect(service.ping).not.toHaveBeenCalled()
        })

        it('calls a nested method on its parent with the arguments', async () => {
            await expect(
                createProxyService(KEY).token.describe(7, 'x')
            ).resolves.toBe('nested:7:x')
            expect(service.token.describe).toHaveBeenCalledWith(7, 'x')
        })

        it("passes on the method's errors", async () => {
            await expect(createProxyService(KEY).fail()).rejects.toMatchObject({
                name: 'CodedError',
                message: 'Refused by the service',
                code: 4001,
            })
        })
    })
})
