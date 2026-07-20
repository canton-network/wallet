// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './api-key-form.js'
import { ApiKeyGenerateEvent, ApiKeyForm } from './api-key-form.js'

function submitForm(el: ApiKeyForm) {
    const form = el.shadowRoot!.querySelector<HTMLFormElement>('form')!
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

function setInputValue(input: HTMLInputElement, value: string) {
    input.value = value
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

function getFormInputs(el: ApiKeyForm) {
    return Array.from(
        el.shadowRoot!.querySelectorAll<HTMLInputElement>(
            '.form-fields > .field-group input.field-control'
        )
    )
}

function fillFormInputs(el: ApiKeyForm, values: { name?: string }) {
    const [name] = getFormInputs(el)
    if (values.name !== undefined) setInputValue(name, values.name)
}

describe('api-key-form', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('mounts without error', async () => {
        const el = await fixture<ApiKeyForm>(
            html`<api-key-form></api-key-form>`
        )

        expect(el).toBeInstanceOf(ApiKeyForm)
    })

    it('shows the generate button', async () => {
        const el = await fixture<ApiKeyForm>(
            html`<api-key-form></api-key-form>`
        )

        expect(el.shadowRoot?.textContent).toContain('Generate')
    })

    it('emits ApiKeyGenerateEvent when adding a API key', async () => {
        const apiKey = {
            name: 'New API Key',
        }

        const el = await fixture<ApiKeyForm>(
            html`<api-key-form></api-key-form>`
        )

        const listener = vi.fn()
        el.addEventListener('api-key-generate', listener)

        fillFormInputs(el, apiKey)
        submitForm(el)

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(ApiKeyGenerateEvent)
        expect(
            (listener.mock.calls[0][0] as ApiKeyGenerateEvent).apiKeyParams
        ).toEqual(apiKey)
    })
})
