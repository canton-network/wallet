// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, elementUpdated } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginConnectEvent, WgLoginForm } from './login-form.js'
import { makeIdp, makePublicNetwork } from './fixtures.js'

describe('wg-login-form', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('auto-selects the first non client_credentials network', async () => {
        const networks = [
            makePublicNetwork({
                id: 'cc',
                name: 'CC',
                authMethod: 'client_credentials',
            }),
            makePublicNetwork({
                id: 'oauth',
                name: 'OAuth',
                authMethod: 'authorization_code',
                identityProviderId: 'idp-1',
            }),
        ]
        const idps = [makeIdp({ id: 'idp-1' })]

        const el = await fixture<WgLoginForm>(
            html`<wg-login-form
                .networks=${networks}
                .idps=${idps}
            ></wg-login-form>`
        )

        expect(el.selectedNetwork?.id).toBe('oauth')
        expect(el.selectedIdp?.id).toBe('idp-1')
    })

    it('shows an error when the identity provider is misconfigured', async () => {
        const el = await fixture<WgLoginForm>(
            html`<wg-login-form
                .networks=${[
                    makePublicNetwork({ identityProviderId: 'missing' }),
                ]}
                .idps=${[makeIdp({ id: 'other' })]}
            ></wg-login-form>`
        )

        el.shadowRoot!.querySelector<HTMLButtonElement>('.connect-btn')!.click()
        await elementUpdated(el)

        expect(el.messageType).toBe('error')
        expect(el.message).toBe(
            'Identity provider misconfigured for this network.'
        )
    })

    it('emits LoginConnectEvent when configuration is valid', async () => {
        const network = makePublicNetwork({
            identityProviderId: 'idp-1',
            clientId: 'client-id',
        })
        const idp = makeIdp({ id: 'idp-1' })

        const el = await fixture<WgLoginForm>(
            html`<wg-login-form
                .networks=${[network]}
                .idps=${[idp]}
            ></wg-login-form>`
        )

        const listener = vi.fn()
        el.addEventListener('login-connect', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>('.connect-btn')!.click()

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(LoginConnectEvent)
        const event = listener.mock.calls[0][0] as LoginConnectEvent
        expect(event.selectedNetwork).toBe(network)
        expect(event.selectedIdp).toBe(idp)
        expect(event.clientId).toBe('client-id')
    })
})
