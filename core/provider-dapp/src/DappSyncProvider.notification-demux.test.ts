// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { WalletEvent } from '@canton-network/core-types'
import { WindowTransport } from '@canton-network/core-rpc-transport'
import { DappSyncProvider } from './DappSyncProvider'

// Companion to DappSyncProvider.push-events.test.ts: exercises the always-on
// notification demux against the *announced-provider* construction path.
//
// Discovery hands the dApp a routing key, not a provider object
// (requestAnnouncedProviders → AnnouncedProvider.target), and the SDK then
// builds DappSyncProvider(new WindowTransport(window, { target })). In that
// future every transport is targeted, so event delivery must honor the same
// target gating as extension detection — otherwise a page with two wallets
// cross-delivers one wallet's events to the other wallet's provider.
describe('DappSyncProvider notification demux (announced-provider path)', () => {
    const flushMessageQueue = () => new Promise((r) => setTimeout(r, 100))

    const notification = (target?: string) => ({
        type: WalletEvent.SPLICE_WALLET_REQUEST,
        request: {
            jsonrpc: '2.0',
            method: 'txChanged',
            params: { status: 'executed', commandId: 'cmd-demux-1' },
        },
        ...(target !== undefined ? { target } : {}),
    })

    it('delivers notifications stamped with the provider announced routing key', async () => {
        const provider = new DappSyncProvider(
            new WindowTransport(window, { target: 'wallet-a' })
        )
        const received: unknown[] = []
        provider.on('txChanged', (payload: unknown) => received.push(payload))

        window.postMessage(notification('wallet-a'), '*')
        await flushMessageQueue()

        expect(received).toHaveLength(1)
    })

    it('does not cross-deliver notifications addressed to another wallet', async () => {
        const provider = new DappSyncProvider(
            new WindowTransport(window, { target: 'wallet-a' })
        )
        const received: unknown[] = []
        provider.on('txChanged', (payload: unknown) => received.push(payload))

        window.postMessage(notification('wallet-b'), '*')
        // An unstamped frame is also undeliverable to a targeted provider:
        // with multiple announced wallets there is no way to attribute it.
        window.postMessage(notification(), '*')
        await flushMessageQueue()

        expect(received).toHaveLength(0)
    })

    it('does not echo the dApp own id-carrying requests into the event path', async () => {
        const provider = new DappSyncProvider()
        const received: unknown[] = []
        provider.on('ping', (payload: unknown) => received.push(payload))

        // request() posts an id-carrying SPLICE_WALLET_REQUEST into the same
        // window the demux listens on; it must be treated as an outbound call,
        // not a wallet notification. No wallet responds in this harness, so
        // the returned promise intentionally never settles.
        void provider.request({ method: 'ping' } as never)
        await flushMessageQueue()

        expect(received).toHaveLength(0)
    })
})
