// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import { errorCodes, providerErrors } from '@canton-network/core-rpc-errors'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { JsonRpcRequest } from '@canton-network/core-types'
import {
    NotificationService,
    subscribeNotifications,
} from '@canton-network/core-wallet-services'
import {
    PartyLevelRight,
    type Store,
    type Wallet,
} from '@canton-network/core-wallet-store'
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    type Mock,
    vi,
} from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { fakeAuthContext } from '@/__tests__/fake-auth-context.ts'
import { asPort, fakePort } from '@/__tests__/fake-port.ts'
import { inAnHour, jwt } from '@/__tests__/jwt.ts'
import { approvalRequestsItem } from '@/shared/storage.ts'
import type { VaultStatus } from '@/shared/vault-protocol.ts'

import {
    createSitePorts,
    handleNotificationPort,
    type SitePorts,
} from '../../notifications.ts'
import type { SiteApprovals } from '../../site-approval.ts'
import { disconnectedStatusEvent } from '../../status.ts'
import type { ApprovedSiteStore } from '../../store/approved-sites.ts'
import type { WalletStore } from '../../store/index.ts'
import { createTestWalletStore } from '../../store/test-store.ts'
import { VaultLockedError } from '../../vault/index.ts'
import type { DappControllerDeps } from './controller.ts'
import { createDappDispatcher, type DappDispatcher } from './dispatch.ts'

const origin = 'https://dapp.example'
const networkId = 'canton:local-oauth'
const authContext = {
    userId: 'user-1',
    accessToken: jwt({ sub: 'user-1', exp: inAnHour() }),
}
// The IdP of `networkId` in the default config.
const principal = JSON.stringify(['idp-mock-oauth', authContext.userId])
const vaultIn = (status: VaultStatus) => ({
    ready: Promise.resolve(),
    status: () => status,
})

/** In memory, like the vault item, without the vault. */
function fakeApprovedSites() {
    const approved = new Set<string>()
    const key = (owner: string, site: string) => JSON.stringify([owner, site])
    return {
        isApproved: vi.fn(async (owner: string, site: string) =>
            approved.has(key(owner, site))
        ),
        approve: vi.fn(async (owner: string, site: string) => {
            approved.add(key(owner, site))
        }),
        revoke: vi.fn(async (owner: string, site: string) => {
            approved.delete(key(owner, site))
        }),
    } satisfies ApprovedSiteStore
}

const request = (
    method: string,
    params?: JsonRpcRequest['params']
): JsonRpcRequest => ({
    jsonrpc: '2.0',
    id: 7,
    method,
    ...(params && { params }),
})

