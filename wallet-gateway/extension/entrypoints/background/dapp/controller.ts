// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Disabled unused vars rule to allow for future implementations
/* eslint-disable @typescript-eslint/no-unused-vars */

import { LedgerClient } from '@canton-network/core-ledger-client'
import { AuthService } from '../auth-service.js'
import buildController from './rpc-gen'
import type {
    ConnectResult,
    LedgerApiParams,
    Network,
    PrepareExecuteParams,
    Provider,
    SignMessageParams,
    SignMessageResult,
    StatusEvent,
    Wallet,
} from './rpc-gen/typings.js'

import type { Store } from '@canton-network/core-wallet-store'
import { AuthTokenProvider } from '@canton-network/core-wallet-auth'
import { networkStatus } from '@/utils/legacy-backend/utils.js'

export const dappController = (getStore: () => Promise<Store>) =>
    buildController({
        connect: async () => {
            logger.info('Dapp connect status: connecting')

            const context = await AuthService.loadAuthContext()
            const store = await getStore()

            const session =
                context && (await store.getSession(context.accessToken))

            if (!context || !session) {
                return {
                    isConnected: false,
                    isNetworkConnected: false,
                    networkReason: 'Unauthenticated',
                    // userUrl: `${userUrl}/login/`,
                } satisfies ConnectResult
            }

            const network = await store.getCurrentNetwork()
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger: pinoLogger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    context.accessToken,
                    pinoLogger
                ),
            })

            const status = await networkStatus(ledgerClient)

            logger.info('Dapp connect status: {*}', { status })
            // NOTE: no notifier yet in extension
            // const notifier = notificationService.getNotifier(session.id)
            const provider: Provider = {
                id: browser.runtime.id,
                version: 'TODO',
                providerType: 'browser',
                url: '...',
                // userUrl: `${userUrl}/login/`,
            }
            const connection = {
                isConnected: true,
                reason: 'OK',
                isNetworkConnected: status.isConnected,
                networkReason: status.reason ? status.reason : 'OK',
                // userUrl: `${userUrl}/login/`,
            }
            // const statusEvent: StatusEvent = {
            //     provider,
            //     connection,
            //     network: {
            //         networkId: network.id,
            //         ledgerApi: network.ledgerApi.baseUrl,
            //         accessToken: context.accessToken,
            //     },
            //     session: {
            //         accessToken: context.accessToken,
            //         userId: context.userId,
            //     },
            // }
            // notifier.emit('statusChanged', statusEvent)
            // notifier.emit('connected', statusEvent)
            return connection
        },
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
            const store = await getStore()
            return await store.getWallets()
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
