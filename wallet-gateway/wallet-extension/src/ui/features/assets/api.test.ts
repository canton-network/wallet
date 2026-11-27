// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RegistryInstrument } from '@canton-network/core-wallet-ui-components/react/token'
import type { Wallet } from '@canton-network/core-wallet-user-rpc-client'
import { describe, expect, it } from 'vitest'

import { groupInstrumentsByAdmin, toTokenWallets } from './api.ts'

const instrument = (admin: string, id: string): RegistryInstrument => ({
    id,
    name: `${id} name`,
    displayName: `${id} name`,
    symbol: id,
    decimals: 10,
    admin,
    registryUrl: 'http://registry.test/',
    capabilities: {} as RegistryInstrument['capabilities'],
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

describe('groupInstrumentsByAdmin', () => {
    it('groups the instruments by admin party', () => {
        const amulet = instrument('dso::1', 'Amulet')
        const usdx = instrument('issuer::2', 'USDX')
        const other = instrument('dso::1', 'Other')

        expect([
            ...groupInstrumentsByAdmin([amulet, usdx, other]).entries(),
        ]).toEqual([
            ['dso::1', [amulet, other]],
            ['issuer::2', [usdx]],
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
