// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit'
import { afterEach, describe, expect, it } from 'vitest'
import { NotFound } from './not-found.js'

describe('not-found', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('mounts without error', async () => {
        const el = await fixture<NotFound>(html`<not-found></not-found>`)

        expect(el).toBeInstanceOf(NotFound)
    })
})
