// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, elementUpdated } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './form-input.js'
import { FormInput, FormInputChangedEvent } from './form-input.js'

describe('form-input', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('emits FormInputChangedEvent when the input changes', async () => {
        const el = await fixture<FormInput>(
            html`<form-input label="Name" .value=${'old'}></form-input>`
        )

        const listener = vi.fn()
        el.addEventListener('form-input-change', listener)

        const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!
        input.value = 'new-value'
        input.dispatchEvent(new Event('change', { bubbles: true }))
        await elementUpdated(el)

        expect(el.value).toBe('new-value')
        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(FormInputChangedEvent)
        expect((listener.mock.calls[0][0] as FormInputChangedEvent).value).toBe(
            'new-value'
        )
    })

    it('toggles password visibility when hideable', async () => {
        const el = await fixture<FormInput>(
            html`<form-input
                label="Secret"
                .hideable=${true}
                .hidden=${true}
            ></form-input>`
        )

        expect(
            el.shadowRoot!.querySelector<HTMLInputElement>('input')!.type
        ).toBe('password')

        el.shadowRoot!.querySelector<HTMLButtonElement>('.input-addon')!.click()
        await elementUpdated(el)

        expect(el.hidden).toBe(false)
        expect(
            el.shadowRoot!.querySelector<HTMLInputElement>('input')!.type
        ).toBe('text')
    })
})
