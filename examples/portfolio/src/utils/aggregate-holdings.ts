// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Decimal from 'decimal.js'
import { TokenStandardService } from '@canton-network/core-token-standard-service'
import type { Instruments } from '../types/instruments'
import { isBasicAccount, type PortfolioHolding } from './holdings'
import type { Account } from '@canton-network/core-token-standard-v2'

export interface AggregatedWalletBalance {
    account: Account
    isBasic: boolean
    totalAmount: string
    lockedAmount: string
    availableAmount: string
}

export interface AggregatedHolding {
    instrumentId: { admin: string; id: string }
    totalAmount: string
    lockedAmount: string
    availableAmount: string
    numOfHoldings: number
    accountBalances: AggregatedWalletBalance[]
    instrument?: {
        name: string
        symbol: string
        decimals: number
    }
}

export function getInstrumentKey(instrumentId: { admin: string; id: string }) {
    return JSON.stringify([instrumentId.admin, instrumentId.id])
}

export function getAccountKey(account: Account) {
    return JSON.stringify([
        account.owner ?? null,
        account.provider ?? null,
        account.id,
    ])
}

export function aggregateHoldings(
    holdings: PortfolioHolding[],
    currentTime: Date = new Date()
): Map<string, AggregatedHolding> {
    const aggregated = new Map<string, AggregatedHolding>()
    const grouped = new Map<string, Map<string, PortfolioHolding[]>>() //group by instrument key => account key, holdings

    for (const holding of holdings) {
        const instrumentKey = getInstrumentKey(holding.instrumentId)
        const accounts =
            grouped.get(instrumentKey) ?? new Map<string, PortfolioHolding[]>()
        const accountKey = getAccountKey(holding.account)
        accounts.set(accountKey, [...(accounts.get(accountKey) ?? []), holding])
        grouped.set(instrumentKey, accounts)
    }

    for (const [instrumentKey, accounts] of grouped) {
        const accountBalances = [...accounts.values()]
            .map((accountHoldings) => sumAccount(accountHoldings, currentTime))
            .sort(compareAccountBalances)

        const total = accountBalances.reduce(
            (sum, b) => sum.plus(b.totalAmount),
            new Decimal(0)
        )
        const locked = accountBalances.reduce(
            (sum, b) => sum.plus(b.lockedAmount),
            new Decimal(0)
        )

        aggregated.set(instrumentKey, {
            instrumentId: accountBalances.length
                ? [...accounts.values()][0][0].instrumentId
                : JSON.parse(instrumentKey),
            totalAmount: total.toString(),
            lockedAmount: locked.toString(),
            availableAmount: total.minus(locked).toString(),
            numOfHoldings: [...accounts.values()].reduce(
                (n, hs) => n + hs.length,
                0
            ),
            accountBalances,
        })
    }

    return aggregated
}

function sumAccount(
    holdings: PortfolioHolding[],
    currentTime: Date
): AggregatedWalletBalance {
    let total = new Decimal(0)
    let locked = new Decimal(0)

    for (const h of holdings) {
        const amount = new Decimal(h.amount)
        total = total.plus(amount)
        if (TokenStandardService.checkLock(h.lock, h.createdAt, currentTime))
            locked = locked.plus(amount)
    }

    const { account } = holdings[0]
    return {
        account,
        isBasic: isBasicAccount(account),
        totalAmount: total.toString(),
        lockedAmount: locked.toString(),
        availableAmount: total.minus(locked).toString(),
    }
}

function compareAccountBalances(
    a: AggregatedWalletBalance,
    b: AggregatedWalletBalance
): number {
    if (a.isBasic !== b.isBasic) return a.isBasic ? -1 : 1
    return (
        (a.account.provider ?? '').localeCompare(b.account.provider ?? '') ||
        a.account.id.localeCompare(b.account.id)
    )
}

export function enrichWithInstrumentInfo(
    aggregated: Map<string, AggregatedHolding>,
    instruments: Instruments
): AggregatedHolding[] {
    return Array.from(aggregated.values(), (item) => {
        const instrumentInfo = instruments
            .get(item.instrumentId.admin)
            ?.find((i) => i.id === item.instrumentId.id)

        return {
            ...item,
            instrument: instrumentInfo
                ? {
                      name: instrumentInfo.name,
                      symbol: instrumentInfo.symbol,
                      decimals: instrumentInfo.decimals,
                  }
                : undefined,
        }
    })
}
