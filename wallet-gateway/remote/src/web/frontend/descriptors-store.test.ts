// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseDescriptorText } from '@canton-network/core-tx-clear-signing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request, createUserClient } = vi.hoisted(() => ({
    request: vi.fn(),
    createUserClient: vi.fn(),
}))

vi.mock('./listeners.ts', () => ({
    detectCurrentOrigin: () => Promise.resolve('http://localhost'),
}))
vi.mock('./state-manager.ts', () => ({
    stateManager: {
        accessToken: { get: () => Promise.resolve('session-token') },
    },
}))
vi.mock('./rpc-client.ts', () => ({
    createUserClient: (token?: string) => {
        createUserClient(token)
        return Promise.resolve({ request })
    },
}))

import {
    addDescriptor,
    listDescriptors,
    removeDescriptor,
} from './descriptors-store.ts'

const PKG_1 = '11'.repeat(32)
const PKG_2 = '22'.repeat(32)

function template(
    packageId: string,
    entityName: string,
    name = entityName
): string {
    return JSON.stringify({
        $schema: 'https://example.org/canton-clear-signing/v1/schema.json',
        context: {
            template: {
                packageId,
                moduleName: 'Canton.Internal.Ping',
                entityName,
            },
        },
        metadata: { version: '1.0.0', publisher: 'test', name },
        display: { create: { intent: 'Create it' } },
    })
}

function nameOf(text: string): string {
    return parseDescriptorText(text).metadata.name
}

describe('descriptors store', () => {
    let stored: string[]

    beforeEach(() => {
        stored = []
        request.mockImplementation(
            async ({
                method,
                params,
            }: {
                method: string
                params?: {
                    descriptor?: string
                    packageId?: string
                    moduleName?: string
                    entityName?: string
                }
            }) => {
                if (method === 'listClearSigningDescriptors') {
                    return { descriptors: stored }
                }
                if (method === 'setClearSigningDescriptor') {
                    const descriptor = params?.descriptor
                    if (!descriptor) throw new Error('missing descriptor')
                    const key = parseDescriptorText(descriptor).context.template
                    stored = [
                        ...stored.filter((item) => {
                            const template =
                                parseDescriptorText(item).context.template
                            return (
                                template.packageId !== key.packageId ||
                                template.moduleName !== key.moduleName ||
                                template.entityName !== key.entityName
                            )
                        }),
                        descriptor,
                    ]
                    return { descriptor }
                }
                if (method === 'removeClearSigningDescriptor') {
                    stored = stored.filter((item) => {
                        const template =
                            parseDescriptorText(item).context.template
                        return (
                            template.packageId !== params?.packageId ||
                            template.moduleName !== params?.moduleName ||
                            template.entityName !== params?.entityName
                        )
                    })
                    return null
                }
                throw new Error(`unexpected method ${method}`)
            }
        )
    })

    it('starts empty', async () => {
        expect(await listDescriptors()).toEqual([])
        expect(createUserClient).toHaveBeenCalledWith('session-token')
    })

    it('keeps two package ids and replaces the same one', async () => {
        await addDescriptor(template(PKG_1, 'Ping', 'first'))
        await addDescriptor(template(PKG_2, 'Ping', 'second'))
        await addDescriptor(template(PKG_1, 'Ping', 'replaced'))

        expect((await listDescriptors()).map(nameOf).sort()).toEqual([
            'replaced',
            'second',
        ])
    })

    it('rejects a descriptor without a template and stores nothing', async () => {
        await expect(
            addDescriptor('{"metadata":{"name":"no template"}}')
        ).rejects.toThrow(/invalid clear-signing descriptor/)
        expect(await listDescriptors()).toEqual([])
    })

    it('removes one descriptor', async () => {
        const ping = await addDescriptor(template(PKG_1, 'Ping'))
        await addDescriptor(template(PKG_2, 'Ping', 'other'))
        await removeDescriptor(ping)
        expect((await listDescriptors()).map(nameOf)).toEqual(['other'])
    })
})
