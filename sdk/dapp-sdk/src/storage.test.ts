// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StatusEvent } from '@canton-network/core-wallet-dapp-rpc-client'
import {
    getKernelDiscovery,
    getKernelSession,
    removeKernelDiscovery,
    removeKernelSession,
    setKernelDiscovery,
    setKernelSession,
} from './storage'

const kernelSession = (): StatusEvent => ({
    provider: {
        id: 'remote-kernel',
        version: '1.0.0',
        providerType: 'remote',
        url: 'https://gateway.example.com/api',
        userUrl: 'https://gateway.example.com/user',
    },
    connection: {
        isConnected: true,
        isNetworkConnected: true,
        reason: 'OK',
        networkReason: 'OK',
        userUrl: 'https://gateway.example.com/user',
    },
    network: {
        networkId: 'test-network',
        ledgerApi: 'https://ledger.example.com',
        accessToken: 'test-access-token',
    },
    session: {
        accessToken: 'test-access-token',
        userId: 'test-user',
    },
})

describe('storage', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('kernel discovery', () => {
        it('round-trips remote discovery through localStorage', () => {
            setKernelDiscovery({
                walletType: 'remote',
                url: 'https://gateway.example.com',
            })

            expect(getKernelDiscovery()).toEqual({
                walletType: 'remote',
                url: 'https://gateway.example.com',
            })
        })

        it('round-trips extension discovery through localStorage', () => {
            setKernelDiscovery({
                walletType: 'extension',
                providerId: 'browser:ext:abc',
            })

            expect(getKernelDiscovery()).toEqual({
                walletType: 'extension',
                providerId: 'browser:ext:abc',
            })
        })

        it('returns undefined for invalid stored discovery', () => {
            const errorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            localStorage.setItem(
                'splice_wallet_kernel_discovery',
                JSON.stringify({ walletType: 'remote', url: 'not-a-url' })
            )

            expect(getKernelDiscovery()).toBeUndefined()
            expect(errorSpy).toHaveBeenCalled()
        })

        it('removes stored discovery', () => {
            setKernelDiscovery({
                walletType: 'remote',
                url: 'https://gateway.example.com',
            })
            removeKernelDiscovery()

            expect(getKernelDiscovery()).toBeUndefined()
        })
    })

    describe('kernel session', () => {
        it('round-trips session through localStorage', () => {
            const session = kernelSession()

            setKernelSession(session)
            expect(getKernelSession()).toEqual(session)
        })

        it('returns undefined for invalid stored session', () => {
            const errorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            localStorage.setItem('splice_wallet_kernel_session', '{not-json')

            expect(getKernelSession()).toBeUndefined()
            expect(errorSpy).toHaveBeenCalled()
        })

        it('removes stored session', () => {
            setKernelSession(kernelSession())
            removeKernelSession()

            expect(getKernelSession()).toBeUndefined()
        })
    })
})
