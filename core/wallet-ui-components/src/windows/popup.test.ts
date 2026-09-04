// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { popup } from './popup.js'

function createMockPopupWindow() {
    const win = {
        closed: false,
        location: { href: '' },
        focus: vi.fn(),
        close: vi.fn(() => {
            win.closed = true
        }),
        postMessage: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }
    return win
}

describe('popup', () => {
    beforeEach(() => {
        popup.close()
    })

    afterEach(() => {
        popup.close()
        vi.restoreAllMocks()
    })

    it('opens a URL in a new window', () => {
        const mockWin = createMockPopupWindow()
        const openSpy = vi
            .spyOn(window, 'open')
            .mockReturnValue(mockWin as unknown as Window)

        const result = popup.open('https://example.com/wallet')

        expect(openSpy).toHaveBeenCalledWith(
            '',
            'wallet-popup',
            expect.stringContaining('width=400')
        )
        expect(mockWin.location.href).toBe('https://example.com/wallet')
        expect(mockWin.focus).toHaveBeenCalled()
        expect(result).toBe(mockWin)
    })

    it('renders a custom element into a blob URL', () => {
        const mockWin = createMockPopupWindow()
        vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)

        class TestPopupElement extends HTMLElement {
            static styles = '.test { color: red; }'
            connectedCallback() {
                this.textContent = 'popup content'
            }
        }
        customElements.define('test-popup-element', TestPopupElement)

        popup.open(TestPopupElement)

        expect(mockWin.location.href).toMatch(/^blob:/)
    })

    it('closes the active popup window', () => {
        const mockWin = createMockPopupWindow()
        vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)

        popup.open('https://example.com')
        popup.close()

        expect(mockWin.close).toHaveBeenCalled()
    })

    it('reuses the same popup window when opened again', () => {
        const mockWin = createMockPopupWindow()
        const openSpy = vi
            .spyOn(window, 'open')
            .mockReturnValue(mockWin as unknown as Window)

        popup.open('https://first.example')
        popup.open('https://second.example')

        expect(openSpy).toHaveBeenCalledTimes(1)
        expect(mockWin.location.href).toBe('https://second.example')
    })

    it('includes a caller-supplied stylesheet in the popup document head', async () => {
        const mockWin = createMockPopupWindow()
        vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)

        class TestPopupElementWithStylesheet extends HTMLElement {
            static styles = '.test { color: red; }'
        }
        customElements.define(
            'test-popup-element-with-stylesheet',
            TestPopupElementWithStylesheet
        )

        popup.open(TestPopupElementWithStylesheet, {
            stylesheet: ':root { --wg-theme-primary-color: #123456; }',
        })

        const html = await (await fetch(mockWin.location.href)).text()
        expect(html).toContain('--wg-theme-primary-color: #123456')
    })

    it('neutralizes a literal closing style tag in a caller-supplied stylesheet', async () => {
        const mockWin = createMockPopupWindow()
        vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)

        class TestPopupElementWithUnsafeStylesheet extends HTMLElement {
            static styles = '.test { color: red; }'
        }
        customElements.define(
            'test-popup-element-with-unsafe-stylesheet',
            TestPopupElementWithUnsafeStylesheet
        )

        popup.open(TestPopupElementWithUnsafeStylesheet, {
            stylesheet: '</style><script>window.__pwned = true</script>',
        })

        const html = await (await fetch(mockWin.location.href)).text()
        expect(html).not.toContain('</style><script>')
        expect(html).toContain('&lt;/style')
    })
})
