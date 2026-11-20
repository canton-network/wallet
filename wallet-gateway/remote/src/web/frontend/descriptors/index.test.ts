// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseDescriptorText } from '@canton-network/core-tx-clear-signing'
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

const PONG = 'ab'.repeat(32)
const PKG_1 = '11'.repeat(32)
const PKG_2 = '22'.repeat(32)

function named(
    packageId: string,
    entityName: string,
    name: string,
    display: unknown = { create: { intent: 'Create it' } }
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
        display,
    })
}

const pong = named(PONG, 'Pong', 'Uploaded pong')

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
    let stored: string[]

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
                    descriptor?: string
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
        const el = await render()
        expect(el.shadowRoot!.querySelector('section.descriptor')).toBeNull()
        expect(el.shadowRoot!.textContent).toContain('start empty')
    })

    it('adds pasted JSON and deletes it', async () => {
        const el = await render()
        await paste(el, pong)

        expect(el.problems).toEqual([])
        expect(el.pasted).toBe('')
        const card = [
            ...el.shadowRoot!.querySelectorAll('section.descriptor'),
        ].find((c) => c.textContent?.includes('Uploaded pong'))!
        expect(card.textContent).toContain(PONG)

        const remove = [...card.querySelectorAll('button')].find(
            (b) => b.textContent?.trim() === 'Delete'
        )!
        remove.click()
        await waitUntil(
            () => !el.shadowRoot!.textContent?.includes('Uploaded pong'),
            'descriptor removed'
        )
    })

    it('rejects a descriptor whose exercises field is not a list', async () => {
        const el = await render()
        await paste(
            el,
            named(PONG, 'Pong', 'Uploaded pong', {
                exercises: { Respond: { intent: 'Respond' } },
            })
        )

        expect(el.problems.join('\n')).toContain('pasted JSON:')
        expect(el.shadowRoot!.textContent).not.toContain('Uploaded pong')
    })

    it('rejects a descriptor that repeats a member name', async () => {
        const el = await render()
        await paste(
            el,
            `{"context":{"template":{"packageId":"${PONG}","moduleName":"Canton.Internal.Ping","entityName":"Pong"}},"context":{"template":{"packageId":"${PONG}","moduleName":"Canton.Internal.Ping","entityName":"Pong"}}}`
        )

        expect(el.problems.join('\n')).toContain("duplicate key 'context'")
        expect(el.descriptors).toEqual([])
    })

    it('shows why a descriptor is rejected', async () => {
        const el = await render()
        await paste(el, JSON.stringify({ metadata: { name: 'no template' } }))

        expect(
            el.shadowRoot!.querySelector('.alert-danger')?.textContent
        ).toContain('invalid clear-signing descriptor')

        await paste(el, '{ not json')
        expect(el.problems[0]).toContain('pasted JSON:')
    })

    it('uploads every JSON file in a directory', async () => {
        const el = await render()
        const input = el.shadowRoot!.querySelector(
            '#descriptor-directory'
        ) as HTMLInputElement
        const files = [
            jsonFile('descriptors/ping.json', named(PKG_1, 'Ping', 'Ping one')),
            jsonFile(
                'descriptors/v2/ping.json',
                named(PKG_2, 'Ping', 'Ping two')
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
        expect(el.shadowRoot!.textContent).toContain(PKG_1)
        expect(el.shadowRoot!.textContent).toContain('Ping two')
        expect(el.shadowRoot!.textContent).toContain(PKG_2)
        expect(el.problems.join('\n')).toContain('descriptors/bad.json:')
        expect(el.problems.join('\n')).toContain('descriptors/empty.json')
        expect(el.problems.join('\n')).not.toContain('notes.txt')
        expect(showToast).toHaveBeenCalledWith(
            '',
            'Added 2, 2 rejected',
            'error'
        )
    })
})
