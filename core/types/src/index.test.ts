// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest'
import { WalletEvent, isSpliceMessage, isSpliceMessageEvent } from './index'

describe('isSpliceMessage', () => {
    it('accepts each splice message variant', () => {
        expect(
            isSpliceMessage({
                type: WalletEvent.SPLICE_WALLET_REQUEST,
                request: { jsonrpc: '2.0', method: 'connect', id: 1 },
            })
        ).toBe(true)
        expect(
            isSpliceMessage({
                type: WalletEvent.SPLICE_WALLET_RESPONSE,
                response: { jsonrpc: '2.0', id: 1, result: null },
            })
        ).toBe(true)
        expect(
            isSpliceMessage({ type: WalletEvent.SPLICE_WALLET_EXT_READY })
        ).toBe(true)
        expect(
            isSpliceMessage({ type: WalletEvent.SPLICE_WALLET_EXT_ACK })
        ).toBe(true)
        expect(
            isSpliceMessage({
                type: WalletEvent.SPLICE_WALLET_EXT_OPEN,
                url: 'https://wallet.example.com',
            })
        ).toBe(true)
        expect(
            isSpliceMessage({
                type: WalletEvent.SPLICE_WALLET_IDP_AUTH_SUCCESS,
                token: 'token',
                sessionId: 'session',
            })
        ).toBe(true)
    })

    it('rejects invalid values', () => {
        expect(isSpliceMessage(null)).toBe(false)
        expect(isSpliceMessage('message')).toBe(false)
        expect(
            isSpliceMessage({ type: WalletEvent.SPLICE_WALLET_REQUEST })
        ).toBe(false)
        expect(
            isSpliceMessage({
                type: WalletEvent.SPLICE_WALLET_EXT_OPEN,
                url: 'not-a-url',
            })
        ).toBe(false)
    })
})

describe('isSpliceMessageEvent', () => {
    it('accepts objects with valid splice message data', () => {
        const message = {
            type: WalletEvent.SPLICE_WALLET_EXT_READY,
        }
        expect(isSpliceMessageEvent({ data: message })).toBe(true)
    })

    it('rejects objects without valid splice message data', () => {
        expect(isSpliceMessageEvent(null)).toBe(false)
        expect(isSpliceMessageEvent({})).toBe(false)
        expect(isSpliceMessageEvent({ data: { type: 'unknown' } })).toBe(false)
        expect(
            isSpliceMessageEvent({
                data: { type: WalletEvent.SPLICE_WALLET_REQUEST },
            })
        ).toBe(false)
    })
})
