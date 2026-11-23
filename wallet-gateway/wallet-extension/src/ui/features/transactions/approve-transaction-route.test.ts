// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    holdTransactionApproval,
    releaseTransactionApproval,
} from '@/ui/features/transactions/index.ts'
import { Route } from '@/ui/routes/_unlocked/_connected/approve-transaction.tsx'

vi.mock('@/ui/features/transactions/index.ts', () => ({
    ApproveTransactionPage: () => null,
    holdTransactionApproval: vi.fn(),
    releaseTransactionApproval: vi.fn(),
    transactionQuery: vi.fn(),
}))

describe('approve-transaction route', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    // A change of `?id=` alone runs only onStay.
    it.each(['onEnter', 'onStay'] as const)(
        'holds the transaction of the URL on %s',
        (hook) => {
            Route.options[hook]?.({ search: { id: 'tx-2' } } as never)

            expect(holdTransactionApproval).toHaveBeenCalledWith('tx-2')
        }
    )

    it('releases the transaction on onLeave', () => {
        Route.options.onLeave?.({} as never)

        expect(releaseTransactionApproval).toHaveBeenCalled()
    })
})
