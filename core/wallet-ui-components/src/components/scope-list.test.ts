// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'
import './scope-list.js'
import type { WgScopeList } from './scope-list.js'

describe('wg-scope-list', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('lists each scope', async () => {
        const scopes = ['ledger:read', 'l:pkg:#pkg-one']
        const el = await fixture<WgScopeList>(
            html`<wg-scope-list .scopes=${scopes}></wg-scope-list>`
        )

        const items = [...el.shadowRoot!.querySelectorAll('li')].map((li) =>
            li.textContent?.trim()
        )
        expect(items).toEqual(scopes)
    })

    it('renders nothing when there are no scopes', async () => {
        const el = await fixture<WgScopeList>(
            html`<wg-scope-list .scopes=${[]}></wg-scope-list>`
        )

        expect(el.shadowRoot!.querySelector('ul')).toBeNull()
    })
})
