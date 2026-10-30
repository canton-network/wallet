// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pino } from 'pino'
import { ServerNotices } from './server-notices.js'

describe('ServerNotices', () => {
    const logger = pino({ level: 'silent' })

    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('starts empty', () => {
        expect(new ServerNotices(logger).list()).toEqual([])
    })

    it('records a reported notice', () => {
        const notices = new ServerNotices(logger)
        notices.report({
            id: 'deprecated-config:server.tls',
            severity: 'warning',
            message: 'server.tls is deprecated',
            configPath: 'server.tls',
        })

        expect(notices.list()).toEqual([
            {
                id: 'deprecated-config:server.tls',
                severity: 'warning',
                message: 'server.tls is deprecated',
                configPath: 'server.tls',
                firstSeenAt: '2026-01-01T00:00:00.000Z',
                lastSeenAt: '2026-01-01T00:00:00.000Z',
            },
        ])
    })

    it('updates a notice reported again with the same id', () => {
        const notices = new ServerNotices(logger)
        notices.report({ id: 'a', severity: 'info', message: 'first' })
        vi.setSystemTime(new Date('2026-01-02T00:00:00Z'))
        notices.report({ id: 'a', severity: 'warning', message: 'second' })

        expect(notices.list()).toEqual([
            {
                id: 'a',
                severity: 'warning',
                message: 'second',
                firstSeenAt: '2026-01-01T00:00:00.000Z',
                lastSeenAt: '2026-01-02T00:00:00.000Z',
            },
        ])
    })

    it('logs a notice only when it is first reported', () => {
        const warn = vi.spyOn(logger, 'warn')
        const notices = new ServerNotices(logger)
        const report = {
            id: 'a',
            severity: 'warning',
            message: 'careful',
        } as const
        notices.report(report)
        notices.report(report)

        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn).toHaveBeenCalledWith(
            { noticeId: 'a', configPath: undefined },
            'careful'
        )
    })
})
