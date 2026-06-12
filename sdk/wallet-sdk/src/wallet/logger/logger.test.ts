// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ConsoleLogAdapter from './adapter/console'
import CustomLogAdapter from './adapter/custom'
import { SDKLogger } from './logger'
import { LogAdapter } from './types'

function makeCustomAdapter() {
    const log = vi.fn()
    return { adapter: new CustomLogAdapter(log), log }
}

function setNodeEnv(value: string | undefined) {
    if (typeof process !== 'undefined') {
        if (value === undefined) {
            delete process.env.NODE_ENV
        } else {
            process.env.NODE_ENV = value
        }
    }
}

describe('sdk logging package', () => {
    describe('console log adapter', () => {
        const adapter = new ConsoleLogAdapter()

        beforeEach(() => {
            vi.spyOn(console, 'info').mockImplementation(() => {})
            vi.spyOn(console, 'error').mockImplementation(() => {})
            vi.spyOn(console, 'warn').mockImplementation(() => {})
            vi.spyOn(console, 'debug').mockImplementation(() => {})
            vi.spyOn(console, 'trace').mockImplementation(() => {})
        })

        afterEach(() => vi.restoreAllMocks())

        it('calls console[type] for each log level', () => {
            adapter.log('info', {}, 'test')
            expect(console.info).toHaveBeenCalledOnce()
        })

        it('includes namespace info', () => {
            adapter.log('error', { namespace: 'amulet' }, 'message')
            const label = (console.error as ReturnType<typeof vi.fn>).mock
                .calls[0][0]
            expect(label).toContain('ERROR:(amulet)/message')
        })
    })

    describe('custom log adapter', () => {
        it('delegates to provided log function', () => {
            const { adapter, log } = makeCustomAdapter()
            adapter.log('info', { namespace: 'token' }, 'message')
            expect(log).toHaveBeenCalledOnce()
            expect(log).toHaveBeenCalledWith(
                'info',
                { namespace: 'token' },
                'message'
            )
        })
    })

    describe('adapter selection', () => {
        afterEach(() => vi.restoreAllMocks())

        it('accepts console adapter string without throwing an exception', () => {
            vi.spyOn(console, 'info').mockImplementation(() => {})
            expect(() => new SDKLogger('console')).not.toThrow()
        })

        it('accepts console adapter string without throwing an exception', () => {
            expect(() => new SDKLogger('pino')).not.toThrow()
        })

        it('accepts CustomLogAdapter instance directly', () => {
            const { adapter } = makeCustomAdapter()
            expect(() => new SDKLogger(adapter)).not.toThrow()
        })
    })

    describe('sdk logger logs correct levels based on node env', () => {
        const isBrowserEnv = typeof process === 'undefined'
        let log: ReturnType<typeof vi.fn<LogAdapter['log']>>
        let logger: SDKLogger
        let ogNodeEnv: string | undefined
        beforeEach(() => {
            ogNodeEnv = process.env.NODE_ENV
            log = vi.fn()
            logger = new SDKLogger(new CustomLogAdapter(log))
        })

        afterEach(() => {
            setNodeEnv(ogNodeEnv)
        })

        it.skipIf(isBrowserEnv)(
            'node env is development should not be supressed',
            () => {
                setNodeEnv('development')
                logger.debug('should not be supressed')
                expect(log).toHaveBeenCalled()
            }
        )

        it.skipIf(isBrowserEnv)(
            'node env is production debug should be supressed',
            () => {
                setNodeEnv('production')
                logger.debug({ requestId: '123' }, 'should be supressed')
                expect(log).not.toHaveBeenCalled()
            }
        )

        it.skipIf(isBrowserEnv)(
            'node env is undefined debug should be supressed',
            () => {
                setNodeEnv(undefined)
                logger.debug({ requestId: '123' }, 'should be supressed')
                expect(log).not.toHaveBeenCalled()
            }
        )
    })
})
