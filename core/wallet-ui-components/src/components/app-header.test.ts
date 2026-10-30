// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture, elementUpdated } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './app-header.js'
import { CopyDappApiUrlEvent, LogoutEvent } from './app-header.js'

describe('app-header', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('shows the administration entry only to admins', async () => {
        const menuLabels = async (isAdmin: boolean) => {
            const el = await fixture(
                html`<app-header .isAdmin=${isAdmin}></app-header>`
            )
            return Array.from(
                el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.menu-item')
            ).map((button) => button.textContent?.trim())
        }

        expect(await menuLabels(false)).not.toContain('Administration')
        expect(await menuLabels(true)).toContain('Administration')
    })

    it('shows the number of server warnings only to admins', async () => {
        const badges = async (isAdmin: boolean, warningCount: number) => {
            const el = await fixture(
                html`<app-header
                    .isAdmin=${isAdmin}
                    .warningCount=${warningCount}
                ></app-header>`
            )
            return Array.from(
                el.shadowRoot!.querySelectorAll<HTMLElement>('.badge')
            ).map((badge) => badge.textContent?.trim())
        }

        // On the menu button and on the administration entry
        expect(await badges(true, 2)).toEqual(['2', '2'])
        expect(await badges(true, 0)).toEqual([])
        expect(await badges(false, 2)).toEqual([])
    })
})
