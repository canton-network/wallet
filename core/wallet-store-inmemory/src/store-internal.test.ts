// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, test } from 'vitest'

import { StoreInternal, StoreInternalConfig } from './store-internal'
import {
    Wallet,
    Session,
    Store,
    LedgerApi,
    Network,
    Transaction,
    MessageRaw,
    UserLevelRight,
    PartyLevelRight,
    ApiKey,
} from '@canton-network/core-wallet-store'
import {
    AuthContext,
    AuthorizationCodeAuth,
    Idp,
} from '@canton-network/core-wallet-auth'
import { pino, Logger } from 'pino'

const authContextMock: AuthContext = {
    userId: 'test-user-id',
    accessToken: 'test-access-token',
}

const oauthIdp = (): Idp => ({
    id: 'idp1',
    type: 'oauth',
    issuer: 'http://auth',
    configUrl: 'http://auth/.well-known/openid-configuration',
})

const baseNetwork = (id = 'network1'): Network => ({
    id,
    name: `net-${id}`,
    synchronizerId: 'sync1::fingerprint',
    description: 'Test Network',
    identityProviderId: 'idp1',
    ledgerApi: { baseUrl: 'http://api' },
    auth: {
        method: 'authorization_code',
        clientId: 'cid',
        scope: 'scope',
        audience: 'aud',
    },
})

const baseWallet = (
    partyId: string,
    networkId = 'network1',
    overrides: Partial<Wallet> = {}
): Wallet => ({
    primary: false,
    partyId,
    status: 'allocated',
    hint: partyId,
    signingProviderId: 'internal',
    publicKey: 'publicKey',
    namespace: 'namespace',
    rights: [PartyLevelRight.CanActAs],
    networkId,
    ...overrides,
})

type StoreCtor = new (
    config: StoreInternalConfig,
    logger: Logger,
    authContext?: AuthContext,
    userStorage?: Map<string, ReturnType<typeof StoreInternal.createStorage>>
) => Store

const implementations: Array<[string, StoreCtor]> = [
    ['StoreInternal', StoreInternal],
]

