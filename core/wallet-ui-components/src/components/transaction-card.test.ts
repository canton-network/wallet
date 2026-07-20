// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import './transaction-card.js'
import { TransactionCardReviewEvent } from './transaction-card.js'

describe('wg-transaction-card', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('emits TransactionCardReviewEvent when clicked', async () => {
        const el = await fixture(
            html`<wg-transaction-card
                transactionId="tx-1"
                commandId="cmd-1"
                status="pending"
            ></wg-transaction-card>`
        )

        const listener = vi.fn()
        el.addEventListener('transaction-review', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>(
            '.activity-card'
        )!.click()

        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0]).toBeInstanceOf(
            TransactionCardReviewEvent
        )
        const event = listener.mock.calls[0][0] as TransactionCardReviewEvent
        expect(event.transactionId).toBe('tx-1')
        expect(event.commandId).toBe('cmd-1')
    })

    it('does not emit when loading', async () => {
        const el = await fixture(
            html`<wg-transaction-card
                transactionId="tx-1"
                commandId="cmd-1"
                .loading=${true}
            ></wg-transaction-card>`
        )

        const listener = vi.fn()
        el.addEventListener('transaction-review', listener)

        el.shadowRoot!.querySelector<HTMLButtonElement>(
            '.activity-card'
        )!.click()

        expect(listener).not.toHaveBeenCalled()
    })
})
