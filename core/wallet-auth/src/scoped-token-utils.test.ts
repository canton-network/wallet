// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest'

import { findInvalidScope, mergeScopes } from './scoped-token-utils.ts'

describe('mergeScopes', () => {
    it('returns the network scope when no scopes are requested', () => {
        expect(mergeScopes('daml_ledger_api openid')).toBe(
            'daml_ledger_api openid'
        )
        expect(mergeScopes('daml_ledger_api openid', [])).toBe(
            'daml_ledger_api openid'
        )
    })

    it('appends the requested scopes without duplicates', () => {
        expect(
            mergeScopes('daml_ledger_api openid', [
                'ledger:read',
                'openid',
                'ledger:read',
            ])
        ).toBe('daml_ledger_api openid ledger:read')
    })

    it('trims requested scopes and drops empty ones', () => {
        expect(mergeScopes('openid', [' ledger:read ', '', '  '])).toBe(
            'openid ledger:read'
        )
    })

    it('ignores extra whitespace in the network scope', () => {
        expect(
            mergeScopes('  daml_ledger_api   openid ', ['ledger:read'])
        ).toBe('daml_ledger_api openid ledger:read')
        expect(mergeScopes('', ['ledger:read'])).toBe('ledger:read')
    })
})

describe('findInvalidScope', () => {
    it('accepts trimmed, empty and missing scopes', () => {
        expect(findInvalidScope()).toBeUndefined()
        expect(
            findInvalidScope([' ledger:read ', '', '  ', 'l:pkg:#pkg-one'])
        ).toBeUndefined()
    })

    it('returns the first scope with whitespace inside, trimmed', () => {
        expect(
            findInvalidScope(['openid', ' ledger:read daml_admin ', 'a\tb'])
        ).toBe('ledger:read daml_admin')
        expect(findInvalidScope(['ledger:read\nusers:self'])).toBe(
            'ledger:read\nusers:self'
        )
    })
})
