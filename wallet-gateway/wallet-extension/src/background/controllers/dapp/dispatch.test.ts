// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import {
    errorCodes,
    providerErrors,
    rpcErrors,
} from '@canton-network/core-rpc-errors'
import { SigningProvider } from '@canton-network/core-signing-lib'
import type { JsonRpcRequest } from '@canton-network/core-types'
import { NotificationService } from '@canton-network/core-wallet-services'
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
    type MockInstance,
    vi,
} from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { fakeAuthContext } from '@/__tests__/fake-auth-context.ts'
import { asPort, fakePort } from '@/__tests__/fake-port.ts'
import { inAnHour, jwt } from '@/__tests__/jwt.ts'
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
import type { TxApprovals } from '../../tx-approval.ts'
import type { UnlockRequests } from '../../unlock-request.ts'
import { VaultLockedError } from '../../vault/index.ts'
import type { DappControllerDeps } from './controller.ts'
import { createDappDispatcher, type DappDispatcher } from './dispatch.ts'

const origin = 'https://dapp.example'
const networkId = 'canton:local-oauth'
// Signed in through the IdP of `networkId` in the default config.
const authContext = {
    userId: 'user-1',
    accessToken: jwt({ sub: 'user-1', exp: inAnHour() }),
    identityProviderId: 'idp-mock-oauth',
}
const principal = JSON.stringify(['idp-mock-oauth', authContext.userId])
// `canton:localnet` signs in through another IdP.
const selfSignedPrincipal = JSON.stringify([
    'idp-self-signed',
    authContext.userId,
])
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
        unlockRequests: { request: Mock<UnlockRequests['request']> }
        txApprovals: {
            begin: Mock<TxApprovals['begin']>
            endSite: Mock<TxApprovals['endSite']>
        }
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
            sites,
            siteApprovals: { request: vi.fn() },
            unlockRequests: { request: vi.fn(async () => {}) },
            txApprovals: { begin: vi.fn(), endSite: vi.fn() },
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
        vi.useRealTimers()
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
        const tab = {
            tabId: 7,
            windowId: 3,
            page: 'document-1',
            connection: undefined,
        }
        await expect(
            locked.request(request('connect'), origin, tab)
        ).resolves.toMatchObject({
            result: { isConnected: false, reason: 'Locked' },
        })
        expect(deps.unlockRequests.request).toHaveBeenCalledWith(tab)
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
            let finishEnding!: () => void
            deps.txApprovals.endSite.mockImplementation(async () => {
                expect(await sites.isApproved(principal, origin)).toBe(false)
                await new Promise<void>((resolve) => (finishEnding = resolve))
            })

            const disconnected = dispatcher.request(
                request('disconnect'),
                origin
            )
            await vi.waitFor(() =>
                expect(deps.txApprovals.endSite).toHaveBeenCalled()
            )
            // The site's other tabs still get its transactions' failures.
            expect(deps.sitePorts.close).not.toHaveBeenCalled()
            finishEnding()

            await expect(disconnected).resolves.toEqual({
                jsonrpc: '2.0',
                id: 7,
                result: null,
            })

            expect(await sites.isApproved(principal, origin)).toBe(false)
            expect(
                await sites.isApproved(principal, 'https://other.example')
            ).toBe(true)
            expect(deps.sitePorts.close).toHaveBeenCalledWith(
                origin,
                disconnectedStatusEvent('disconnect')
            )
            expect(deps.sitePorts.close).toHaveBeenCalledTimes(1)
            expect(deps.txApprovals.endSite).toHaveBeenCalledWith(
                principal,
                origin
            )
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

                const tab = {
                    tabId: 7,
                    windowId: 3,
                    page: 'document-1',
                    connection: undefined,
                }

                await expect(
                    dispatcher.request(request('connect'), unapproved, tab)
                ).resolves.toMatchObject({ result: { isConnected: true } })
                expect(deps.siteApprovals.request).toHaveBeenCalledWith({
                    principal,
                    origin: unapproved,
                    accessToken: authContext.accessToken,
                    tab,
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

        it('reports an expired session as not connected', async () => {
            const expired = {
                ...authContext,
                accessToken: jwt({ sub: authContext.userId, exp: 1 }),
            }
            authContextStore.load.mockResolvedValue(expired)
            await walletStore.withAuthContext(expired).setSession({
                id: sessionId,
                origin: 'browserext',
                network: networkId,
                accessToken: expired.accessToken,
            })

            await expect(
                dispatcher.request(request('status'), origin)
            ).resolves.toMatchObject({
                result: { connection: { isConnected: false } },
            })
            await expect(
                dispatcher.request(request('isConnected'), origin)
            ).resolves.toMatchObject({ result: { isConnected: false } })
            await expect(
                dispatcher.request(request('connect'), origin)
            ).resolves.toMatchObject({ result: { isConnected: false } })
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

        describe('prepareExecute', () => {
            const tab = {
                tabId: 7,
                windowId: 3,
                page: 'document-1',
                connection: { page: 'document-1', origin, live: true },
            }
            const executed = {
                status: 'executed' as const,
                commandId: 'command-1',
                payload: { updateId: 'update-1', completionOffset: 42 },
            }
            const params = {
                commandId: 'command-1',
                commands: [{ CreateCommand: {} }],
            }
            let postWithRetry: MockInstance<LedgerClient['postWithRetry']>

            beforeEach(() => {
                postWithRetry = vi
                    .spyOn(LedgerClient.prototype, 'postWithRetry')
                    .mockResolvedValue({
                        preparedTransaction: 'prepared-tx',
                        preparedTransactionHash: 'prepared-hash',
                    })
            })

            const approval = (outcome: Promise<typeof executed>) => {
                outcome.catch(() => {})
                return {
                    outcome,
                    prompt: vi.fn(async () => {}),
                    abort: vi.fn(),
                }
            }

            it('stores the transaction, then prompts for it on the tab', async () => {
                const started = approval(new Promise(() => {}))
                deps.txApprovals.begin.mockReturnValue(started)

                const response = await dispatcher.request(
                    request('prepareExecute', params),
                    origin,
                    tab
                )

                expect(response).toEqual({
                    jsonrpc: '2.0',
                    id: 7,
                    result: null,
                })
                expect(postWithRetry).toHaveBeenCalledWith(
                    '/v2/interactive-submission/prepare',
                    expect.objectContaining({
                        commandId: 'command-1',
                        actAs: [wallet.partyId],
                    })
                )
                expect(deps.txApprovals.begin).toHaveBeenCalledWith({
                    transactionId: expect.any(String),
                    commandId: 'command-1',
                    sessionId,
                    auth: authContext,
                    principal,
                    origin,
                    tab,
                    receivedAt: expect.any(Number),
                })
                const [{ transactionId }] =
                    deps.txApprovals.begin.mock.calls[0]!
                const stored = await store.getTransaction(transactionId)
                expect(stored).toMatchObject({
                    status: 'pending',
                    commandId: 'command-1',
                    preparedTransaction: 'prepared-tx',
                    origin,
                })
                // The payload reaches dApps, which must not see the session.
                expect(stored?.payload).not.toHaveProperty('sessionId')
                expect(started.prompt).toHaveBeenCalled()
            })

            it('counts the approval time from the request, before the vault has restored', async () => {
                vi.useFakeTimers({ toFake: ['Date'] })
                let restored!: () => void
                const vault = {
                    ready: new Promise<void>((resolve) => (restored = resolve)),
                    status: () => 'unlocked' as const,
                }
                deps.txApprovals.begin.mockReturnValue(
                    approval(new Promise(() => {}))
                )
                const arrived = Date.now()

                const response = createDappDispatcher(
                    deps,
                    vault,
                    authContextStore
                ).request(request('prepareExecute', params), origin, tab)
                vi.setSystemTime(arrived + 60_000)
                restored()
                await response

                expect(deps.txApprovals.begin).toHaveBeenCalledWith(
                    expect.objectContaining({ receivedAt: arrived })
                )
            })

            it('ends the prompt when the transaction cannot be prepared', async () => {
                const started = approval(new Promise(() => {}))
                deps.txApprovals.begin.mockReturnValue(started)
                postWithRetry.mockRejectedValue(new Error('ledger down'))

                await expect(
                    dispatcher.request(
                        request('prepareExecute', params),
                        origin,
                        tab
                    )
                ).resolves.toMatchObject({
                    error: { message: 'ledger down' },
                })
                expect(started.abort).toHaveBeenCalledWith(
                    expect.objectContaining({ message: 'ledger down' })
                )
                expect(started.prompt).not.toHaveBeenCalled()
            })

            describe('with more than one acting party', () => {
                const other: Wallet = {
                    ...wallet,
                    primary: false,
                    partyId: 'other::namespace',
                    hint: 'other',
                }

                beforeEach(async () => {
                    await store.addWallet({ ...other })
                })

                it('refuses them for an externally signed first party, before preparing', async () => {
                    deps.txApprovals.begin.mockReturnValue(
                        approval(new Promise(() => {}))
                    )

                    await expect(
                        dispatcher.request(
                            request('prepareExecute', {
                                ...params,
                                actAs: [wallet.partyId, other.partyId],
                            }),
                            origin,
                            tab
                        )
                    ).resolves.toMatchObject({
                        error: {
                            code: errorCodes.rpc.invalidParams,
                            message: expect.stringContaining(
                                'Multi-party external signing is not supported'
                            ),
                        },
                    })
                    expect(postWithRetry).not.toHaveBeenCalled()
                })

                it.each([
                    [
                        'a participant-hosted first party',
                        SigningProvider.PARTICIPANT,
                        [wallet.partyId, other.partyId],
                    ],
                    [
                        'one party named twice',
                        SigningProvider.WALLET_KERNEL,
                        [wallet.partyId, wallet.partyId],
                    ],
                ])('prepares for %s', async (_, signingProviderId, actAs) => {
                    await store.updateWallet({
                        partyId: wallet.partyId,
                        networkId,
                        signingProviderId,
                    })
                    deps.txApprovals.begin.mockReturnValue(
                        approval(new Promise(() => {}))
                    )

                    await expect(
                        dispatcher.request(
                            request('prepareExecute', { ...params, actAs }),
                            origin,
                            tab
                        )
                    ).resolves.toMatchObject({ result: null })
                    expect(postWithRetry).toHaveBeenCalledWith(
                        '/v2/interactive-submission/prepare',
                        expect.objectContaining({ actAs })
                    )
                })
            })

            it('waits for the executed transaction in prepareExecuteAndWait', async () => {
                deps.txApprovals.begin.mockReturnValue(
                    approval(Promise.resolve(executed))
                )

                await expect(
                    dispatcher.request(
                        request('prepareExecuteAndWait', params),
                        origin,
                        tab
                    )
                ).resolves.toEqual({
                    jsonrpc: '2.0',
                    id: 7,
                    result: { tx: executed },
                })
            })

            it('answers prepareExecuteAndWait when the prompt ends before the ledger has prepared it', async () => {
                postWithRetry.mockReturnValue(new Promise(() => {}))
                deps.txApprovals.begin.mockReturnValue(
                    approval(
                        Promise.reject(
                            providerErrors.userRejectedRequest({
                                message: 'The transaction approval timed out',
                            })
                        )
                    )
                )

                await expect(
                    dispatcher.request(
                        request('prepareExecuteAndWait', params),
                        origin,
                        tab
                    )
                ).resolves.toMatchObject({
                    error: { code: errorCodes.provider.userRejectedRequest },
                })
            })

            it.each([
                [
                    'rejected',
                    providerErrors.userRejectedRequest({
                        message: 'Rejected by the user',
                    }),
                ],
                [
                    'failed',
                    rpcErrors.transactionRejected({ message: 'INVALID: no' }),
                ],
                [
                    'has an unknown outcome',
                    rpcErrors.internal({
                        message: 'The outcome of the transaction is unknown',
                    }),
                ],
                [
                    'timed out',
                    providerErrors.userRejectedRequest({
                        message: 'The transaction approval timed out',
                    }),
                ],
            ])(
                'returns the error of a transaction that %s in prepareExecuteAndWait',
                async (_, error) => {
                    deps.txApprovals.begin.mockReturnValue(
                        approval(Promise.reject(error))
                    )

                    await expect(
                        dispatcher.request(
                            request('prepareExecuteAndWait', params),
                            origin,
                            tab
                        )
                    ).resolves.toMatchObject({
                        error: { code: error.code, message: error.message },
                    })
                }
            )
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
                identityProviderId: 'idp-self-signed',
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

        /** Expects the origin to be treated as unapproved. */
        async function expectUnapproved() {
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
        }

        it("does not pick up the approvals of a network's IdP when the session moves there", async () => {
            await sites.revoke(principal, origin)
            await sites.approve(selfSignedPrincipal, origin)
            await store.setSession({
                id: sessionId,
                origin: 'browserext',
                network: 'canton:localnet',
                accessToken: authContext.accessToken,
            })

            await expectUnapproved()
        })

        it('keeps the approval when the same user signs in again', async () => {
            const again = {
                ...authContext,
                accessToken: jwt({
                    sub: authContext.userId,
                    exp: inAnHour(),
                    jti: 'again',
                }),
            }
            await walletStore.withAuthContext(again).setSession({
                id: 'session-2',
                origin: 'browserext',
                network: networkId,
                accessToken: again.accessToken,
            })
            authContextStore.load.mockResolvedValue(again)

            await expect(
                dispatcher.request(request('listAccounts'), origin)
            ).resolves.toMatchObject({
                result: [expect.objectContaining({ partyId: wallet.partyId })],
            })
        })

        it('grants nothing to a context stored without its IdP', async () => {
            const { identityProviderId: _, ...legacy } = authContext
            authContextStore.load.mockResolvedValue(legacy)

            await expectUnapproved()
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
                    async () => ({
                        sessionId,
                        userId: authContext.userId,
                        principal,
                    }),
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
