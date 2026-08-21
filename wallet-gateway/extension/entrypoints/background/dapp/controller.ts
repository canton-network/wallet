// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Disabled unused vars rule to allow for future implementations
/* eslint-disable @typescript-eslint/no-unused-vars */

import buildController from './rpc-gen'
import type {
    LedgerApiParams,
    Network,
    PrepareExecuteParams,
    SignMessageParams,
    SignMessageResult,
    Wallet,
} from './rpc-gen/typings.js'

import { type Store } from '@canton-network/core-wallet-store'

export const dappController = (store: Store) =>
    buildController({
        connect: async () => ({
            isConnected: true,
            reason: 'OK',
            isNetworkConnected: true,
            networkReason: 'OK',
        }),
        disconnect: async () => Promise.resolve(null),
        isConnected: async () => {
            throw new Error('Function isConnected not implemented.')
        },
        ledgerApi: async (params: LedgerApiParams) =>
            Promise.resolve({ response: 'default-response' }),
        prepareExecute: async (params: PrepareExecuteParams) => {
            throw new Error('Function prepareExecute not implemented.')
        },
        prepareExecuteAndWait: async (params: PrepareExecuteParams) => {
            throw new Error('Function prepareExecuteAndWait not implemented.')
        },
        status: async () => ({
            provider: {
                id: 'browser:ext:canton-wallet',
            },
            connection: {
                isConnected: true,
                reason: 'OK',
                isNetworkConnected: true,
                networkReason: 'OK',
            },
        }),
        listAccounts: async () => {
            const wallets = await store!.getWallets()
            return wallets
        },
        accountsChanged: async () => {
            throw new Error('Only for events.')
        },
        txChanged: async () => {
            throw new Error('Only for events.')
        },
        getActiveNetwork: function (): Promise<Network> {
            throw new Error('Function getActiveNetwork not implemented.')
        },
        signMessage: function (
            params: SignMessageParams
        ): Promise<SignMessageResult> {
            throw new Error('Function signMessage not implemented.')
        },
        getPrimaryAccount: async function (): Promise<Wallet> {
            throw new Error('Function getPrimaryAccount not implemented.')
        },
        messageSignature: async () => {
            throw new Error('Only for events.')
        },
    })
