// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ClearSigningResult } from '@canton-network/core-tx-clear-signing'
import { fixture } from '@open-wc/testing-helpers'
import { html, type LitElement } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'

import './transaction-detail.ts'

type OperationDescription = ClearSigningResult['operations'][number]

const operation: OperationDescription = {
    kind: 'create',
    template: { packageId: 'pkg', moduleName: 'M', entityName: 'T' },
    status: 'described',
    intent: 'Create T',
    fields: [],
}

const complete: ClearSigningResult = {
    complete: true,
    operations: [operation],
}

const incomplete: ClearSigningResult = {
    complete: false,
    operations: [{ ...operation, status: 'undescribed' }],
}

async function render(
    clearSigning: ClearSigningResult | null,
    clearSigningError: string | null = null,
    status = 'pending'
): Promise<LitElement> {
    return fixture<LitElement>(html`
        <wg-transaction-detail
            commandId="cmd"
            .status=${status}
            .clearSigning=${clearSigning}
            .clearSigningError=${clearSigningError}
        ></wg-transaction-detail>
    `)
}

function approveButton(el: LitElement): HTMLButtonElement {
    const button = [...el.shadowRoot!.querySelectorAll('button')].find(
        (b) => b.textContent?.trim() === 'Approve'
    )
    if (!button) throw new Error('no Approve button')
    return button
}

function acknowledgement(el: LitElement): HTMLInputElement | null {
    return el.shadowRoot!.querySelector('#acknowledge-undescribed')
}

async function tick(el: LitElement): Promise<void> {
    const box = acknowledgement(el)
    if (!box) throw new Error('no acknowledgement checkbox')
    box.click()
    await el.updateComplete
}

describe('wg-transaction-detail approval', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('offers Approve directly for a fully described transaction', async () => {
        const el = await render(complete)
        expect(acknowledgement(el)).toBeNull()
        expect(approveButton(el).disabled).toBe(false)
    })

    it('offers Approve directly when there is no description', async () => {
        const el = await render(null)
        expect(acknowledgement(el)).toBeNull()
        expect(approveButton(el).disabled).toBe(false)
    })

    it('waits for the acknowledgement when parts are not described', async () => {
        const el = await render(incomplete)
        expect(approveButton(el).disabled).toBe(true)

        await tick(el)
        expect(approveButton(el).disabled).toBe(false)

        await tick(el)
        expect(approveButton(el).disabled).toBe(true)
    })

    it('waits for the acknowledgement when the description failed', async () => {
        const el = await render(null, 'decode failed')
        expect(approveButton(el).disabled).toBe(true)

        await tick(el)
        expect(approveButton(el).disabled).toBe(false)
    })

    it('asks again when the description changes', async () => {
        const el = await render(incomplete)
        await tick(el)
        expect(approveButton(el).disabled).toBe(false)

        ;(el as unknown as { clearSigning: ClearSigningResult }).clearSigning =
            { ...incomplete }
        await el.updateComplete
        expect(acknowledgement(el)?.checked).toBe(false)
        expect(approveButton(el).disabled).toBe(true)
    })

    it('does not ask to acknowledge a transaction that is already signed', async () => {
        const el = await render(incomplete, null, 'signed')
        expect(acknowledgement(el)).toBeNull()
    })
})
