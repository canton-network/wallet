// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BitGoHandler } from './bitgo.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const WALLET_ID = 'test-wallet-id-aabbcc'
const TX_REQUEST_ID = 'aaaabbbb-cccc-dddd-eeee-ffffffffffff'
const ENTERPRISE_ID = 'test-enterprise-id'
const ACCESS_TOKEN = 'v2xtest-access-token'
const KEYCHAIN_ID = 'test-keychain-id-aabb'

// Real commonKeychain from a BitGo TSS Canton wallet (128 hex chars = 64 bytes).
// First 32 bytes: Ed25519 public key (little-endian); last 32 bytes: chain code (big-endian).
const COMMON_KEYCHAIN =
    '39970e7108c78fc37a3bec66931858dacd6cd98c0aa3944d0908970e2f3d53f9badc25dbc3d45ee50502d03b93e15a5fb4cd6d0dda9c064036c29c69dbf4f14f'

// Derived Ed25519 public key at m/0 (base64).
// Hex: c730e4dca781f4751783b92dd603dd10987324ceef1729ea02dacbade5ad0df6
const DERIVED_PUBLIC_KEY = 'xzDk3KeB9HUXg7kt1gPdEJhzJM7vFynqAtrLreWtDfY='

// Real txHash from a wallet initialization (topology signing), hex-decoded to JSON.
const TOPOLOGY_SIGNED_MSG = {
    type: 'CANTON_SIGN_TOPOLOGY',
    payload: 'EiAKfHeA63Yjn7upDMhH3DX+nd3UJUX2uC9AoOm+PnUHGQ==',
    serializedSignatures: [
        {
            publicKey:
                'c730e4dca781f4751783b92dd603dd10987324ceef1729ea02dacbade5ad0df6',
            signature:
                'g4xOU4vuN8sTcjyXt2kL1qMKSgflrUoiwqCMnleMaNhPRP/b7ed+03j0ZcSY1lM0+vX2mfqc4I4uk1hv3kI1AA==',
        },
    ],
    signers: [
        '12206::122066c3b0ed7e4879579d53a0f04cabf54895fc4b410877adf88e61b68999b6e38d',
    ],
    metadata: { encoding: 'utf8' },
    signablePayload: 'EiAKfHeA63Yjn7upDMhH3DX+nd3UJUX2uC9AoOm+PnUHGQ==',
}
const TX_HASH_HEX = Buffer.from(JSON.stringify(TOPOLOGY_SIGNED_MSG)).toString('hex')

// Real txHash from a regular Canton transaction signing.
const TRANSACTION_SIGNED_MSG = {
    type: 'CANTON_SIGN_TRANSACTION',
    payload: 'pX5rTNQvME38LP6ZpzqhGKiv2Q/UBD+xeYiPxcEJeoM=',
    serializedSignatures: [
        {
            publicKey:
                'c730e4dca781f4751783b92dd603dd10987324ceef1729ea02dacbade5ad0df6',
            signature:
                'RCS+Qh5w9VHk6Ih14jYTBcTB30RG5arj3ZmUr8mSTO7N6+zNPrJdXHUL13zE3LGfVDqvLEI76PKOczC5EL3OAw==',
        },
    ],
    signers: [
        '12206::122066c3b0ed7e4879579d53a0f04cabf54895fc4b410877adf88e61b68999b6e38d',
    ],
    metadata: { encoding: 'utf8' },
    signablePayload: 'pX5rTNQvME38LP6ZpzqhGKiv2Q/UBD+xeYiPxcEJeoM=',
}

// Real preparedTransaction (tx param) values from BitGo signing requests.
// Topology tx: base64(JSON.stringify([topology_tx_proto_string])) — JSON array of proto-encoded topology transactions.
const TOPOLOGY_TX =
    'WyJDdmtCQ0FFUUFScnlBVXJ2QVFwTE1USXlNRFk2T2pFeU1qQTJObU16WWpCbFpEZGxORGczT1RVM09XUTFNMkV3WmpBMFkyRmlaalUwT0RrMVptTTBZalF4TURnM04yRmtaamc0WlRZeFlqWTRPVGs1WWpabE16aGtFQUVhWVFwZGRtRnNhV1JoZEc5eUxXSnBkR2d2ZEdWemRHNWxkRG82T2pFeU1qQTJPRFF5TmpBeE56Z3dabVJrWldZME5qZGlZV1poTW1Vd05UQmpZV0U1T1RJellUUmtNamxpWm1Nek5EVTBZemMzTVRaaE56QXdaV1U1TWpGbFpqQmpFQUl5T3dvM0VBUWFMREFxTUFVR0F5dGxjQU1oQU1jdzVOeW5nZlIxRjRPNUxkWUQzUkNZY3lUTzd4Y3A2Z0xheTYzbHJRMzJLZ01CQlFRd0FSQUJFQjQ5Il0='
