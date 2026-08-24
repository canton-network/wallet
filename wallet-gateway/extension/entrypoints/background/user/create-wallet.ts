// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LedgerClient } from '@canton-network/core-ledger-client'
import {
    isRpcError,
    SigningProvider,
    type SigningDriverInterface,
} from '@canton-network/core-signing-lib'
import type { AuthContext } from '@canton-network/core-wallet-auth'
import type { Store, Wallet } from '@canton-network/core-wallet-store'

function base64ToBytes(value: string): Uint8Array {
    const normalized = value.replace(/\s/g, '')
    if (
        normalized.length === 0 ||
        normalized.length % 4 === 1 ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)
    ) {
        throw new Error('Signing driver returned an invalid public key')
    }

    try {
        const decoded = globalThis.atob(normalized)
        return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
    } catch {
        throw new Error('Signing driver returned an invalid public key')
    }
}

export async function fingerprintPublicKey(publicKey: string): Promise<string> {
    const hashPurpose = 12
    const keyBytes = base64ToBytes(publicKey)
    const hashInput = new Uint8Array(4 + keyBytes.length)
    new DataView(hashInput.buffer).setUint32(0, hashPurpose)
    hashInput.set(keyBytes, 4)

    const hash = new Uint8Array(
        await globalThis.crypto.subtle.digest('SHA-256', hashInput)
    )
    const fingerprint = new Uint8Array(2 + hash.length)
    fingerprint.set([0x12, 0x20])
    fingerprint.set(hash, 2)

    return Array.from(fingerprint, (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('')
}

function signingError(operation: string, description: string): Error {
    return new Error(`Signing driver failed to ${operation}: ${description}`)
}

export async function createExtensionWallet({
    authContext,
    ledgerClient,
    networkId,
    partyHint,
    primary,
    signingDriver,
    store,
    synchronizerId,
}: {
    authContext: AuthContext
    ledgerClient: LedgerClient
    networkId: string
    partyHint: string
    primary: boolean
    signingDriver: SigningDriverInterface
    store: Store
    synchronizerId?: string
}): Promise<Wallet> {
    const driver = signingDriver.controller(authContext.userId)
    const key = await driver.createKey({ name: partyHint })
    if (isRpcError(key)) {
        throw signingError('create key', key.error_description)
    }
    if (!key.publicKey) {
        throw new Error('Signing driver returned no public key')
    }

    const resolvedSynchronizerId =
        synchronizerId ?? (await ledgerClient.getSynchronizerId())
    const namespace = await fingerprintPublicKey(key.publicKey)
    const topology = await ledgerClient.generateTopology(
        resolvedSynchronizerId,
        key.publicKey,
        partyHint
    )
    if (!topology.multiHash) {
        throw new Error('Ledger returned no topology hash')
    }
    if (!topology.topologyTransactions?.length) {
        throw new Error('Ledger returned no topology transactions')
    }

    const signed = await driver.signTransaction({
        tx: '',
        txHash: topology.multiHash,
        keyIdentifier: { publicKey: key.publicKey },
    })
    if (isRpcError(signed)) {
        throw signingError(
            'sign topology transaction',
            signed.error_description
        )
    }
    if (!signed.signature) {
        throw new Error('Signing driver returned no signature')
    }

    const allocatedParty = await ledgerClient.allocateExternalParty(
        resolvedSynchronizerId,
        topology.topologyTransactions.map((transaction) => ({ transaction })),
        [
            {
                format: 'SIGNATURE_FORMAT_CONCAT',
                signature: signed.signature,
                signedBy: namespace,
                signingAlgorithmSpec: 'SIGNING_ALGORITHM_SPEC_ED25519',
            },
        ]
    )
    await ledgerClient.waitForPartyAndGrantUserRights(
        authContext.userId,
        allocatedParty.partyId
    )

    const wallet: Wallet = {
        partyId: allocatedParty.partyId,
        hint: partyHint,
        namespace,
        signingProviderId: SigningProvider.WALLET_KERNEL,
        networkId,
        status: 'allocated',
        primary,
        publicKey: key.publicKey,
        externalTxId: '',
        topologyTransactions: '',
        rights: [],
    }
    await store.addWallet(wallet)

    return wallet
}
