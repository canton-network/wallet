// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Descriptor } from '@canton-network/core-wallet-services/clear-signing'
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

function template(
    packageId: string,
    entityName: string,
    name = entityName
): Descriptor {
    return {
        $schema: 'https://example.org/canton-clear-signing/v1/schema.json',
        context: {
            template: {
                packageId,
                moduleName: 'Canton.Internal.Ping',
                entityName,
            },
        },
        metadata: { version: '1', publisher: 'test', name },
        display: {},
        signatures: [],
    } as Descriptor
}

describe('descriptors store', () => {
    let stored: Descriptor[]

    beforeEach(() => {
        stored = []
        request.mockImplementation(
            async ({
                method,
                params,
            }: {
                method: string
                params?: {
                    descriptor?: Descriptor
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
                    const key = descriptor.context.template
                    stored = [
                        ...stored.filter(
                            (item) =>
                                item.context.template.packageId !==
                                    key.packageId ||
                                item.context.template.moduleName !==
                                    key.moduleName ||
                                item.context.template.entityName !==
                                    key.entityName
                        ),
                        descriptor,
                    ]
                    return { descriptor }
                }
                if (method === 'removeClearSigningDescriptor') {
                    stored = stored.filter(
                        (item) =>
                            item.context.template.packageId !==
                                params?.packageId ||
                            item.context.template.moduleName !==
                                params?.moduleName ||
                            item.context.template.entityName !==
                                params?.entityName
                    )
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
        await addDescriptor(template('pkg-1', 'Ping', 'first'))
        await addDescriptor(template('pkg-2', 'Ping', 'second'))
        await addDescriptor(template('pkg-1', 'Ping', 'replaced'))

        expect(
            (await listDescriptors()).map((d) => d.metadata.name).sort()
        ).toEqual(['replaced', 'second'])
    })

    it('rejects a descriptor without a template and stores nothing', async () => {
        await expect(addDescriptor({ context: {} })).rejects.toThrow(
            /no template/
        )
        expect(request).not.toHaveBeenCalled()
        expect(await listDescriptors()).toEqual([])
    })

    it('removes one descriptor', async () => {
        const ping = await addDescriptor(template('pkg-1', 'Ping'))
        await addDescriptor(template('pkg-2', 'Ping', 'other'))
        await removeDescriptor(ping)
        expect((await listDescriptors()).map((d) => d.metadata.name)).toEqual([
            'other',
        ])
    })
})
