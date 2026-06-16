// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    ALLOWED_ROUTES,
    getCurrentRoute,
    isAllowedRoute,
    toRelHref,
    toRelPath,
} from './routing.js'

describe('isAllowedRoute', () => {
    it('accepts every configured route', () => {
        for (const route of ALLOWED_ROUTES) {
            expect(isAllowedRoute(route)).toBe(true)
        }
    })

    it('rejects unknown paths', () => {
        expect(isAllowedRoute('/unknown')).toBe(false)
        expect(isAllowedRoute('')).toBe(false)
    })
})

describe('getCurrentRoute', () => {
    it('resolves root and normalizes trailing slashes', () => {
        expect(getCurrentRoute('/')).toBe('/')
        expect(getCurrentRoute('')).toBe('/')
        expect(getCurrentRoute('/parties/')).toBe('/parties')
    })

    it('strips index.html suffixes before matching routes', () => {
        expect(getCurrentRoute('/index.html')).toBe('/')
        expect(getCurrentRoute('/parties/index.html')).toBe('/parties')
    })

    it('returns null for unrecognized paths', () => {
        expect(getCurrentRoute('/not-a-route')).toBeNull()
    })

    it('throws when the pathname is too long', () => {
        expect(() => getCurrentRoute(`/${'a'.repeat(1001)}`)).toThrow(
            'Path is too long'
        )
    })
})

describe('toRelPath', () => {
    it('returns absolute paths when served from the gateway root', () => {
        expect(toRelPath('/login', '/parties')).toBe('/login')
        expect(toRelPath('login', '/')).toBe('/login')
    })

    it('prefixes paths with the gateway base path', () => {
        expect(toRelPath('/login', '/gateway/parties')).toBe('/gateway/login')
        expect(toRelPath('/', '/gateway/parties')).toBe('/gateway/')
    })

    it('preserves deeper base paths for nested deployments', () => {
        expect(toRelPath('/networks/add', '/app/wallet/parties')).toBe(
            '/app/wallet/networks/add'
        )
    })
})

describe('toRelHref', () => {
    it('builds hrefs for root and nested routes', () => {
        expect(toRelHref('/', '/gateway/parties')).toBe('/gateway/')
        expect(toRelHref('/login', '/gateway/parties')).toBe('/gateway/login/')
        expect(toRelHref('/activities', '/')).toBe('/activities/')
    })
})
