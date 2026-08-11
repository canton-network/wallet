// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import {
    resolveTokenApiVersion,
    instrumentSupportsV2,
    assertInstrumentNotPaused,
    isMissingOffLedgerEndpoint,
} from './api-version.js'

describe('resolveTokenApiVersion', () => {
    const dual = {
        'splice-api-token-holding-v1': '1.0.0',
        'splice-api-token-holding-v2': '1.0.0',
    }
    const v1Only = { 'splice-api-token-holding-v1': '1.0.0' }

    it('prefers v2 when auto and advertised', () => {
        expect(resolveTokenApiVersion('auto', dual)).toBe('v2')
    })

    it('falls back to v1 when auto and only v1 advertised', () => {
        expect(resolveTokenApiVersion('auto', v1Only)).toBe('v1')
    })

    it('allows forced v1 against dual instruments', () => {
        expect(resolveTokenApiVersion('v1', dual)).toBe('v1')
    })

    it('rejects forced v2 when not advertised', () => {
        expect(() => resolveTokenApiVersion('v2', v1Only)).toThrow(
            /Forced apiVersion=v2/
        )
    })

    it('detects v2 markers', () => {
        expect(instrumentSupportsV2(dual)).toBe(true)
        expect(instrumentSupportsV2(v1Only)).toBe(false)
    })

    it('blocks paused instruments', () => {
        expect(() =>
            assertInstrumentNotPaused({
                id: 'Amulet',
                paused: true,
                pauseInfo: { reason: 'maintenance' },
            })
        ).toThrow(/paused/)
    })

    it('detects missing OffLedger endpoint errors', () => {
        expect(
            isMissingOffLedgerEndpoint({
                error: 'The requested resource could not be found: http://splice/v2/transfer-factory',
            })
        ).toBe(true)
        expect(isMissingOffLedgerEndpoint(new Error('boom'))).toBe(false)
    })
})
