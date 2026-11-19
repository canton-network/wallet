// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Wallet } from '@canton-network/core-wallet-user-rpc-client'
import { describe, expect, it } from 'vitest'
import type { TokenAsset } from '@/background/token/service'
import { toTokenInstruments, toTokenWallets } from './api'

const asset = (admin: string, id: string, symbol: string): TokenAsset => ({
    id,
    displayName: `${id} name`,
    symbol,
    admin,
    registryUrl: 'http://registry.test',
    capabilities: {} as TokenAsset['capabilities'],
})

const wallet = (
    partyId: string,
    status: Wallet['status'],
    primary = false
): Wallet =>
    ({
        partyId,
        hint: `${partyId}-hint`,
        primary,
        status,
        publicKey: 'key',
        namespace: 'ns',
        networkId: 'canton:localnet',
        signingProviderId: 'wallet-kernel',
    }) as Wallet

describe('toTokenInstruments', () => {
    it('groups the assets by admin party, with no decimals', () => {
        const instruments = toTokenInstruments([
            asset('dso::1', 'Amulet', 'CC'),
            asset('issuer::2', 'USDX', 'USDX'),
            asset('dso::1', 'Other', 'OTH'),
        ])

        expect([...instruments.entries()]).toEqual([
            [
                'dso::1',
                [
                    { id: 'Amulet', name: 'Amulet name', symbol: 'CC' },
                    { id: 'Other', name: 'Other name', symbol: 'OTH' },
                ],
            ],
            ['issuer::2', [{ id: 'USDX', name: 'USDX name', symbol: 'USDX' }]],
        ])
    })
})

describe('toTokenWallets', () => {
    it('keeps the allocated wallets and only the fields the hooks use', () => {
        expect(
            toTokenWallets([
                wallet('alice::1', 'allocated', true),
                wallet('bob::1', 'initialized'),
                wallet('carol::1', 'removed'),
                wallet('dave::1', 'allocated'),
            ])
        ).toEqual([
            { partyId: 'alice::1', hint: 'alice::1-hint', primary: true },
            { partyId: 'dave::1', hint: 'dave::1-hint', primary: false },
        ])
    })
})
