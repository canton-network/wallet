// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './copy-button.js'
import './form-input.js'
import './idp-card.js'
import './idps.js'
import { FormInputChangedEvent } from './form-input.js'
import { IdpAddEvent, WgIdps } from './idps.js'
import { makeIdp } from './fixtures.js'

const testIdps = [
    makeIdp({ id: 'idp-one', issuer: 'https://one.example' }),
    makeIdp({ id: 'idp-two', issuer: 'https://two.example' }),
]

function getModalForm(el: WgIdps) {
    return el.shadowRoot!.querySelector<HTMLFormElement>('.modal form')!
}

async function fillAddIdpForm(el: WgIdps) {
    const typeSelect =
        el.shadowRoot!.querySelector<HTMLSelectElement>('#idp-type')!
    typeSelect.value = 'oauth'
    typeSelect.dispatchEvent(new Event('change', { bubbles: true }))
    await elementUpdated(el)

    const formInputs = el.shadowRoot!.querySelectorAll('form-input')
    formInputs[0].dispatchEvent(new FormInputChangedEvent('new-idp'))
    formInputs[1].dispatchEvent(
        new FormInputChangedEvent('https://issuer.example')
    )
    formInputs[2].dispatchEvent(
        new FormInputChangedEvent('https://config.example')
    )
    await elementUpdated(el)
}

describe('wg-idps', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('mounts without error', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps}></wg-idps>`
        )

        expect(el).toBeInstanceOf(WgIdps)
    })

    it('renders an idp card for each idp', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps}></wg-idps>`
        )

        const cards = el.shadowRoot!.querySelectorAll('idp-card')
        expect(cards.length).toBe(2)
        expect(cards[0].shadowRoot?.textContent).toContain('idp-one')
        expect(cards[1].shadowRoot?.textContent).toContain('idp-two')
    })

    it('hides the add button in readonly mode', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps} .readonly=${true}></wg-idps>`
        )

        expect(el.shadowRoot?.querySelector('.btn-primary')).toBeNull()
        expect(el.shadowRoot!.querySelectorAll('idp-card').length).toBe(2)
    })

    it('shows the add button when not readonly', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps} .readonly=${false}></wg-idps>`
        )

        expect(
            el.shadowRoot?.querySelector('.btn-primary')?.textContent?.trim()
        ).toBe('Add Identity Provider')
    })

    it('opens and closes the add idp modal', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps}></wg-idps>`
        )

        expect(el.shadowRoot?.querySelector('.modal')).toBeNull()

        el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click()
        await elementUpdated(el)

        const modal = el.shadowRoot!.querySelector('.modal')
        expect(modal).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.modal form')).not.toBeNull()
        ;(modal as HTMLElement).click()
        await elementUpdated(el)

        expect(el.shadowRoot?.querySelector('.modal')).toBeNull()
    })

    it('closes the add idp modal with the cancel button', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps}></wg-idps>`
        )

        el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click()
        await elementUpdated(el)

        el.shadowRoot!.querySelector<HTMLButtonElement>(
            '.btn-secondary'
        )!.click()
        await elementUpdated(el)

        expect(el.shadowRoot?.querySelector('.modal')).toBeNull()
    })

    it('submits the add idp form and closes the modal', async () => {
        const el = await fixture<WgIdps>(
            html`<wg-idps .idps=${testIdps}></wg-idps>`
        )
        const listener = vi.fn()
        el.addEventListener('idp-add', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click()
        await elementUpdated(el)

        await fillAddIdpForm(el)

        getModalForm(el).dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        )
        await elementUpdated(el)

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(IdpAddEvent)
        expect((listener.mock.calls[0][0] as IdpAddEvent).idp).toEqual({
            id: 'new-idp',
            type: 'oauth',
            issuer: 'https://issuer.example',
            configUrl: 'https://config.example',
        })
        expect(el.shadowRoot?.querySelector('.modal')).toBeNull()
    })
})
