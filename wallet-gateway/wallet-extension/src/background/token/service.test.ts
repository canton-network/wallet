// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import { errorCodes } from '@canton-network/core-rpc-errors'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Wallet } from '@canton-network/core-wallet-store'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import createPlain from '@/__tests__/fixtures/v3-create-plain.json'
import { EXTENSION_ORIGIN } from '@/shared/auth-protocol.ts'
import { isNotSubmitted, NOT_SUBMITTED } from '@/shared/transfer-errors.ts'

import type { AuthContextStore } from '../auth-context.ts'
import type { TransactionSubmitter } from '../controllers/user/transactions.ts'
import type { RegistryStore } from '../store/registries.ts'
import { createTestWalletStore } from '../store/test-store.ts'
import type { TokenSdk, TokenSdkConfig } from './sdk.ts'
import { createTokenService } from './service.ts'

const networkId = 'canton:localnet'
const context: AuthContext = { userId: 'alice', accessToken: 'alice-token' }
const registryUrls = ['http://scan.localhost:4000']

const wallet: Wallet = {
    primary: true,
    status: 'allocated',
    partyId: 'alice::1220',
    hint: 'alice',
    publicKey: 'public-key',
    namespace: '1220',
    networkId,
    signingProviderId: 'wallet-kernel',
    rights: [],
    userId: context.userId,
}

const registryUrl = new URL('http://scan.localhost:4000')
const amulet = { admin: 'dso::1220', id: 'Amulet' }
const command = () => [{ ExerciseCommand: {} }, []]

function fakeSdk(transferVersions = ['v1', 'v2']) {
    const transfer = () => ({
        create: vi.fn(async () => command()),
        withdraw: vi.fn(async () => command()),
    })
    return {
        token: {
            assets: vi.fn(async () => [
                {
                    ...amulet,
                    displayName: 'Amulet',
                    symbol: 'CC',
                    registryUrl,
                    capabilities: { transferInstruction: transferVersions },
                },
            ]),
            v1: {
                utxos: { list: vi.fn(async () => [{ contractId: 'v1' }]) },
                transfer: transfer(),
            },
            v2: {
                utxos: { list: vi.fn(async () => [{ contractId: 'v2' }]) },
                transfer: transfer(),
            },
        },
    }
}

const transferParams = {
    sender: wallet.partyId,
    receiver: 'bob::1220',
    instrumentId: amulet,
    amount: '5',
    expiry: '2026-12-01T00:00:00.000Z',
    tokenStandardVersion: 'v2' as const,
}

