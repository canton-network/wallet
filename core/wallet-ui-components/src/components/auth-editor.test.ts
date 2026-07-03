// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import './auth-editor.js'
import { AuthEditor, AuthEditorChangeEvent } from './auth-editor.js'

const byTestId = <T extends Element>(el: Element, id: string): T | null =>
    el.querySelector<T>(`[data-test-id="${id}"]`)

describe('auth-editor', () => {
    it('starts add mode and uses first allowed method as default auth', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .allowedMethods=${['client_credentials']}
            ></auth-editor>`
        )

        expect(byTestId(el, 'auth-editor-empty-state')).not.toBeNull()

        byTestId<HTMLButtonElement>(el, 'auth-editor-add-button')?.click()
        await elementUpdated(el)

        const methodSelect = byTestId<HTMLSelectElement>(
            el,
            'auth-editor-method-select'
        )
        expect(byTestId(el, 'auth-editor-edit-state')).not.toBeNull()
        expect(methodSelect?.value).toBe('client_credentials')
        expect(byTestId(el, 'auth-editor-client-secret-input')).not.toBeNull()
    })

    it('starts edit mode with values from auth when edit is clicked', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .auth=${{
                    method: 'authorization_code',
                    clientId: 'client-id',
                    audience: 'aud',
                    scope: 'scope',
                }}
            ></auth-editor>`
        )

        expect(byTestId(el, 'auth-editor-view-state')).not.toBeNull()

        byTestId<HTMLButtonElement>(el, 'auth-editor-edit-button')?.click()
        await elementUpdated(el)

        expect(byTestId(el, 'auth-editor-view-state')).toBeNull()
        expect(byTestId(el, 'auth-editor-edit-state')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-cancel-edit-button')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-method-select')).not.toBeNull()
    })

    it('cancels add mode to empty state and emits undefined auth', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor .optional=${true}></auth-editor>`
        )
        const listener = vi.fn()
        el.addEventListener('auth-change', listener)

        byTestId<HTMLButtonElement>(el, 'auth-editor-add-button')?.click()
        await elementUpdated(el)
        byTestId<HTMLButtonElement>(
            el,
            'auth-editor-cancel-edit-button'
        )?.click()
        await elementUpdated(el)

        expect(byTestId(el, 'auth-editor-empty-state')).not.toBeNull()
        const lastEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(lastEvent.auth).toBeUndefined()
    })

    it('cancels edit and restores backup auth values', async () => {
        const existingAuth = {
            method: 'authorization_code',
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
        }
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .auth=${existingAuth}
            ></auth-editor>`
        )
        const listener = vi.fn()
        el.addEventListener('auth-change', listener)
        // Keep test behavior aligned with parent component being source of state for auth-editor
        el.addEventListener('auth-change', (event: Event) => {
            el.auth = (event as AuthEditorChangeEvent).auth
        })

        byTestId<HTMLButtonElement>(el, 'auth-editor-edit-button')?.click()
        await elementUpdated(el)

        const clientIdInput = byTestId<HTMLInputElement>(
            el,
            'auth-editor-client-id-input'
        )
        clientIdInput!.value = 'changed-client-id'
        clientIdInput!.dispatchEvent(new Event('change', { bubbles: true }))
        await elementUpdated(el)

        byTestId<HTMLButtonElement>(
            el,
            'auth-editor-cancel-edit-button'
        )?.click()
        await elementUpdated(el)

        const lastEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(lastEvent.auth).toMatchObject(existingAuth)
        expect(byTestId(el, 'auth-editor-view-state')).not.toBeNull()
    })

    it('resolves secret from backup when replacement input stays empty', async () => {
        const existingAuth = {
            method: 'client_credentials' as const,
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            clientSecret: 'existing-secret',
        }
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .auth=${existingAuth}
            ></auth-editor>`
        )
        const listener = vi.fn()
        el.addEventListener('auth-change', listener)
        // Keep test behavior aligned with parent component being source of state for auth-editor
        el.addEventListener('auth-change', (event: Event) => {
            el.auth = (event as AuthEditorChangeEvent).auth
        })

        byTestId<HTMLButtonElement>(el, 'auth-editor-edit-button')?.click()
        await elementUpdated(el)

        const secretInput = byTestId<HTMLInputElement>(
            el,
            'auth-editor-client-secret-input'
        )
        secretInput!.value = 'new-secret'
        secretInput!.dispatchEvent(new Event('change', { bubbles: true }))

        secretInput!.value = ''
        secretInput!.dispatchEvent(new Event('change', { bubbles: true }))

        const lastEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(lastEvent.auth).toMatchObject({
            method: 'client_credentials',
            clientSecret: 'existing-secret',
        })
    })

    it('emits new secret when replacement input has value', async () => {
        const existingAuth = {
            method: 'client_credentials' as const,
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            clientSecret: 'existing-secret',
        }
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .auth=${existingAuth}
            ></auth-editor>`
        )
        const listener = vi.fn()
        el.addEventListener('auth-change', listener)
        // Keep test behavior aligned with parent component being source of state for auth-editor
        el.addEventListener('auth-change', (event: Event) => {
            el.auth = (event as AuthEditorChangeEvent).auth
        })

        byTestId<HTMLButtonElement>(el, 'auth-editor-edit-button')?.click()
        await elementUpdated(el)

        const secretInput = byTestId<HTMLInputElement>(
            el,
            'auth-editor-client-secret-input'
        )
        secretInput!.value = 'new-secret'
        secretInput!.dispatchEvent(new Event('change', { bubbles: true }))

        const lastEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(lastEvent.auth).toMatchObject({
            method: 'client_credentials',
            clientSecret: 'new-secret',
        })
    })

    it('does not treat cleared add mode secret as hidden existing secret', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .allowedMethods=${['client_credentials']}
            ></auth-editor>`
        )
        const listener = vi.fn()
        el.addEventListener('auth-change', listener)
        // Keep test behavior aligned with parent component being source of state for auth-editor
        el.addEventListener('auth-change', (event: Event) => {
            el.auth = (event as AuthEditorChangeEvent).auth
        })

        byTestId<HTMLButtonElement>(el, 'auth-editor-add-button')?.click()
        await elementUpdated(el)

        const secretInput = byTestId<HTMLInputElement>(
            el,
            'auth-editor-client-secret-input'
        )
        secretInput!.value = 'new-secret'
        secretInput!.dispatchEvent(new Event('change', { bubbles: true }))
        await elementUpdated(el)
        secretInput!.value = ''
        secretInput!.dispatchEvent(new Event('change', { bubbles: true }))
        await elementUpdated(el)

        expect(secretInput?.placeholder).toBe('')
        expect(byTestId(el, 'auth-editor-secret-help')).toBeNull()

        const lastEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(lastEvent.auth).toMatchObject({
            method: 'client_credentials',
            clientSecret: '',
        })
    })

    it('keeps method select visible and shows warning for unsupported method', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${false}
                .auth=${{
                    method: 'unexpected_method',
                    clientId: 'client-id',
                    audience: 'aud',
                    scope: 'scope',
                }}
            ></auth-editor>`
        )

        expect(byTestId(el, 'auth-editor-method-select')).not.toBeNull()
        expect(
            byTestId(el, 'auth-editor-unsupported-method-warning')?.textContent
        ).toContain('Unsupported auth method')
    })

    it('renders auth inputs directly when optional is false', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor .optional=${false}></auth-editor>`
        )

        expect(byTestId(el, 'auth-editor-edit-state')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-method-select')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-client-id-input')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-add-button')).toBeNull()
    })

    it('renders Add state when optional is true and auth missing', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor .optional=${true}></auth-editor>`
        )

        expect(byTestId(el, 'auth-editor-empty-state')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-empty-text')?.textContent).toContain(
            'No auth configured.'
        )
        expect(byTestId(el, 'auth-editor-add-button')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-method-select')).toBeNull()
    })

    it('renders summary with edit and remove when optional and configured', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .auth=${{
                    method: 'client_credentials',
                    clientId: 'client-id',
                    audience: 'aud',
                    scope: 'scope',
                    clientSecret: 'secret',
                }}
            ></auth-editor>`
        )

        expect(byTestId(el, 'auth-editor-view-state')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-summary-list')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-edit-button')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-remove-button')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-empty-state')).toBeNull()
    })

    it('switches auth methods and renders method specific inputs', async () => {
        const el = await fixture<AuthEditor>(
            html`<auth-editor .optional=${false}></auth-editor>`
        )
        // The editor emits updates and expects the parent to pass the new auth back.
        el.addEventListener('auth-change', (event: Event) => {
            el.auth = (event as AuthEditorChangeEvent).auth
        })

        const methodSelect = byTestId<HTMLSelectElement>(
            el,
            'auth-editor-method-select'
        )
        expect(methodSelect).not.toBeNull()
        expect(byTestId(el, 'auth-editor-client-secret-input')).toBeNull()
        expect(byTestId(el, 'auth-editor-issuer-input')).toBeNull()

        methodSelect!.value = 'client_credentials'
        methodSelect!.dispatchEvent(new Event('change', { bubbles: true }))
        await elementUpdated(el)
        expect(byTestId(el, 'auth-editor-client-secret-input')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-issuer-input')).toBeNull()

        methodSelect!.value = 'self_signed'
        methodSelect!.dispatchEvent(new Event('change', { bubbles: true }))
        await elementUpdated(el)
        expect(byTestId(el, 'auth-editor-client-secret-input')).not.toBeNull()
        expect(byTestId(el, 'auth-editor-issuer-input')).not.toBeNull()
    })

    it('hides current secret in input and emits replacement secret', async () => {
        const existingAuth = {
            method: 'client_credentials' as const,
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            clientSecret: 'existing-secret',
        }
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${false}
                .auth=${existingAuth}
            ></auth-editor>`
        )

        const secretInput = byTestId<HTMLInputElement>(
            el,
            'auth-editor-client-secret-input'
        )
        expect(secretInput).toBeDefined()
        expect(secretInput?.value).toBe('')
        expect(byTestId(el, 'auth-editor-secret-help')?.textContent).toContain(
            'Current secret is hidden. Enter a new value to replace it.'
        )

        const listener = vi.fn()
        el.addEventListener('auth-change', listener)

        secretInput!.value = 'new-secret'
        secretInput!.dispatchEvent(new Event('change', { bubbles: true }))

        const lastEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(lastEvent.auth).toMatchObject({
            method: 'client_credentials',
            clientSecret: 'new-secret',
        })
    })

    it('emits undefined on remove and restores previous auth on cancel', async () => {
        const existingAuth = {
            method: 'client_credentials' as const,
            clientId: 'client-id',
            audience: 'aud',
            scope: 'scope',
            clientSecret: 'existing-secret',
        }
        const el = await fixture<AuthEditor>(
            html`<auth-editor
                .optional=${true}
                .auth=${existingAuth}
            ></auth-editor>`
        )

        const listener = vi.fn()
        el.addEventListener('auth-change', listener)

        const removeBtn = byTestId<HTMLButtonElement>(
            el,
            'auth-editor-remove-button'
        )
        removeBtn?.click()
        await elementUpdated(el)

        const removeEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(removeEvent.auth).toBeUndefined()
        expect(
            byTestId(el, 'auth-editor-pending-remove-text')?.textContent
        ).toContain('Auth will be removed after submitting')

        const cancelBtn = byTestId<HTMLButtonElement>(
            el,
            'auth-editor-cancel-remove-button'
        )
        cancelBtn?.click()
        await elementUpdated(el)

        const restoreEvent = listener.mock.calls.at(
            -1
        )?.[0] as AuthEditorChangeEvent
        expect(restoreEvent.auth).toMatchObject(existingAuth)
    })
})
