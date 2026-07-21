// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO use signing lib also for bd and dfns
import { signTransactionHash } from '@canton-network/core-signing-lib'
import { SigningProviderMockRoute } from '../server.js'
import { generateKeyPairSync, KeyObject } from 'node:crypto'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

type AdminSigningStatus = 'pending' | 'signed' | 'rejected' | 'failed'

const CC_COIN_TYPE = 6767
const MOCK_VAULT_ID = '4'

export const MOCK_FIREBLOCKS_VAULT_NAME = 'Mock Vault'

interface MockVaultKey {
    publicKeyHex: string
    secretKeyBase64: string
    derivationPath: number[]
}

interface MockFireblocksTransaction {
    id: string
    createdAt: number
    messageHex: string
    derivationPath: number[]
    publicKeyHex: string
    signatureHex?: string
    // TODO probably can remove
    adminStatus: AdminSigningStatus
    externalTxId?: string
}

interface TransactionRequestBody {
    operation?: string
    externalTxId?: string
    note?: string
    extraParameters?: {
        rawMessageData?: {
            messages?: Array<{
                content?: string
                derivationPath?: number[]
            }>
            algorithm?: string
        }
    }
}

interface CreateTransactionBody extends TransactionRequestBody {
    transactionRequest?: TransactionRequestBody
}

interface SetTransactionStateBody {
    txId?: string
    status?: AdminSigningStatus
}

function asTransactionRequest(
    body: unknown
): TransactionRequestBody | undefined {
    const parsed = body as CreateTransactionBody
    if (parsed.transactionRequest) {
        return parsed.transactionRequest
    }
    if (parsed.extraParameters?.rawMessageData) {
        return parsed
    }
    return undefined
}

function createMockEd25519KeyPair(): MockVaultKey {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519')
    const spkiDer = publicKey.export({ type: 'spki', format: 'der' })
    const publicKeyBytes = Buffer.from(spkiDer).subarray(-32)
    return {
        publicKeyHex: publicKeyBytes.toString('hex'),
        secretKeyBase64: exportTweetnaclSecretKeyBase64(privateKey),
        derivationPath: [44, CC_COIN_TYPE, Number(MOCK_VAULT_ID), 0, 0],
    }
}

function exportTweetnaclSecretKeyBase64(privateKey: KeyObject): string {
    const pkcs8 = privateKey.export({ type: 'pkcs8', format: 'der' })
    const seed = pkcs8.subarray(-32)
    const keyPair = nacl.sign.keyPair.fromSeed(seed)
    return naclUtil.encodeBase64(keyPair.secretKey)
}

function signContentHex(contentHex: string, key: MockVaultKey): string {
    const multiHashBase64 = Buffer.from(contentHex, 'hex').toString('base64')
    const signatureBase64 = signTransactionHash(
        multiHashBase64,
        key.secretKeyBase64
    )
    return Buffer.from(signatureBase64, 'base64').toString('hex')
}

function formatTransactionResponse(
    tx: MockFireblocksTransaction
): Record<string, unknown> {
    if (tx.adminStatus === 'signed') {
        if (!tx.signatureHex) {
            throw new Error(`Missing signature for signed transaction ${tx.id}`)
        }
        return {
            id: tx.id,
            createdAt: tx.createdAt,
            signedMessages: [
                {
                    publicKey: tx.publicKeyHex,
                    content: tx.messageHex,
                    signature: { fullSig: tx.signatureHex },
                    derivationPath: tx.derivationPath,
                },
            ],
        }
    }

    const fireblocksStatus =
        tx.adminStatus === 'rejected'
            ? 'REJECTED'
            : tx.adminStatus === 'failed'
              ? 'FAILED'
              : 'PENDING'

    return {
        id: tx.id,
        createdAt: tx.createdAt,
        status: fireblocksStatus,
        extraParameters: {
            rawMessageData: {
                messages: [
                    {
                        content: tx.messageHex,
                        derivationPath: tx.derivationPath,
                    },
                ],
                algorithm: 'MPC_EDDSA_ED25519',
            },
        },
    }
}