describe('createTokenService', () => {
    let sdk: ReturnType<typeof fakeSdk>
    let createSdk: ReturnType<
        typeof vi.fn<(config: TokenSdkConfig) => Promise<TokenSdk>>
    >
    let registries: RegistryStore
    let authContext: Pick<AuthContextStore, 'load'>
    let sign: Mock<TransactionSubmitter['sign']>
    let execute: Mock<TransactionSubmitter['execute']>
    let prepare: Mock<LedgerClient['postWithRetry']>
    let store: ReturnType<typeof createTestWalletStore>

    function service() {
        store = createTestWalletStore(context)
        return createTokenService({
            authContext,
            getStore: async () => store,
            registries,
            createSdk,
            submitter: { sign, execute },
        })
    }

    async function signedIn() {
        const tokenService = service()
        await store.setSession({
            id: 'dapp-session',
            origin: 'https://dapp.example',
            network: networkId,
            accessToken: context.accessToken,
        })
        await store.setSession({
            id: 'session-1',
            origin: EXTENSION_ORIGIN,
            network: networkId,
            accessToken: context.accessToken,
        })
        await store.addWallet({ ...wallet })
        return tokenService
    }

    beforeEach(() => {
        sdk = fakeSdk()
        createSdk = vi.fn(async () => sdk as unknown as TokenSdk)
        registries = {
            forNetwork: async (id) => (id === networkId ? registryUrls : []),
        }
        authContext = { load: async () => context }
        vi.spyOn(LedgerClient.prototype, 'getSynchronizerId').mockResolvedValue(
            'global::1220'
        )
        // A prepared transaction whose hash matches, as the ledger sends it.
        prepare = vi
            .spyOn(LedgerClient.prototype, 'postWithRetry')
            .mockResolvedValue({
                preparedTransaction: createPlain.preparedTransaction,
                preparedTransactionHash: Buffer.from(
                    createPlain.expected.hash,
                    'hex'
                ).toString('base64'),
            })
        sign = vi.fn(
            async (signStore, _context, _session, { transactionId }) => {
                await signStore.setTransactionSigned(transactionId, new Date())
                return {
                    status: 'signed' as const,
                    partyId: wallet.partyId,
                    signature: 'signature',
                    signedBy: 'namespace',
                }
            }
        )
        execute = vi.fn(
            async (executeStore, _context, _session, { transactionId }) => {
                await executeStore.setTransactionStatus(
                    transactionId,
                    'executed'
                )
                return { updateId: 'update-1', completionOffset: 42 }
            }
        )
    })

    it('rejects a party that is not one of the user’s wallets', async () => {
        const tokenService = await signedIn()

        await expect(
            tokenService.token.v1.utxos.list({ partyId: 'mallory::1220' })
        ).rejects.toThrow('Party mallory::1220 does not belong to user')
        await expect(
            tokenService.token.v2.utxos.list({ partyId: 'mallory::1220' })
        ).rejects.toThrow('does not belong to user')
        expect(createSdk).not.toHaveBeenCalled()
    })

    it.each([
        ['missing', {}],
        ['null', { partyId: null }],
        ['not a string', { partyId: 42 }],
        ['empty', { partyId: '' }],
        ['no params', undefined],
    ])('rejects a %s partyId', async (_, params) => {
        const tokenService = await signedIn()

        await expect(
            tokenService.token.v1.utxos.list(params as never)
        ).rejects.toThrow('A partyId is required')
        await expect(
            tokenService.token.v2.utxos.list(params as never)
        ).rejects.toThrow('A partyId is required')
        expect(createSdk).not.toHaveBeenCalled()
    })

    it('lists the holdings of one of the user’s wallets', async () => {
        const tokenService = await signedIn()
        const params = { partyId: wallet.partyId, limit: 10 }

        await expect(tokenService.token.v1.utxos.list(params)).resolves.toEqual(
            [{ contractId: 'v1' }]
        )
        await expect(tokenService.token.v2.utxos.list(params)).resolves.toEqual(
            [{ contractId: 'v2' }]
        )
        expect(sdk.token.v1.utxos.list).toHaveBeenCalledWith(
            expect.objectContaining(params)
        )
        expect(sdk.token.v2.utxos.list).toHaveBeenCalledWith(
            expect.objectContaining(params)
        )
    })

    it('builds the SDK with the user whose wallets it checked', async () => {
        const tokenService = await signedIn()
        // Another user signs in after the first load, while the call runs.
        let loads = 0
        authContext.load = async () =>
            loads++ === 0
                ? context
                : { userId: 'bob', accessToken: 'bob-token' }

        await tokenService.token.v1.utxos.list({ partyId: wallet.partyId })

        expect(loads).toBe(1)
        expect(createSdk).toHaveBeenCalledWith(
            expect.objectContaining({ accessToken: context.accessToken })
        )
    })

    it('doesn’t pass options it doesn’t expose', async () => {
        const tokenService = await signedIn()

        await tokenService.token.v1.utxos.list({
            partyId: wallet.partyId,
            continueUntilCompletion: true,
        } as never)

        expect(sdk.token.v1.utxos.list).toHaveBeenCalledWith(
            expect.not.objectContaining({ continueUntilCompletion: true })
        )
    })

    it('rejects when nobody is signed in', async () => {
        authContext = { load: async () => undefined }
        const tokenService = service()

        await expect(tokenService.token.instruments()).rejects.toThrow(
            'Not signed in'
        )
        await expect(
            tokenService.token.v1.utxos.list({ partyId: wallet.partyId })
        ).rejects.toThrow('Not signed in')
        expect(createSdk).not.toHaveBeenCalled()
    })

    it('builds the SDK for the current network, its registries and the user’s token', async () => {
        const tokenService = await signedIn()

        await tokenService.token.v1.utxos.list({ partyId: wallet.partyId })

        expect(createSdk).toHaveBeenCalledWith({
            network: expect.objectContaining({ id: networkId }),
            accessToken: context.accessToken,
            registries: registryUrls,
        })
    })

    /** Prepares the transfer and submits it, as the send page does. */
    async function send(
        tokenService: ReturnType<typeof service>,
        params = transferParams
    ): Promise<string> {
        const { transactionId } =
            await tokenService.token.transfer.prepare(params)
        await tokenService.token.transfer.submit(transactionId)
        return transactionId
    }

    describe('transfer.prepare and transfer.submit', () => {
        it('falls back to v1 when the registry has no v2 transfers', async () => {
            sdk = fakeSdk(['v1'])
            const tokenService = await signedIn()

            await tokenService.token.transfer.prepare(transferParams)

            expect(sdk.token.v1.transfer.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    sender: wallet.partyId,
                    recipient: 'bob::1220',
                    instrumentId: 'Amulet',
                    registryUrl,
                })
            )
            expect(sdk.token.v2.transfer.create).not.toHaveBeenCalled()
        })

        it('refuses a sender that isn’t the user’s before preparing', async () => {
            const tokenService = await signedIn()

            await expect(
                tokenService.token.transfer.prepare({
                    ...transferParams,
                    sender: 'mallory::1220',
                })
            ).rejects.toThrow('Party mallory::1220 does not belong to user')
            expect(createSdk).not.toHaveBeenCalled()
            expect(prepare).not.toHaveBeenCalled()
        })

        it('prepares the transfer for review, then signs and executes it in the extension’s session', async () => {
            const tokenService = await signedIn()

            const prepared =
                await tokenService.token.transfer.prepare(transferParams)

            expect(prepare).toHaveBeenCalledWith(
                '/v2/interactive-submission/prepare',
                expect.objectContaining({ actAs: [wallet.partyId] })
            )
            expect(prepared).toEqual({
                transactionId: expect.any(String),
                commandId: expect.any(String),
                preparedTransaction: createPlain.preparedTransaction,
                preparedTransactionHash: expect.any(String),
                createdAt: expect.any(String),
                partyId: wallet.partyId,
            })
            expect(sign).not.toHaveBeenCalled()

            await tokenService.token.transfer.submit(prepared.transactionId)

            const [, , sessionId, { transactionId, partyId }] =
                sign.mock.calls[0]!
            expect([transactionId, sessionId, partyId]).toEqual([
                prepared.transactionId,
                'session-1',
                wallet.partyId,
            ])
            expect(execute).toHaveBeenCalledWith(
                expect.anything(),
                context,
                'session-1',
                { transactionId, partyId }
            )
            await expect(store.getTransaction(transactionId)).resolves.toEqual(
                expect.objectContaining({
                    status: 'executed',
                    origin: EXTENSION_ORIGIN,
                })
            )
        })

        it.each([
            ['a dApp’s pending transaction', 'dapp-tx'],
            ['an unknown id', 'unknown-tx'],
        ])('refuses to submit %s', async (_, transactionId) => {
            const tokenService = await signedIn()
            await store.setTransaction({
                id: 'dapp-tx',
                commandId: 'dapp-command',
                status: 'pending',
                preparedTransaction: createPlain.preparedTransaction,
                preparedTransactionHash: 'hash',
                payload: { actAs: [wallet.partyId] },
                origin: 'https://dapp.example',
                createdAt: new Date(),
            })
            const before = await store.getTransaction('dapp-tx')

            const error = await tokenService.token.transfer
                .submit(transactionId)
                .catch((cause: unknown) => cause)

            expect(isNotSubmitted(error)).toBe(true)
            await expect(store.getTransaction('dapp-tx')).resolves.toEqual(
                before
            )
            expect(sign).not.toHaveBeenCalled()
            expect(execute).not.toHaveBeenCalled()
        })

        it('removes a review past its deadline instead of signing it', async () => {
            const tokenService = await signedIn()
            const { transactionId } =
                await tokenService.token.transfer.prepare(transferParams)
            const transaction = (await store.getTransaction(transactionId))!
            await store.setTransaction({
                ...transaction,
                createdAt: new Date(Date.now() - 5 * 60 * 1000),
            })

            const error = await tokenService.token.transfer
                .submit(transactionId)
                .catch((cause: unknown) => cause)

            expect(isNotSubmitted(error)).toBe(true)
            expect(error).toMatchObject({
                message: expect.stringContaining('expired'),
            })
            await expect(
                store.getTransaction(transactionId)
            ).resolves.toBeUndefined()
            expect(sign).not.toHaveBeenCalled()
        })

        it('is safe to submit again', async () => {
            const tokenService = await signedIn()
            const { transactionId } =
                await tokenService.token.transfer.prepare(transferParams)
            await store.setTransactionSigned(transactionId, new Date())

            // Signed, its reply lost: executed again, not signed again.
            await tokenService.token.transfer.submit(transactionId)
            expect(sign).not.toHaveBeenCalled()
            expect(execute).toHaveBeenCalledWith(
                expect.anything(),
                context,
                'session-1',
                { transactionId, partyId: wallet.partyId }
            )

            // Executed: nothing reaches the ledger.
            execute.mockClear()
            await tokenService.token.transfer.submit(transactionId)
            expect(sign).not.toHaveBeenCalled()
            expect(execute).not.toHaveBeenCalled()
        })

        it('refuses when the extension’s session is on another network than the wallet’s', async () => {
            const tokenService = service()
            // The store takes the network from the first session with the
            // token: the dApp's.
            await store.setSession({
                id: 'dapp-session',
                origin: 'https://dapp.example',
                network: 'canton:local-oauth',
                accessToken: context.accessToken,
            })
            await store.setSession({
                id: 'session-1',
                origin: EXTENSION_ORIGIN,
                network: networkId,
                accessToken: context.accessToken,
            })
            await store.addWallet({ ...wallet })
            await store.addWallet({
                ...wallet,
                networkId: 'canton:local-oauth',
            })

            const error = await tokenService.token.transfer
                .prepare(transferParams)
                .catch((cause: unknown) => cause)
            expect(error).toMatchObject({
                message: expect.stringContaining(
                    'The extension is connected to canton:localnet'
                ),
            })
            expect(isNotSubmitted(error)).toBe(true)
            expect(createSdk).not.toHaveBeenCalled()
            expect(prepare).not.toHaveBeenCalled()
        })

        it('stays on the checked network when a reconnect moves the extension’s session', async () => {
            const tokenService = service()
            const extensionSession = (id: string) =>
                store.setSession({
                    id,
                    origin: EXTENSION_ORIGIN,
                    network: networkId,
                    accessToken: context.accessToken,
                })
            const dappSession = () =>
                store.setSession({
                    id: 'dapp-session',
                    origin: 'https://dapp.example',
                    network: 'canton:local-oauth',
                    accessToken: context.accessToken,
                })
            await extensionSession('session-1')
            await dappSession()
            await store.addWallet({ ...wallet })
            await store.addWallet({
                ...wallet,
                networkId: 'canton:local-oauth',
            })
            // Reconnecting replaces the session, which moves it behind the
            // dApp's, so the store now takes the dApp's network.
            createSdk.mockImplementationOnce(async () => {
                await extensionSession('session-2')
                return sdk as unknown as TokenSdk
            })

            const { transactionId } =
                await tokenService.token.transfer.prepare(transferParams)

            expect(
                prepare.mock.contexts.map(
                    (client) => (client as LedgerClient).baseUrl.href
                )
            ).toEqual(['http://localhost:2975/'])

            // The dApp reconnects, and then the extension again, while the
            // transfer is signed.
            await dappSession()
            sign.mockImplementationOnce(async (signStore, ...rest) => {
                await extensionSession('session-3')
                return sign.getMockImplementation()!(signStore, ...rest)
            })
            await tokenService.token.transfer.submit(transactionId)

            const [signStore] = sign.mock.calls[0]!
            const [executeStore] = execute.mock.calls[0]!
            for (const used of [signStore, executeStore]) {
                await expect(used.getCurrentNetwork()).resolves.toMatchObject({
                    id: networkId,
                })
                await expect(used.getWallets()).resolves.toEqual([
                    expect.objectContaining({ networkId }),
                ])
            }
        })

        it('stops before preparing when the extension’s session is removed', async () => {
            const tokenService = await signedIn()
            createSdk.mockImplementationOnce(async () => {
                await store.removeSession(context.accessToken)
                return sdk as unknown as TokenSdk
            })

            const error = await tokenService.token.transfer
                .prepare(transferParams)
                .catch((cause: unknown) => cause)

            expect(error).toMatchObject({
                message: 'The extension is not connected',
            })
            expect(isNotSubmitted(error)).toBe(true)
            expect(prepare).not.toHaveBeenCalled()
            expect(sign).not.toHaveBeenCalled()
        })

        it.each([
            [
                'nothing',
                undefined,
                'The transfer failed without an error message',
            ],
            [
                'a ledger error',
                { code: 'UNKNOWN_INFORMEES', cause: 'not known' },
                'UNKNOWN_INFORMEES: not known',
            ],
        ])(
            'rejects with an Error when the SDK rejects with %s',
            async (_, cause, message) => {
                sdk.token.assets.mockRejectedValue(cause)
                const tokenService = await signedIn()

                const error = await tokenService.token.transfer
                    .prepare(transferParams)
                    .catch((rejection: unknown) => rejection)
                expect(error).toBeInstanceOf(Error)
                expect(error).toMatchObject({ message })
            }
        )

        it('tells a signed transfer whose outcome is unknown from a failed one', async () => {
            const tokenService = await signedIn()

            sign.mockRejectedValueOnce(new Error('signer unavailable'))
            await expect(send(tokenService)).rejects.toMatchObject({
                code: errorCodes.rpc.transactionRejected,
                data: NOT_SUBMITTED,
            })

            execute.mockRejectedValueOnce(new Error('connection lost'))
            await expect(send(tokenService)).rejects.toMatchObject({
                code: errorCodes.rpc.internal,
                message: expect.stringContaining('outcome'),
            })

            // The transaction service records the ledger's structured
            // timeout as a rejection.
            execute.mockImplementationOnce(
                async (executeStore, _context, _session, { transactionId }) => {
                    await executeStore.setTransactionStatus(
                        transactionId,
                        'failed',
                        { failureReason: 'REQUEST_TIMEOUT: timed out' }
                    )
                    throw new Error(
                        'Ledger rejected submission REQUEST_TIMEOUT: timed out'
                    )
                }
            )
            await expect(send(tokenService)).rejects.toMatchObject({
                code: errorCodes.rpc.internal,
                message: expect.stringContaining('outcome'),
            })
        })
    })

    describe('transfer.withdraw', () => {
        it('sends a v1 and a v2 withdraw to their own SDK call', async () => {
            const tokenService = await signedIn()
            const withdraw = {
                partyId: wallet.partyId,
                contractId: 'instruction-1',
                instrumentId: amulet,
            }

            await tokenService.token.transfer.withdraw({
                ...withdraw,
                version: 'v1',
            })
            expect(sdk.token.v1.transfer.withdraw).toHaveBeenCalledWith({
                transferInstructionCid: 'instruction-1',
                registryUrl,
            })
            expect(sdk.token.v2.transfer.withdraw).not.toHaveBeenCalled()

            await tokenService.token.transfer.withdraw({
                ...withdraw,
                version: 'v2',
            })
            expect(sdk.token.v2.transfer.withdraw).toHaveBeenCalledWith(
                'instruction-1',
                [wallet.partyId],
                registryUrl
            )
            expect(sdk.token.v1.transfer.withdraw).toHaveBeenCalledTimes(1)
            expect(execute).toHaveBeenCalledTimes(2)
        })
    })
})
