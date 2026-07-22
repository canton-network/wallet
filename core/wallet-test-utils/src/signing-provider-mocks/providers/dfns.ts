// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SigningProviderMockRoute } from '../server.js'
import {
    createMockEd25519KeyPair,
    MockEd25519KeyPair,
    normalizeHex,
    signMultiHashHexPrefixed,
    toPrefixedHex,
} from '../crypto.js'
import { randomBytes, randomUUID } from 'node:crypto'

type DfnsApiStatus = 'Pending' | 'Signed' | 'Rejected' | 'Failed'

interface DfnsMockKey {
    id: string
    name: string
    status: 'Active'
    scheme: 'EdDSA'
    curve: 'ed25519'
    key: MockEd25519KeyPair
}

interface DfnsMockSignature {
    id: string
    keyId: string
    status: DfnsApiStatus
    kind: string
    messageHex: string
    externalId?: string
    signatureHex?: string
}

interface DfnsCreateKeyBody {
    scheme: string
    curve: string
    name: string
}

interface DfnsGenerateSignatureBody {
    kind: string
    message: string
    externalId?: string
}

interface DfnsSetSignatureStateBody {
    signatureId?: string
    status?: DfnsApiStatus
    signatureHex?: string
}

const MOCK_CRED_ID = 'mock-cred-id'

function signatureResponse(signature: DfnsMockSignature):
    | {
          encoded: string
          r: string
          s: string
      }
    | undefined {
    if (!signature.signatureHex) {
        return undefined
    }
    const normalized = normalizeHex(signature.signatureHex)
    return {
        encoded: toPrefixedHex(normalized),
        r: toPrefixedHex(normalized.slice(0, 64)),
        s: toPrefixedHex(normalized.slice(64)),
    }
}

function keyResponse(key: DfnsMockKey): {
    id: string
    name: string
    status: string
    scheme: string
    curve: string
    publicKey: string
} {
    return {
        id: key.id,
        name: key.name,
        status: key.status,
        scheme: key.scheme,
        curve: key.curve,
        publicKey: toPrefixedHex(key.key.publicKeyHex),
    }
}

function signatureApiResponse(signature: DfnsMockSignature): {
    id: string
    status: DfnsApiStatus
    signature?: {
        encoded: string
        r: string
        s: string
    }
} {
    const encodedSignature = signatureResponse(signature)
    return {
        id: signature.id,
        status: signature.status,
        ...(signature.status === 'Signed' &&
            encodedSignature !== undefined && {
                signature: encodedSignature,
            }),
    }
}

export function createDfnsMockProvider(): SigningProviderMockRoute[] {
    const keysById = new Map<string, DfnsMockKey>()
    const signaturesById = new Map<string, DfnsMockSignature>()
    let keyCounter = 0
    let signatureCounter = 0

    const routes: SigningProviderMockRoute[] = [
        {
            method: 'POST',
            path: '/auth/action/init',
            handler: () => ({
                body: {
                    challenge: randomBytes(32).toString('base64url'),
                    challengeIdentifier: randomUUID(),
                    allowCredentials: {
                        key: [{ id: MOCK_CRED_ID }],
                        passwordProtectedKey: [],
                        webauthn: [],
                    },
                },
            }),
        },
        {
            method: 'POST',
            path: '/auth/action',
            handler: () => ({
                body: {
                    userAction: `mock-user-action-${randomUUID()}`,
                },
            }),
        },
        {
            method: 'POST',
            path: '/keys',
            handler: ({ body }) => {
                const createBody = body as DfnsCreateKeyBody
                if (createBody.scheme !== 'EdDSA') {
                    return {
                        status: 400,
                        body: { error: 'unsupported_scheme' },
                    }
                }
                if (createBody.curve !== 'ed25519') {
                    return {
                        status: 400,
                        body: { error: 'unsupported_curve' },
                    }
                }

                keyCounter += 1
                const keyPair = createMockEd25519KeyPair()
                const key: DfnsMockKey = {
                    id: `key-mock-${keyCounter}`,
                    name: createBody.name,
                    status: 'Active',
                    scheme: 'EdDSA',
                    curve: 'ed25519',
                    key: keyPair,
                }
                keysById.set(key.id, key)
                return { body: keyResponse(key) }
            },
        },
        {
            method: 'GET',
            path: '/keys',
            handler: () => ({
                body: {
                    items: Array.from(keysById.values()).map((key) =>
                        keyResponse(key)
                    ),
                    nextPageToken: undefined,
                },
            }),
        },
        {
            method: 'GET',
            path: '/keys/:keyId',
            handler: ({ pathParams }) => {
                const key = keysById.get(pathParams.keyId)
                if (!key) {
                    return {
                        status: 404,
                        body: { error: 'key_not_found' },
                    }
                }
                return { body: keyResponse(key) }
            },
        },
        {
            method: 'POST',
            path: '/keys/:keyId/signatures',
            handler: ({ pathParams, body }) => {
                const key = keysById.get(pathParams.keyId)
                if (!key) {
                    return {
                        status: 404,
                        body: { error: 'key_not_found' },
                    }
                }

                const signatureBody = body as DfnsGenerateSignatureBody
                if (!signatureBody.message) {
                    return {
                        status: 400,
                        body: { error: 'missing_message' },
                    }
                }

                signatureCounter += 1
                const signatureId = `sig-mock-${signatureCounter}`
                const signature: DfnsMockSignature = {
                    id: signatureId,
                    keyId: key.id,
                    status: 'Pending',
                    kind: signatureBody.kind,
                    messageHex: normalizeHex(signatureBody.message),
                    ...(signatureBody.externalId !== undefined && {
                        externalId: signatureBody.externalId,
                    }),
                    signatureHex: signMultiHashHexPrefixed(
                        signatureBody.message,
                        key.key
                    ),
                }
                signaturesById.set(signatureId, signature)
                return {
                    body: signatureApiResponse(signature),
                }
            },
        },
        {
            method: 'GET',
            path: '/keys/:keyId/signatures/:signatureId',
            handler: ({ pathParams }) => {
                const signature = signaturesById.get(pathParams.signatureId)
                if (!signature || signature.keyId !== pathParams.keyId) {
                    return {
                        status: 404,
                        body: { error: 'signature_not_found' },
                    }
                }
                return {
                    body: signatureApiResponse(signature),
                }
            },
        },
        {
            method: 'GET',
            path: '/keys/:keyId/signatures',
            handler: ({ pathParams }) => {
                const signatures = Array.from(signaturesById.values()).filter(
                    (signature) => signature.keyId === pathParams.keyId
                )
                return {
                    body: {
                        items: signatures.map((signature) =>
                            signatureApiResponse(signature)
                        ),
                        nextPageToken: undefined,
                    },
                }
            },
        },
        {
            method: 'POST',
            path: '/_admin/setSignatureState',
            handler: ({ body }) => {
                const { signatureId, status, signatureHex } =
                    body as DfnsSetSignatureStateBody
                if (!signatureId) {
                    return {
                        status: 400,
                        body: { error: 'missing_signature_id' },
                    }
                }
                const existing = signaturesById.get(signatureId)
                if (!existing) {
                    return {
                        status: 404,
                        body: { error: 'signature_not_found', signatureId },
                    }
                }

                const nextSignature: DfnsMockSignature = {
                    ...existing,
                    status: status ?? 'Pending',
                    ...(signatureHex !== undefined && {
                        signatureHex: toPrefixedHex(normalizeHex(signatureHex)),
                    }),
                }
                signaturesById.set(signatureId, nextSignature)
                return { body: signatureApiResponse(nextSignature) }
            },
        },
    ]

    return routes
}
