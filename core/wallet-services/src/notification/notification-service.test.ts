// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeLogRecorder } from '../__tests__/test-utils.js'
import { NotificationService } from './notification-service.js'

const recorder = await initializeLogRecorder()

const category = ['core', 'wallet-services', 'notification-service']

describe('NotificationService', () => {
    let service: NotificationService

    beforeEach(() => {
        recorder.clear()
        service = new NotificationService()
    })

    it('creates a notifier for a new notifierId', () => {
        const notifier = service.getNotifier('user-1')

        expect(notifier).toBeDefined()
        expect(typeof notifier.on).toBe('function')
        expect(typeof notifier.emit).toBe('function')
        expect(typeof notifier.removeListener).toBe('function')
    })

    it('returns the same notifier instance for the same notifierId', () => {
        expect(service.getNotifier('user-1')).toBe(
            service.getNotifier('user-1')
        )
    })

    it('returns different notifier instances for different notifierIds', () => {
        expect(service.getNotifier('user-1')).not.toBe(
            service.getNotifier('user-2')
        )
    })

    it('calls listeners when an event is emitted', () => {
        const notifier = service.getNotifier('user-1')
        const listener = vi.fn()
        notifier.on('txChanged', listener)

        const result = notifier.emit('txChanged', { id: 123 }, 'extra')

        expect(result).toBe(true)
        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith({ id: 123 }, 'extra')
    })

    it('calls listeners in registration order', () => {
        const notifier = service.getNotifier('user-1')
        const calls: string[] = []
        notifier.on('txChanged', () => calls.push('first'))
        notifier.on('txChanged', () => calls.push('second'))

        notifier.emit('txChanged')

        expect(calls).toEqual(['first', 'second'])
    })

    it('returns false when emitting an event with no listeners', () => {
        const notifier = service.getNotifier('user-1')

        expect(notifier.emit('unknown-event')).toBe(false)
        recorder.assertLogged({
            category,
            level: 'debug',
            rawMessage: 'Notifier emitted event: {event} for {notifierId}',
            properties: { event: 'unknown-event', notifierId: 'user-1' },
        })
    })

    it('logs every emitted event with the correct notifierId', () => {
        service.getNotifier('user-1').emit('txChanged', { id: 123 })
        service.getNotifier('user-2').emit('statusChanged')

        expect(recorder.records.map((r) => [r.level, r.properties])).toEqual([
            ['debug', { event: 'txChanged', notifierId: 'user-1' }],
            ['debug', { event: 'statusChanged', notifierId: 'user-2' }],
        ])
    })

    it('never logs the emitted args', () => {
        const notifier = service.getNotifier('user-1')
        notifier.on('connected', () => {
            throw new Error('boom')
        })

        notifier.emit('connected', {
            session: { accessToken: 'secret-token' },
        })

        expect(recorder.records).toHaveLength(2)
        for (const record of recorder.records) {
            expect(record.properties).not.toHaveProperty('args')
            expect(JSON.stringify(record.properties)).not.toContain(
                'secret-token'
            )
            expect(record.message.join('')).not.toContain('secret-token')
        }
    })

    it('removes listeners with removeListener', () => {
        const notifier = service.getNotifier('user-1')
        const listener = vi.fn()

        notifier.on('txChanged', listener)
        notifier.removeListener('txChanged', listener)

        expect(notifier.emit('txChanged', { id: 123 })).toBe(false)
        expect(listener).not.toHaveBeenCalled()
    })

    it('ignores removal of a listener that was never registered', () => {
        const notifier = service.getNotifier('user-1')
        const listener = vi.fn()
        notifier.on('txChanged', listener)

        notifier.removeListener('txChanged', vi.fn())
        notifier.removeListener('otherEvent', listener)

        expect(notifier.emit('txChanged')).toBe(true)
        expect(listener).toHaveBeenCalledTimes(1)
    })

    it('invokes a listener registered twice twice, and removes one registration at a time', () => {
        const notifier = service.getNotifier('user-1')
        const listener = vi.fn()
        notifier.on('txChanged', listener)
        notifier.on('txChanged', listener)

        notifier.emit('txChanged')
        expect(listener).toHaveBeenCalledTimes(2)

        notifier.removeListener('txChanged', listener)
        notifier.emit('txChanged')
        expect(listener).toHaveBeenCalledTimes(3)
    })

    it('does not affect the in-flight emit when listeners are removed during it', () => {
        const notifier = service.getNotifier('user-1')
        const second = vi.fn()
        const first = vi.fn(() => notifier.removeListener('logout', second))
        notifier.on('logout', first)
        notifier.on('logout', second)

        notifier.emit('logout')
        expect(first).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledTimes(1)

        notifier.emit('logout')
        expect(first).toHaveBeenCalledTimes(2)
        expect(second).toHaveBeenCalledTimes(1)
    })

    it('logs a throwing listener and still invokes the remaining listeners', () => {
        const notifier = service.getNotifier('user-1')
        const error = new Error('boom')
        const failing = vi.fn(() => {
            throw error
        })
        const next = vi.fn()
        notifier.on('txChanged', failing)
        notifier.on('txChanged', next)

        let result: boolean | undefined
        expect(() => {
            result = notifier.emit('txChanged', { id: 1 })
        }).not.toThrow()

        expect(result).toBe(true)
        expect(failing).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith({ id: 1 })
        const errors = recorder.records.filter((r) => r.level === 'error')
        expect(errors).toHaveLength(1)
        recorder.assertLogged({
            category,
            level: 'error',
            rawMessage:
                'Notifier listener failed for event: {event} for {notifierId}',
            properties: { event: 'txChanged', notifierId: 'user-1', error },
        })
    })

    it('keeps listeners isolated between notifiers', () => {
        const notifier1 = service.getNotifier('user-1')
        const notifier2 = service.getNotifier('user-2')
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        notifier1.on('txChanged', listener1)
        notifier2.on('txChanged', listener2)
        notifier1.emit('txChanged', { id: 1 })

        expect(listener1).toHaveBeenCalledWith({ id: 1 })
        expect(listener2).not.toHaveBeenCalled()
    })
})
