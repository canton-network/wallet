// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Disabled unused vars rule to allow for future implementations
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LedgerClient } from '@canton-network/core-ledger-client'
import buildController from './rpc-gen/index.js'
import {
    AddNetworkParams,
    RemoveNetworkParams,
    ExecuteParams,
    SignParams,
    SignMessageParams,
    SignMessageResult,
    GetMessageToSignParams,
    GetMessageToSignResult,
    ListMessagesToSignResult,
    DeleteMessageToSignParams,
    AddSessionParams,
    AddSessionResult,
    ListSessionsResult,
    SetPrimaryWalletParams,
    SyncWalletsResult,
    IsWalletSyncNeededResult,
    AddIdpParams,
    RemoveIdpParams,
    CreateWalletParams,
    AllocatePartyForWalletParams,
    GetTransactionResult,
    GetTransactionParams,
    DeleteTransactionParams,
    Null,
    ListTransactionsResult,
    GetUserResult,
    GetNetworkParams,
    GetNetworkResult,
    SelfSignedAccessTokenParams,
    SelfSignedAccessTokenResult,
    Network as ApiNetwork,
    PublicNetwork,
    GenerateApiKeyParams,
    GeneratedApiKey,
    ListApiKeysResult,
    RemoveApiKeyParams,
    ListSigningProviderVaultsResult,
    ListSigningProviderVaultsParams,
} from './rpc-gen/typings.js'
import { Store, Network } from '@canton-network/core-wallet-store'
import { Logger } from 'pino'
import { NotificationService } from '../notification/NotificationService.js'
import {
    assertConnected,
    AuthContext,
    authSchema,
    Auth,
    AuthTokenProvider,
    idpSchema,
} from '@canton-network/core-wallet-auth'
import { KernelInfo } from '../config/Config.js'
import { isRpcError, SigningProvider } from '@canton-network/core-signing-lib'
import type { SigningDrivers } from '../signing/signing-drivers.js'
import { PartyAllocationService } from '../ledger/party-allocation-service.js'
import { WalletAllocationService } from '../ledger/wallet-allocation/wallet-allocation-service.js'
import { WalletSyncService } from '../ledger/wallet-sync-service.js'
import { logDynamically, networkStatus } from '../utils.js'
import { v4 } from 'uuid'
import { TransactionService } from '../ledger/transaction-service.js'
import { StatusEvent } from '../dapp-api/rpc-gen/typings.js'
import type { MessageSignatureEvent } from '../dapp-api/rpc-gen/typings.js'
import { rpcErrors } from '@canton-network/core-rpc-errors'
import crypto from 'crypto'

