// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './copy-button.js'
import './api-key-card.js'
import { ApiKeyCardRevokeEvent } from './api-key-card.js'

describe('api-key-card', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('shows a placeholder when no API key is supplied', async () => {
        const el = await fixture(html`<api-key-card></api-key-card>`)

        expect(el.shadowRoot?.textContent).toContain('No API key supplied')
    })

    it('emits ApiKeyCardRevokeEvent when revoke is clicked', async () => {
        const apiKey = {
            id: 'api-key-1',
            name: 'Test API Key',
            createdAt: new Date().toISOString(),
        }
        const el = await fixture(
            html`<api-key-card .apiKey=${apiKey}></api-key-card>`
        )

        const listener = vi.fn()
        el.addEventListener('revoke', listener)

        el.shadowRoot!.querySelector<HTMLElement>('.btn.btn-danger')!.click()

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(ApiKeyCardRevokeEvent)
    })
})
