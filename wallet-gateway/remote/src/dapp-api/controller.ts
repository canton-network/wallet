// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    assertConnected,
    AuthContext,
    AuthTokenProvider,
} from '@canton-network/core-wallet-auth'
import buildController from './rpc-gen/index.js'
import {
    ConnectResult,
    LedgerApiParams,
    LedgerApiResult,
    MessageSignatureEvent,
    Network,
    PrepareExecuteParams,
    SignMessageParams,
    SignMessageResult,
    StatusEvent,
    Wallet,
} from './rpc-gen/typings.js'
import { Store, Transaction } from '@canton-network/core-wallet-store'
import {
    LedgerClient,
    GetEndpoint,
    PostEndpoint,
    PrepareSubmissionResponse,
} from '@canton-network/core-ledger-client'
import { v4 } from 'uuid'
import { NotificationService } from '../notification/NotificationService.js'
import { KernelInfo as KernelInfoConfig } from '../config/Config.js'
import { Logger } from 'pino'
import { networkStatus, ledgerPrepareParams, logDynamically } from '../utils.js'
import type { Network as StoreNetwork } from '@canton-network/core-wallet-store'
import { TransactionService } from '../ledger/transaction-service.js'

import { SigningDrivers } from '../signing/signing-drivers.js'
import { rpcErrors } from '@canton-network/core-rpc-errors'

export interface DappControllerDeps {
    signingDrivers: SigningDrivers
}

