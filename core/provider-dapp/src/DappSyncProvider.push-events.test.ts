// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { WalletEvent } from '@canton-network/core-types'
import { DappSyncProvider } from './DappSyncProvider'

// Regression coverage for https://github.com/canton-network/wallet/issues/1815.
//
// The CIP-103 Provider API requires wallets to deliver txChanged /
// accountsChanged / statusChanged / connected through
// provider.on(event, listener). On the sync (postMessage) path the wire
// shape for a wallet-pushed event is a JSON-RPC 2.0 notification — the
// existing SPLICE_WALLET_REQUEST envelope with no `id`, method = event
// name. WindowTransport demuxes those frames on an always-on listener and
// DappSyncProvider bridges them to AbstractProvider.emit.
//
// Targeted (announced-provider) delivery is covered in
// DappSyncProvider.notification-demux.test.ts; this file pins the envelope
// semantics themselves.
describe('DappSyncProvider push events (CIP-103 Provider API)', () => {
    const flushMessageQueue = () => new Promise((r) => setTimeout(r, 100))

    // The canonical envelope: id-less request frame, method = event name.
    // Reuses upstream's own wire vocabulary instead of introducing a new
    // message type, per the JSON-RPC 2.0 notification definition (§4.1).
    it('delivers events shaped as JSON-RPC notifications (id-less request envelope)', async () => {
        const provider = new DappSyncProvider()
        const received: unknown[] = []
        provider.on('txChanged', (payload: unknown) => received.push(payload))

        window.postMessage(
            {
                type: WalletEvent.SPLICE_WALLET_REQUEST,
                request: {
                    jsonrpc: '2.0',
                    method: 'txChanged',
                    params: {
                        status: 'executed',
                        commandId: 'cmd-push-1',
                        updateId: 'update-push-1',
                    },
                },
            },
            '*'
        )
        await flushMessageQueue()

        expect(received).toHaveLength(1)
    })

    // The demux must not become a sink for arbitrary window traffic: only
    // the canonical notification shape is delivered. A frame in any other
    // envelope (e.g. a wallet-invented event message type) is ignored, so
    // the provider's event surface stays bound to the specified wire shape.
    it('does not deliver frames in non-canonical envelopes', async () => {
        const provider = new DappSyncProvider()
        const received: unknown[] = []
        provider.on('txChanged', (payload: unknown) => received.push(payload))

        window.postMessage(
            {
                type: 'WALLET_EVENT',
                event: 'txChanged',
                payload: { status: 'executed', commandId: 'cmd-push-2' },
            },
            '*'
        )
        await flushMessageQueue()

        expect(received).toHaveLength(0)
    })
})