export const userController = (
    kernelInfo: KernelInfo,
    userUrl: string,
    store: Store,
    notificationService: NotificationService,
    authContext: AuthContext | undefined,
    drivers: SigningDrivers,
    _logger: Logger,
    adminUserId?: string
) => {
    const logger = _logger.child({ component: 'user-controller' })
    const provider = {
        id: kernelInfo.id,
        version: 'TODO',
        providerType: kernelInfo.clientType,
        userUrl: `${userUrl}/login/`,
    }

    function assertAdmin(): void {
        const userId = assertConnected(authContext).userId
        if (!adminUserId || userId !== adminUserId) {
            throw new Error(
                'Unauthorized: only the admin user can perform this operation'
            )
        }
    }

    return buildController({
        getUser: async (): Promise<GetUserResult> => {
            const userId = assertConnected(authContext).userId
            return {
                userId,
                isAdmin: !!adminUserId && userId === adminUserId,
            }
        },
        addNetwork: async (params: AddNetworkParams) => {
            assertAdmin()
            const { network } = params

            const ledgerApi = {
                baseUrl: network.ledgerApi ?? '',
            }

            const auth = authSchema.parse(network.auth)
            const adminAuth = network.adminAuth
                ? authSchema.parse(network.adminAuth)
                : undefined

            const newNetwork: Network = {
                name: network.name,
                id: network.id,
                description: network.description,
                synchronizerId: network.synchronizerId,
                identityProviderId: network.identityProviderId,
                auth,
                adminAuth,
                ledgerApi,
            }

            // TODO: Add an explicit updateNetwork method to the User API spec and controller
            const existingNetworks = await store.listNetworks()
            if (existingNetworks.find((n) => n.id === newNetwork.id)) {
                logger.info(`Updating network ${newNetwork.id}`)
                await store.updateNetwork(newNetwork)
            } else {
                logger.info(`Adding network ${newNetwork.id}`)
                await store.addNetwork(newNetwork)
            }

            return null
        },
        removeNetwork: async (params: RemoveNetworkParams) => {
            assertAdmin()
            await store.removeNetwork(params.networkName)
            return null
        },
        listNetworks: async () => {
            const networks = await store.listNetworks()
            return {
                networks: networks.map(toPublicNetwork),
            }
        },
        getNetwork: async (
            params: GetNetworkParams
        ): Promise<GetNetworkResult> => {
            assertAdmin()
            const network = await store.getNetwork(params.networkId)
            return { network: toNetworkDto(network) }
        },
        selfSignedAccessToken: async (
            params: SelfSignedAccessTokenParams
        ): Promise<SelfSignedAccessTokenResult> => {
            const network = (await store.listNetworks()).find(
                (n) => n.id === params.networkId
            )
            if (!network) {
                throw new Error(`Network "${params.networkId}" not found`)
            }
            const auth = network.auth

            if (auth.method !== 'self_signed') {
                throw new Error(
                    'Network does not use self_signed authentication'
                )
            }

            const idp = (await store.listIdps()).find(
                (idp) => idp.id === network.identityProviderId
            )
            if (!idp) {
                throw new Error(
                    `Identity provider "${network.identityProviderId}" not found`
                )
            }
            if (idp.type !== 'self_signed') {
                throw new Error(
                    'Identity provider is not configured for self_signed authentication'
                )
            }

            const accessToken = await new AuthTokenProvider(
                {
                    method: 'self_signed',
                    issuer: idp.issuer,
                    credentials: {
                        clientId: params.clientId,
                        clientSecret: auth.clientSecret,
                        scope: auth.scope,
                        audience: auth.audience,
                    },
                },
                logger
            ).getAccessToken()

            return { accessToken }
        },
        addIdp: async (params: AddIdpParams) => {
            assertAdmin()
            const validatedIdp = idpSchema.parse(params.idp)

            // TODO: Add an explicit updateIdp method to the User API spec and controller
            const existingIdps = await store.listIdps()
            if (existingIdps.find((n) => n.id === validatedIdp.id)) {
                logger.info(`Updating IDP ${validatedIdp.id}`)
                await store.updateIdp(validatedIdp)
            } else {
                logger.info(`Adding IDP ${validatedIdp.id}`)
                await store.addIdp(validatedIdp)
            }

            return null
        },
        removeIdp: async (params: RemoveIdpParams) => {
            assertAdmin()
            logger.info(`Removing IDP ${params.identityProviderId}`)
            await store.removeIdp(params.identityProviderId)
            return null
        },
        listIdps: async () => ({ idps: await store.listIdps() }),
        createWallet: async (params: CreateWalletParams) => {
            const { signingProviderId, primary, partyHint } = params

            const connectedContext = assertConnected(authContext)
            const network = await store.getCurrentNetwork()
            if (network === undefined) {
                throw new Error('No network session found')
            }
            const idp = await store.getIdp(network.identityProviderId)
            if (!network.adminAuth) {
                throw new Error('No admin auth configured')
            }

            const notifier = notificationService.getNotifier(
                connectedContext.userId
            )

            const adminTokenProvider = AuthTokenProvider.fromGatewayConfig(
                idp,
                network.adminAuth,
                logger
            )

            const partyAllocator = new PartyAllocationService({
                synchronizerId: network.synchronizerId,
                accessTokenProvider: adminTokenProvider,
                httpLedgerUrl: network.ledgerApi.baseUrl,
                logger,
            })
            const walletAllocationService = new WalletAllocationService(
                store,
                logger,
                partyAllocator,
                drivers
            )

            if (!drivers[signingProviderId as SigningProvider]) {
                throw new Error(
                    `Signing provider ${signingProviderId} not supported`
                )
            }

            const wallet = await walletAllocationService.createWallet(
                connectedContext,
                partyHint,
                primary ?? false,
                signingProviderId as SigningProvider,
                params.vaultName
            )

            // Sync wallets (TODO: separate rights sync from wallet sync as we only need rights sync here)
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    authContext!.accessToken,
                    logger
                ),
            })
            const service = new WalletSyncService(
                store,
                ledgerClient,
                authContext!,
                logger,
                drivers,
                partyAllocator
            )
            await service.syncWallets()

            // Notify about the change and return the new wallet
            const wallets = await store.getWallets()
            notifier?.emit('accountsChanged', wallets)

            return { wallet }
        },
        allocatePartyForWallet: async (
            params: AllocatePartyForWalletParams
        ) => {
            const connectedContext = assertConnected(authContext)
            const userId = connectedContext.userId

            const network = await store.getCurrentNetwork()
            if (!network) {
                throw new Error('No network session found')
            }
            if (!network.adminAuth) {
                throw new Error('No admin auth configured')
            }

            const allWallets = await store.getWallets()
            const existingWallet = allWallets.find(
                (w) =>
                    w.partyId === params.partyId && w.networkId === network.id
            )
            if (!existingWallet) {
                throw new Error(`Wallet not found for party ${params.partyId}`)
            }

            const idp = await store.getIdp(network.identityProviderId)
            const accessTokenProvider = AuthTokenProvider.fromGatewayConfig(
                idp,
                network.adminAuth,
                logger
            )
            const partyAllocator = new PartyAllocationService({
                synchronizerId: network.synchronizerId,
                accessTokenProvider,
                httpLedgerUrl: network.ledgerApi.baseUrl,
                logger,
            })
            const walletAllocationService = new WalletAllocationService(
                store,
                logger,
                partyAllocator,
                drivers
            )

            const signingProviderId =
                existingWallet.signingProviderId as SigningProvider
            if (!drivers[signingProviderId]) {
                throw new Error(
                    `Signing provider ${signingProviderId} not supported`
                )
            }

            await walletAllocationService.allocateParty(
                connectedContext,
                existingWallet,
                signingProviderId
            )

            // Sync wallets (TODO: separate rights sync from wallet sync as we only need rights sync here)
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    authContext!.accessToken,
                    logger
                ),
            })
            const service = new WalletSyncService(
                store,
                ledgerClient,
                authContext!,
                logger,
                drivers,
                partyAllocator
            )
            await service.syncWallets()

            // Notify about the change and return the updated wallet
            const wallets = await store.getWallets()
            const wallet = wallets.find(
                (w) =>
                    w.partyId === existingWallet.partyId &&
                    w.networkId === network.id
            )!

            const notifier = notificationService.getNotifier(userId)
            notifier?.emit('accountsChanged', wallets)
            return { wallet }
        },
        setPrimaryWallet: async (params: SetPrimaryWalletParams) => {
            await store.setPrimaryWallet(params.partyId)
            const notifier = authContext?.userId
                ? notificationService.getNotifier(authContext.userId)
                : undefined

            const wallets = await store.getWallets()
            notifier?.emit('accountsChanged', wallets)
            return null
        },
        removeWallet: async (params: { partyId: string }) => {
            throw rpcErrors.methodNotSupported()
        },
        listWallets: async (params: {
            filter?: { signingProviderIds?: string[] }
        }) => {
            return await store.getWallets(params.filter)
        },
        sign: async (signParams: SignParams) => {
            const network = await store.getCurrentNetwork()
            if (network === undefined) {
                throw new Error('No network session found')
            }

            const wallets = await store.getWallets()
            const wallet = wallets.find((w) => w.partyId === signParams.partyId)

            if (wallet === undefined) {
                throw new Error('No primary wallet found')
            }

            const connectedContext = assertConnected(authContext)
            const userId = connectedContext.userId
            const notifier = notificationService.getNotifier(userId)

            const transactionService = new TransactionService(
                store,
                logger,
                drivers,
                notifier
            )

            logDynamically(logger, 'signing transaction with params', {
                info: { transactionId: signParams.transactionId },
                debug: { signParams, wallet, connectedContext },
            })

            const response = await transactionService.sign(
                connectedContext,
                wallet,
                signParams
            )

            logDynamically(logger, 'transaction signed with response', {
                info: { transactionId: signParams.transactionId },
                debug: { response },
            })

            return response
        },
        signMessage: async (
            params: SignMessageParams
        ): Promise<SignMessageResult> => {
            const pending = await store.getMessageRaw(params.messageId)
            if (!pending) {
                throw new Error(
                    `Message signing request not found with id: ${params.messageId}`
                )
            }
            if (pending.status !== 'pending') {
                throw new Error(
                    `Cannot sign message with status '${pending.status}'. Only pending messages can be signed.`
                )
            }

            const userId = assertConnected(authContext).userId
            if (pending.userId !== userId) {
                throw new Error(
                    `Message signing request ${pending.id} is not owned by user ${userId}`
                )
            }

            const notifier = notificationService.getNotifier(userId)

            const emitFailedAndPersist = async (
                details: string
            ): Promise<never> => {
                // Best-effort: make sure listeners see a terminal state.
                try {
                    await store.setMessageRawStatus(pending.id, 'failed')
                } catch {
                    // ignore (e.g. record removed concurrently)
                }
                notifier.emit('messageSignature', {
                    status: 'failed',
                    messageId: pending.id,
                } satisfies MessageSignatureEvent)
                // Preserve the original error message for the caller/UI.
                throw new Error(details)
            }

            const wallet = (await store.getWallets()).find(
                (w) => w.partyId === pending.partyId
            )
            if (!wallet) {
                return await emitFailedAndPersist(
                    `No wallet found for partyId ${pending.partyId} (from message request ${pending.id})`
                )
            }
            if (wallet.publicKey !== pending.publicKey) {
                return await emitFailedAndPersist(
                    `Wallet public key changed for partyId ${pending.partyId}; refusing to sign message request ${pending.id}`
                )
            }

            // TODO: support other signing providers
            if (wallet.signingProviderId !== SigningProvider.WALLET_KERNEL) {
                return await emitFailedAndPersist(
                    `signMessage is only supported for ${SigningProvider.WALLET_KERNEL} wallets, got ${wallet.signingProviderId}`
                )
            }

            const driver =
                drivers[SigningProvider.WALLET_KERNEL]?.controller(userId)
            if (!driver) {
                return await emitFailedAndPersist(
                    'Wallet Kernel signing driver not available'
                )
            }

            const result = await driver.signMessage({
                message: pending.message,
                keyIdentifier: { publicKey: wallet.publicKey },
            })

            if (isRpcError(result)) {
                await store.setMessageRawStatus(pending.id, 'failed')
                notifier.emit('messageSignature', {
                    status: 'failed',
                    messageId: pending.id,
                } satisfies MessageSignatureEvent)
                throw new Error(result.error_description)
            }

            if (!result?.signature) {
                await store.setMessageRawStatus(pending.id, 'failed')
                notifier.emit('messageSignature', {
                    status: 'failed',
                    messageId: pending.id,
                } satisfies MessageSignatureEvent)
                throw new Error(`signMessage failed`)
            }

            await store.setMessageRawStatus(pending.id, 'signed', {
                signedAt: new Date(),
                signature: result.signature,
            })

            notifier.emit('messageSignature', {
                status: 'signed',
                messageId: pending.id,
                signature: result.signature,
            } satisfies MessageSignatureEvent)

            return {
                signature: result.signature,
                publicKey: wallet.publicKey,
            }
        },
        getMessageToSign: async (
            params: GetMessageToSignParams
        ): Promise<GetMessageToSignResult> => {
            const message = await store.getMessageRaw(params.messageId)
            if (!message) {
                throw new Error(
                    `Message signing request not found with id: ${params.messageId}`
                )
            }
            return {
                message: {
                    id: message.id,
                    status: message.status,
                    partyId: message.partyId,
                    publicKey: message.publicKey,
                    message: message.message,
                    ...(message.origin !== null && { origin: message.origin }),
                    ...(message.createdAt && {
                        createdAt: message.createdAt.toISOString(),
                    }),
                    ...(message.signedAt && {
                        signedAt: message.signedAt.toISOString(),
                    }),
                    ...(message.signature && { signature: message.signature }),
                },
            }
        },
        listMessagesToSign: async (): Promise<ListMessagesToSignResult> => {
            const messages = await store.listMessageRaws()
            return {
                messages: messages.map((message) => ({
                    id: message.id,
                    status: message.status,
                    partyId: message.partyId,
                    publicKey: message.publicKey,
                    message: message.message,
                    ...(message.origin !== null && { origin: message.origin }),
                    ...(message.createdAt && {
                        createdAt: message.createdAt.toISOString(),
                    }),
                    ...(message.signedAt && {
                        signedAt: message.signedAt.toISOString(),
                    }),
                    ...(message.signature && { signature: message.signature }),
                })),
            }
        },
        deleteMessageToSign: async (
            params: DeleteMessageToSignParams
        ): Promise<Null> => {
            const message = await store.getMessageRaw(params.messageId)
            if (!message) {
                throw new Error(
                    `Message signing request not found with id: ${params.messageId}`
                )
            }
            if (message.status !== 'pending') {
                throw new Error(
                    `Cannot delete message with status '${message.status}'. Only pending messages can be deleted.`
                )
            }
            const userId = assertConnected(authContext).userId
            if (message.userId !== userId) {
                throw new Error(
                    `Message signing request ${message.id} is not owned by user ${userId}`
                )
            }
            await store.removeMessageRaw(message.id)
            return null
        },
        execute: async (executeParams: ExecuteParams) => {
            const wallets = await store.getWallets()
            const network = await store.getCurrentNetwork()
            const transaction = await store.getTransaction(
                executeParams.transactionId
            )
            const wallet = wallets.find(
                (w) => w.partyId === executeParams.partyId
            )

            if (wallet === undefined) {
                throw new Error('Requested wallet not found for user')
            }

            if (transaction === undefined) {
                throw new Error('No transaction found')
            }

            const connectedContext = assertConnected(authContext)
            const accessTokenProvider: AuthTokenProvider =
                AuthTokenProvider.fromToken(
                    connectedContext.accessToken,
                    logger
                )

            if (network === undefined) {
                throw new Error('No network session found')
            }

            const notifier = notificationService.getNotifier(
                connectedContext.userId
            )

            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider,
            })

            const transactionService = new TransactionService(
                store,
                logger,
                drivers,
                notifier
            )

            logDynamically(logger, 'executing transaction with params', {
                info: { transactionId: executeParams.transactionId },
                debug: {
                    executeParams,
                    transaction,
                    wallet,
                    userId: connectedContext.userId,
                },
            })

            const response = await transactionService.execute(
                connectedContext.userId,
                wallet,
                transaction,
                executeParams,
                ledgerClient,
                network
            )

            logDynamically(logger, 'transaction executed with response', {
                info: { transactionId: executeParams.transactionId },
                debug: { response },
            })

            return response
        },
        addSession: async function (
            params: AddSessionParams
        ): Promise<AddSessionResult> {
            try {
                const newSessionId = v4()
                logger.info(
                    `Adding session with ID ${newSessionId} for network ${params.networkId}`
                )

                const network = await store.getNetwork(params.networkId)
                await store.setSession({
                    id: newSessionId,
                    network: params.networkId,
                    accessToken: authContext?.accessToken || '',
                })
                const idp = await store.getIdp(network.identityProviderId)
                // Assumption: `setSession` calls `assertConnected`, so its safe to declare that the authContext is defined.
                const { userId, accessToken } = authContext!
                const notifier = notificationService.getNotifier(userId)

                const ledgerClient = new LedgerClient({
                    baseUrl: new URL(network.ledgerApi.baseUrl),
                    logger,
                    accessTokenProvider: AuthTokenProvider.fromToken(
                        accessToken,
                        logger
                    ),
                })
                const status = await networkStatus(ledgerClient)
                const statusEvent: StatusEvent = {
                    provider: provider,
                    connection: {
                        isConnected: status.isConnected,
                        reason: status.reason ? status.reason : 'OK',
                        isNetworkConnected: status.isConnected,
                        networkReason: status.reason ? status.reason : 'OK',
                    },
                    network: {
                        networkId: network.id,
                        ledgerApi: network.ledgerApi.baseUrl,
                        accessToken: accessToken,
                    },
                    session: {
                        accessToken: accessToken,
                        userId: userId,
                    },
                }
                notifier.emit('statusChanged', statusEvent)
                notifier.emit('connected', statusEvent)

                //we only want to automatically perform a sync if it is the first time a session is created
                const wallets = await store.getWallets()
                if (wallets.length == 0) {
                    if (!network.adminAuth) {
                        throw new Error('No admin auth configured')
                    }

                    const adminAccessTokenProvider =
                        AuthTokenProvider.fromGatewayConfig(
                            idp,
                            network.adminAuth,
                            logger
                        )
                    const partyAllocator = new PartyAllocationService({
                        synchronizerId: network.synchronizerId,
                        accessTokenProvider: adminAccessTokenProvider,
                        httpLedgerUrl: network.ledgerApi.baseUrl,
                        logger,
                    })

                    const service = new WalletSyncService(
                        store,
                        ledgerClient,
                        authContext!,
                        logger,
                        drivers,
                        partyAllocator
                    )
                    await service.syncWallets()
                }

                const rights = await store.getUserRights(network.id)
                return {
                    id: newSessionId,
                    accessToken,
                    network: {
                        ...network,
                        ledgerApi: network.ledgerApi.baseUrl,
                    },
                    idp,
                    status: status.isConnected ? 'connected' : 'disconnected',
                    reason: status.reason ? status.reason : 'OK',
                    rights: rights,
                }
            } catch (error) {
                logger.error({ error }, 'Failed to add session')
                throw new Error(`Failed to add session`, {
                    cause: error,
                })
            }
        },
        removeSession: async (): Promise<Null> => {
            logger.info({ authContext }, 'Removing session')
            const userId = assertConnected(authContext).userId
            const notifier = notificationService.getNotifier(userId)
            await store.removeSession()

            notifier.emit('statusChanged', {
                provider: provider,
                connection: {
                    isConnected: false,
                    reason: 'disconnect',
                    isNetworkConnected: false,
                    networkReason: 'removed session',
                },
                network: undefined,
                session: undefined,
                userUrl: `${userUrl}/login/`,
            })

            return null
        },
        listSessions: async (): Promise<ListSessionsResult> => {
            const session = await store.getSession()
            if (!session) {
                return { sessions: [] }
            }

            const network = await store.getNetwork(session.network)
            const ledgerClient = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: AuthTokenProvider.fromToken(
                    authContext!.accessToken,
                    logger
                ),
            })
            const idp = await store.getIdp(network.identityProviderId)
            const status = await networkStatus(ledgerClient)
            const rights = await store.getUserRights(network.id)
            return {
                sessions: [
                    {
                        id: session.id,
                        network: {
                            ...network,
                            ledgerApi: network.ledgerApi.baseUrl,
                        },
                        idp: idp,
                        accessToken: authContext!.accessToken,
                        status: status.isConnected
                            ? 'connected'
                            : 'disconnected',
                        reason: status.reason ? status.reason : 'OK',
                        rights: rights,
                    },
                ],
            }
        },
        syncWallets: async function (): Promise<SyncWalletsResult> {
            const network = await store.getCurrentNetwork()
            const { userId } = assertConnected(authContext)

            const userAccessTokenProvider = AuthTokenProvider.fromToken(
                authContext!.accessToken,
                logger
            )

            const idp = await store.getIdp(network.identityProviderId)

            if (!network.adminAuth) {
                throw new Error('No admin auth configured')
            }

            const adminAccessTokenProvider =
                AuthTokenProvider.fromGatewayConfig(
                    idp,
                    network.adminAuth,
                    logger
                )

            const partyAllocator = new PartyAllocationService({
                synchronizerId: network.synchronizerId,
                accessTokenProvider: adminAccessTokenProvider,
                httpLedgerUrl: network.ledgerApi.baseUrl,
                logger,
            })

            const userLedger = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: userAccessTokenProvider,
            })

            const service = new WalletSyncService(
                store,
                userLedger,
                authContext!,
                logger,
                drivers,
                partyAllocator
            )
            const result = await service.syncWallets()
            if (
                (result.added.length === 0 && result.updated.length === 0) ||
                result.disabled.length === 0
            ) {
                return result
            }
            const notifier = notificationService.getNotifier(userId)
            const wallets = await store.getWallets()
            notifier?.emit('accountsChanged', wallets)
            return result
        },
        isWalletSyncNeeded: async (): Promise<IsWalletSyncNeededResult> => {
            const network = await store.getCurrentNetwork()
            assertConnected(authContext)

            const userAccessTokenProvider = AuthTokenProvider.fromToken(
                authContext!.accessToken,
                logger
            )

            const idp = await store.getIdp(network.identityProviderId)

            if (!network.adminAuth) {
                throw new Error('No admin auth configured')
            }

            const adminAccessTokenProvider =
                AuthTokenProvider.fromGatewayConfig(
                    idp,
                    network.adminAuth,
                    logger
                )

            const partyAllocator = new PartyAllocationService({
                synchronizerId: network.synchronizerId,
                accessTokenProvider: adminAccessTokenProvider,
                httpLedgerUrl: network.ledgerApi.baseUrl,
                logger,
            })

            const userLedger = new LedgerClient({
                baseUrl: new URL(network.ledgerApi.baseUrl),
                logger,
                accessTokenProvider: userAccessTokenProvider,
            })

            const service = new WalletSyncService(
                store,
                userLedger,
                authContext!,
                logger,
                drivers,
                partyAllocator
            )
            const walletSyncNeeded = await service.isWalletSyncNeeded()
            return { walletSyncNeeded }
        },
        getTransaction: async (
            params: GetTransactionParams
        ): Promise<GetTransactionResult> => {
            const transaction = await store.getTransaction(params.transactionId)
            if (!transaction) {
                throw new Error(
                    `Transaction not found with id: ${params.transactionId}`
                )
            }
            return {
                id: transaction.id,
                commandId: transaction.commandId,
                status: transaction.status,
                preparedTransaction: transaction.preparedTransaction,
                preparedTransactionHash: transaction.preparedTransactionHash,
                payload: transaction.payload
                    ? JSON.stringify(transaction.payload)
                    : '',
                ...(transaction.origin !== null && {
                    origin: transaction.origin,
                }),
                ...(transaction.createdAt && {
                    createdAt: transaction.createdAt.toISOString(),
                }),
                ...(transaction.signedAt && {
                    signedAt: transaction.signedAt.toISOString(),
                }),
                ...(transaction.externalTxId && {
                    externalTxId: transaction.externalTxId,
                }),
            }
        },
        listTransactions: async function (): Promise<ListTransactionsResult> {
            const transactions = await store.listTransactions()
            const txs = transactions.map((transaction) => ({
                id: transaction.id,
                commandId: transaction.commandId,
                status: transaction.status,
                preparedTransaction: transaction.preparedTransaction,
                preparedTransactionHash: transaction.preparedTransactionHash,
                payload: transaction.payload
                    ? JSON.stringify(transaction.payload)
                    : '',
                ...(transaction.origin !== null && {
                    origin: transaction.origin,
                }),
                ...(transaction.createdAt && {
                    createdAt: transaction.createdAt.toISOString(),
                }),
                ...(transaction.signedAt && {
                    signedAt: transaction.signedAt.toISOString(),
                }),
                ...(transaction.externalTxId && {
                    externalTxId: transaction.externalTxId,
                }),
            }))
            return { transactions: txs }
        },
        deleteTransaction: async (
            params: DeleteTransactionParams
        ): Promise<Null> => {
            const transaction = await store.getTransaction(params.transactionId)
            if (!transaction) {
                throw new Error(
                    `Transaction not found with id: ${params.transactionId}`
                )
            }
            if (transaction.status !== 'pending') {
                throw new Error(
                    `Cannot delete transaction with status '${transaction.status}'. Only pending transactions can be deleted.`
                )
            }
            await store.removeTransaction(transaction.id)
            return null
        },
        generateApiKey: async (
            params: GenerateApiKeyParams
        ): Promise<GeneratedApiKey> => {
            const userId = assertConnected(authContext).userId
            const network = await store.getCurrentNetwork()

            const apiKeyId = v4()
            const generatedApiKey = crypto.randomBytes(32).toString('hex')
            const hashedApiKey = crypto
                .createHash('sha256')
                .update(generatedApiKey)
                .digest('hex')

            const storedApiKey = {
                id: apiKeyId,
                name: params.name,
                digest: hashedApiKey,
                userId,
                networkId: network.id,
                email: authContext?.email || null,
                createdAt: new Date(),
            }

            await store.addApiKey(storedApiKey)

            logDynamically(logger, 'Generated new API key', {
                info: { apiKeyId: storedApiKey.id },
                debug: {
                    name: storedApiKey.name,
                    userId: storedApiKey.userId,
                    networkId: storedApiKey.networkId,
                    createdAt: storedApiKey.createdAt,
                },
            })

            return {
                id: storedApiKey.id,
                apiKey: generatedApiKey,
            }
        },
        listApiKeys: async (): Promise<ListApiKeysResult> => {
            const apiKeys = await store.listApiKeys().then((keys) =>
                keys.map((key) => ({
                    id: key.id,
                    name: key.name,
                    createdAt: key.createdAt.toISOString(),
                }))
            )
            return { apiKeys }
        },
        removeApiKey: async (params: RemoveApiKeyParams): Promise<Null> => {
            await store.removeApiKey(params.id)
            return null
        },
        listSigningProviderVaults: async (
            params: ListSigningProviderVaultsParams
        ): Promise<ListSigningProviderVaultsResult> => {
            const network = await store.getCurrentNetwork()
            const idp = await store.getIdp(network.identityProviderId)

            if (!network.adminAuth) {
                throw new Error('No admin auth configured')
            }

            const adminAccessTokenProvider =
                AuthTokenProvider.fromGatewayConfig(
                    idp,
                    network.adminAuth,
                    logger
                )
            const partyAllocator = new PartyAllocationService({
                synchronizerId: network.synchronizerId,
                accessTokenProvider: adminAccessTokenProvider,
                httpLedgerUrl: network.ledgerApi.baseUrl,
                logger,
            })
            const walletAllocationService = new WalletAllocationService(
                store,
                logger,
                partyAllocator,
                drivers
            )
            if (!drivers[params.signingProviderId as SigningProvider]) {
                throw new Error(
                    `Signing provider ${params.signingProviderId} not supported`
                )
            }
            return walletAllocationService.getVaults(
                assertConnected(authContext),
                params.signingProviderId as SigningProvider
            )
        },
    })
}

