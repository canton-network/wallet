// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type GetEndpoint,
    isValidGetEndpoint,
    isValidPostEndpoint,
    LedgerClient,
    type PostEndpoint,
    type PrepareSubmissionResponse,
} from '@canton-network/core-ledger-client'
import { providerErrors } from '@canton-network/core-rpc-errors'
import {
    assertConnected,
    type AuthContext,
    AuthTokenProvider,
    jwtExpired,
} from '@canton-network/core-wallet-auth'
import {
    type INotificationService,
    ledgerPrepareParams,
    networkStatus,
} from '@canton-network/core-wallet-services'
import type {
    Network as StoreNetwork,
    Transaction,
} from '@canton-network/core-wallet-store'

import { enqueueApprovalRequest } from '@/shared/approval-requests.ts'
import { logger } from '@/shared/logger.ts'

import type { SitePorts } from '../../notifications.ts'
import {
    type SessionCheck,
    type SiteApprovals,
    type SiteApprovalTab,
    sessionEnded,
} from '../../site-approval.ts'
import { disconnectedStatusEvent, extensionProvider } from '../../status.ts'
import type { ApprovedSiteStore } from '../../store/approved-sites.ts'
import type { WalletStore } from '../../store/index.ts'
import type { UnlockRequests } from '../../unlock-request.ts'
import buildController from './rpc-gen/index.ts'
import type {
    ConnectResult,
    LedgerApiParams,
    LedgerApiResult,
    Network,
    PrepareExecuteParams,
    StatusEvent,
    TxChangedPendingEvent,
    Wallet,
} from './rpc-gen/typings.ts'

export interface DappControllerDeps {
    /** The wallet store, not yet scoped to a user. */
    getStore: () => Promise<WalletStore>
    notificationService: INotificationService
    sites: ApprovedSiteStore
    siteApprovals: Pick<SiteApprovals, 'request'>
    unlockRequests: Pick<UnlockRequests, 'request'>
    sitePorts: Pick<SitePorts, 'send' | 'close'>
    isCurrent: SessionCheck
}

/** Where a dApp request comes from. */
export interface DappRequestContext {
    /** Origin of the page that sent the request, e.g. `https://app.example`. */
    origin: string
    /** The browser tab of the page, where a site approval prompt shows. */
    tab?: SiteApprovalTab
    /** The vault isn't unlocked. */
    locked: boolean
    /** The signed-in user. Always undefined while locked. */
    auth: AuthContext | undefined
    /** Who approvals belong to, see `sitePrincipal`. Undefined without a user. */
    principal: string | undefined
    /** The principal approved `origin`. Always false without one. */
    approved: boolean
}

function ledgerClientFor(network: StoreNetwork, accessToken: string) {
    return new LedgerClient({
        baseUrl: new URL(network.ledgerApi.baseUrl),
        accessTokenProvider: AuthTokenProvider.fromToken(accessToken),
    })
}

