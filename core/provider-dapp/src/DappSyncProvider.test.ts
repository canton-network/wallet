// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest'
import { RpcTransport } from '@canton-network/core-rpc-transport'
import { WalletEvent } from '@canton-network/core-types'
import { DappSyncProvider } from './DappSyncProvider'

describe('DappSyncProvider', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('can send a request and receive a response', async () => {
        const submit = vi.fn().mockResolvedValue({
            result: 'response-value',
        })
        const transport: RpcTransport = { submit }
        const provider = new DappSyncProvider(transport)

        const response = await provider.request({
            method: 'prepareExecute',
            params: { commands: [] },
        })

        expect(submit).toHaveBeenCalledTimes(1)
        expect(submit).toHaveBeenCalledWith({
            method: 'prepareExecute',
            params: { commands: [] },
        })
        expect(response).toBe('response-value')
    })

    it('uses WindowTransport when no transport is provided', async () => {
        const postMessageSpy = vi
            .spyOn(window, 'postMessage')
            .mockImplementation((message: unknown) => {
                const requestId = (
                    message as { request?: { id?: string | number | null } }
                ).request?.id

                setTimeout(() => {
                    window.dispatchEvent(
                        new MessageEvent('message', {
                            data: {
                                type: WalletEvent.SPLICE_WALLET_RESPONSE,
                                response: {
                                    jsonrpc: '2.0',
                                    id: requestId,
                                    result: 'default-transport-response',
                                },
                            },
                        })
                    )
                }, 0)
            })

        const provider = new DappSyncProvider()

        const response = await provider.request({
            method: 'prepareExecute',
            params: { commands: [] },
        })

        expect(postMessageSpy).toHaveBeenCalledTimes(1)
        expect(response).toBe('default-transport-response')
    })
})
