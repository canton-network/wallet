// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'

import { assessScopes } from './scopes.ts'

describe('assessScopes', () => {
    it('reports full access when no scopes are requested', () => {
        expect(assessScopes()).toEqual({ verdict: 'none' })
        expect(assessScopes([])).toEqual({ verdict: 'none' })
        expect(assessScopes(['', '  '])).toEqual({ verdict: 'none' })
    })

    it('reports a scoped token when every scope is recognized', () => {
        expect(assessScopes(['ledger:read', 'users:self'])).toEqual({
            verdict: 'scoped',
            recognized: ['ledger:read', 'users:self'],
        })
    })

    it('separates recognized and unrecognized scopes', () => {
        expect(
            assessScopes(['ledger:read', 'l:pkg:#pkg-one', 'openid'])
        ).toEqual({
            verdict: 'partial',
            recognized: ['ledger:read'],
            unrecognized: ['l:pkg:#pkg-one', 'openid'],
        })
    })

    it('reports unrecognized scopes when none is recognized', () => {
        expect(assessScopes(['openid', 'daml_ledger_api'])).toEqual({
            verdict: 'unrecognized',
            unrecognized: ['openid', 'daml_ledger_api'],
        })
    })

    it('trims scopes, drops empty ones and removes duplicates', () => {
        expect(
            assessScopes([' ledger:read ', '', 'ledger:read', '\tledger:act'])
        ).toEqual({
            verdict: 'scoped',
            recognized: ['ledger:read', 'ledger:act'],
        })
    })

    it('recognizes only exact scope names', () => {
        // Capital I, capital L, Cyrillic small l, and inner whitespace
        for (const lookalike of [
            'Iedger:read',
            'Ledger:read',
            '\u04cfedger:read',
            'ledger: read',
        ]) {
            expect(assessScopes([lookalike])).toEqual({
                verdict: 'unrecognized',
                unrecognized: [lookalike],
            })
        }
    })
})
