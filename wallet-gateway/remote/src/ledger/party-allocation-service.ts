// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    type GenerateTransactionResponse,
    LedgerClient,
} from '@canton-network/core-ledger-client'
import { createHash } from 'node:crypto'
import type { AccessTokenProvider } from '@canton-network/core-wallet-auth'

export type AllocatedParty = {
    partyId: string
    hint: string
    namespace: string
}

type SigningCbFn = (hash: string) => Promise<string>

/**
 * This service provides an abstraction for Canton party allocation that seamlessly handles both internal and external parties.
 */
export class PartyAllocationService {
    private ledgerClient: LedgerClient
    private synchronizerId: string | undefined

    constructor({
        synchronizerId,
        accessTokenProvider,
        httpLedgerUrl,
    }: {
        synchronizerId?: string
        accessTokenProvider: AccessTokenProvider
        httpLedgerUrl: string
    }) {
        this.synchronizerId = synchronizerId
        this.ledgerClient = new LedgerClient({
            baseUrl: new URL(httpLedgerUrl),
            accessTokenProvider,
        })
    }

    /**
     * Allocates an internal participant party.
     * @param hint A hint for the party ID.
     */
    async allocateParty(hint: string): Promise<AllocatedParty>

    /**
     * Allocates an externally signed party.
     * @param hint A hint for the party ID.
     * @param publicKey The public key of the party.
     * @param signingCallback A callback function that asynchronously signs the onboarding request hash.
     */
    async allocateParty(
        hint: string,
        publicKey: string,
        signingCallback: SigningCbFn
    ): Promise<AllocatedParty>

    async allocateParty(
        hint: string,
        publicKey?: string,
        signingCallback?: SigningCbFn
    ): Promise<AllocatedParty> {
        if (publicKey !== undefined && signingCallback !== undefined) {
            return this.allocateExternalParty(hint, publicKey, signingCallback)
        }
        return this.allocateInternalParty(hint)
    }

    /**
     * Allocates an internal participant party and grants a user rights to it.
     * @param userId The ID of the user.
     * @param hint A hint for the party ID.
     */
    async allocatePartyAndGrantRights(
        userId: string,
        hint: string
    ): Promise<AllocatedParty>

    /**
     * Allocates an externally signed party and grants a user rights to it.
     * @param userId The ID of the user.
     * @param hint A hint for the party ID.
     * @param publicKey The public key of the party.
     * @param signingCallback A callback function that asynchronously signs the onboarding request hash.
     */
    async allocatePartyAndGrantRights(
        userId: string,
        hint: string,
        publicKey: string,
        signingCallback: SigningCbFn
    ): Promise<AllocatedParty>

    async allocatePartyAndGrantRights(
        userId: string,
        hint: string,
        publicKey?: string,
        signingCallback?: SigningCbFn
    ): Promise<AllocatedParty> {
        const party =
            publicKey !== undefined && signingCallback !== undefined
                ? await this.allocateParty(hint, publicKey, signingCallback)
                : await this.allocateParty(hint)
        await this.grantUserRights(userId, party.partyId)
        return party
    }

    /**
     * Grants a user rights to act as a party.
     * @param userId The ID of the user.
     * @param partyId The ID of the party.
     */
    async grantUserRights(userId: string, partyId: string): Promise<void> {
        await this.ledgerClient.waitForPartyAndGrantUserRights(userId, partyId)
    }

    /**
     * Create fingerprint
     * @param publicKey The public key of the user (in base64 format).
     */
    createFingerprintFromKey(publicKey: string): string {
        // Hash purpose codes can be looked up in the Canton codebase:
        //  https://github.com/DACH-NY/canton/blob/62e9ccd3f1743d2c9422d863cfc2ca800405c71b/community/base/src/main/scala/com/digitalasset/canton/crypto/HashPurpose.scala#L52
        const hashPurpose = 12 // For `PublicKeyFingerprint`
        const keyBytes = Buffer.from(publicKey, 'base64')
        const hashInput = Buffer.alloc(4 + keyBytes.length)
        hashInput.writeUInt32BE(hashPurpose, 0)
        Buffer.from(keyBytes).copy(hashInput, 4)
        const hash = createHash('sha256').update(hashInput).digest()
        const multiprefix = Buffer.from([0x12, 0x20])
        return Buffer.concat([multiprefix, hash]).toString('hex')
    }

