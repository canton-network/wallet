// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'
import { WgLoadingState } from './loading-state.js'

describe('wg-loading-state', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('mounts without error', async () => {
        const el = await fixture<WgLoadingState>(
            html`<wg-loading-state></wg-loading-state>`
        )

        expect(el).toBeInstanceOf(WgLoadingState)
    })
})
