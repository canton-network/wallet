// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EXTENDED_SDK_OPTION_KEYS, SDKPlugin } from '../'
import * as mock from '../../__test__/mocks'
import { SDK } from '../..'
import { SDKContext } from '../types/context'

const testPluginFactory = (key: string) => {
    return vi.fn(
        class extends SDKPlugin {
            constructor(ctx: SDKContext) {
                super(key, ctx)
            }
        }
    )
}

const pluginName = 'pluginName'

class TestPlugin extends SDKPlugin {
    constructor(ctx: SDKContext) {
        super(pluginName, ctx)
    }

    public testMethod() {
        return true
    }
}

describe('plugin', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    EXTENDED_SDK_OPTION_KEYS.forEach((key) => {
        it(`should throw error if ${key} is used as a name`, () => {
            expect(() => new (testPluginFactory(key))(mock.ctx)).toThrow()
        })
    })

    it('should call a plugin constructor when registering', async () => {
        // Mock the authenticated user response
        mock.ledgerProvider.request
            .mockResolvedValueOnce({
                user: { id: 'test-user-id' },
            })
            // Mock the connected synchronizers response
            .mockResolvedValueOnce({
                connectedSynchronizers: [{ id: 'sync-1' }],
            })

        const sdk = await SDK.create({
            ledgerProvider: mock.ledgerProvider as never,
        })

        const PluginClass = testPluginFactory('plugin')

        const SDKWithPlugin = sdk.registerPlugins({
            plugin: PluginClass,
        })

        expect(SDKWithPlugin.plugin).toBeInstanceOf(PluginClass)
        expect(PluginClass).toHaveBeenCalledOnce()
    })

    it('should successfully register a plugin under provided name', async () => {
        // Mock the authenticated user response
        mock.ledgerProvider.request
            .mockResolvedValueOnce({
                user: { id: 'test-user-id' },
            })
            // Mock the connected synchronizers response
            .mockResolvedValueOnce({
                connectedSynchronizers: [{ id: 'sync-1' }],
            })

        const sdk = await SDK.create({
            ledgerProvider: mock.ledgerProvider as never,
        })
        const SDKWithPlugin = sdk.registerPlugins({
            [pluginName]: TestPlugin,
        })

        expect(SDKWithPlugin[pluginName]).toBeDefined()
        expect(SDKWithPlugin[pluginName].testMethod()).toBe(true)
    })
})
