// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TRUSTS_REFERENCE_KEY } from '@canton-network/core-tx-clear-signing'
import { pino } from 'pino'
import { describe, expect, it } from 'vitest'

import {
    REFERENCE_KEY_NOTICE_ID,
    reportClearSigningTrust,
} from './clear-signing-notice.ts'
import { ServerNotices } from './server-notices.ts'

function notices(): ServerNotices {
    return new ServerNotices(pino({ level: 'silent' }))
}

describe('reportClearSigningTrust', () => {
    it('warns while the reference key is trusted', () => {
        const registry = notices()
        reportClearSigningTrust(registry, true)
        expect(registry.list()).toEqual([
            expect.objectContaining({
                id: REFERENCE_KEY_NOTICE_ID,
                severity: 'warning',
            }),
        ])
    })

    it('reports nothing once the reference key is removed', () => {
        const registry = notices()
        reportClearSigningTrust(registry, false)
        expect(registry.list()).toEqual([])
    })

    it('warns for the shipped config, which still trusts the reference key', () => {
        expect(TRUSTS_REFERENCE_KEY).toBe(true)
    })
})
