// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    PartyLevelRight,
    UserLevelRight,
    type Wallet,
} from '@canton-network/core-wallet-store'
import {
    type Memory,
    StoreInternal,
} from '@canton-network/core-wallet-store-inmemory'
import { describe, expect, it } from 'vitest'
import { logger } from '@/shared/logger'
import { defaultConfig } from './default-config'
import {
    CorruptSnapshotError,
    decodeSnapshot,
    encodeSnapshot,
    type SnapshotV1,
} from './snapshot'

const CONTEXT = { userId: 'alice', accessToken: 'alice-token' }
const NETWORK_ID = 'canton:local-oauth'

const WALLET: Wallet = {
    primary: true,
    status: 'allocated',
    partyId: 'alice::1220',
    hint: 'alice',
    publicKey: 'public-key',
    namespace: '1220',
    networkId: NETWORK_ID,
    signingProviderId: 'wallet-kernel',
    rights: [PartyLevelRight.CanActAs],
    userId: CONTEXT.userId,
}

/** One signed-in user's store, and its snapshot after a JSON round trip. */
async function filledStore() {
    const config = defaultConfig()
    const memory: Memory = new Map()
    const store = new StoreInternal(config, logger, CONTEXT, memory)
    await store.setSession({
        id: 'session-1',
        origin: 'popup',
        network: NETWORK_ID,
        accessToken: CONTEXT.accessToken,
    })
    await store.addWallet(WALLET)
    await store.setTransaction({
        id: 'tx-1',
        status: 'signed',
        commandId: 'command-1',
        preparedTransaction: 'prepared',
        preparedTransactionHash: 'hash',
        origin: 'https://dapp.example',
        createdAt: new Date('2026-01-02T03:04:05.000Z'),
        signedAt: new Date('2026-01-02T03:05:00.000Z'),
    })
    await store.setMessageRaw({
        id: 'message-1',
        kind: 'regular',
        status: 'pending',
        userId: CONTEXT.userId,
        partyId: WALLET.partyId,
        publicKey: WALLET.publicKey,
        message: 'hello',
        origin: null,
        createdAt: new Date('2026-01-02T03:06:00.000Z'),
    })
    await store.setUserRights(NETWORK_ID, [UserLevelRight.CanReadAsAnyParty])

    const snapshot = JSON.parse(
        JSON.stringify(encodeSnapshot(config, memory))
    ) as SnapshotV1
    return { store, snapshot }
}

describe('wallet store snapshot', () => {
    it('keeps Maps, Sets and Dates through a JSON round trip', async () => {
        const { store, snapshot } = await filledStore()

        const { config, memory } = decodeSnapshot(snapshot)
        const restored = new StoreInternal(config, logger, CONTEXT, memory)

        expect(await restored.listIdps()).toEqual(await store.listIdps())
        expect(await restored.listNetworks()).toEqual(
            await store.listNetworks()
        )
        // Both lines find the current network through the session's token,
        // so they only pass if the sessions came back intact.
        expect((await restored.getCurrentNetwork()).id).toBe(NETWORK_ID)
        expect(await restored.getWallets()).toEqual([WALLET])

        const transaction =
            await restored.getLatestTransactionByCommandId('command-1')
        expect(transaction?.createdAt).toBeInstanceOf(Date)
        expect(transaction?.signedAt).toBeInstanceOf(Date)
        expect(transaction).toEqual(await store.getTransaction('tx-1'))

        const message = await restored.getMessageRaw('message-1')
        expect(message?.createdAt).toBeInstanceOf(Date)
        expect(message).toEqual(await store.getMessageRaw('message-1'))

        expect(await restored.getUserRights()).toEqual([
            UserLevelRight.CanReadAsAnyParty,
        ])
        expect(memory.get(CONTEXT.userId)?.apiKeys).toEqual(new Map())
    })

    it('rejects an unknown version', async () => {
        const { snapshot } = await filledStore()

        expect(() => decodeSnapshot({ ...snapshot, version: 2 })).toThrow(
            CorruptSnapshotError
        )
    })

    it('rejects a snapshot without users', async () => {
        const { snapshot } = await filledStore()
        const withoutUsers: Partial<SnapshotV1> = { ...snapshot }
        delete withoutUsers.users

        expect(() => decodeSnapshot(withoutUsers)).toThrow(CorruptSnapshotError)
    })
})