/** The dApp API. Built per request, for the page that sent it. */
export const dappController = (
    {
        getStore,
        notificationService,
        sites,
        siteApprovals,
        unlockRequests,
        sitePorts,
        isCurrent,
    }: DappControllerDeps,
    { origin, tab, locked, auth, principal, approved }: DappRequestContext
) => {
    const notConnected = () =>
        disconnectedStatusEvent(locked ? 'Locked' : 'Unauthenticated')

    function requireAuth(): AuthContext {
        if (locked) {
            throw providerErrors.unauthorized({ message: 'Wallet is locked' })
        }
        return assertConnected(auth)
    }

    /**
     * The store, scoped to the request's user. Without one (signed out or
     * locked) it refuses every user read.
     */
    async function loadStore() {
        return (await getStore()).withAuthContext(auth)
    }

    async function sessionOf(context: AuthContext) {
        // The store still holds the session, but the wallet treats an expired
        // token as signed out, so sites must too.
        if (jwtExpired(context.accessToken)) return undefined
        const store = await loadStore()
        const session = await store.getSession(context.accessToken)
        return session && { context, store, session }
    }

    /**
     * The signed-in user's auth context, store and session, if any. None for
     * a site the user hasn't approved, so it learns nothing about the user.
     */
    async function loadSession() {
        if (!auth || !approved) return undefined
        return sessionOf(auth)
    }

    return buildController({
        connect: async () => {
            logger.info('Dapp connect status: connecting')

            if (locked) {
                // Report "not connected" and show the unlock page on the
                // tab's toolbar icon.
                await unlockRequests.request(tab).catch((error: unknown) => {
                    logger.error('Failed to open the unlock page: {error}', {
                        error,
                    })
                })
            }

            const signedIn = auth && (await sessionOf(auth))
            if (!signedIn) return notConnected().connection

            const { context, store } = signedIn
            if (!approved) {
                if (principal === undefined) {
                    throw providerErrors.unauthorized({
                        message:
                            'Sign in again to approve sites: the identity provider you signed in through is not recorded',
                    })
                }
                // Throws unless the user approves. A second connect from the
                // origin waits on the same prompt.
                await siteApprovals.request({
                    principal,
                    origin,
                    accessToken: context.accessToken,
                    tab,
                })
            }
            const network = await store.getCurrentNetwork()
            const status = await networkStatus(
                ledgerClientFor(network, context.accessToken)
            )

            // The user may have signed out or switched accounts during the
            // prompt or the network check. The token must not reach the site.
            if (!(await isCurrent(context.accessToken))) throw sessionEnded()

            logger.info('Dapp connect status: {*}', { status })
            const connection = {
                isConnected: true,
                reason: 'OK',
                isNetworkConnected: status.isConnected,
                networkReason: status.reason ? status.reason : 'OK',
            }
            const statusEvent: StatusEvent = {
                provider: extensionProvider,
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
            // They carry the token, so only the site that connected gets
            // them, not every site of the session. A page only subscribes
            // after a connected response, so mostly its other tabs see them.
            sitePorts.send(origin, 'statusChanged', [statusEvent])
            sitePorts.send(origin, 'connected', [statusEvent])
            return connection
        },
        // Revokes this site only. The user stays signed in, and other sites
        // stay connected. Fails rather than report a revocation it can't
        // make while locked or signed out.
        disconnect: async () => {
            requireAuth()
            if (principal !== undefined) await sites.revoke(principal, origin)
            sitePorts.close(origin, disconnectedStatusEvent('disconnect'))
            return null
        },
        isConnected: async () => {
            const signedIn = await loadSession()
            if (!signedIn) return notConnected().connection

            const { context, store } = signedIn
            const network = await store.getCurrentNetwork()
            const status = await networkStatus(
                ledgerClientFor(network, context.accessToken)
            )
            return {
                isConnected: true,
                reason: 'OK',
                isNetworkConnected: status.isConnected,
                networkReason: status.reason ? status.reason : 'OK',
            } satisfies ConnectResult
        },
        // Every route of the ledger's OpenAPI, as on the remote gateway, with
        // the user's token. Site approval is what limits who can call it.
        ledgerApi: async (
            params: LedgerApiParams
        ): Promise<LedgerApiResult> => {
            const context = requireAuth()
            const store = await loadStore()
            const network = await store.getCurrentNetwork()
            const ledgerClient = ledgerClientFor(network, context.accessToken)
            const options = {
                path: params.path ?? {},
                query: params.query ?? {},
            }

            switch (params.requestMethod) {
                case 'get':
                    if (!isValidGetEndpoint(params.resource)) {
                        throw new Error(
                            `Unsupported get resource: ${params.resource}`
                        )
                    }
                    return await ledgerClient.getWithRetry(
                        params.resource as GetEndpoint,
                        undefined,
                        options
                    )
                case 'post':
                    if (!isValidPostEndpoint(params.resource)) {
                        throw new Error(
                            `Unsupported post resource: ${params.resource}`
                        )
                    }
                    return await ledgerClient.postWithRetry(
                        params.resource as PostEndpoint,
                        params.body as never,
                        undefined,
                        options
                    )
                default:
                    throw new Error(
                        `Unsupported request method: ${String(params.requestMethod)}`
                    )
            }
        },

        prepareExecute: async (params: PrepareExecuteParams) => {
            const context = requireAuth()
            const store = await loadStore()
            const session = await store.getSession(context.accessToken)
            if (!session) {
                throw new Error('No active session found')
            }

            const primaryWallet = await store.getPrimaryWallet()
            const wallets = await store.getWallets()
            const network = await store.getCurrentNetwork()

            let actAs = params.actAs ? [...params.actAs] : []
            if (actAs.length === 0) {
                if (!primaryWallet) {
                    throw new Error(
                        'No primary wallet found. Create or sync a wallet and set it as primary before prepareExecute.'
                    )
                }
                actAs = [primaryWallet.partyId]
            }

            for (const party of actAs) {
                if (!wallets.some((wallet) => wallet.partyId === party)) {
                    throw new Error(
                        `Acting party ${party} does not belong to user`
                    )
                }
            }

            const wallet = wallets.find(
                (candidate) => candidate.partyId === actAs[0]
            )
            if (!wallet) {
                throw new Error(
                    'No wallet found for the first acting party. Create or sync a wallet and set it as primary before prepareExecute.'
                )
            }

            const ledgerClient = ledgerClientFor(network, context.accessToken)
            const commandId = params.commandId || crypto.randomUUID()
            const transactionId = crypto.randomUUID()
            const synchronizerId =
                network.synchronizerId ??
                (await ledgerClient.getSynchronizerId())

            logger.info('prepareExecute: Submitting request to ledger', {
                transactionId,
                commandId,
                actAs,
            })

            const prepared: PrepareSubmissionResponse =
                await ledgerClient.postWithRetry(
                    '/v2/interactive-submission/prepare',
                    ledgerPrepareParams({
                        userId: context.userId,
                        commandId,
                        actAs,
                        synchronizerId,
                        params,
                        hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V3',
                    })
                )

            const transaction: Transaction = {
                id: transactionId,
                commandId,
                status: 'pending',
                preparedTransaction: prepared.preparedTransaction,
                preparedTransactionHash: prepared.preparedTransactionHash,
                payload: { ...params, commandId, actAs },
                // The requesting page, not the session's login origin.
                origin,
                createdAt: new Date(),
            }

            await store.setTransaction(transaction)

            notificationService.getNotifier(session.id).emit('txChanged', {
                status: 'pending',
                commandId,
            } satisfies TxChangedPendingEvent)

            await enqueueApprovalRequest({ transactionId, commandId })

            logger.info('prepareExecute: Prepared transaction for approval', {
                transactionId,
                commandId,
                actAs,
            })

            return null
        },
        prepareExecuteAndWait: async () => {
            throw new Error('Function prepareExecuteAndWait not implemented.')
        },
        status: async (): Promise<StatusEvent> => {
            const signedIn = await loadSession()
            if (!signedIn) return notConnected()

            const { context, store } = signedIn
            const network = await store.getCurrentNetwork()
            const status = await networkStatus(
                ledgerClientFor(network, context.accessToken)
            )
            return {
                provider: extensionProvider,
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
                    accessToken: context.accessToken,
                    userId: context.userId,
                },
            }
        },
        listAccounts: async () => {
            requireAuth()
            const store = await loadStore()
            return await store.getWallets()
        },
        accountsChanged: async () => {
            throw new Error('Only for events.')
        },
        txChanged: async () => {
            throw new Error('Only for events.')
        },
        getActiveNetwork: async (): Promise<Network> => {
            const context = requireAuth()
            const store = await loadStore()
            const network = await store.getCurrentNetwork()
            return {
                networkId: network.id,
                ledgerApi: network.ledgerApi.baseUrl,
                ...(context.accessToken
                    ? { accessToken: context.accessToken }
                    : {}),
            }
        },
        signMessage: async () => {
            throw new Error('Function signMessage not implemented.')
        },
        getPrimaryAccount: async (): Promise<Wallet> => {
            requireAuth()
            const store = await loadStore()
            const wallet = await store.getPrimaryWallet()
            if (!wallet) {
                throw new Error('No primary wallet found')
            }
            return wallet
        },
        messageSignature: async () => {
            throw new Error('Only for events.')
        },
    })
}
