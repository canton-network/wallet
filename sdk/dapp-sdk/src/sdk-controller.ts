// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DappAsyncProvider } from '@canton-network/core-provider-dapp'
import buildController from './dapp-api/rpc-gen'
import type {
    ConnectResult,
    LedgerApiParams,
    MessageSignatureEvent,
    Network,
    PrepareExecuteAndWaitResult,
    PrepareExecuteParams,
    SignMessageParams,
    SignMessageResult,
    Wallet,
} from './dapp-api/rpc-gen/typings'
import {
    isCip103ErrorCode,
    JsonRpcError,
    rpcErrors,
} from '@canton-network/core-rpc-errors'
import { popup } from '@canton-network/core-wallet-ui-components'
import type * as dappAsyncAPI from '@canton-network/core-wallet-dapp-remote-rpc-client'

const withTimeout = (
    reject: (reason?: unknown) => void,
    details: string,
    timeoutMs: number = 5 * 60 * 1000 // default to 5 minutes
) =>
    setTimeout(() => {
        console.warn(`SDK: ${details}`)
        reject(rpcErrors.resourceUnavailable(details))
    }, timeoutMs)

// Keeps the wallet's CIP-103 error code, falling back to transactionRejected
// for wallets that don't report why it failed or send a code outside CIP-103.
// JsonRpcError also throws on a non-integer code, so the caller would never settle.
const toFailureError = (
    details: string,
    error: dappAsyncAPI.FailureError | undefined
) => {
    if (!error) {
        return rpcErrors.transactionRejected(`${details}.`)
    }
    const message = `${details}: ${error.message}`
    return isCip103ErrorCode(error.code)
        ? new JsonRpcError(error.code, message, error.data)
        : rpcErrors.transactionRejected(message)
}

export const dappSDKController = (provider: DappAsyncProvider) =>
    buildController({
        connect: async (): Promise<ConnectResult> => {
            const response = await provider.request({
                method: 'connect',
            })

            popup.open(response.userUrl ?? '')
            const promise = new Promise<ConnectResult>((resolve, reject) => {
                // 5 minutes timeout
                const timeout = withTimeout(
                    reject,
                    'Timeout waiting for connection',
                    5 * 60 * 1000
                )
                provider.on<dappAsyncAPI.StatusEvent>(
                    'statusChanged',
                    (event) => {
                        if (event.connection.isConnected) {
                            clearTimeout(timeout)
                            resolve(event.connection)
                        }
                    }
                )
            })

            return promise
        },
        disconnect: async () => {
            return await provider.request({
                method: 'disconnect',
            })
        },
        isConnected: async () => {
            return await provider.request({
                method: 'isConnected',
            })
        },
        ledgerApi: async (params: LedgerApiParams) =>
            provider.request({
                method: 'ledgerApi',
                params,
            }),
        prepareExecute: async (params: PrepareExecuteParams) => {
            const response = await provider.request({
                method: 'prepareExecute',
                params,
            })

            if (response.userUrl) popup.open(response.userUrl)

            return null
        },
        prepareExecuteAndWait: async (
            params: PrepareExecuteParams
        ): Promise<PrepareExecuteAndWaitResult> => {
            const commandId = params.commandId ?? crypto.randomUUID()
            const response = await provider.request({
                method: 'prepareExecute',
                params: {
                    ...params,
                    commandId,
                },
            })

            if (response.userUrl) popup.open(response.userUrl)

            const promise = new Promise<PrepareExecuteAndWaitResult>(
                (resolve, reject) => {
                    const timeout = withTimeout(
                        reject,
                        'Timed out waiting for transaction approval'
                    )

                    const listener = (event: dappAsyncAPI.TxChangedEvent) => {
                        if (event.commandId !== commandId) return
                        if (event.status === 'failed') {
                            provider.removeListener('txChanged', listener)
                            clearTimeout(timeout)
                            reject(
                                toFailureError(
                                    `Transaction with commandId ${event.commandId} failed to execute`,
                                    event.error
                                )
                            )
                        }
                        if (event.status === 'executed') {
                            provider.removeListener('txChanged', listener)
                            clearTimeout(timeout)
                            resolve({
                                tx: event,
                            })
                        }
                    }

                    provider.on<dappAsyncAPI.TxChangedEvent>(
                        'txChanged',
                        listener
                    )
                }
            )

            return promise
        },
        status: async () => {
            return provider.request({ method: 'status' })
        },
        listAccounts: async () =>
            provider.request({
                method: 'listAccounts',
            }),
        accountsChanged: async () => {
            throw new Error('Only for events.')
        },
        txChanged: async () => {
            throw new Error('Only for events.')
        },
        getActiveNetwork: async (): Promise<Network> =>
            provider.request({
                method: 'getActiveNetwork',
            }),
        signMessage: async (
            params: SignMessageParams
        ): Promise<SignMessageResult> => {
            const response = await provider.request({
                method: 'signMessage',
                params,
            })
            const { userUrl } = response
            popup.open(userUrl)

            const messageId = new URL(userUrl).searchParams.get('messageId')
            if (!messageId) {
                throw new Error(
                    'Remote signMessage userUrl is missing messageId query param'
                )
            }

            return await new Promise<SignMessageResult>((resolve, reject) => {
                const timeout = withTimeout(
                    reject,
                    'Timed out waiting for message signing approval'
                )

                const listener = (
                    event: dappAsyncAPI.MessageSignatureEvent
                ) => {
                    if (event.messageId !== messageId) return

                    // pending is informational; continue waiting
                    if (event.status === 'pending') return

                    provider.removeListener('messageSignature', listener)
                    clearTimeout(timeout)

                    if (event.status === 'failed') {
                        reject(
                            toFailureError(
                                `Message signing failed for messageId ${event.messageId}`,
                                event.error
                            )
                        )
                        return
                    }

                    resolve({ signature: event.signature })
                }

                provider.on<dappAsyncAPI.MessageSignatureEvent>(
                    'messageSignature',
                    listener
                )
            })
        },
        getPrimaryAccount: async (): Promise<Wallet> =>
            provider.request({
                method: 'getPrimaryAccount',
            }),
        messageSignature: function (): Promise<MessageSignatureEvent> {
            throw new Error('Only for events.')
        },
    })
