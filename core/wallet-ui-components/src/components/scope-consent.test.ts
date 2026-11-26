// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'

import './scope-consent.ts'
import type { WgScopeConsent } from './scope-consent.ts'

const render = (scopes: string[] | undefined, origin = 'https://app.example') =>
    fixture<WgScopeConsent>(
        html`<wg-scope-consent
            .scopes=${scopes}
            .origin=${origin}
        ></wg-scope-consent>`
    )

const text = (node: Node | null | undefined) =>
    node?.textContent?.replace(/\s+/g, ' ').trim()

const listedScopes = (el: WgScopeConsent) =>
    [...el.shadowRoot!.querySelectorAll('.alert')].map((alert) => ({
        variant: [...alert.classList].find((c) => c.startsWith('alert-')),
        scopes: [
            ...(alert
                .querySelector('wg-scope-list')
                ?.shadowRoot?.querySelectorAll('.scope') ?? []),
        ].map((scope) => scope.textContent),
    }))

describe('wg-scope-consent', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('warns about full access when no scopes are requested', async () => {
        for (const scopes of [undefined, []]) {
            const el = await render(scopes)

            expect(listedScopes(el)).toEqual([
                { variant: 'alert-warning', scopes: [] },
            ])
            expect(text(el.shadowRoot)).toBe(
                'https://app.example requested no specific permissions and will have full ledger access.'
            )
        }
    })

    it('lists the permissions a scoped token is restricted to', async () => {
        const el = await render(['ledger:read', 'users:self'])

        expect(listedScopes(el)).toEqual([
            {
                variant: 'alert-success',
                scopes: ['ledger:read', 'users:self'],
            },
        ])
        expect(text(el.shadowRoot)).toContain(
            'https://app.example requests limited access to the ledger.'
        )
    })

    it('separates recognized and unrecognized permissions', async () => {
        const el = await render(['ledger:read', 'Iedger:act'])

        expect(listedScopes(el)).toEqual([
            { variant: 'alert-success', scopes: ['ledger:read'] },
            { variant: 'alert-warning', scopes: ['Iedger:act'] },
        ])
        expect(text(el.shadowRoot)).toContain(
            "Wallet Gateway doesn't recognize some of the permissions"
        )
        expect(text(el.shadowRoot)).toContain(
            'Continue only if you understand and accept effects of granting the dApp these permissions.'
        )
    })

    it('warns that unrecognized permissions may give full access', async () => {
        const el = await render(['Iedger:read'])

        expect(listedScopes(el)).toEqual([
            { variant: 'alert-danger', scopes: ['Iedger:read'] },
        ])
        expect(text(el.shadowRoot)).toContain(
            "If the ledger doesn't recognize them either, the dApp gets full access."
        )
    })

    it('names the dApp generically without an origin', async () => {
        const el = await render([], '')

        expect(text(el.shadowRoot!.querySelector('strong'))).toBe('This dApp')
    })
})