export const dappController = (
    kernelInfo: KernelInfoConfig,
    dappUrl: string,
    userUrl: string,
    store: Store,
    notificationService: NotificationService,
    _logger: Logger,
    origin: string | null,
    deps: DappControllerDeps,
    context?: AuthContext
) => {
    const logger = _logger.child({ component: 'dapp-controller' })

    function assertActAsPartiesBelongToUser(
        actAs: string[],
        wallets: Wallet[]
    ): void {
        for (const party of actAs) {
            if (wallets.find((w) => w.partyId === party) === undefined) {
                throw rpcErrors.invalidRequest(
                    `Acting party ${party} does not belong to user`
                )
            }
        }
    }

    return buildController({
        connect: async () => {
            if (!context || !(await store.getSession())) {
                return {
                    isConnected: false,
                    isNetworkConnected: false,
                    networkReason: 'Unauthenticated',
                    userUrl: `${userUrl}/login/`,
                } satisfies ConnectResult
            }

            // const session = await store.getSession()
            const network = await store.getCurrentNetwork()
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    context.accessToken,
                    logger
                ),
            })
            const status = await networkStatus(ledgerClient)
            const notifier = notificationService.getNotifier(context.userId)
            const provider = {
                id: kernelInfo.id,
                version: 'TODO',
                providerType: kernelInfo.clientType,
                url: dappUrl,
                userUrl: `${userUrl}/login/`,
            }
            const connection = {
                isConnected: true,
                reason: 'OK',
                isNetworkConnected: status.isConnected,
                networkReason: status.reason ? status.reason : 'OK',
                userUrl: `${userUrl}/login/`,
            }
            const statusEvent: StatusEvent = {
                provider,
                connection,
                network: {
                    networkId: network.id,
                    ledgerApi: network.ledgerApi.baseUrl,
                    accessToken: context.accessToken,
                },
                session: {
                    accessToken: context.accessToken,
                    userId: context.userId,
                },
            }
            notifier.emit('statusChanged', statusEvent)
            notifier.emit('connected', statusEvent)
            return connection
        },
        disconnect: async () => {
            if (!context) {
                return null
            } else {
                const notifier = notificationService.getNotifier(context.userId)
                await store.removeSession()
                notifier.emit('statusChanged', {
                    provider: {
                        id: kernelInfo.id,
                        providerType: kernelInfo.clientType,
                        url: dappUrl,
                        userUrl: `${userUrl}/login/`,
                    },
                    connection: {
                        isConnected: false,
                        reason: 'disconnect',
                        isNetworkConnected: false,
                        networkReason: 'disconnect',
                    },
                } as StatusEvent)
            }

            return null
        },
        isConnected: async () => {
            if (!context || !(await store.getSession())) {
                return {
                    isConnected: false,
                    isNetworkConnected: false,
                    networkReason: 'Unauthenticated',
                    userUrl: `${userUrl}/login/`,
                } satisfies ConnectResult
            }

            const network = await store.getCurrentNetwork()
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    context.accessToken,
                    logger
                ),
            })
            const status = await networkStatus(ledgerClient)
            return {
                isConnected: true,
                reason: 'OK',
                isNetworkConnected: status.isConnected,
                networkReason: status.reason ? status.reason : 'OK',
                userUrl: `${userUrl}/login/`,
            } satisfies ConnectResult
        },
        ledgerApi: async (params: LedgerApiParams) => {
            const network = await store.getCurrentNetwork()
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    assertConnected(context).accessToken,
                    logger
                ),
            })

            let result: LedgerApiResult

            switch (params.requestMethod) {
                case 'get':
                    result = await ledgerClient.getWithRetry(
                        params.resource as GetEndpoint,
                        undefined,
                        { path: params.path ?? {}, query: params.query ?? {} }
                    )
                    break
                case 'post':
                    result = await ledgerClient.postWithRetry(
                        params.resource as PostEndpoint,
                        params.body as never,
                        undefined,
                        { query: params.query ?? {}, path: params.path ?? {} }
                    )
                    break
                default:
                    throw new Error(
                        `Unsupported request method: ${params.requestMethod}`
                    )
            }
            return result
        },
        prepareExecute: async (params: PrepareExecuteParams) => {
            const primaryWallet = await store.getPrimaryWallet()
            const wallets = await store.getWallets()
            const network = await store.getCurrentNetwork()

            if (context === undefined) {
                throw new Error('Unauthenticated context')
            }

            // determine user ID
            let userId = context.userId
            const accessTokenProvider: AuthTokenProvider =
                AuthTokenProvider.fromToken(context.accessToken, logger)

            if (context?.isApiKey) {
                logger.info(
                    'Authenticated with API Key, fetching m2m token for ledger access'
                )
                userId = context.ledgerUserId
            }

            // determine party ID
            let actAs = params.actAs || []
            if (actAs.length === 0) {
                if (!primaryWallet) {
                    throw new Error(
                        'No primary wallet found. Create or sync a wallet and set it as primary before prepareExecute.'
                    )
                }
                actAs = [primaryWallet.partyId]
            }

            assertActAsPartiesBelongToUser(actAs, wallets)

            // determine wallet
            const wallet = wallets.find((w) => w.partyId === actAs[0])
            if (wallet === undefined) {
                throw new Error(
                    'No wallet found for the first acting party. Create or sync a wallet and set it as primary before prepareExecute.'
                )
            }

            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider,
            })

            const notifier = notificationService.getNotifier(userId)

            const commandId = params.commandId || v4()
            const transactionId = v4()

            notifier.emit('txChanged', { status: 'pending', commandId })

            const synchronizerId =
                network.synchronizerId ??
                (await ledgerClient.getSynchronizerId())

            logDynamically(
                logger,
                'prepareExecute: Submitting request to ledger',
                {
                    info: { transactionId },
                    debug: { commandId, userId, actAs, params },
                }
            )

            const prepared = await prepareSubmission(
                userId,
                actAs,
                synchronizerId,
                params,
                ledgerClient
            )

            logDynamically(
                logger,
                'prepareExecute: Received response from ledger',
                {
                    info: { transactionId },
                    debug: {
                        commandId,
                        userId,
                        actAs,
                        prepared,
                    },
                }
            )

            const transaction: Transaction = {
                id: transactionId,
                commandId,
                status: 'pending',
                preparedTransaction: prepared.preparedTransaction,
                preparedTransactionHash: prepared.preparedTransactionHash,
                payload: params,
                origin: origin || null,
                createdAt: new Date(),
            }

            logger.info(
                {
                    actAs,
                    readAs: params.readAs || [],
                    userId,
                    commandId,
                    commands: params.commands?.[0],
                    confirmationRequestTrafficCostEstimation:
                        prepared.costEstimation
                            ?.confirmationRequestTrafficCostEstimation,
                },
                'prepared transaction traffic estimation'
            )

            await store.setTransaction(transaction)

            const approveUrl = `${userUrl}/approve/index.html?transactionId=${transactionId}&commandId=${commandId}&closeafteraction`

            if (context.isApiKey) {
                logger.info(
                    {
                        userId,
                        commandId,
                        transactionId,
                        signingProviderId: wallet.signingProviderId,
                    },
                    'Service account straight-through prepare/sign/execute'
                )
                const transactionService = new TransactionService(
                    store,
                    logger,
                    deps!.signingDrivers,
                    notifier
                )
                try {
                    await transactionService.signAndExecute(
                        context,
                        network,
                        wallet,
                        transaction
                    )
                } catch (error) {
                    logger.error(
                        {
                            err: error,
                            userId,
                            commandId,
                            transactionId,
                            actAs,
                            signingProviderId: wallet.signingProviderId,
                        },
                        'Service account sign/execute failed after prepare'
                    )
                    throw error
                }
            }

            return {
                // closeafteraction query param flag makes approving or deleting tx close the popup
                userUrl: approveUrl,
            }
        },
        status: async () => {
            const provider = {
                id: kernelInfo.id,
                version: 'TODO',
                providerType: kernelInfo.clientType,
                url: dappUrl,
                userUrl: `${userUrl}/login/`,
            }
            if (!context || !(await store.getSession())) {
                return {
                    provider: provider,
                    connection: {
                        isConnected: false,
                        reason: 'Unauthenticated',
                        isNetworkConnected: false,
                        networkReason: 'Unauthenticated',
                    },
                }
            }

            const session = await store.getSession()
            const network = await store.getCurrentNetwork()
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    context.accessToken,
                    logger
                ),
            })
            const status = await networkStatus(ledgerClient)
            return {
                provider: provider,
                connection: {
                    isConnected: true,
                    reason: 'OK',
                    isNetworkConnected: status.isConnected,
                    networkReason: status.reason ? status.reason : 'OK',
                },
                network: {
                    networkId: network.id,
                    ledgerApi: network.ledgerApi.baseUrl,
                    accessToken: context.accessToken,
                },
                session: {
                    id: session?.id,
                    accessToken: context.accessToken,
                    userId: context.userId,
                },
                userUrl: `${userUrl}/login/`,
            }
        },
        listAccounts: async () => {
            return await store.getWallets()
        },
        getActiveNetwork: async (): Promise<Network> => {
            const network: StoreNetwork = await store.getCurrentNetwork()
            return {
                networkId: network.id,
                ledgerApi: network.ledgerApi.baseUrl,
                ...(context?.accessToken
                    ? { accessToken: context.accessToken }
                    : {}),
            }
        },
        signMessage: async (
            params: SignMessageParams
        ): Promise<SignMessageResult> => {
            if (!params?.message) throw new Error('Message is required')

            const wallet = await store.getPrimaryWallet()

            if (context === undefined) {
                throw new Error('Unauthenticated context')
            }

            if (wallet === undefined) {
                throw new Error('No primary wallet found')
            }

            const notifier = notificationService.getNotifier(context.userId)
            const messageId = v4()
            await store.setMessageRaw({
                id: messageId,
                status: 'pending',
                userId: context.userId,
                partyId: wallet.partyId,
                publicKey: wallet.publicKey,
                message: params.message,
                origin: origin || null,
                createdAt: new Date(),
            })

            notifier.emit('messageSignature', {
                status: 'pending',
                messageId,
            } satisfies MessageSignatureEvent)

            return {
                messageId,
                userUrl: `${userUrl}/sign-message/index.html?messageId=${messageId}&closeafteraction`,
            }
        },
        getPrimaryAccount: async function (): Promise<Wallet> {
            const wallet = await store.getPrimaryWallet()
            if (!wallet) {
                throw new Error('No primary wallet found')
            }
            return wallet
        },
        connected: async () => {
            throw new Error('Only for events.')
        },
        onStatusChanged: async () => {
            throw new Error('Only for events.')
        },
        accountsChanged: async () => {
            throw new Error('Only for events.')
        },
        txChanged: async () => {
            throw new Error('Only for events.')
        },
        messageSignature: function (): Promise<MessageSignatureEvent> {
            throw new Error('Only for events.')
        },
    })
}

async function prepareSubmission(
    userId: string,
    partyIds: string[],
    synchronizerId: string,
    params: PrepareExecuteParams,
    ledgerClient: LedgerClient
): Promise<PrepareSubmissionResponse> {
    return await ledgerClient.postWithRetry(
        '/v2/interactive-submission/prepare',
        ledgerPrepareParams(userId, partyIds, synchronizerId, params)
    )
}
