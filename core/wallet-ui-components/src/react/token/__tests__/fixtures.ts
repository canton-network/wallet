// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HoldingView } from '@canton-network/core-token-standard'
import type {
    Account,
    HoldingView as HoldingViewV2,
} from '@canton-network/core-token-standard-v2'
import type { PrettyContract } from '@canton-network/core-tx-parser'

import type { PortfolioHolding } from '../holdings.ts'

export const alice = 'alice::1220'
export const bob = 'bob::1220'
export const amulet = { admin: 'dso::1220', id: 'Amulet' }
export const createdAt = '2026-01-01T00:00:00.000Z'

type Lock = PortfolioHolding['lock']

export const lockUntil = (expiresAt: string | null): Lock =>
    ({ holders: [], expiresAt, expiresAfter: null, context: null }) as Lock

export function v1Contract(
    contractId: string,
    view: { owner: string; amount: string; lock?: Lock }
): PrettyContract<HoldingView> {
    return {
        contractId,
        interfaceViewValue: {
            owner: view.owner,
            amount: view.amount,
            instrumentId: amulet,
            lock: view.lock ?? null,
            meta: { values: {} },
        },
        activeContract: { createdEvent: { createdAt } },
    } as unknown as PrettyContract<HoldingView>
}

export function v2Contract(
    contractId: string,
    view: { account: Account; amount: string }
): PrettyContract<HoldingViewV2> {
    return {
        contractId,
        interfaceViewValue: {
            account: view.account,
            amount: view.amount,
            instrumentId: amulet,
            lock: null,
            meta: { values: {} },
        },
        activeContract: { createdEvent: { createdAt } },
    } as unknown as PrettyContract<HoldingViewV2>
}

export function holding(
    contractId: string,
    fields: Partial<PortfolioHolding> & { account: Account; amount: string }
): PortfolioHolding {
    return {
        contractId,
        instrumentId: amulet,
        lock: null,
        meta: { values: {} },
        createdAt,
        ...fields,
    }
}
