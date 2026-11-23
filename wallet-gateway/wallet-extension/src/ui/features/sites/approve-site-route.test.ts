// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    holdSiteApproval,
    releaseSiteApproval,
} from '@/ui/features/sites/index.ts'
import { Route } from '@/ui/routes/_unlocked/approve-site.tsx'

vi.mock('@/ui/features/sites/index.ts', () => ({
    ApproveSitePage: () => null,
    holdSiteApproval: vi.fn(),
    releaseSiteApproval: vi.fn(),
    siteApprovalQuery: vi.fn(),
}))

describe('approve-site route', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    // A change of `?id=` alone runs only onStay.
    it.each(['onEnter', 'onStay'] as const)(
        'holds the request of the URL on %s',
        (hook) => {
            Route.options[hook]?.({ search: { id: 'request-2' } } as never)

            expect(holdSiteApproval).toHaveBeenCalledWith('request-2')
        }
    )

    it('releases the request on onLeave', () => {
        Route.options.onLeave?.({} as never)

        expect(releaseSiteApproval).toHaveBeenCalled()
    })
})
