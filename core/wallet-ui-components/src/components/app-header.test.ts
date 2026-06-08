// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, elementUpdated } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './app-header.js'
import { LogoutEvent } from './app-header.js'

describe('app-header', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('toggles the menu and closes it on outside click', async () => {
        const el = await fixture(html`<app-header></app-header>`)

        el.shadowRoot!.querySelector<HTMLButtonElement>(
            '.page-trigger'
        )!.click()
        await elementUpdated(el)
        expect(
            el
                .shadowRoot!.querySelector<HTMLElement>('.dropdown')!
                .classList.contains('open')
        ).toBe(true)

        document.body.dispatchEvent(
            new MouseEvent('click', { bubbles: true, composed: true })
        )
        await elementUpdated(el)

        expect(
            el
                .shadowRoot!.querySelector<HTMLElement>('.dropdown')!
                .classList.contains('open')
        ).toBe(false)
    })

    it('dispatches LogoutEvent from the menu', async () => {
        const el = await fixture(html`<app-header></app-header>`)
        const listener = vi.fn()
        el.addEventListener('logout', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>(
            '.page-trigger'
        )!.click()
        await elementUpdated(el)

        const logoutButton = Array.from(
            el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.menu-item')
        ).find((button) => button.textContent?.includes('Logout'))!

        logoutButton.click()
        await elementUpdated(el)

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(LogoutEvent)
        expect(
            el
                .shadowRoot!.querySelector<HTMLElement>('.dropdown')!
                .classList.contains('open')
        ).toBe(false)
    })
})