export function createFireblocksMockProvider(): SigningProviderMockRoute[] {
    const vaultKey = createMockEd25519KeyPair()
    const derivationPathKey = JSON.stringify(vaultKey.derivationPath)
    const keysByDerivationPath = new Map<string, MockVaultKey>([
        [derivationPathKey, vaultKey],
    ])
    const keysByPublicKeyHex = new Map<string, MockVaultKey>([
        [vaultKey.publicKeyHex, vaultKey],
    ])
    const transactionsById = new Map<string, MockFireblocksTransaction>()
    let txCounter = 0

    const routes: SigningProviderMockRoute[] = [
        {
            method: 'GET',
            path: '/v1/vault/accounts_paged',
            handler: ({ query }) => {
                const after = query.get('after')
                if (after) {
                    return {
                        body: {
                            accounts: [],
                            paging: {},
                        },
                    }
                }

                return {
                    body: {
                        accounts: [
                            {
                                id: MOCK_VAULT_ID,
                                name: MOCK_FIREBLOCKS_VAULT_NAME,
                            },
                        ],
                        paging: {},
                    },
                }
            },
        },
        {
            method: 'GET',
            path: '/v1/vault/public_key_info',
            handler: ({ query }) => {
                const derivationPathParam = query.get('derivationPath')
                if (!derivationPathParam) {
                    return {
                        status: 400,
                        body: { error: 'missing_derivation_path' },
                    }
                }

                const key = keysByDerivationPath.get(derivationPathParam)
                if (!key) {
                    return {
                        status: 404,
                        body: { error: 'key_not_found' },
                    }
                }

                return {
                    body: {
                        publicKey: key.publicKeyHex,
                    },
                }
            },
        },
        {
            method: 'POST',
            path: '/v1/transactions',
            handler: ({ body }) => {
                const request = asTransactionRequest(body)
                if (!request) {
                    return {
                        status: 400,
                        body: { error: 'missing_raw_message' },
                    }
                }
                const message =
                    request.extraParameters?.rawMessageData?.messages?.[0]
                if (!message?.content || !message.derivationPath) {
                    return {
                        status: 400,
                        body: { error: 'missing_raw_message' },
                    }
                }

                const derivationPathString = JSON.stringify(
                    message.derivationPath
                )
                const key = keysByDerivationPath.get(derivationPathString)
                if (!key) {
                    return {
                        status: 400,
                        body: { error: 'unknown_derivation_path' },
                    }
                }

                txCounter += 1
                const id = `mock-fb-tx-${txCounter}`
                const tx: MockFireblocksTransaction = {
                    id,
                    createdAt: Date.now(),
                    messageHex: message.content,
                    derivationPath: message.derivationPath,
                    publicKeyHex: key.publicKeyHex,
                    adminStatus: 'pending',
                    ...(request.externalTxId !== undefined && {
                        externalTxId: request.externalTxId,
                    }),
                }
                transactionsById.set(id, tx)

                return {
                    body: {
                        id,
                        status: 'PENDING',
                    },
                }
            },
        },
        {
            method: 'GET',
            path: '/v1/transactions',
            handler: () => ({
                body: Array.from(transactionsById.values()).map((tx) =>
                    formatTransactionResponse(tx)
                ),
            }),
        },
        {
            method: 'GET',
            path: '/v1/transactions/:txId',
            handler: ({ pathParams }) => {
                const tx = transactionsById.get(pathParams.txId)
                if (!tx) {
                    return {
                        status: 404,
                        body: { error: 'transaction_not_found' },
                    }
                }

                return {
                    body: formatTransactionResponse(tx),
                }
            },
        },
        {
            method: 'POST',
            path: '/_admin/setTransactionState',
            handler: ({ body }) => {
                const { txId, status } = body as SetTransactionStateBody
                if (!txId) {
                    return {
                        status: 400,
                        body: { error: 'missing_tx_id' },
                    }
                }

                const existing = transactionsById.get(txId)
                if (!existing) {
                    return {
                        status: 404,
                        body: { error: 'transaction_not_found', txId },
                    }
                }

                const adminStatus = status ?? 'pending'
                const key = keysByPublicKeyHex.get(existing.publicKeyHex)
                if (adminStatus === 'signed' && !key) {
                    return {
                        status: 500,
                        body: { error: 'signing_key_not_found' },
                    }
                }

                const nextTx: MockFireblocksTransaction = {
                    id: existing.id,
                    createdAt: existing.createdAt,
                    messageHex: existing.messageHex,
                    derivationPath: existing.derivationPath,
                    publicKeyHex: existing.publicKeyHex,
                    adminStatus,
                    ...(existing.externalTxId !== undefined && {
                        externalTxId: existing.externalTxId,
                    }),
                    ...(adminStatus === 'signed' && key
                        ? {
                              signatureHex: signContentHex(
                                  existing.messageHex,
                                  key
                              ),
                          }
                        : {}),
                }
                transactionsById.set(txId, nextTx)

                return {
                    body: formatTransactionResponse(nextTx),
                }
            },
        },
    ]

    return routes
}