// Transaction tx: base64-encoded proto binary PreparedTransaction (not valid JSON).
const TRANSACTION_TX =
    'CrYHCgMyLjESATAahwcKATDCPoAHCv0GCgMyLjESQjAwNmVlMWI3MDg4OGI1Y2E3ODZiZDU4MTc2OGMwOGYyMTA2Yjc0MzU1MGU5MDM1YTNlNmNmNTI4NGJhYjJkMTUxORoNc3BsaWNlLXdhbGxldCKCAQpAZjc5OWE1OGZhNTNkZmU0OGJhZTUyYmQ1ZGJjYzJiNTc4YTdkNGRmZWUzYWUzZjRlYjc2MzVmZTlhOGNjNjdkMxIhU3BsaWNlLldhbGxldC5UcmFuc2ZlclByZWFwcHJvdmFsGhtUcmFuc2ZlclByZWFwcHJvdmFsUHJvcG9zYWwqqgNypwMKggEKQGY3OTlhNThmYTUzZGZlNDhiYWU1MmJkNWRiY2MyYjU3OGE3ZDRkZmVlM2FlM2Y0ZWI3NjM1ZmU5YThjYzY3ZDMSIVNwbGljZS5XYWxsZXQuVHJhbnNmZXJQcmVhcHByb3ZhbBobVHJhbnNmZXJQcmVhcHByb3ZhbFByb3Bvc2FsElkKCHJlY2VpdmVyEk06SzEyMjA2OjoxMjIwNjZjM2IwZWQ3ZTQ4Nzk1NzlkNTNhMGYwNGNhYmY1NDg5NWZjNGI0MTA4NzdhZGY4OGU2MWI2ODk5OWI2ZTM4ZBJlCghwcm92aWRlchJZOldiaXRnby12YWxpZGF0b3ItMTo6MTIyMDY4NDI2MDE3ODBmZGRlZjQ2N2JhZmEyZTA1MGNhYTk5MjNhNGQyOWJmYzM0NTRjNzcxNmE3MDBlZTkyMWVmMGMSXgoLZXhwZWN0ZWREc28ST1JNCks6SURTTzo6MTIyMGYyMmE4YjhmMmQ4MTNjMjViOWE2ODRkYzRkZDUyYjUzMmEwMTc0ZDhlNzNhMTNjZGYyYmFhYmZmZjc1MTgzMzcySzEyMjA2OjoxMjIwNjZjM2IwZWQ3ZTQ4Nzk1NzlkNTNhMGYwNGNhYmY1NDg5NWZjNGI0MTA4NzdhZGY4OGU2MWI2ODk5OWI2ZTM4ZDpLMTIyMDY6OjEyMjA2NmMzYjBlZDdlNDg3OTU3OWQ1M2EwZjA0Y2FiZjU0ODk1ZmM0YjQxMDg3N2FkZjg4ZTYxYjY4OTk5YjZlMzhkOldiaXRnby12YWxpZGF0b3ItMTo6MTIyMDY4NDI2MDE3ODBmZGRlZjQ2N2JhZmEyZTA1MGNhYTk5MjNhNGQyOWJmYzM0NTRjNzcxNmE3MDBlZTkyMWVmMGMiIhIgiZHCTklv38y4B+If2FRvOAU3toMMkJ1HiW+9+4NLeKQSoAISkwEKSzEyMjA2OjoxMjIwNjZjM2IwZWQ3ZTQ4Nzk1NzlkNTNhMGYwNGNhYmY1NDg5NWZjNGI0MTA4NzdhZGY4OGU2MWI2ODk5OWI2ZTM4ZBJEMTIyMDY2YzNiMGVkN2U0ODc5NTc5ZDUzYTBmMDRjYWJmNTQ4OTVmYzRiNDEwODc3YWRmODhlNjFiNjg5OTliNmUzOGQaWWdsb2JhbC1kb21haW46OjEyMjBmMjJhOGI4ZjJkODEzYzI1YjlhNjg0ZGM0ZGQ1MmI1MzJhMDE3NGQ4ZTczYTEzY2RmMmJhYWJmZmY3NTE4MzM3OjozNS0yKiQzNGM5YzhmYi03NjJmLTQ4MjEtYWMzMy1mYWI3NWZkNWNkOWIwktLKp63ZlQM='

