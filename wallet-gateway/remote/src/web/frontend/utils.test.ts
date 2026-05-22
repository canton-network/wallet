// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from 'vitest'
import '@canton-network/core-wallet-ui-components'
import { showToast } from './utils.js'

describe('showToast', () => {
    afterEach(() => {
        // make sure toast is gone from DOM
        document.body.innerHTML = ''
    })

    it('appends a toast element to the document body', () => {
        showToast('Title', 'Message body', 'success')

        const toast = document.body.querySelector('custom-toast')
        expect(toast).not.toBeNull()
        expect((toast as HTMLElement & { title: string }).title).toBe('Title')
        expect((toast as HTMLElement & { message: string }).message).toBe(
            'Message body'
        )
        expect((toast as HTMLElement & { type: string }).type).toBe('success')
    })
})
