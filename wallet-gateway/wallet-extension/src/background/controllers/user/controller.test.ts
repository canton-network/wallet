// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerClient } from '@canton-network/core-ledger-client'
import { InternalSigningDriver } from '@canton-network/core-signing-internal'
import {
    createKeyPair,
    SigningProvider,
    verifySignedTxHash,
    type SigningDriverInterface,
    type SigningDriverStore,
} from '@canton-network/core-signing-lib'
import { fingerprintPublicKey } from '@canton-network/core-types'
import {
    NotificationService,
    subscribeNotifications,
} from '@canton-network/core-wallet-services'
import {
    PartyLevelRight,
    type Store,
    type Transaction,
    type Wallet,
} from '@canton-network/core-wallet-store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { fakeAuthContext } from '@/__tests__/fake-auth-context'
import { createWalletStore, loadAuthedStore } from '../../store'
import { createVaultSigningStore } from '../../store/signing-store'
import { createTestWalletStore } from '../../store/test-store'
import { createVault, type Vault, VaultLockedError } from '../../vault'
import { userController } from '.'

const networkId = 'canton:local-oauth'
const authContext = { userId: 'user-1', accessToken: 'token-1' }

describe('userController.addSession', () => {
    let service: NotificationService
    let controller: ReturnType<typeof userController>

    const fakeSink = () => ({ send: vi.fn(), close: vi.fn() })
    const subscribe = (sessionId: string) => {
        const sink = fakeSink()
        subscribeNotifications(
            service,
            { sessionId, userId: authContext.userId },
            sink
        )
        return sink
    }

    beforeEach(() => {
        service = new NotificationService({ debug: vi.fn(), error: vi.fn() })
        const store = createTestWalletStore(authContext)
        controller = userController({
            getStore: async () => store,
            authContext: fakeAuthContext(authContext),
            signingDriver: {} as SigningDriverInterface,
            notificationService: service,
        })
    })

    it('closes the notification subscriptions of a replaced session', async () => {
        const first = await controller.addSession({
            origin: 'https://dapp.example',
            networkId,
        })
        const other = await controller.addSession({
            origin: 'https://other.example',
            networkId,
        })
        const firstSink = subscribe(first.id)
        const otherSink = subscribe(other.id)

        const second = await controller.addSession({
            origin: 'https://dapp.example',
            networkId,
        })

        expect(firstSink.close).toHaveBeenCalledTimes(1)
        expect(service.getNotifier(first.id).emit('txChanged', {})).toBe(false)
        expect(otherSink.close).not.toHaveBeenCalled()

        const secondSink = subscribe(second.id)
        service.getNotifier(second.id).emit('txChanged', { status: 'pending' })
        expect(secondSink.send).toHaveBeenCalledWith('txChanged', [
            { status: 'pending' },
        ])
        expect(firstSink.send).not.toHaveBeenCalled()
    })
})