const BASE_TX_REQUEST = {
    txRequestId: TX_REQUEST_ID,
    walletId: WALLET_ID,
    state: 'delivered',
    messages: [{ state: 'signed', txHash: TX_HASH_HEX }],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockOk(data: unknown): Response {
    return { ok: true, json: () => Promise.resolve(data) } as unknown as Response
}

function createHandler(opts: { enterpriseId?: string; coin?: string } = {}) {
    return new BitGoHandler({
        accessToken: ACCESS_TOKEN,
        baseUrl: 'https://app.bitgo-test.com',
        enterpriseId: 'enterpriseId' in opts ? opts.enterpriseId : ENTERPRISE_ID,
        coin: opts.coin ?? 'tcanton',
    })
}

const keychainMock = () => mockOk({ commonKeychain: COMMON_KEYCHAIN })
const walletMock = (id = WALLET_ID) => mockOk({ id, label: 'key', keys: [KEYCHAIN_ID] })

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('BitGoHandler', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    // ── createKey ──────────────────────────────────────────────────────────

    describe('createKey', () => {
        it('returns key with derived Ed25519 publicKey at m/0', async () => {
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ id: WALLET_ID, label: 'my-key', keys: [KEYCHAIN_ID] })
                )
                .mockResolvedValueOnce(keychainMock())

            const key = await createHandler().createKey('my-key')
            expect(key).toEqual({
                id: WALLET_ID,
                name: 'my-key',
                publicKey: DERIVED_PUBLIC_KEY,
            })
        })

        it('sends custodial TSS wallet creation body with coin and enterprise', async () => {
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ id: WALLET_ID, label: 'test', keys: [KEYCHAIN_ID] })
                )
                .mockResolvedValueOnce(keychainMock())

            await createHandler().createKey('test')

            const [url, opts] = fetchMock.mock.calls[0]
            expect(url).toContain('/api/v2/tcanton/wallet')
            const body = JSON.parse(opts.body)
            expect(body).toMatchObject({
                type: 'custodial',
                multisigType: 'tss',
                enterprise: ENTERPRISE_ID,
            })
        })

        it('fetches keychain using the first key id from the wallet', async () => {
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ id: WALLET_ID, label: 'test', keys: [KEYCHAIN_ID] })
                )
                .mockResolvedValueOnce(keychainMock())

            await createHandler().createKey('test')

            const keychainUrl = fetchMock.mock.calls[1][0] as string
            expect(keychainUrl).toContain(`/api/v2/tcanton/key/${KEYCHAIN_ID}`)
        })

        it('throws immediately when enterpriseId is not configured', async () => {
            await expect(
                createHandler({ enterpriseId: undefined }).createKey('test')
            ).rejects.toThrow('enterpriseId is required')
            expect(fetchMock).not.toHaveBeenCalled()
        })

        it('throws when wallet has no keychain (keys is empty)', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ id: WALLET_ID, label: 'test', keys: [] })
            )

            await expect(createHandler().createKey('test')).rejects.toThrow(
                'no associated keychain'
            )
        })
    })

    // ── signTransaction ────────────────────────────────────────────────────

    describe('signTransaction', () => {
        it('posts to msgrequests and returns txRequestId', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
            )

            const result = await createHandler().signTransaction({
                tx: 'base64tx==',
                txHash: 'base64hash==',
                walletId: WALLET_ID,
                messageStandardType: 'CANTON_SIGN_TOPOLOGY',
            })

            expect(result.txId).toBe(TX_REQUEST_ID)
            const [url, opts] = fetchMock.mock.calls[0]
            expect(url).toContain(`/api/v2/wallet/${WALLET_ID}/msgrequests`)
            const body = JSON.parse(opts.body)
            expect(body.intent.intentType).toBe('signMessage')
            expect(body.intent.messageStandardType).toBe('CANTON_SIGN_TOPOLOGY')
            expect(body.apiVersion).toBe('full')
        })

        it('populates txStore so getTransaction can resolve without enterprise call', async () => {
            const handler = createHandler()
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
                )
                .mockResolvedValueOnce(
                    mockOk({
                        txRequests: [{ ...BASE_TX_REQUEST, state: 'pendingDelivery', messages: [] }],
                    })
                )

            await handler.signTransaction({
                tx: 'tx',
                txHash: 'hash',
                walletId: WALLET_ID,
                messageStandardType: 'CANTON_SIGN_TOPOLOGY',
            })
            const tx = await handler.getTransaction(TX_REQUEST_ID)

            // Should have used wallet-scoped endpoint (txStore path), not enterprise endpoint
            const usedUrls = fetchMock.mock.calls.map(([url]) => url as string)
            expect(usedUrls[1]).toContain(`/api/v2/wallet/${WALLET_ID}/txrequests`)
            expect(usedUrls[1]).not.toContain('/enterprise/')
            expect(tx?.txId).toBe(TX_REQUEST_ID)
        })

        it('detects topology payload when messageStandardType is omitted (real topology tx)', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
            )

            await createHandler().signTransaction({
                tx: TOPOLOGY_TX,
                txHash: Buffer.from(JSON.stringify(TOPOLOGY_SIGNED_MSG)).toString('hex'),
                walletId: WALLET_ID,
            })

            const body = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(body.intent.messageStandardType).toBe('CANTON_SIGN_TOPOLOGY')
        })

        it('detects transaction payload when messageStandardType is omitted (real PreparedTransaction)', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
            )

            await createHandler().signTransaction({
                tx: TRANSACTION_TX,
                txHash: Buffer.from(JSON.stringify(TRANSACTION_SIGNED_MSG)).toString('hex'),
                walletId: WALLET_ID,
            })

            const body = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(body.intent.messageStandardType).toBe('CANTON_SIGN_TRANSACTION')
        })

        it('detects transaction payload when tx decodes to a JSON object (not an array)', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
            )

            const objectTx = Buffer.from(JSON.stringify({ nodes: [] })).toString('base64')

            await createHandler().signTransaction({
                tx: objectTx,
                txHash: 'hash==',
                walletId: WALLET_ID,
            })

            const body = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(body.intent.messageStandardType).toBe('CANTON_SIGN_TRANSACTION')
        })

        it('unwraps a single-item topology JSON array to the raw proto element', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
            )

            await createHandler().signTransaction({
                tx: TOPOLOGY_TX,
                txHash: Buffer.from(JSON.stringify(TOPOLOGY_SIGNED_MSG)).toString('hex'),
                walletId: WALLET_ID,
                messageStandardType: 'CANTON_SIGN_TOPOLOGY',
            })

            const [innerElement] = JSON.parse(
                Buffer.from(TOPOLOGY_TX, 'base64').toString('utf8')
            )
            const body = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(body.intent.preparedTransaction).toBe(innerElement)
        })

        it('leaves raw proto binary tx (CANTON_SIGN_TRANSACTION) unchanged', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ txRequestId: TX_REQUEST_ID, walletId: WALLET_ID, state: 'initialized' })
            )

            await createHandler().signTransaction({
                tx: TRANSACTION_TX,
                txHash: Buffer.from(JSON.stringify(TRANSACTION_SIGNED_MSG)).toString('hex'),
                walletId: WALLET_ID,
                messageStandardType: 'CANTON_SIGN_TRANSACTION',
            })

            const body = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(body.intent.preparedTransaction).toBe(TRANSACTION_TX)
        })

        it('throws on a multi-item topology transaction batch instead of silently mis-signing', async () => {
            const multiItemTx = Buffer.from(
                JSON.stringify(['proto-one==', 'proto-two=='])
            ).toString('base64')

            await expect(
                createHandler().signTransaction({
                    tx: multiItemTx,
                    txHash: 'hash==',
                    walletId: WALLET_ID,
                    messageStandardType: 'CANTON_SIGN_TOPOLOGY',
                })
            ).rejects.toThrow('single-item topology transaction batches')

            expect(fetchMock).not.toHaveBeenCalled()
        })
    })

    // ── getTransaction ─────────────────────────────────────────────────────

    describe('getTransaction', () => {
        it('uses enterprise fallback when txId is unknown', async () => {
            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)

            expect(fetchMock.mock.calls[0][0]).toContain(
                `/api/v2/enterprise/${ENTERPRISE_ID}/txrequests`
            )
            expect(tx?.txId).toBe(TX_REQUEST_ID)
            expect(tx?.status).toBe('signed')
        })

        it('caches walletId in txStore after enterprise fallback', async () => {
            const handler = createHandler()
            fetchMock
                // First getTransaction: enterprise lookup
                .mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))
                // resolvePublicKey on cache miss: wallet + keychain
                .mockResolvedValueOnce(walletMock())
                .mockResolvedValueOnce(keychainMock())
                // Second getTransaction: wallet-scoped (txStore hit; resolvePublicKey hits cache)
                .mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))

            await handler.getTransaction(TX_REQUEST_ID)
            await handler.getTransaction(TX_REQUEST_ID)

            // calls[3] is the wallet-scoped txrequests request
            const secondUrl = fetchMock.mock.calls[3][0] as string
            expect(secondUrl).toContain(`/api/v2/wallet/${WALLET_ID}/txrequests`)
        })

        it('returns undefined when txId unknown and no enterpriseId configured', async () => {
            const tx = await createHandler({ enterpriseId: undefined }).getTransaction('unknown')
            expect(tx).toBeUndefined()
            expect(fetchMock).not.toHaveBeenCalled()
        })

        it('returns undefined when enterprise returns no results', async () => {
            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [] }))

            const tx = await createHandler().getTransaction('ghost-id')
            expect(tx).toBeUndefined()
        })
    })

    // ── fetchTxRequest ─────────────────────────────────────────────────────

    describe('fetchTxRequest', () => {
        it('includes apiVersion=full and latest=true', async () => {
            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))

            await createHandler().fetchTxRequest(TX_REQUEST_ID, WALLET_ID)
            const url = fetchMock.mock.calls[0][0] as string
            expect(url).toContain('apiVersion=full')
            expect(url).toContain('latest=true')
        })

        it('throws when txRequest not found', async () => {
            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [] }))

            await expect(
                createHandler().fetchTxRequest(TX_REQUEST_ID, WALLET_ID)
            ).rejects.toThrow('not found')
        })

        it('throws on non-ok response', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: () => Promise.resolve('Unauthorized'),
            } as unknown as Response)

            await expect(
                createHandler().fetchTxRequest(TX_REQUEST_ID, WALLET_ID)
            ).rejects.toThrow('401')
        })
    })

    // ── state mapping ──────────────────────────────────────────────────────

    describe('state mapping', () => {
        async function withState(txReqState: string, messageState?: string, txHash?: string) {
            fetchMock.mockResolvedValueOnce(
                mockOk({
                    txRequests: [
                        {
                            txRequestId: TX_REQUEST_ID,
                            walletId: WALLET_ID,
                            state: txReqState,
                            messages: messageState
                                ? [{ state: messageState, txHash: txHash ?? '' }]
                                : [],
                        },
                    ],
                })
            )
            return createHandler().getTransaction(TX_REQUEST_ID)
        }

        it.each([
            ['canceled', 'rejected'],
            ['rejected', 'rejected'],
            ['failed', 'failed'],
            ['pendingApproval', 'pending'],
            ['pendingDelivery', 'pending'],
            ['unknownState', 'pending'],
        ])(
            'txRequest state "%s" → Canton status "%s"',
            async (bitgoState, expectedStatus) => {
                const tx = await withState(bitgoState)
                expect(tx?.status).toBe(expectedStatus)
            }
        )

        it.each([['delivered'], ['signed']])(
            'terminal txRequest state "%s" without messages returns failed (avoids infinite polling)',
            async (bitgoState) => {
                const tx = await withState(bitgoState)
                expect(tx?.status).toBe('failed')
            }
        )

        it('non-terminal txRequest with signed message but missing txHash falls back to pending (retryable)', async () => {
            // pendingDelivery + messages[0].signed but txHash absent → message-level signed,
            // non-terminal txRequest state → pending (will be retried)
            const tx = await withState('pendingDelivery', 'signed', undefined)
            expect(tx?.status).toBe('pending')
        })

        it('delivered txRequest with signed message returns signed', async () => {
            const tx = await withState('delivered', 'signed', TX_HASH_HEX)
            expect(tx?.status).toBe('signed')
        })

        it('message-level signed overrides pendingDelivery txRequest state', async () => {
            const tx = await withState('pendingDelivery', 'signed', TX_HASH_HEX)
            expect(tx?.status).toBe('signed')
        })

        it('intermediate EdDSA message state keeps txRequest pending', async () => {
            const tx = await withState('pendingDelivery', 'eddsaPendingCommitment')
            expect(tx?.status).toBe('pending')
        })
    })

    // ── signature + metadata extraction ───────────────────────────────────

    describe('signature and metadata extraction', () => {
        it('extracts base64 signature and Canton fingerprint signedBy', async () => {
            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.signature).toBe(TOPOLOGY_SIGNED_MSG.serializedSignatures[0].signature)
            expect(tx?.metadata?.signedBy).toBe(TOPOLOGY_SIGNED_MSG.signers[0])
        })

        it('returns no signature or metadata when status is pending', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({
                    txRequests: [
                        {
                            ...BASE_TX_REQUEST,
                            state: 'pendingDelivery',
                            messages: [{ state: 'eddsaPendingCommitment' }],
                        },
                    ],
                })
            )

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.signature).toBeUndefined()
            expect(tx?.metadata).toBeUndefined()
        })

        it('returns failed for terminal txRequest when txHash is empty (avoids infinite polling)', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({
                    txRequests: [{ ...BASE_TX_REQUEST, messages: [{ state: 'signed', txHash: '' }] }],
                })
            )

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.status).toBe('failed')
            expect(tx?.signature).toBeUndefined()
        })

        it('returns failed for terminal txRequest when txHash is malformed hex', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({
                    txRequests: [
                        {
                            ...BASE_TX_REQUEST,
                            messages: [{ state: 'signed', txHash: 'not-valid-hex!' }],
                        },
                    ],
                })
            )

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.status).toBe('failed')
            expect(tx?.signature).toBeUndefined()
        })

        it('returns failed for terminal txRequest when txHash decodes to JSON without serializedSignatures', async () => {
            const emptyPayload = Buffer.from(
                JSON.stringify({ type: 'CANTON_SIGN_TOPOLOGY' })
            ).toString('hex')
            fetchMock.mockResolvedValueOnce(
                mockOk({
                    txRequests: [
                        {
                            ...BASE_TX_REQUEST,
                            messages: [{ state: 'signed', txHash: emptyPayload }],
                        },
                    ],
                })
            )

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.status).toBe('failed')
            expect(tx?.signature).toBeUndefined()
            expect(tx?.metadata?.signedBy).toBeUndefined()
        })
    })

    // ── resolvePublicKey (via formatTxRequest) ─────────────────────────────

    describe('resolvePublicKey', () => {
        it('fetches publicKey from API on cache miss and includes it in the result', async () => {
            fetchMock
                .mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))
                .mockResolvedValueOnce(walletMock())
                .mockResolvedValueOnce(keychainMock())

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.publicKey).toBe(DERIVED_PUBLIC_KEY)
        })

        it('omits publicKey gracefully when wallet has no keychain', async () => {
            fetchMock
                .mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))
                .mockResolvedValueOnce(mockOk({ id: WALLET_ID, label: 'key', keys: [] }))

            const tx = await createHandler().getTransaction(TX_REQUEST_ID)
            expect(tx?.publicKey).toBeUndefined()
            expect(tx?.status).toBe('signed') // other fields unaffected
        })
    })

    // ── getKeys ────────────────────────────────────────────────────────────

    describe('getKeys', () => {
        it('returns wallets with derived Ed25519 publicKey', async () => {
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({
                        wallets: [
                            { id: 'w1', label: 'key-one', keys: [KEYCHAIN_ID] },
                            { id: 'w2', label: 'key-two', keys: [KEYCHAIN_ID] },
                        ],
                    })
                )
                .mockResolvedValueOnce(keychainMock()) // keychain for w1
                .mockResolvedValueOnce(keychainMock()) // keychain for w2

            const keys = await createHandler().getKeys()
            expect(keys).toHaveLength(2)
            expect(keys[0]).toEqual({ id: 'w1', name: 'key-one', publicKey: DERIVED_PUBLIC_KEY })
            expect(keys[1]).toEqual({ id: 'w2', name: 'key-two', publicKey: DERIVED_PUBLIC_KEY })
        })

        it('skips wallets without keychains (non-TSS or incomplete)', async () => {
            fetchMock.mockResolvedValueOnce(
                mockOk({ wallets: [{ id: 'w1', label: 'key-one', keys: [] }] })
            )

            const keys = await createHandler().getKeys()
            expect(keys).toHaveLength(0)
            expect(fetchMock).toHaveBeenCalledTimes(1) // no keychain fetch attempted
        })

        it('follows pagination via nextBatchPrevId', async () => {
            fetchMock
                // Page 1: returns one wallet + cursor
                .mockResolvedValueOnce(
                    mockOk({
                        wallets: [{ id: 'w1', label: 'key-one', keys: [KEYCHAIN_ID] }],
                        nextBatchPrevId: 'cursor-abc',
                    })
                )
                .mockResolvedValueOnce(keychainMock()) // keychain for w1
                // Page 2: returns one wallet + no cursor (last page)
                .mockResolvedValueOnce(
                    mockOk({ wallets: [{ id: 'w2', label: 'key-two', keys: [KEYCHAIN_ID] }] })
                )
                .mockResolvedValueOnce(keychainMock()) // keychain for w2

            const keys = await createHandler().getKeys()
            expect(keys).toHaveLength(2)
            // Second page request should include prevId cursor
            const page2Url = fetchMock.mock.calls[2][0] as string
            expect(page2Url).toContain('prevId=cursor-abc')
        })

        it('filters by coin and custodial type, requests up to 500 per page', async () => {
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))

            await createHandler({ coin: 'tcanton' }).getKeys()
            const url = fetchMock.mock.calls[0][0] as string
            expect(url).toContain('coin=tcanton')
            expect(url).toContain('type=custodial')
            expect(url).toContain('limit=500')
        })
    })

    // ── getTransactions ────────────────────────────────────────────────────

    describe('getTransactions', () => {
        it('resolves publicKey to walletId via keyMap and fetches from wallet-scoped endpoint', async () => {
            const handler = createHandler()

            // Populate keyMap via createKey first
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ id: WALLET_ID, label: 'key', keys: [KEYCHAIN_ID] })
                )
                .mockResolvedValueOnce(keychainMock())
            await handler.createKey('key')

            // Now test getTransactions with the derived publicKey
            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))

            const txs: unknown[] = []
            for await (const tx of handler.getTransactions({ publicKeys: [DERIVED_PUBLIC_KEY] })) {
                txs.push(tx)
            }
            expect(txs).toHaveLength(1)
            const lastUrl = fetchMock.mock.calls.at(-1)![0] as string
            expect(lastUrl).toContain(`/api/v2/wallet/${WALLET_ID}/txrequests`)
            // walletId (not the derived publicKey) is used in the URL
            expect(lastUrl).not.toContain(encodeURIComponent(DERIVED_PUBLIC_KEY))
        })

        it('auto-refreshes keyMap via getKeys on publicKey cache miss', async () => {
            fetchMock
                // getKeys: GET wallets
                .mockResolvedValueOnce(
                    mockOk({ wallets: [{ id: WALLET_ID, label: 'key', keys: [KEYCHAIN_ID] }] })
                )
                // getKeys: GET keychain
                .mockResolvedValueOnce(keychainMock())
                // getTransactions: GET txrequests
                .mockResolvedValueOnce(mockOk({ txRequests: [BASE_TX_REQUEST] }))

            const txs: unknown[] = []
            for await (const tx of createHandler().getTransactions({
                publicKeys: [DERIVED_PUBLIC_KEY],
            })) {
                txs.push(tx)
            }
            expect(txs).toHaveLength(1)
            // Third call is the wallet-scoped txrequests endpoint
            expect(fetchMock.mock.calls[2][0] as string).toContain(
                `/api/v2/wallet/${WALLET_ID}/txrequests`
            )
        })

        it('requests up to 500 txrequests per page', async () => {
            const handler = createHandler()
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ id: WALLET_ID, label: 'key', keys: [KEYCHAIN_ID] })
                )
                .mockResolvedValueOnce(keychainMock())
            await handler.createKey('key')

            fetchMock.mockResolvedValueOnce(mockOk({ txRequests: [] }))

            const txs: unknown[] = []
            for await (const tx of handler.getTransactions({ publicKeys: [DERIVED_PUBLIC_KEY] })) {
                txs.push(tx)
            }
            const url = fetchMock.mock.calls.at(-1)![0] as string
            expect(url).toContain('limit=500')
        })

        it('follows pagination for wallet txrequests via nextBatchPrevId', async () => {
            const handler = createHandler()
            // Populate keyMap
            fetchMock
                .mockResolvedValueOnce(
                    mockOk({ id: WALLET_ID, label: 'key', keys: [KEYCHAIN_ID] })
                )
                .mockResolvedValueOnce(keychainMock())
            await handler.createKey('key')

            const TX2 = { ...BASE_TX_REQUEST, txRequestId: 'tx-request-2' }
            fetchMock
                // Page 1: one txRequest + cursor
                .mockResolvedValueOnce(
                    mockOk({ txRequests: [BASE_TX_REQUEST], nextBatchPrevId: 'page-cursor' })
                )
                // Page 2: one more txRequest + no cursor
                .mockResolvedValueOnce(mockOk({ txRequests: [TX2] }))

            const txs: unknown[] = []
            for await (const tx of handler.getTransactions({ publicKeys: [DERIVED_PUBLIC_KEY] })) {
                txs.push(tx)
            }
            expect(txs).toHaveLength(2)
            const page2Url = fetchMock.mock.calls.at(-1)![0] as string
            expect(page2Url).toContain('prevId=page-cursor')
        })

        it('refreshes only once per getTransactions call even with multiple missing publicKeys', async () => {
            // Two unknown keys: getKeys() is called once (keysRefreshed guard), not twice
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))

            const txs: unknown[] = []
            for await (const tx of createHandler().getTransactions({
                publicKeys: ['unknown-key-1', 'unknown-key-2'],
            })) {
                txs.push(tx)
            }
            expect(txs).toHaveLength(0)
            expect(fetchMock).toHaveBeenCalledTimes(1) // only one getKeys call
        })

        it('skips publicKey not found in keyMap after refresh', async () => {
            // getKeys returns no wallets → keyMap stays empty → publicKey not found → no txs
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))

            const txs: unknown[] = []
            for await (const tx of createHandler().getTransactions({
                publicKeys: ['unknown-key'],
            })) {
                txs.push(tx)
            }
            expect(txs).toHaveLength(0)
        })
    })

    // ── coin auto-detection ────────────────────────────────────────────────

    describe('coin auto-detection', () => {
        it('uses canton for bitgo.com prod URL', async () => {
            const handler = new BitGoHandler({ accessToken: 'token', baseUrl: 'https://app.bitgo.com' })
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))
            await handler.getKeys()
            expect(fetchMock.mock.calls[0][0]).toContain('coin=canton')
        })

        it('uses tcanton for bitgo-test.com URL', async () => {
            const handler = new BitGoHandler({ accessToken: 'token', baseUrl: 'https://app.bitgo-test.com' })
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))
            await handler.getKeys()
            expect(fetchMock.mock.calls[0][0]).toContain('coin=tcanton')
        })

        it('defaults to canton for unknown/proxy URLs (not bitgo-test.com)', async () => {
            const handler = new BitGoHandler({
                accessToken: 'token',
                baseUrl: 'https://bitgo-proxy.internal.example.com',
            })
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))
            await handler.getKeys()
            expect(fetchMock.mock.calls[0][0]).toContain('coin=canton')
        })

        it('respects explicit coin override', async () => {
            const handler = new BitGoHandler({
                accessToken: 'token',
                baseUrl: 'https://app.bitgo.com',
                coin: 'tcanton',
            })
            fetchMock.mockResolvedValueOnce(mockOk({ wallets: [] }))
            await handler.getKeys()
            expect(fetchMock.mock.calls[0][0]).toContain('coin=tcanton')
        })
    })
})
