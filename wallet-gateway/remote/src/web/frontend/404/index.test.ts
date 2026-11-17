// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../index.ts', () => ({}))

import './index.ts'
import type { NotFoundUi } from './index.ts'

describe('NotFoundUi', () => {
    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
    })

    it('renders the not-found component with a home link', async () => {
        const el = await fixture<NotFoundUi>(html`<user-ui-404></user-ui-404>`)

        const notFound = el.shadowRoot?.querySelector('not-found')
        expect(notFound).not.toBeNull()
        expect(notFound?.getAttribute('href')).toContain('/')
    })
})
