// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    CANTON_ANNOUNCE_PROVIDER_EVENT,
    CANTON_REQUEST_PROVIDER_EVENT,
} from '@canton-network/core-types'
import { requestAnnouncedProviders } from './announce-discovery'

describe('requestAnnouncedProviders', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('collects announced providers and deduplicates by id', async () => {
        const announce = (detail: Record<string, unknown>) => {
            window.dispatchEvent(
                new CustomEvent(CANTON_ANNOUNCE_PROVIDER_EVENT, { detail })
            )
        }

        const promise = requestAnnouncedProviders({ timeoutMs: 50 })

        window.dispatchEvent(
            new CustomEvent(CANTON_REQUEST_PROVIDER_EVENT, { detail: {} })
        )

        announce({
            id: 'ext-1',
            name: 'Extension One',
            icon: 'data:image/png;base64,abc',
            target: 'ext-1',
        })
        announce({
            id: 'ext-1',
            name: 'Duplicate',
        })
        announce({
            id: 'ext-2',
            name: 'Extension Two',
        })
        announce({
            id: 'invalid',
            // no name
        })

        await expect(promise).resolves.toEqual([
            {
                id: 'ext-1',
                name: 'Extension One',
                icon: 'data:image/png;base64,abc',
                target: 'ext-1',
            },
            {
                id: 'ext-2',
                name: 'Extension Two',
                icon: undefined,
                target: undefined,
            },
        ])
    })

    it('removes the announce listener after the timeout', async () => {
        const addListenerSpy = vi.spyOn(window, 'addEventListener')
        const removeListenerSpy = vi.spyOn(window, 'removeEventListener')

        // this keeps pending until the timeout passes
        await requestAnnouncedProviders({ timeoutMs: 10 })

        const announceHandler = addListenerSpy.mock.calls.find(
            ([event]) => event === CANTON_ANNOUNCE_PROVIDER_EVENT
        )?.[1]
        expect(announceHandler).toBeTypeOf('function')
        expect(removeListenerSpy).toHaveBeenCalledWith(
            CANTON_ANNOUNCE_PROVIDER_EVENT,
            announceHandler
        )
    })
})