describe('userController transactions', () => {
    const otherAuthContext = { ...authContext, accessToken: 'token-2' }
    const keyPair = createKeyPair()
    // Base64 of a 32-byte hash, as signed by the wallet-kernel driver
    const preparedTransactionHash = btoa('h'.repeat(32))
    const ledgerResult = { updateId: 'update-1', completionOffset: 42 }

    const wallet: Wallet = {
        primary: true,
        status: 'allocated',
        partyId: 'party::namespace',
        hint: 'party',
        namespace: 'namespace',
        signingProviderId: SigningProvider.WALLET_KERNEL,
        publicKey: keyPair.publicKey,
        networkId,
        rights: [PartyLevelRight.CanActAs],
        userId: authContext.userId,
    }
    const pendingTransaction: Transaction = {
        id: 'tx-1',
        commandId: 'cmd-1',
        status: 'pending',
        preparedTransaction: 'prepared-tx',
        preparedTransactionHash,
        origin: 'https://dapp.example',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const params = {
        transactionId: pendingTransaction.id,
        partyId: wallet.partyId,
    }

    let service: NotificationService
    let store: Store
    let signingStore: SigningDriverStore
    let controller: ReturnType<typeof userController>
    let postWithRetry: ReturnType<typeof vi.spyOn>
    let sessionSink: { send: ReturnType<typeof vi.fn>; close: () => void }
    let otherSessionSink: { send: ReturnType<typeof vi.fn>; close: () => void }

    const subscribe = (sessionId: string) => {
        const sink = { send: vi.fn(), close: vi.fn() }
        subscribeNotifications(
            service,
            { sessionId, userId: authContext.userId },
            sink
        )
        return sink
    }
    const txChangedEvents = (sink: { send: ReturnType<typeof vi.fn> }) =>
        sink.send.mock.calls
            .filter(([event]) => event === 'txChanged')
            .map(([, args]) => (args as unknown[])[0])

    beforeEach(async () => {
        fakeBrowser.reset()
        const authContextStore = fakeAuthContext(authContext)
        postWithRetry = vi
            .spyOn(LedgerClient.prototype, 'postWithRetry')
            .mockResolvedValue(ledgerResult)

        service = new NotificationService({ debug: vi.fn(), error: vi.fn() })
        store = createTestWalletStore(authContext)
        const vault = createVault({ iterations: 1000 })
        await vault.create('abcde1')
        signingStore = createVaultSigningStore(vault)
        await signingStore.setSigningKey(authContext.userId, {
            id: 'key-1',
            name: wallet.hint,
            ...keyPair,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        controller = userController({
            getStore: async () => store,
            authContext: authContextStore,
            signingDriver: new InternalSigningDriver(signingStore),
            notificationService: service,
        })

        const session = await controller.addSession({
            origin: pendingTransaction.origin!,
            networkId,
        })
        authContextStore.load.mockResolvedValueOnce(otherAuthContext)
        const otherSession = await controller.addSession({
            origin: 'https://other.example',
            networkId,
        })
        sessionSink = subscribe(session.id)
        otherSessionSink = subscribe(otherSession.id)

        await store.addWallet({ ...wallet })
        await store.setTransaction({ ...pendingTransaction })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('executes with the signature stored under the signing transaction ID', async () => {
        const getSigningTransaction = vi.spyOn(
            signingStore,
            'getSigningTransaction'
        )

        const signResult = await controller.sign(params)

        expect(signResult).toEqual({
            status: 'signed',
            signature: expect.any(String),
            signedBy: wallet.namespace,
            partyId: wallet.partyId,
            externalTxId: expect.any(String),
        })
        if (signResult.status !== 'signed') throw new Error('not signed')
        const { signature, externalTxId } = signResult
        expect(
            verifySignedTxHash(
                preparedTransactionHash,
                keyPair.publicKey,
                signature
            )
        ).toBe(true)
        const signedTx = await store.getTransaction(pendingTransaction.id)
        expect(signedTx).toMatchObject({ status: 'signed', externalTxId })

        const result = await controller.execute(params)

        expect(result).toEqual(ledgerResult)
        expect(getSigningTransaction).toHaveBeenCalledWith(
            authContext.userId,
            externalTxId
        )
        expect(postWithRetry).toHaveBeenCalledWith(
            '/v2/interactive-submission/executeAndWait',
            {
                userId: authContext.userId,
                preparedTransaction: pendingTransaction.preparedTransaction,
                hashingSchemeVersion: 'HASHING_SCHEME_VERSION_V3',
                submissionId: expect.any(String),
                deduplicationPeriod: { Empty: {} },
                partySignatures: {
                    signatures: [
                        {
                            party: wallet.partyId,
                            signatures: [
                                {
                                    signature,
                                    signedBy: wallet.namespace,
                                    format: 'SIGNATURE_FORMAT_CONCAT',
                                    signingAlgorithmSpec:
                                        'SIGNING_ALGORITHM_SPEC_ED25519',
                                },
                            ],
                        },
                    ],
                },
            },
            expect.objectContaining({
                retries: 20,
                delayMs: 3000,
                cantonErrorKeys: expect.arrayContaining([
                    'SEQUENCER_BACKPRESSURE',
                    'SUBMISSION_ALREADY_IN_FLIGHT',
                ]),
            })
        )
        expect(await store.getTransaction(pendingTransaction.id)).toMatchObject(
            { status: 'executed', payload: ledgerResult, externalTxId }
        )

        expect(txChangedEvents(sessionSink)).toEqual([
            expect.objectContaining({
                id: pendingTransaction.id,
                commandId: pendingTransaction.commandId,
                origin: pendingTransaction.origin,
                createdAt: pendingTransaction.createdAt,
                status: 'signed',
                signedAt: expect.any(Date),
                externalTxId,
                payload: {
                    signature,
                    signedBy: wallet.namespace,
                    party: wallet.partyId,
                },
            }),
            expect.objectContaining({
                id: pendingTransaction.id,
                commandId: pendingTransaction.commandId,
                origin: pendingTransaction.origin,
                createdAt: pendingTransaction.createdAt,
                signedAt: signedTx!.signedAt,
                status: 'executed',
                payload: ledgerResult,
            }),
        ])
        expect(otherSessionSink.send).not.toHaveBeenCalled()
    })

    it('executes transactions signed concurrently', async () => {
        const secondTransaction: Transaction = {
            ...pendingTransaction,
            id: 'tx-2',
            commandId: 'cmd-2',
            preparedTransaction: 'prepared-tx-2',
            preparedTransactionHash: btoa('i'.repeat(32)),
        }
        await store.setTransaction({ ...secondTransaction })
        const secondParams = { ...params, transactionId: secondTransaction.id }

        const signResults = await Promise.all([
            controller.sign(params),
            controller.sign(secondParams),
        ])

        const externalTxIds = signResults.map((result) =>
            result.status === 'signed' ? result.externalTxId : undefined
        )
        expect(new Set(externalTxIds).size).toBe(2)
        for (const externalTxId of externalTxIds) {
            expect(
                await signingStore.getSigningTransaction(
                    authContext.userId,
                    externalTxId!
                )
            ).toMatchObject({ id: externalTxId, status: 'signed' })
        }

        await expect(controller.execute(params)).resolves.toEqual(ledgerResult)
        await expect(controller.execute(secondParams)).resolves.toEqual(
            ledgerResult
        )

        const requests = postWithRetry.mock.calls as [
            string,
            {
                submissionId: string
                partySignatures: {
                    signatures: [{ signatures: [{ signature: string }] }]
                }
            },
        ][]
        expect(
            requests.map(([, request]) => ({
                submissionId: request.submissionId,
                signature:
                    request.partySignatures.signatures[0].signatures[0]
                        .signature,
            }))
        ).toEqual(
            signResults.map((result) => ({
                submissionId: expect.any(String),
                signature:
                    result.status === 'signed' ? result.signature : undefined,
            }))
        )
        for (const transaction of [pendingTransaction, secondTransaction]) {
            expect(await store.getTransaction(transaction.id)).toMatchObject({
                status: 'executed',
                payload: ledgerResult,
            })
        }
        const events = txChangedEvents(sessionSink).map((event) => {
            const { id, status } = event as Transaction
            return `${id}:${status}`
        })
        expect(events.slice(0, 2).sort()).toEqual([
            'tx-1:signed',
            'tx-2:signed',
        ])
        expect(events.slice(2)).toEqual(['tx-1:executed', 'tx-2:executed'])
        expect(otherSessionSink.send).not.toHaveBeenCalled()
    })

    it('re-signs a legacy signed transaction without a signing transaction ID', async () => {
        await store.setTransactionSigned(pendingTransaction.id, new Date())

        await controller.execute(params)

        const request = postWithRetry.mock.calls[0]![1] as {
            partySignatures: {
                signatures: [{ signatures: [{ signature: string }] }]
            }
        }
        const [{ signature }] = request.partySignatures.signatures[0].signatures
        expect(
            verifySignedTxHash(
                preparedTransactionHash,
                keyPair.publicKey,
                signature
            )
        ).toBe(true)
        expect(txChangedEvents(sessionSink)).toEqual([
            expect.objectContaining({
                id: pendingTransaction.id,
                origin: pendingTransaction.origin,
                status: 'executed',
            }),
        ])
        expect(otherSessionSink.send).not.toHaveBeenCalled()
    })

    it('does not mark a transaction signed after it changed while signing', async () => {
        const setSigningTransaction =
            signingStore.setSigningTransaction.bind(signingStore)
        vi.spyOn(signingStore, 'setSigningTransaction').mockImplementation(
            async (...args) => {
                await store.setTransactionStatus(
                    pendingTransaction.id,
                    'failed'
                )
                return setSigningTransaction(...args)
            }
        )

        await expect(controller.sign(params)).rejects.toThrow(
            'changed to failed while signing'
        )

        expect(await store.getTransaction(pendingTransaction.id)).toMatchObject(
            { status: 'failed' }
        )
        expect(sessionSink.send).not.toHaveBeenCalled()
        expect(otherSessionSink.send).not.toHaveBeenCalled()
    })

    it('records a ledger rejection as a failed transaction', async () => {
        postWithRetry.mockRejectedValue({
            code: 'INVALID_ARGUMENT',
            cause: 'bad signature',
            errorCategory: 8,
            context: {},
        })
        await controller.sign(params)

        await expect(controller.execute(params)).rejects.toThrow(
            'Ledger rejected submission INVALID_ARGUMENT: bad signature'
        )

        expect(await store.getTransaction(pendingTransaction.id)).toMatchObject(
            {
                status: 'failed',
                failureReason: 'INVALID_ARGUMENT: bad signature',
            }
        )
        expect(txChangedEvents(sessionSink)).toEqual([
            expect.objectContaining({ status: 'signed' }),
            expect.objectContaining({
                id: pendingTransaction.id,
                commandId: pendingTransaction.commandId,
                origin: pendingTransaction.origin,
                status: 'failed',
            }),
        ])
        expect(otherSessionSink.send).not.toHaveBeenCalled()
    })

    it('only signs with the wallet-kernel driver', async () => {
        await store.updateWallet({
            partyId: wallet.partyId,
            networkId,
            signingProviderId: SigningProvider.PARTICIPANT,
        })

        await expect(controller.sign(params)).rejects.toThrow(
            `No driver found for ${SigningProvider.PARTICIPANT}`
        )
        expect(sessionSink.send).not.toHaveBeenCalled()
    })
})

describe('userController wallets', () => {
    const password = 'abcde1'
    const origin = 'https://dapp.example'
    const topology = {
        partyId: 'party::topology',
        publicKeyFingerprint: 'topology',
        multiHash: btoa('h'.repeat(32)),
        topologyTransactions: ['tx-1'],
    }
    const createParams = (partyHint: string) => ({
        partyHint,
        signingProviderId: SigningProvider.WALLET_KERNEL,
    })

    let vault: Vault
    let service: NotificationService
    let signingStore: SigningDriverStore
    const newSink = () => ({
        send: vi.fn<(event: string, args: unknown[]) => void>(),
        close: vi.fn(),
    })
    let sink: ReturnType<typeof newSink>
    let generateTopology: ReturnType<typeof vi.spyOn>
    let allocateExternalParty: ReturnType<typeof vi.spyOn>
    let waitForPartyAndGrantUserRights: ReturnType<typeof vi.spyOn>
    let getSynchronizerId: ReturnType<typeof vi.spyOn>

    const inMemoryStore = () => {
        const store = createTestWalletStore(authContext)
        return async () => store
    }
    // The same wiring as startBackground().
    const vaultStore = () => {
        const holder = createWalletStore(vault)
        const authContextStore = fakeAuthContext(authContext)
        return async () => loadAuthedStore(await holder.get(), authContextStore)
    }

    async function setup(getStore: () => Promise<Store>) {
        const controller = userController({
            getStore,
            authContext: fakeAuthContext(authContext),
            signingDriver: new InternalSigningDriver(signingStore),
            notificationService: service,
        })
        const session = await controller.addSession({ origin, networkId })
        subscribeNotifications(
            service,
            { sessionId: session.id, userId: authContext.userId },
            sink
        )
        return controller
    }

    const accountsChangedEvents = () =>
        sink.send.mock.calls
            .filter(([event]) => event === 'accountsChanged')
            .map(([, args]) => (args as unknown[])[0])

    const lockAndUnlock = async () => {
        await vault.lock()
        await vault.unlock(password)
    }

    beforeEach(async () => {
        fakeBrowser.reset()
        vault = createVault({ iterations: 1000 })
        await vault.create(password)
        signingStore = createVaultSigningStore(vault)
        service = new NotificationService({ debug: vi.fn(), error: vi.fn() })
        sink = newSink()

        generateTopology = vi
            .spyOn(LedgerClient.prototype, 'generateTopology')
            .mockResolvedValue(topology)
        allocateExternalParty = vi
            .spyOn(LedgerClient.prototype, 'allocateExternalParty')
            // Each key has its own namespace, so every call gets its own ID.
            .mockImplementation(async (_synchronizerId, _txs, [signature]) => ({
                partyId: `party::${signature!.signedBy}`,
            }))
        waitForPartyAndGrantUserRights = vi
            .spyOn(LedgerClient.prototype, 'waitForPartyAndGrantUserRights')
            .mockResolvedValue(undefined)
        getSynchronizerId = vi
            .spyOn(LedgerClient.prototype, 'getSynchronizerId')
            .mockResolvedValue('ledger-synchronizer')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('creates, signs and stores a party', async () => {
        const controller = await setup(inMemoryStore())

        const { wallet } = await controller.createWallet(createParams('alice'))

        const [key] = await signingStore.listSigningKeys(authContext.userId)
        expect(wallet).toMatchObject({
            hint: 'alice',
            signingProviderId: SigningProvider.WALLET_KERNEL,
            status: 'allocated',
            primary: true,
            publicKey: key!.publicKey,
            networkId,
        })
        const [, , [signature]] = allocateExternalParty.mock.calls[0] as [
            string,
            unknown,
            { signature: string; signedBy: string }[],
        ]
        expect(
            verifySignedTxHash(
                topology.multiHash,
                key!.publicKey,
                signature!.signature
            )
        ).toBe(true)
        expect(signature!.signedBy).toBe(
            await fingerprintPublicKey(key!.publicKey)
        )
        expect(waitForPartyAndGrantUserRights).toHaveBeenCalledWith(
            authContext.userId,
            wallet.partyId
        )
        expect(getSynchronizerId).not.toHaveBeenCalled()
        expect(await controller.listWallets({})).toEqual([wallet])
        expect(accountsChangedEvents()).toEqual([[wallet]])
    })

    it('names the key after keyName, or else after partyHint', async () => {
        const controller = await setup(inMemoryStore())

        await controller.createWallet({
            ...createParams('alice'),
            keyName: 'alice-key',
        })
        await controller.createWallet(createParams('bob'))

        const keys = await signingStore.listSigningKeys(authContext.userId)
        expect(keys.map((key) => key.name).sort()).toEqual(['alice-key', 'bob'])
    })

    it('rejects another signing provider before it creates a key', async () => {
        const controller = await setup(inMemoryStore())

        await expect(
            controller.createWallet({
                partyHint: 'alice',
                signingProviderId: SigningProvider.PARTICIPANT,
            })
        ).rejects.toThrow(
            `Signing provider ${SigningProvider.PARTICIPANT} not supported`
        )

        expect(await signingStore.listSigningKeys(authContext.userId)).toEqual(
            []
        )
        expect(generateTopology).not.toHaveBeenCalled()
    })

    it("falls back to the ledger's synchronizer", async () => {
        const getStore = inMemoryStore()
        const controller = await setup(getStore)
        const store = await getStore()
        const network = await store.getCurrentNetwork()
        await store.updateNetwork({ ...network, synchronizerId: undefined })

        await controller.createWallet(createParams('alice'))

        expect(getSynchronizerId).toHaveBeenCalledTimes(1)
        expect(generateTopology).toHaveBeenCalledWith(
            'ledger-synchronizer',
            expect.any(String),
            'alice'
        )
        expect(allocateExternalParty).toHaveBeenCalledWith(
            'ledger-synchronizer',
            expect.anything(),
            expect.anything()
        )
    })

    it('stores nothing when the allocation fails', async () => {
        const controller = await setup(inMemoryStore())
        allocateExternalParty.mockRejectedValueOnce(
            new Error('allocation failed')
        )

        await expect(
            controller.createWallet(createParams('alice'))
        ).rejects.toThrow('allocation failed')

        expect(await controller.listWallets({})).toEqual([])
        expect(accountsChangedEvents()).toEqual([])
    })

    it('keeps concurrent creations through a reload', async () => {
        const getStore = vaultStore()
        const controller = await setup(getStore)

        const created = await Promise.all([
            controller.createWallet(createParams('alice')),
            controller.createWallet(createParams('bob')),
        ])
        await lockAndUnlock()

        const wallets = await controller.listWallets({})
        expect(wallets.map((wallet) => wallet.hint).sort()).toEqual([
            'alice',
            'bob',
        ])
        expect(wallets.filter((wallet) => wallet.primary)).toHaveLength(1)
        const keys = await signingStore.listSigningKeys(authContext.userId)
        expect(keys.map((key) => key.publicKey).sort()).toEqual(
            created.map(({ wallet }) => wallet.publicKey).sort()
        )
    })

    it('stops before signing when the vault locks during topology', async () => {
        const controller = await setup(vaultStore())
        const pendingTopology = Promise.withResolvers<typeof topology>()
        generateTopology.mockReturnValueOnce(pendingTopology.promise)

        const creating = controller.createWallet(createParams('alice'))
        await vi.waitFor(() => expect(generateTopology).toHaveBeenCalled())
        await lockAndUnlock()
        pendingTopology.resolve(topology)

        await expect(creating).rejects.toBeInstanceOf(VaultLockedError)
        expect(allocateExternalParty).not.toHaveBeenCalled()
        expect(
            await signingStore.listSigningTransactions(authContext.userId)
        ).toEqual([])
        expect(
            await signingStore.listSigningKeys(authContext.userId)
        ).toHaveLength(1)
        expect(await controller.listWallets({})).toEqual([])
    })

    it('stops before allocation when the vault locks during signing', async () => {
        const controller = await setup(vaultStore())
        const getSigningKeyByPublicKey =
            signingStore.getSigningKeyByPublicKey.bind(signingStore)
        const keyRead = Promise.withResolvers<void>()
        const release = Promise.withResolvers<void>()
        vi.spyOn(signingStore, 'getSigningKeyByPublicKey').mockImplementation(
            async (publicKey) => {
                const key = await getSigningKeyByPublicKey(publicKey)
                keyRead.resolve()
                await release.promise
                return key
            }
        )

        const creating = controller.createWallet(createParams('alice'))
        await keyRead.promise
        await lockAndUnlock()
        release.resolve()

        await expect(creating).rejects.toBeInstanceOf(VaultLockedError)
        expect(
            await signingStore.listSigningTransactions(authContext.userId)
        ).toHaveLength(1)
        expect(allocateExternalParty).not.toHaveBeenCalled()
        expect(await controller.listWallets({})).toEqual([])
    })

    it('switches the primary wallet', async () => {
        const controller = await setup(inMemoryStore())
        const { wallet: first } = await controller.createWallet(
            createParams('alice')
        )
        const { wallet: second } = await controller.createWallet(
            createParams('bob')
        )
        sink.send.mockClear()

        await expect(
            controller.setPrimaryWallet({ partyId: second.partyId })
        ).resolves.toBeNull()

        const wallets = await controller.listWallets({})
        expect(
            wallets.map(({ partyId, primary }) => ({ partyId, primary }))
        ).toEqual([
            { partyId: first.partyId, primary: false },
            { partyId: second.partyId, primary: true },
        ])
        expect(accountsChangedEvents()).toEqual([wallets])
    })
})