    /**
     * Normalizes a public key to base64 format.
     * Converts hex format (Fireblocks) to base64, or returns base64 as-is.
     * @param publicKey Public key in hex or base64 format
     * @returns Public key in base64 format, or null if conversion fails
     */
    normalizePublicKeyToBase64(publicKey: string): string | null {
        try {
            // Try hex first (Fireblocks format), fallback to base64 (internal format)
            try {
                const hexKey = Buffer.from(publicKey, 'hex')
                // If it's valid hex and produces 32 bytes, convert to base64
                if (hexKey.length === 32) {
                    return hexKey.toString('base64')
                } else {
                    // Invalid hex length, treat as base64
                    return publicKey
                }
            } catch {
                // Not valid hex, treat as base64
                return publicKey
            }
        } catch {
            // If any conversion fails, return null
            return null
        }
    }

    /**
     * Generate topology transactions
     * @param hint A hint for the party ID.
     * @param publicKey The public key of the user.
     */
    async generateTopologyTransactions(
        hint: string,
        publicKey: string
    ): Promise<GenerateTransactionResponse>

    async generateTopologyTransactions(
        hint: string,
        publicKey: string
    ): Promise<GenerateTransactionResponse> {
        const synchronizerId =
            this.synchronizerId ?? (await this.ledgerClient.getSynchronizerId())
        return this.ledgerClient.generateTopology(
            synchronizerId,
            publicKey,
            hint
        )
    }

    /**
     * Allocates a party using topology transactions signed by an existing wallet.
     * @param namespace The namespace of the wallet.
     * @param transactions The topology transactions.
     * @param signature A transaction signature from the signing provider.
     */
    async allocatePartyWithExistingWallet(
        namespace: string,
        transactions: string[],
        signature: string
    ): Promise<string>

    async allocatePartyWithExistingWallet(
        namespace: string,
        transactions: string[],
        signature: string
    ): Promise<string> {
        const synchronizerId =
            this.synchronizerId ?? (await this.ledgerClient.getSynchronizerId())
        const res = await this.ledgerClient.allocateExternalParty(
            synchronizerId,
            transactions.map((transaction) => ({
                transaction,
            })),
            [
                {
                    format: 'SIGNATURE_FORMAT_CONCAT',
                    signature: signature,
                    signedBy: namespace,
                    signingAlgorithmSpec: 'SIGNING_ALGORITHM_SPEC_ED25519',
                },
            ]
        )

        return res.partyId
    }

    /**
     * Allocates a party using topology transactions signed by an existing
     * wallet and grants user rights to it.
     */
    async allocatePartyWithExistingWalletAndGrantRights(
        namespace: string,
        transactions: string[],
        signature: string,
        userId: string
    ): Promise<string> {
        const partyId = await this.allocatePartyWithExistingWallet(
            namespace,
            transactions,
            signature
        )
        await this.grantUserRights(userId, partyId)
        return partyId
    }

    private async allocateInternalParty(hint: string): Promise<AllocatedParty> {
        const { participantId } = await this.ledgerClient.getWithRetry(
            '/v2/parties/participant-id'
        )
        // Extract the namespace part from participantId
        // Format is hint::namespace
        const [, namespace] = participantId.split('::')
        if (!namespace) {
            throw new Error(
                `Invalid participantId format: expected "hint::namespace", got "${participantId}"`
            )
        }

        const res = await this.ledgerClient.postWithRetry('/v2/parties', {
            partyIdHint: hint,
            identityProviderId: '',
            synchronizerId:
                this.synchronizerId ??
                (await this.ledgerClient.getSynchronizerId()),
        })

        if (!res.partyDetails?.party) {
            throw new Error('Failed to allocate party')
        }
        return { hint, namespace, partyId: res.partyDetails.party }
    }

    private async allocateExternalParty(
        hint: string,
        publicKey: string,
        signingCallback: SigningCbFn
    ): Promise<AllocatedParty> {
        const synchronizerId =
            this.synchronizerId ?? (await this.ledgerClient.getSynchronizerId())
        const namespace = this.createFingerprintFromKey(publicKey)

        const transactions = await this.generateTopologyTransactions(
            hint,
            publicKey
        )

        const signature = await signingCallback(transactions.multiHash)

        const res = await this.ledgerClient.allocateExternalParty(
            synchronizerId,
            transactions.topologyTransactions!.map((transaction) => ({
                transaction,
            })),
            [
                {
                    format: 'SIGNATURE_FORMAT_CONCAT',
                    signature: signature,
                    signedBy: namespace,
                    signingAlgorithmSpec: 'SIGNING_ALGORITHM_SPEC_ED25519',
                },
            ]
        )

        return { hint, partyId: res.partyId, namespace }
    }
}