function toAuthDto(auth: Auth): ApiNetwork['auth'] {
    const base = {
        method: auth.method,
        audience: auth.audience,
        scope: auth.scope,
        clientId: auth.clientId,
    }

    if (auth.method === 'self_signed') {
        return {
            ...base,
            issuer: auth.issuer,
            clientSecret: auth.clientSecret,
        }
    }

    if (auth.method === 'client_credentials') {
        return {
            ...base,
            clientSecret: auth.clientSecret,
        }
    }

    return base
}

function toNetworkDto(network: Network): ApiNetwork {
    return {
        id: network.id,
        name: network.name,
        description: network.description,
        synchronizerId: network.synchronizerId,
        identityProviderId: network.identityProviderId,
        ledgerApi: network.ledgerApi.baseUrl,
        auth: toAuthDto(network.auth),
        ...(network.adminAuth
            ? { adminAuth: toAuthDto(network.adminAuth) }
            : {}),
    }
}

function toPublicNetwork(network: Network): PublicNetwork {
    const auth = network.auth

    return {
        id: network.id,
        name: network.name,
        description: network.description,
        synchronizerId: network.synchronizerId,
        identityProviderId: network.identityProviderId,
        ledgerApi: network.ledgerApi.baseUrl,
        authMethod: auth.method,
        ...(auth.method !== 'client_credentials' && {
            clientId: auth.clientId,
            scope: auth.scope,
            audience: auth.audience,
        }),
    }
}
