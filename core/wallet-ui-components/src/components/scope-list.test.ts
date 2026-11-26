// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'

import { CANTON_SCOPES } from '../logic/scopes.ts'
import './scope-list.ts'
import type { WgScopeList } from './scope-list.ts'

describe('wg-scope-list', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('lists each scope', async () => {
        const scopes = ['ledger:read', 'l:pkg:#pkg-one']
        const el = await fixture<WgScopeList>(
            html`<wg-scope-list .scopes=${scopes}></wg-scope-list>`
        )

        const items = [...el.shadowRoot!.querySelectorAll('.scope')].map(
            (scope) => scope.textContent
        )
        expect(items).toEqual(scopes)
    })

    it('explains only the scopes recognized by Canton', async () => {
        const el = await fixture<WgScopeList>(
            html`<wg-scope-list
                .scopes=${['ledger:read', 'Iedger:read']}
            ></wg-scope-list>`
        )

        const [recognized, unrecognized] = el.shadowRoot!.querySelectorAll('li')
        const info = recognized!.querySelector('button')!
        expect(info.getAttribute('aria-label')).toBe('About ledger:read')
        const tooltip = el.shadowRoot!.getElementById(
            info.getAttribute('aria-describedby')!
        )
        expect(tooltip?.getAttribute('role')).toBe('tooltip')
        expect(tooltip?.textContent).toBe(CANTON_SCOPES['ledger:read'])
        expect(unrecognized!.querySelector('button')).toBeNull()
    })

    it('renders nothing when there are no scopes', async () => {
        const el = await fixture<WgScopeList>(
            html`<wg-scope-list .scopes=${[]}></wg-scope-list>`
        )

        expect(el.shadowRoot!.querySelector('ul')).toBeNull()
    })
})
