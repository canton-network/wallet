// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Descriptor } from '@canton-network/core-wallet-services/clear-signing'
import { fixture, waitUntil } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request, showToast } = vi.hoisted(() => ({
    request: vi.fn(),
    showToast: vi.fn(),
}))

vi.mock('../index.ts', () => ({}))
vi.mock('../utils.ts', () => ({ showToast }))
vi.mock('../rpc-client.ts', () => ({
    createUserClient: () => Promise.resolve({ request }),
}))

import './index.ts'
import type { UserUiDescriptors } from './index.ts'

function named(
    packageId: string,
    entityName: string,
    name: string,
    display: unknown = {}
): Descriptor {
    return {
        context: {
            template: {
                packageId,
                moduleName: 'Canton.Internal.Ping',
                entityName,
            },
        },
        metadata: { version: '1', publisher: 'test', name },
        display,
    } as Descriptor
}

const pong = named('pkg-pong', 'Pong', 'Uploaded pong')

async function render(): Promise<UserUiDescriptors> {
    const el = await fixture<UserUiDescriptors>(
        html`<user-ui-descriptors></user-ui-descriptors>`
    )
    await waitUntil(
        () =>
            request.mock.calls.some(
                (call) => call[0]?.method === 'listClearSigningDescriptors'
            ),
        'descriptors listed'
    )
    await el.updateComplete
    return el
}

async function paste(el: UserUiDescriptors, text: string) {
    el.pasted = text
    await el.updateComplete
    const add = [...el.shadowRoot!.querySelectorAll('button')].find(
        (b) => b.textContent?.trim() === 'Add'
    )!
    const callsBefore = request.mock.calls.length
    add.click()
    await waitUntil(() => {
        const reported = el.problems.some((problem) =>
            problem.startsWith('pasted JSON')
        )
        const stored =
            el.pasted === '' && request.mock.calls.length > callsBefore
        return reported || stored
    }, 'paste settled')
    await el.updateComplete
}

function jsonFile(path: string, contents: string): File {
    const name = path.slice(path.lastIndexOf('/') + 1)
    const file = new File([contents], name, { type: 'application/json' })
    Object.defineProperty(file, 'webkitRelativePath', { value: path })
    return file
}

describe('descriptors page', () => {
    let stored: Descriptor[]

    beforeEach(() => {
        stored = []
        showToast.mockReset()
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
                    return { descriptors: [...stored] }
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
        const el = await render()
        expect(el.shadowRoot!.querySelector('section.descriptor')).toBeNull()
        expect(el.shadowRoot!.textContent).toContain('start empty')
    })

    it('adds pasted JSON and deletes it', async () => {
        const el = await render()
        await paste(el, JSON.stringify(pong))

        expect(el.problems).toEqual([])
        expect(el.pasted).toBe('')
        const card = [
            ...el.shadowRoot!.querySelectorAll('section.descriptor'),
        ].find((c) => c.textContent?.includes('Uploaded pong'))!
        expect(card.textContent).toContain('pkg-pong')

        const remove = [...card.querySelectorAll('button')].find(
            (b) => b.textContent?.trim() === 'Delete'
        )!
        remove.click()
        await waitUntil(
            () => !el.shadowRoot!.textContent?.includes('Uploaded pong'),
            'descriptor removed'
        )
    })

    it('still lists a descriptor whose exercises field is not a list', async () => {
        const el = await render()
        await paste(
            el,
            JSON.stringify({
                ...pong,
                display: { exercises: { Respond: { intent: 'Respond' } } },
            })
        )

        expect(el.shadowRoot!.textContent).toContain(
            'Clear-signing descriptors'
        )
        expect(el.shadowRoot!.textContent).toContain('Uploaded pong')
    })

    it('shows why a descriptor is rejected', async () => {
        const el = await render()
        await paste(el, JSON.stringify({ metadata: { name: 'no template' } }))

        expect(
            el.shadowRoot!.querySelector('.alert-danger')?.textContent
        ).toContain('descriptor has no template')

        await paste(el, '{ not json')
        expect(el.problems).toEqual(['pasted JSON: not valid JSON'])
    })

    it('uploads every JSON file in a directory', async () => {
        const el = await render()
        const input = el.shadowRoot!.querySelector(
            '#descriptor-directory'
        ) as HTMLInputElement
        const files = [
            jsonFile(
                'descriptors/ping.json',
                JSON.stringify(named('pkg-1', 'Ping', 'Ping one'))
            ),
            jsonFile(
                'descriptors/v2/ping.json',
                JSON.stringify(named('pkg-2', 'Ping', 'Ping two'))
            ),
            jsonFile('descriptors/notes.txt', 'not json'),
            jsonFile('descriptors/bad.json', '{'),
            jsonFile(
                'descriptors/empty.json',
                JSON.stringify({ metadata: { name: 'no template' } })
            ),
        ]
        Object.defineProperty(input, 'files', { value: files })
        input.dispatchEvent(new Event('change'))
        await waitUntil(() => el.descriptors.length === 2, 'directory uploaded')
        await el.updateComplete

        expect(el.shadowRoot!.textContent).toContain('Ping one')
        expect(el.shadowRoot!.textContent).toContain('pkg-1')
        expect(el.shadowRoot!.textContent).toContain('Ping two')
        expect(el.shadowRoot!.textContent).toContain('pkg-2')
        expect(el.problems.join('\n')).toContain(
            'descriptors/bad.json: not valid JSON'
        )
        expect(el.problems.join('\n')).toContain('descriptors/empty.json')
        expect(el.problems.join('\n')).not.toContain('notes.txt')
        expect(showToast).toHaveBeenCalledWith(
            '',
            'Added 2, 2 rejected',
            'error'
        )
    })
})
