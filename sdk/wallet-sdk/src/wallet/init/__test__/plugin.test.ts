// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EXTENDED_SDK_OPTION_KEYS, SDKPlugin, SDKPluginContext } from '../'
import * as mock from '../../__test__/mocks'
import { SDK } from '../..'

const testPluginFactory = (key: string) => {
    return vi.fn(
        class extends SDKPlugin {
            constructor(ctx: SDKPluginContext) {
                super(key, ctx)
            }
        }
    )
}

const createTestSDK = async () => {
    // Mock the authenticated user response
    mock.ledgerProvider.request
        .mockResolvedValueOnce({
            user: { id: 'test-user-id' },
        })
        // Mock the connected synchronizers response
        .mockResolvedValueOnce({
            connectedSynchronizers: [{ id: 'sync-1' }],
        })

    return await SDK.create({
        ledgerProvider: mock.ledgerProvider as never,
    })
}

describe('plugin', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    EXTENDED_SDK_OPTION_KEYS.forEach((key) => {
        it(`should throw error if ${key} is used as a name`, () => {
            expect(
                () => new (testPluginFactory(key))(mock.ctx as never)
            ).toThrow()
        })
    })

    describe('record based registration (deprecated)', () => {
        it('should call a plugin constructor when registering', async () => {
            const sdk = await createTestSDK()
            const TestPlugin = testPluginFactory('plugin')

            sdk.registerPlugins({
                plugin: TestPlugin,
            })

            expect(TestPlugin).toHaveBeenCalledOnce()
        })

        it('should successfully register a plugin under provided name', async () => {
            const sdk = await createTestSDK()
            const TestPlugin = testPluginFactory('plugin')
            const SDKWithPlugin = sdk.registerPlugins({
                plugin: TestPlugin,
            })

            expect(SDKWithPlugin.plugin).toBeInstanceOf(TestPlugin)
        })
    })

    describe('array based registration', () => {
        it('should call a plugin constructor when registering', async () => {
            const sdk = await createTestSDK()
            const TestPlugin = testPluginFactory('plugin')

            const SDKWithPlugin = sdk.registerPlugins([TestPlugin])

            expect(SDKWithPlugin.plugin).toBeInstanceOf(TestPlugin)
            expect(TestPlugin).toHaveBeenCalledOnce()
        })

        it('should successfully register a plugin under plugin.name', async () => {
            const sdk = await createTestSDK()
            const TestPlugin = testPluginFactory('plugin')
            const SDKWithPlugin = sdk.registerPlugins([TestPlugin])

            expect(SDKWithPlugin['plugin']).toBeDefined()
        })

        it('should successfully register multiple plugins', async () => {
            const sdk = await createTestSDK()
            const TestPlugin = testPluginFactory('plugin')
            const SecondTestPlugin = testPluginFactory('secondPlugin')
            const SDKWithPlugin = sdk.registerPlugins([
                TestPlugin,
                SecondTestPlugin,
            ])

            expect(SDKWithPlugin.plugin).toBeInstanceOf(TestPlugin)
            expect(SDKWithPlugin.secondPlugin).toBeInstanceOf(SecondTestPlugin)
        })
    })
})