implementations.forEach(([name, StoreImpl]) => {
    describe(name, () => {
        let store: Store

        beforeEach(() => {
            // Create a fresh config for each test to avoid shared state between tests
            const storeConfig: StoreInternalConfig = {
                idps: [],
                networks: [],
            }
            store = new StoreImpl(
                storeConfig,
                pino({ level: 'silent' }),
                authContextMock
            )
        })

        test('should add and retrieve wallets', async () => {
            const idp: Idp = {
                id: 'idp1',
                type: 'oauth' as const,
                issuer: 'http://auth',
                configUrl: 'http://auth/.well-known/openid-configuration',
            }
            const network: Network = {
                id: 'network1',
                name: 'testnet',
                synchronizerId: 'sync1::fingerprint',
                description: 'Test Network',
                identityProviderId: 'idp1',
                ledgerApi: { baseUrl: 'http://api' },
                auth: {
                    method: 'authorization_code',
                    clientId: 'cid',
                    scope: 'scope',
                    audience: 'aud',
                },
            }
            const session: Session = {
                id: 'session1',
                network: 'network1',
                accessToken: 'token',
            }
            await store.addIdp(idp)
            await store.addNetwork(network)
            await store.setSession(session)

            const wallet: Wallet = {
                primary: false,
                partyId: 'party1',
                status: 'allocated',
                hint: 'hint',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            await store.addWallet(wallet)
            const wallets = await store.getWallets()
            expect(wallets).toHaveLength(1)
        })

        test('should filter wallets', async () => {
            const idp: Idp = {
                id: 'idp1',
                type: 'oauth' as const,
                issuer: 'http://auth',
                configUrl: 'http://auth/.well-known/openid-configuration',
            }
            const network1: Network = {
                id: 'network1',
                name: 'testnet-1',
                synchronizerId: 'sync1::fingerprint',
                description: 'Test Network 1',
                identityProviderId: 'idp1',
                ledgerApi: { baseUrl: 'http://api' },
                auth: {
                    method: 'authorization_code',
                    clientId: 'cid',
                    scope: 'scope',
                    audience: 'aud',
                },
            }
            const network2: Network = {
                id: 'network2',
                name: 'testnet-2',
                synchronizerId: 'sync2::fingerprint',
                description: 'Test Network 2',
                identityProviderId: 'idp1',
                ledgerApi: { baseUrl: 'http://api' },
                auth: {
                    method: 'authorization_code',
                    clientId: 'cid',
                    scope: 'scope',
                    audience: 'aud',
                },
            }
            const session: Session = {
                id: 'session1',
                network: 'network1',
                accessToken: 'token',
            }
            await store.addIdp(idp)
            await store.addNetwork(network1)
            await store.addNetwork(network2)
            await store.setSession(session)

            const wallet1: Wallet = {
                primary: false,
                partyId: 'party1',
                status: 'allocated',
                hint: 'hint1',
                signingProviderId: 'internal1',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet2: Wallet = {
                primary: false,
                partyId: 'party2',
                status: 'allocated',
                hint: 'hint2',
                signingProviderId: 'internal2',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet3: Wallet = {
                primary: false,
                partyId: 'party3',
                status: 'allocated',
                hint: 'hint3',
                signingProviderId: 'internal2',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network2',
                rights: [PartyLevelRight.CanActAs],
            }
            await store.addWallet(wallet1)
            await store.addWallet(wallet2)
            await store.addWallet(wallet3)

            const getAllWallets = await store.getWallets()
            const getAllWalletsAcrossNetworks = await store.getAllWallets({
                networkIds: ['network1', 'network2'],
            })
            const getWalletsByNetworkId = await store.getAllWallets({
                networkIds: ['network1'],
            })
            const getWalletsBySigningProviderId = await store.getAllWallets({
                signingProviderIds: ['internal2'],
            })
            const getWalletsByNetworkIdAndSigningProviderId =
                await store.getAllWallets({
                    networkIds: ['network1'],
                    signingProviderIds: ['internal2'],
                })

            expect(getAllWallets).toHaveLength(2)
            expect(getAllWalletsAcrossNetworks).toHaveLength(3)
            expect(getWalletsByNetworkId).toHaveLength(2)
            expect(getWalletsBySigningProviderId).toHaveLength(2)
            expect(getWalletsByNetworkIdAndSigningProviderId).toHaveLength(1)
        })

        test('should set and get primary wallet', async () => {
            const idp: Idp = {
                id: 'idp1',
                type: 'oauth' as const,
                issuer: 'http://auth',
                configUrl: 'http://auth/.well-known/openid-configuration',
            }
            const ledgerApi: LedgerApi = {
                baseUrl: 'http://api',
            }
            const auth: AuthorizationCodeAuth = {
                method: 'authorization_code',
                clientId: 'cid',
                scope: 'scope',
                audience: 'aud',
            }
            const network: Network = {
                id: 'network1',
                name: 'testnet',
                synchronizerId: 'sync1::fingerprint',
                description: 'Test Network',
                identityProviderId: 'idp1',
                ledgerApi,
                auth,
            }
            const wallet1: Wallet = {
                primary: false,
                partyId: 'party1',
                status: 'allocated',
                hint: 'hint1',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet2: Wallet = {
                primary: false,
                partyId: 'party2',
                status: 'allocated',
                hint: 'hint2',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const session: Session = {
                id: 'sess-123',
                network: 'network1',
                accessToken: 'token',
            }
            await store.addIdp(idp)
            await store.addNetwork(network)
            await store.setSession(session)
            await store.addWallet(wallet1)
            await store.addWallet(wallet2)
            await store.setPrimaryWallet('party2')
            const primary = await store.getPrimaryWallet()
            expect(primary?.partyId).toBe('party2')
            expect(primary?.primary).toBe(true)
        })

        test('should set and get session', async () => {
            const session: Session = {
                id: 'sess-123',
                network: 'net',
                accessToken: 'token',
            }
            await store.setSession(session)
            const result = await store.getSession()
            expect(result).toEqual(session)
            await store.removeSession()
            const removed = await store.getSession()
            expect(removed).toBeUndefined()
        })

        test('should add, list, get, update, and remove networks', async () => {
            const idp: Idp = {
                id: 'idp1',
                type: 'oauth' as const,
                issuer: 'http://auth',
                configUrl: 'http://auth/.well-known/openid-configuration',
            }
            const ledgerApi: LedgerApi = {
                baseUrl: 'http://api',
            }
            const auth: AuthorizationCodeAuth = {
                method: 'authorization_code',
                clientId: 'cid',
                scope: 'scope',
                audience: 'aud',
            }
            const network: Network = {
                id: 'network1',
                name: 'testnet',
                synchronizerId: 'sync1::fingerprint',
                description: 'Test Network',
                identityProviderId: 'idp1',
                ledgerApi,
                auth,
            }
            await store.addIdp(idp)
            await store.addNetwork(network)
            const listed = await store.listNetworks()
            expect(listed).toHaveLength(1)
            expect(listed[0].name).toBe('testnet')

            store.updateNetwork({ ...network, name: 'testnet-updated' })

            const fetched = await store.getNetwork('network1')
            expect(fetched.name).toBe('testnet-updated')

            await store.removeNetwork('network1')
            const afterRemove = await store.listNetworks()
            expect(afterRemove).toHaveLength(0)
        })

        test('should throw when getting a non-existent network', async () => {
            await expect(store.getNetwork('doesnotexist')).rejects.toThrow()
        })

        test('should throw when getting current network if none set', async () => {
            await expect(store.getCurrentNetwork()).rejects.toThrow()
        })

        test('should allow same party ID across different networks', async () => {
            const idp: Idp = {
                id: 'idp1',
                type: 'oauth' as const,
                issuer: 'http://auth',
                configUrl: 'http://auth/.well-known/openid-configuration',
            }
            const network1: Network = {
                id: 'network1',
                name: 'testnet-1',
                synchronizerId: 'sync1::fingerprint',
                description: 'Test Network 1',
                identityProviderId: 'idp1',
                ledgerApi: { baseUrl: 'http://api' },
                auth: {
                    method: 'authorization_code',
                    clientId: 'cid',
                    scope: 'scope',
                    audience: 'aud',
                },
            }
            const network2: Network = {
                id: 'network2',
                name: 'testnet-2',
                synchronizerId: 'sync2::fingerprint',
                description: 'Test Network 2',
                identityProviderId: 'idp1',
                ledgerApi: { baseUrl: 'http://api' },
                auth: {
                    method: 'authorization_code',
                    clientId: 'cid',
                    scope: 'scope',
                    audience: 'aud',
                },
            }
            const session: Session = {
                id: 'session1',
                network: 'network1',
                accessToken: 'token',
            }
            await store.addIdp(idp)
            await store.addNetwork(network1)
            await store.addNetwork(network2)
            await store.setSession(session)

            const wallet1: Wallet = {
                primary: false,
                partyId: 'party1::namespace',
                status: 'allocated',
                hint: 'party1',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet2: Wallet = {
                primary: false,
                partyId: 'party1::namespace', // Same party ID
                status: 'allocated',
                hint: 'party1',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network2', // Different network
                rights: [PartyLevelRight.CanActAs],
            }
            await store.addWallet(wallet1)
            await store.addWallet(wallet2) // Should not throw

            const wallets = await store.getWallets()
            expect(wallets).toHaveLength(1)
            const allWallets = await store.getAllWallets({
                networkIds: ['network1', 'network2'],
            })
            expect(allWallets).toHaveLength(2)
            expect(
                allWallets.filter((w) => w.partyId === 'party1::namespace')
            ).toHaveLength(2)
        })

        test('should have separate primary wallets per network', async () => {
            const idp: Idp = {
                id: 'idp1',
                type: 'oauth' as const,
                issuer: 'http://auth',
                configUrl: 'http://auth/.well-known/openid-configuration',
            }
            const ledgerApi: LedgerApi = {
                baseUrl: 'http://api',
            }
            const auth: AuthorizationCodeAuth = {
                method: 'authorization_code',
                clientId: 'cid',
                scope: 'scope',
                audience: 'aud',
            }
            const network1: Network = {
                id: 'network1',
                name: 'testnet-1',
                synchronizerId: 'sync1::fingerprint',
                description: 'Test Network 1',
                identityProviderId: 'idp1',
                ledgerApi,
                auth,
            }
            const network2: Network = {
                id: 'network2',
                name: 'testnet-2',
                synchronizerId: 'sync2::fingerprint',
                description: 'Test Network 2',
                identityProviderId: 'idp1',
                ledgerApi,
                auth,
            }
            await store.addIdp(idp)
            const wallet1: Wallet = {
                primary: false,
                partyId: 'party1',
                status: 'allocated',
                hint: 'hint1',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet2: Wallet = {
                primary: false,
                partyId: 'party2',
                status: 'allocated',
                hint: 'hint2',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network1',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet3: Wallet = {
                primary: false,
                partyId: 'party3',
                status: 'allocated',
                hint: 'hint3',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network2',
                rights: [PartyLevelRight.CanActAs],
            }
            const wallet4: Wallet = {
                primary: false,
                partyId: 'party4',
                status: 'allocated',
                hint: 'hint4',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                networkId: 'network2',
                rights: [PartyLevelRight.CanActAs],
            }

            await store.addNetwork(network1)
            await store.addNetwork(network2)

            const session1: Session = {
                id: 'sess-1',
                network: 'network1',
                accessToken: 'token',
            }
            await store.setSession(session1)
            await store.addWallet(wallet1)
            await store.addWallet(wallet2)
            await store.setPrimaryWallet('party2')
            const primary1 = await store.getPrimaryWallet()
            expect(primary1?.partyId).toBe('party2')
            expect(primary1?.networkId).toBe('network1')

            const session2: Session = {
                id: 'sess-2',
                network: 'network2',
                accessToken: 'token',
            }
            await store.setSession(session2)
            await store.addWallet(wallet3)
            await store.addWallet(wallet4)
            await store.setPrimaryWallet('party4')
            const primary2 = await store.getPrimaryWallet()
            expect(primary2?.partyId).toBe('party4')
            expect(primary2?.networkId).toBe('network2')

            // Verify network1 still has party2 as primary
            await store.setSession(session1)
            const primary1Again = await store.getPrimaryWallet()
            expect(primary1Again?.partyId).toBe('party2')
            expect(primary1Again?.networkId).toBe('network1')
        })

        test('addWallet should allow insert when same party exists on different network', async () => {
            const wallet1: Wallet = {
                primary: false,
                partyId: 'party1::namespace',
                status: 'allocated',
                hint: 'party1',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                rights: [PartyLevelRight.CanActAs],
                networkId: 'network1',
            }
            const wallet2: Wallet = {
                primary: false,
                partyId: 'party1::namespace', // Same party ID
                status: 'allocated',
                hint: 'party1',
                signingProviderId: 'internal',
                publicKey: 'publicKey',
                namespace: 'namespace',
                rights: [PartyLevelRight.CanActAs],
                networkId: 'network2', // Different network
            }

            // Set session for network1
            const session1: Session = {
                id: 'sess-1',
                network: 'network1',
                accessToken: 'token',
            }
            await store.setSession(session1)
            await store.addWallet(wallet1)

            // Switch to network2 and add same party
            const session2: Session = {
                id: 'sess-2',
                network: 'network2',
                accessToken: 'token',
            }
            await store.setSession(session2)
            await store.addWallet(wallet2) // Should not throw, should create new entry

            const wallets = await store.getAllWallets({
                networkIds: ['network1', 'network2'],
            })
            expect(wallets).toHaveLength(2)
            expect(
                wallets.filter((w) => w.partyId === 'party1::namespace')
            ).toHaveLength(2)
            expect(
                wallets.find((w) => w.networkId === 'network1')?.partyId
            ).toBe('party1::namespace')
            expect(
                wallets.find((w) => w.networkId === 'network2')?.partyId
            ).toBe('party1::namespace')
        })

        test('should allow duplicate commandIds and update by transaction id', async () => {
            const initial: Transaction = {
                id: 'tx-immutable-1',
                commandId: 'cmd-immutable',
                status: 'pending',
                preparedTransaction: 'prepared-1',
                preparedTransactionHash: 'hash-1',
                payload: { amount: 100 },
                origin: 'https://safe.example',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            }

            await store.setTransaction(initial)

            await store.setTransaction({
                ...initial,
                id: 'tx-immutable-2',
            })

            await store.setTransactionSigned(
                initial.id,
                new Date('2026-01-01T00:01:00.000Z')
            )
            await store.setTransactionStatus(initial.id, 'executed', {
                payload: { result: 'ok' },
            })

            const persisted = await store.getTransaction(initial.id)
            expect(persisted?.preparedTransaction).toBe('prepared-1')
            expect(persisted?.preparedTransactionHash).toBe('hash-1')
            expect(persisted?.payload).toEqual({ result: 'ok' })
            expect(persisted?.origin).toBe('https://safe.example')
            expect(persisted?.status).toBe('executed')
            expect(persisted?.signedAt).toEqual(
                new Date('2026-01-01T00:01:00.000Z')
            )

            const duplicates = await store.listTransactions()
            expect(
                duplicates.filter((tx) => tx.commandId === initial.commandId)
            ).toHaveLength(2)
        })

        test('should manage idps', async () => {
            const idp = oauthIdp()
            await store.addIdp(idp)
            expect(await store.getIdp('idp1')).toEqual(idp)
            await store.updateIdp({ ...idp, issuer: 'http://updated' })
            expect((await store.listIdps())[0]?.issuer).toBe('http://updated')
            await expect(store.addIdp(idp)).rejects.toThrow(
                'IdP "idp1" already exists'
            )
            await expect(
                store.updateIdp({ ...idp, id: 'missing' })
            ).rejects.toThrow('IdP "missing" not found')
            await store.removeIdp('idp1')
            await expect(store.getIdp('idp1')).rejects.toThrow(
                'IdP "idp1" not found'
            )
        })

        test('should reject duplicate wallet and unknown primary wallet', async () => {
            await store.addIdp(oauthIdp())
            await store.addNetwork(baseNetwork())
            await store.setSession({
                id: 'session1',
                network: 'network1',
                accessToken: 'token',
            })
            const wallet = baseWallet('party1')
            await store.addWallet(wallet)
            await expect(store.addWallet(wallet)).rejects.toThrow(
                'already exists'
            )
            await expect(
                store.setPrimaryWallet('missing-party')
            ).rejects.toThrow(
                'Wallet with partyId "missing-party" not found in network "network1"'
            )
        })

        test('should manage user-level rights per network', async () => {
            await store.addIdp(oauthIdp())
            await store.addNetwork(baseNetwork())
            await store.setSession({
                id: 'session1',
                network: 'network1',
                accessToken: 'token',
            })

            await store.setUserRights('network1', [
                UserLevelRight.CanReadAsAnyParty,
            ])
            expect(await store.getUserRights()).toEqual([
                UserLevelRight.CanReadAsAnyParty,
            ])
            await store.setUserRights('network1', [])
            expect(await store.getUserRights()).toEqual([])
        })

        test('should manage transactions including lookup and removal', async () => {
            const tx: Transaction = {
                id: 'tx-1',
                commandId: 'cmd-a',
                status: 'pending',
                preparedTransaction: 'p',
                preparedTransactionHash: 'h',
                createdAt: new Date('2026-01-02T00:00:00.000Z'),
                origin: 'https://example',
            }
            const older: Transaction = {
                id: 'tx-0',
                commandId: 'cmd-a',
                status: 'pending',
                preparedTransaction: 'p0',
                preparedTransactionHash: 'h0',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                origin: 'https://example',
            }

            await store.setTransaction(older)
            await store.setTransaction(tx)

            expect(
                await store.getLatestTransactionByCommandId('cmd-a')
            ).toEqual(tx)

            await store.setTransactionSigned(
                'tx-1',
                new Date('2026-01-03T00:00:00.000Z'),
                'ext-1'
            )
            expect((await store.getTransaction('tx-1'))?.externalTxId).toBe(
                'ext-1'
            )

            await expect(
                store.setTransactionStatus('missing', 'signed')
            ).rejects.toThrow('Transaction not found')

            await store.removeTransaction('tx-0')
            expect(await store.listTransactions()).toHaveLength(1)
        })

        test('should manage message signing requests', async () => {
            const message: MessageRaw = {
                id: 'msg-1',
                status: 'pending',
                userId: authContextMock.userId,
                partyId: 'party1',
                publicKey: 'pk',
                message: 'hello',
                origin: 'https://app.example',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            }

            await store.setMessageRaw(message)
            await store.setMessageRawStatus('msg-1', 'signed', {
                signature: 'sig',
                signedAt: new Date('2026-01-01T00:01:00.000Z'),
            })

            const stored = await store.getMessageRaw('msg-1')
            expect(stored?.status).toBe('signed')
            expect(stored?.signature).toBe('sig')
            expect(await store.listMessageRaws()).toHaveLength(1)

            await expect(
                store.setMessageRaw({ ...message, userId: 'other-user' })
            ).rejects.toThrow('userId mismatch')

            await expect(
                store.setMessageRawStatus('missing', 'failed')
            ).rejects.toThrow('MessageRaw not found')

            await store.removeMessageRaw('msg-1')
            expect(await store.listMessageRaws()).toHaveLength(0)
        })

        test('should manage api keys', async () => {
            await store.addNetwork(baseNetwork())
            await store.setSession({
                id: 'session1',
                network: 'network1',
                accessToken: 'token',
            })

            const keys = await store.listApiKeys()
            expect(keys).toHaveLength(0)

            const apiKey: ApiKey = {
                id: 'api-key-1',
                digest: 'digest-1',
                name: 'API Key 1',
                userId: 'test-user-id',
                email: 'user1@example.com',
                networkId: 'network1',
                createdAt: new Date('2026-05-08T13:00:00.000Z'),
            }

            await store.addApiKey(apiKey)

            expect(await store.listApiKeys()).toHaveLength(1)

            await store.removeApiKey('api-key-1')
            expect(await store.listApiKeys()).toHaveLength(0)

            // removing a non-existent key should not throw
            expect(store.removeApiKey('non-existent')).resolves.toBeUndefined()
        })

        test('addApiKey should error with wrong userId or networkId', async () => {
            await store.addNetwork(baseNetwork())
            await store.setSession({
                id: 'session1',
                network: 'network2',
                accessToken: 'token',
            })

            const apiKey: ApiKey = {
                id: 'api-key-1',
                digest: 'digest-1',
                name: 'API Key 1',
                userId: 'test-user-id',
                email: 'user1@example.com',
                networkId: 'network1',
                createdAt: new Date('2026-05-08T13:00:00.000Z'),
            }

            expect(store.addApiKey(apiKey)).rejects.toThrow(
                'Network "network2" not found'
            )

            const newstore = (store as StoreInternal).withAuthContext({
                userId: 'other-user-id',
                accessToken: 'token',
            })

            expect(
                newstore.addApiKey({ ...apiKey, networkId: 'network2' })
            ).rejects.toThrow(
                'ApiKey userId mismatch: expected other-user-id, got test-user-id'
            )
        })
    })
})