describe('createDappDispatcher', () => {
    let service: NotificationService
    let walletStore: WalletStore
    let authContextStore: ReturnType<typeof fakeAuthContext>
    let sites: ReturnType<typeof fakeApprovedSites>
    let deps: DappControllerDeps & {
        siteApprovals: { request: Mock<SiteApprovals['request']> }
        sitePorts: {
            send: Mock<SitePorts['send']>
            close: Mock<SitePorts['close']>
        }
        isCurrent: Mock<DappControllerDeps['isCurrent']>
    }
    let dispatcher: DappDispatcher

    beforeEach(() => {
        fakeBrowser.reset()
        service = new NotificationService()
        walletStore = createTestWalletStore()
        authContextStore = fakeAuthContext()
        sites = fakeApprovedSites()
        deps = {
            getStore: async () => walletStore,
            notificationService: service,
            sites,
            siteApprovals: { request: vi.fn() },
            sitePorts: { send: vi.fn(), close: vi.fn() },
            isCurrent: vi.fn(async () => true),
        }
        dispatcher = createDappDispatcher(
            deps,
            vaultIn('unlocked'),
            authContextStore
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it.each([
        'unknownMethod',
        'constructor',
        'toString',
        'hasOwnProperty',
        '__proto__',
    ])('returns methodNotFound for %s', async (method) => {
        const response = await dispatcher.request(request(method), origin)

        expect(response).toEqual({
            jsonrpc: '2.0',
            id: 7,
            error: expect.objectContaining({
                code: errorCodes.rpc.methodNotFound,
                message: `Method ${method} not found`,
            }),
        })
    })

    it('returns the method result', async () => {
        const response = await dispatcher.request(request('status'), origin)

        expect(response).toEqual({
            jsonrpc: '2.0',
            id: 7,
            result: {
                provider: {
                    id: 'browser:ext:canton-wallet',
                    providerType: 'browser',
                    userUrl: 'chrome-extension://test-extension-id/popup.html',
                },
                connection: {
                    isConnected: false,
                    reason: 'Unauthenticated',
                    isNetworkConnected: false,
                    networkReason: 'Unauthenticated',
                },
            },
        })
    })

    it('keeps the code of a thrown JSON-RPC error', async () => {
        const response = await dispatcher.request(
            request('getPrimaryAccount'),
            origin
        )

        expect(response).toMatchObject({
            jsonrpc: '2.0',
            id: 7,
            error: {
                code: errorCodes.provider.unauthorized,
                message: 'User is not connected',
            },
        })
    })

    it('answers status and refuses other methods while locked', async () => {
        const signedIn = fakeAuthContext(authContext)
        const getStore = vi.fn(async () => walletStore)
        const locked = createDappDispatcher(
            { ...deps, getStore },
            vaultIn('locked'),
            signedIn
        )

        await expect(
            locked.request(request('status'), origin)
        ).resolves.toMatchObject({
            result: { connection: { isConnected: false, reason: 'Locked' } },
        })
        // As before site approval: connect shows the unlock page and reports
        // not connected, without asking about the site.
        await expect(
            locked.request(request('connect'), origin)
        ).resolves.toMatchObject({
            result: { isConnected: false, reason: 'Locked' },
        })
        expect(deps.siteApprovals.request).not.toHaveBeenCalled()
        await expect(
            locked.request(request('listAccounts'), origin)
        ).resolves.toMatchObject({
            error: {
                code: errorCodes.provider.unauthorized,
                message: 'Wallet is locked',
            },
        })
        // Locked means no signed-in user: neither the auth context nor the
        // store is read.
        expect(signedIn.load).not.toHaveBeenCalled()
        expect(getStore).not.toHaveBeenCalled()
    })

    it('treats a lock after the status check as locked', async () => {
        authContextStore.load.mockRejectedValue(new VaultLockedError())

        await expect(
            dispatcher.request(request('status'), origin)
        ).resolves.toMatchObject({
            result: { connection: { isConnected: false, reason: 'Locked' } },
        })
        await expect(
            dispatcher.request(request('listAccounts'), origin)
        ).resolves.toMatchObject({
            error: {
                code: errorCodes.provider.unauthorized,
                message: 'Wallet is locked',
            },
        })
    })

    describe('when signed in', () => {
        const wallet: Wallet = {
            primary: true,
            status: 'allocated',
            partyId: 'party::namespace',
            hint: 'party',
            namespace: 'namespace',
            signingProviderId: SigningProvider.WALLET_KERNEL,
            publicKey: 'public-key',
            networkId,
            rights: [PartyLevelRight.CanActAs],
            userId: authContext.userId,
        }
        const sessionId = 'session-1'
        let store: Store

        beforeEach(async () => {
            authContextStore.load.mockResolvedValue(authContext)
            store = walletStore.withAuthContext(authContext)
            // The session's origin is where the user logged in, not the dApp.
            await store.setSession({
                id: sessionId,
                origin: 'browserext',
                network: networkId,
                accessToken: authContext.accessToken,
            })
            await store.addWallet({ ...wallet })
            await sites.approve(principal, origin)
        })

        it('turns any other thrown error into an internal error', async () => {
            const response = await dispatcher.request(
                request('signMessage', { message: 'hello' }),
                origin
            )

            expect(response).toMatchObject({
                jsonrpc: '2.0',
                id: 7,
                error: {
                    code: errorCodes.rpc.internal,
                    message: 'Function signMessage not implemented.',
                },
            })
        })

        it('connects an approved site without asking', async () => {
            vi.spyOn(LedgerClient.prototype, 'get').mockResolvedValue({
                version: '3.4.0',
            })

            await expect(
                dispatcher.request(request('connect'), origin)
            ).resolves.toMatchObject({ result: { isConnected: true } })
            expect(deps.siteApprovals.request).not.toHaveBeenCalled()
        })

        it('revokes only this site on disconnect and keeps the session', async () => {
            await sites.approve(principal, 'https://other.example')

            await expect(
                dispatcher.request(request('disconnect'), origin)
            ).resolves.toEqual({ jsonrpc: '2.0', id: 7, result: null })

            expect(await sites.isApproved(principal, origin)).toBe(false)
            expect(
                await sites.isApproved(principal, 'https://other.example')
            ).toBe(true)
            expect(deps.sitePorts.close).toHaveBeenCalledWith(
                origin,
                disconnectedStatusEvent('disconnect')
            )
            expect(deps.sitePorts.close).toHaveBeenCalledTimes(1)
            expect(await store.getSession(authContext.accessToken)).toEqual(
                expect.objectContaining({ id: sessionId })
            )
            await expect(
                dispatcher.request(request('listAccounts'), origin)
            ).resolves.toMatchObject({
                error: { code: errorCodes.provider.unauthorized },
            })
        })

        describe('ledgerApi', () => {
            it('forwards a GET with its path and query', async () => {
                const getWithRetry = vi
                    .spyOn(LedgerClient.prototype, 'getWithRetry')
                    .mockResolvedValue({ ok: true })

                const response = await dispatcher.request(
                    request('ledgerApi', {
                        requestMethod: 'get',
                        resource: '/v2/parties',
                        path: { partyId: 'party::x' },
                        query: { limit: '10' },
                    }),
                    origin
                )

                expect(response).toEqual({
                    jsonrpc: '2.0',
                    id: 7,
                    result: { ok: true },
                })
                expect(getWithRetry).toHaveBeenCalledWith(
                    '/v2/parties',
                    undefined,
                    { path: { partyId: 'party::x' }, query: { limit: '10' } }
                )
            })

            it('forwards a POST with its body and query', async () => {
                const postWithRetry = vi
                    .spyOn(LedgerClient.prototype, 'postWithRetry')
                    .mockResolvedValue({ created: true })

                const response = await dispatcher.request(
                    request('ledgerApi', {
                        requestMethod: 'post',
                        resource: '/v2/commands/submit-and-wait',
                        body: { commands: [] },
                        query: { wait: 'true' },
                    }),
                    origin
                )

                expect(response).toMatchObject({ result: { created: true } })
                expect(postWithRetry).toHaveBeenCalledWith(
                    '/v2/commands/submit-and-wait',
                    { commands: [] },
                    undefined,
                    { query: { wait: 'true' }, path: {} }
                )
            })

            it.each([
                [
                    { requestMethod: 'patch', resource: '/v2/parties' },
                    'Unsupported request method: patch',
                ],
                [
                    { requestMethod: 'get', resource: '/v2/badresource' },
                    'Unsupported get resource: /v2/badresource',
                ],
                [
                    { requestMethod: 'post', resource: '/v2/state/ledger-end' },
                    'Unsupported post resource: /v2/state/ledger-end',
                ],
            ])('refuses %o', async (params, message) => {
                const getWithRetry = vi.spyOn(
                    LedgerClient.prototype,
                    'getWithRetry'
                )
                const postWithRetry = vi.spyOn(
                    LedgerClient.prototype,
                    'postWithRetry'
                )

                const response = await dispatcher.request(
                    request('ledgerApi', params),
                    origin
                )

                expect(response).toMatchObject({ error: { message } })
                expect(getWithRetry).not.toHaveBeenCalled()
                expect(postWithRetry).not.toHaveBeenCalled()
            })
        })

        describe('from a site the user has not approved', () => {
            const unapproved = 'https://unapproved.example'

            it.each([
                ['listAccounts', undefined],
                ['getPrimaryAccount', undefined],
                ['getActiveNetwork', undefined],
                [
                    'ledgerApi',
                    { requestMethod: 'get', resource: '/v2/version' },
                ],
                ['prepareExecute', { commands: [{ CreateCommand: {} }] }],
            ] as const)('refuses %s', async (method, params) => {
                const ledgerGet = vi.spyOn(LedgerClient.prototype, 'get')
                const ledgerPost = vi.spyOn(
                    LedgerClient.prototype,
                    'postWithRetry'
                )

                const response = await dispatcher.request(
                    request(method, params),
                    unapproved
                )

                expect(response).toMatchObject({
                    error: {
                        code: errorCodes.provider.unauthorized,
                        message:
                            'The user has not approved this site. Call connect first.',
                    },
                })
                expect(ledgerGet).not.toHaveBeenCalled()
                expect(ledgerPost).not.toHaveBeenCalled()
            })

            it.each(['status', 'isConnected'])(
                'reports not connected in %s, without the token or user',
                async (method) => {
                    const response = await dispatcher.request(
                        request(method),
                        unapproved
                    )

                    const notConnected =
                        disconnectedStatusEvent('Unauthenticated')
                    expect(response).toEqual({
                        jsonrpc: '2.0',
                        id: 7,
                        result:
                            method === 'status'
                                ? notConnected
                                : notConnected.connection,
                    })
                }
            )

            it('connects once the user approves', async () => {
                vi.spyOn(LedgerClient.prototype, 'get').mockResolvedValue({
                    version: '3.4.0',
                })
                deps.siteApprovals.request.mockImplementation(async (asked) =>
                    sites.approve(asked.principal, asked.origin)
                )

                await expect(
                    dispatcher.request(request('connect'), unapproved)
                ).resolves.toMatchObject({ result: { isConnected: true } })
                expect(deps.siteApprovals.request).toHaveBeenCalledWith({
                    principal,
                    origin: unapproved,
                    accessToken: authContext.accessToken,
                })
                await expect(
                    dispatcher.request(request('listAccounts'), unapproved)
                ).resolves.toMatchObject({
                    result: [
                        expect.objectContaining({ partyId: wallet.partyId }),
                    ],
                })
            })

            it('fails connect with the approval error', async () => {
                const error = providerErrors.userRejectedRequest({
                    message: 'The user rejected the site',
                })
                deps.siteApprovals.request.mockRejectedValue(error)

                await expect(
                    dispatcher.request(request('connect'), unapproved)
                ).resolves.toMatchObject({
                    error: {
                        code: errorCodes.provider.userRejectedRequest,
                        message: error.message,
                    },
                })
                expect(await sites.isApproved(principal, unapproved)).toBe(
                    false
                )
            })
        })

        it('reports the session in status', async () => {
            vi.spyOn(LedgerClient.prototype, 'get').mockResolvedValue({
                version: '3.4.0',
            })

            const response = await dispatcher.request(request('status'), origin)

            expect(response).toMatchObject({
                result: {
                    connection: {
                        isConnected: true,
                        reason: 'OK',
                        isNetworkConnected: true,
                        networkReason: 'OK',
                    },
                    network: {
                        networkId,
                        ledgerApi: 'http://127.0.0.1:5003',
                    },
                    session: { userId: authContext.userId },
                },
            })
        })

        it('returns the primary account and active network', async () => {
            await expect(
                dispatcher.request(request('getPrimaryAccount'), origin)
            ).resolves.toMatchObject({ result: { partyId: wallet.partyId } })
            await expect(
                dispatcher.request(request('getActiveNetwork'), origin)
            ).resolves.toMatchObject({
                result: { networkId, ledgerApi: 'http://127.0.0.1:5003' },
            })
        })

        it('records the requesting origin on a prepared transaction', async () => {
            const postWithRetry = vi
                .spyOn(LedgerClient.prototype, 'postWithRetry')
                .mockResolvedValue({
                    preparedTransaction: 'prepared-tx',
                    preparedTransactionHash: 'prepared-hash',
                })
            const sink = { send: vi.fn(), close: vi.fn() }
            subscribeNotifications(
                service,
                { sessionId, userId: authContext.userId },
                sink
            )

            const response = await dispatcher.request(
                request('prepareExecute', {
                    commandId: 'command-1',
                    commands: [{ CreateCommand: {} }],
                }),
                origin
            )

            expect(response).toEqual({ jsonrpc: '2.0', id: 7, result: null })
            expect(postWithRetry).toHaveBeenCalledWith(
                '/v2/interactive-submission/prepare',
                expect.objectContaining({
                    commandId: 'command-1',
                    actAs: [wallet.partyId],
                })
            )
            const [queued] = await approvalRequestsItem.getValue()
            expect(queued).toEqual({
                transactionId: expect.any(String),
                commandId: 'command-1',
            })
            expect(
                await store.getTransaction(queued!.transactionId)
            ).toMatchObject({
                status: 'pending',
                commandId: 'command-1',
                preparedTransaction: 'prepared-tx',
                origin,
            })
            expect(sink.send).toHaveBeenCalledWith('txChanged', [
                { status: 'pending', commandId: 'command-1' },
            ])
        })

        it('refuses disconnect while locked and keeps the approval', async () => {
            const locked = createDappDispatcher(
                deps,
                vaultIn('locked'),
                authContextStore
            )

            await expect(
                locked.request(request('disconnect'), origin)
            ).resolves.toMatchObject({
                error: {
                    code: errorCodes.provider.unauthorized,
                    message: 'Wallet is locked',
                },
            })

            // Unlocked again: the site is still approved, as the error said.
            expect(sites.revoke).not.toHaveBeenCalled()
            expect(deps.sitePorts.close).not.toHaveBeenCalled()
            await expect(
                dispatcher.request(request('listAccounts'), origin)
            ).resolves.toMatchObject({
                result: [expect.objectContaining({ partyId: wallet.partyId })],
            })
        })

        it('does not share an approval between equal subjects of different identity providers', async () => {
            // The same subject, signed in to a network of another IdP.
            const otherIdp = {
                userId: authContext.userId,
                accessToken: jwt({
                    sub: authContext.userId,
                    exp: inAnHour(),
                    jti: 'other',
                }),
            }
            await walletStore.withAuthContext(otherIdp).setSession({
                id: 'session-2',
                origin: 'browserext',
                network: 'canton:localnet',
                accessToken: otherIdp.accessToken,
            })
            authContextStore.load.mockResolvedValue(otherIdp)

            await expect(
                dispatcher.request(request('listAccounts'), origin)
            ).resolves.toMatchObject({
                error: { code: errorCodes.provider.unauthorized },
            })
            await expect(
                dispatcher.request(request('status'), origin)
            ).resolves.toMatchObject({
                result: { connection: { isConnected: false } },
            })
        })

        it('fails connect and sends no events when the session ended during it', async () => {
            vi.spyOn(LedgerClient.prototype, 'get').mockResolvedValue({
                version: '3.4.0',
            })
            deps.isCurrent.mockResolvedValue(false)

            await expect(
                dispatcher.request(request('connect'), origin)
            ).resolves.toMatchObject({
                error: { code: errorCodes.provider.unauthorized },
            })
            expect(deps.isCurrent).toHaveBeenCalledWith(authContext.accessToken)
            expect(deps.sitePorts.send).not.toHaveBeenCalled()
        })

        it("sends connect's events only to the connecting site", async () => {
            vi.spyOn(LedgerClient.prototype, 'get').mockResolvedValue({
                version: '3.4.0',
            })
            const other = 'https://other.example'
            await sites.approve(principal, other)
            const sitePorts = createSitePorts(
                { onLock: () => {} },
                { onChange: () => {} }
            )
            const ports = {
                [origin]: fakePort(origin),
                [other]: fakePort(other),
            }
            for (const port of Object.values(ports)) {
                await handleNotificationPort(
                    asPort(port),
                    service,
                    async () => ({ sessionId, userId: authContext.userId }),
                    sitePorts
                )
            }
            const connecting = createDappDispatcher(
                { ...deps, sitePorts },
                vaultIn('unlocked'),
                authContextStore
            )

            await expect(
                connecting.request(request('connect'), origin)
            ).resolves.toMatchObject({ result: { isConnected: true } })

            expect(ports[other]!.postMessage).not.toHaveBeenCalled()
            expect(
                ports[origin]!.postMessage.mock.calls.map(
                    ([message]) => (message as { method: string }).method
                )
            ).toEqual(['statusChanged', 'connected'])
        })
    })
})
