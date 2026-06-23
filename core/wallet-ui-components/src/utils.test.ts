// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit'
import { describe, expect, it } from 'vitest'
import { cssToString } from './utils.js'

describe('cssToString', () => {
    it('returns cssText for a single CSSResult', () => {
        const style = css`
            :host {
                color: red;
            }
        `
        expect(cssToString(style)).toBe(style.cssText)
        expect(cssToString(style)).toContain('color: red')
    })

    it('concatenates CSSResult entries in an array', () => {
        const a = css`
            .a {
                display: block;
            }
        `
        const b = css`
            .b {
                margin: 0;
            }
        `

        expect(cssToString([a, b])).toBe(`${a.cssText}${b.cssText}`)
    })

    it('flattens nested arrays of styles', () => {
        const inner = css`
            .inner {
                padding: 1rem;
            }
        `
        const outer = css`
            .outer {
                border: none;
            }
        `

        expect(cssToString([outer, [inner]])).toBe(
            `${outer.cssText}${inner.cssText}`
        )
    })

    it('returns an empty string for unsupported style values', () => {
        expect(cssToString('not-a-style' as never)).toBe('')
        expect(cssToString(undefined as never)).toBe('')
    })
})
