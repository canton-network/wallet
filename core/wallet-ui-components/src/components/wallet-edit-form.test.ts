// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './wallet-edit-form.js'
import { WalletEditEvent, WgWalletEditForm } from './wallet-edit-form.js'
import { SigningProviderChangeEvent } from './wallet-form.js'

function submitForm(el: WgWalletEditForm) {
    const form = el.shadowRoot!.querySelector<HTMLFormElement>('form')!
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

function fillForm(
    el: WgWalletEditForm,
    values: {
        signingProviderId?: string
        publicKeyId?: string
    }
) {
    if (values.signingProviderId !== undefined) {
        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#signing-provider-id'
        )!.value = values.signingProviderId
        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#signing-provider-id'
        )!.dispatchEvent(new Event('change', { bubbles: true }))
    }
    if (values.publicKeyId !== undefined) {
        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#public-key-id'
        )!.value = values.publicKeyId
        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#public-key-id'
        )!.dispatchEvent(new Event('change', { bubbles: true }))
    }
}

describe('wg-wallet-edit-form', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('mounts without error', async () => {
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form partyId="alice"></wg-wallet-edit-form>`
        )

        expect(el).toBeInstanceOf(WgWalletEditForm)
    })

    it('renders with party id as read-only field', async () => {
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form partyId="alice"></wg-wallet-edit-form>`
        )

        const partyIdInput =
            el.shadowRoot!.querySelector<HTMLInputElement>('#party-id')!
        expect(partyIdInput.value).toBe('alice')
        expect(partyIdInput.readOnly).toBe(true)
        expect(partyIdInput.disabled).toBe(true)
    })

    it('renders signing provider options from props', async () => {
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                .signingProviders=${['participant', 'fireblocks']}
                partyId="alice"
            ></wg-wallet-edit-form>`
        )

        const options = Array.from(
            el.shadowRoot!.querySelectorAll<HTMLOptionElement>(
                'select#signing-provider-id option'
            )
        ).map((option) => option.value)

        expect(options).toContain('participant')
        expect(options).toContain('fireblocks')
    })

    it('emits WalletEditEvent with form values on submit', async () => {
        const keys = [
            { id: 'key1', name: 'Key 1', publicKey: 'pk1' },
            { id: 'key2', name: 'Key 2', publicKey: 'pk2' },
        ]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
            ></wg-wallet-edit-form>`
        )

        fillForm(el, {
            signingProviderId: 'fireblocks',
            publicKeyId: 'key1',
        })

        const listener = vi.fn()
        el.addEventListener('wallet-edit', listener)

        submitForm(el)

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(WalletEditEvent)
        const event = listener.mock.calls[0][0] as WalletEditEvent
        expect(event.partyId).toBe('alice')
        expect(event.signingProviderId).toBe('fireblocks')
        expect(event.publicKey).toBe('pk1')
    })

    it('does not emit when submitting', async () => {
        const keys = [{ id: 'key1', name: 'Key 1', publicKey: 'pk1' }]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
                .submitting=${true}
            ></wg-wallet-edit-form>`
        )

        fillForm(el, {
            signingProviderId: 'fireblocks',
            publicKeyId: 'key1',
        })

        const listener = vi.fn()
        el.addEventListener('wallet-edit', listener)

        submitForm(el)

        expect(listener).not.toHaveBeenCalled()
    })

    it('shows submitting state while editing a wallet', async () => {
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .submitting=${true}
                submitLabel="Edit"
                submittingLabel="Editing..."
                submittingMessage="Editing party, please wait..."
            ></wg-wallet-edit-form>`
        )

        expect(
            el.shadowRoot?.querySelector('.submit-button')?.textContent
        ).toContain('Editing...')
        expect(
            el.shadowRoot
                ?.querySelector('.loading-message')
                ?.textContent?.trim()
        ).toBe('Editing party, please wait...')
        expect(
            el.shadowRoot?.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )?.disabled
        ).toBe(true)
    })

    it('disables public key select when submitting', async () => {
        const keys = [{ id: 'key1', name: 'Key 1', publicKey: 'pk1' }]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
                .submitting=${true}
            ></wg-wallet-edit-form>`
        )

        expect(
            el.shadowRoot!.querySelector<HTMLSelectElement>(
                '#signing-provider-id'
            )?.disabled
        ).toBe(true)
        expect(
            el.shadowRoot!.querySelector<HTMLSelectElement>('#public-key-id')
                ?.disabled
        ).toBe(true)
    })

    it('emits SigningProviderChangeEvent when signing provider changes', async () => {
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['participant', 'fireblocks']}
            ></wg-wallet-edit-form>`
        )

        const listener = vi.fn()
        el.addEventListener('signing-provider-change', listener)

        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#signing-provider-id'
        )!.value = 'fireblocks'
        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#signing-provider-id'
        )!.dispatchEvent(new Event('change', { bubbles: true }))

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(
            SigningProviderChangeEvent
        )
        expect(
            (listener.mock.calls[0][0] as SigningProviderChangeEvent)
                .signingProviderId
        ).toBe('fireblocks')
    })

    it('clears selected public key when signing provider changes', async () => {
        const keys = [
            { id: 'key1', name: 'Key 1', publicKey: 'pk1' },
            { id: 'key2', name: 'Key 2', publicKey: 'pk2' },
        ]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
            ></wg-wallet-edit-form>`
        )

        fillForm(el, {
            signingProviderId: 'fireblocks',
            publicKeyId: 'key1',
        })

        expect(el.selectedPublicKeyId).toBe('key1')

        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#signing-provider-id'
        )!.value = 'fireblocks'
        el.shadowRoot!.querySelector<HTMLSelectElement>(
            '#signing-provider-id'
        )!.dispatchEvent(new Event('change', { bubbles: true }))

        expect(el.selectedPublicKeyId).toBe('')
    })

    it('renders public key options from props', async () => {
        const keys = [
            { id: 'key1', name: 'Key 1', publicKey: 'pk1' },
            { id: 'key2', name: 'Key 2', publicKey: 'pk2' },
            { id: 'key3', name: 'Key 3', publicKey: 'pk3' },
        ]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
            ></wg-wallet-edit-form>`
        )

        const publicKeySelect =
            el.shadowRoot!.querySelector<HTMLSelectElement>('#public-key-id')!

        const options = Array.from(
            publicKeySelect.querySelectorAll('option')
        ).map((option) => option.value)

        expect(options).toContain('key1')
        expect(options).toContain('key2')
        expect(options).toContain('key3')
    })

    it('does not emit when public key is not selected', async () => {
        const keys = [{ id: 'key1', name: 'Key 1', publicKey: 'pk1' }]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
            ></wg-wallet-edit-form>`
        )

        fillForm(el, {
            signingProviderId: 'fireblocks',
        })

        const listener = vi.fn()
        el.addEventListener('wallet-edit', listener)

        submitForm(el)

        expect(listener).not.toHaveBeenCalled()
    })

    it('does not emit when signing provider is not selected', async () => {
        const keys = [{ id: 'key1', name: 'Key 1', publicKey: 'pk1' }]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
            ></wg-wallet-edit-form>`
        )

        fillForm(el, {
            publicKeyId: 'key1',
        })

        const listener = vi.fn()
        el.addEventListener('wallet-edit', listener)

        submitForm(el)

        expect(listener).not.toHaveBeenCalled()
    })

    it('updates selected public key when public key select changes', async () => {
        const keys = [
            { id: 'key1', name: 'Key 1', publicKey: 'pk1' },
            { id: 'key2', name: 'Key 2', publicKey: 'pk2' },
        ]
        const el = await fixture<WgWalletEditForm>(
            html`<wg-wallet-edit-form
                partyId="alice"
                .signingProviders=${['fireblocks']}
                .publicKeys=${keys}
            ></wg-wallet-edit-form>`
        )

        const publicKeySelect =
            el.shadowRoot!.querySelector<HTMLSelectElement>('#public-key-id')!

        publicKeySelect.value = 'key1'
        publicKeySelect.dispatchEvent(new Event('change', { bubbles: true }))

        expect(el.selectedPublicKeyId).toBe('key1')

        publicKeySelect.value = 'key2'
        publicKeySelect.dispatchEvent(new Event('change', { bubbles: true }))

        expect(el.selectedPublicKeyId).toBe('key2')
    })
})
