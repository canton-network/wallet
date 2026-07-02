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
