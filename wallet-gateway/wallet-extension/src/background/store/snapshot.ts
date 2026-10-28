// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Idp, UserId } from '@canton-network/core-wallet-auth'
import type {
    MessageRaw,
    Network,
    Session,
    Transaction,
    UserLevelRight,
    Wallet,
} from '@canton-network/core-wallet-store'
import type {
    Memory,
    StoreInternalConfig,
    UserStorage,
} from '@canton-network/core-wallet-store-inmemory'

// As stored: Dates become ISO strings.
type TransactionJson = Omit<Transaction, 'createdAt' | 'signedAt'> & {
    createdAt?: string
    signedAt?: string
}

type MessageRawJson = Omit<MessageRaw, 'createdAt' | 'signedAt'> & {
    createdAt: string
    signedAt?: string
}

/**
 * A `StoreInternal`'s `config` and `memory` in a form that survives JSON.
 * Maps and Sets become arrays or records, and Dates become ISO strings. The
 * `V1` suffix follows the naming in `vault/envelope.ts`.
 *
 * Snapshots outlive the build that wrote them, so the decoder checks
 * `version` first. Bump it when core changes Wallet, Session, Transaction,
 * MessageRaw, Network or Idp in a way that old snapshots don't satisfy.
 */
export interface SnapshotV1 {
    version: 1
    config: { idps: Idp[]; networks: Network[] }
    users: Record<
        UserId,
        {
            wallets: Wallet[]
            sessions: Session[]
            transactions: TransactionJson[]
            messageRaws: MessageRawJson[]
            userRightsByNetwork: Record<string, UserLevelRight[]>
        }
    >
}

export class CorruptSnapshotError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CorruptSnapshotError'
    }
}

export function encodeSnapshot(
    config: StoreInternalConfig,
    memory: Memory
): SnapshotV1 {
    return {
        version: 1,
        config: { idps: config.idps, networks: config.networks },
        users: Object.fromEntries(
            Array.from(memory, ([userId, storage]) => [
                userId,
                {
                    wallets: storage.wallets,
                    sessions: [...storage.sessions.values()],
                    transactions: Array.from(
                        storage.transactions.values(),
                        encodeTransaction
                    ),
                    messageRaws: Array.from(
                        storage.messageRaws.values(),
                        encodeMessageRaw
                    ),
                    userRightsByNetwork: Object.fromEntries(
                        Array.from(
                            storage.userRightsByNetwork,
                            ([networkId, rights]) => [networkId, [...rights]]
                        )
                    ),
                },
            ])
        ),
    }
}

/**
 * Rebuilds the store's `config` and `memory`. Throws `CorruptSnapshotError`
 * for an unknown version or the wrong shape. It never falls back to the
 * defaults, because that would silently drop the user's parties and sessions.
 */
export function decodeSnapshot(raw: unknown): {
    config: StoreInternalConfig
    memory: Memory
} {
    if (!isRecord(raw) || raw.version !== 1) {
        throw new CorruptSnapshotError(
            'The wallet store snapshot has an unknown version.'
        )
    }
    const { config, users } = raw
    if (
        !isRecord(config) ||
        !Array.isArray(config.idps) ||
        !Array.isArray(config.networks) ||
        !isRecord(users)
    ) {
        throw new CorruptSnapshotError(
            'The wallet store snapshot has the wrong shape.'
        )
    }
    const memory: Memory = new Map(
        Object.entries(users).map(([userId, user]) => [
            userId,
            decodeUser(user),
        ])
    )
    return { config: { idps: config.idps, networks: config.networks }, memory }
}

function decodeUser(user: unknown): UserStorage {
    if (
        !isRecord(user) ||
        !Array.isArray(user.wallets) ||
        !Array.isArray(user.sessions) ||
        !Array.isArray(user.transactions) ||
        !Array.isArray(user.messageRaws) ||
        !isRecord(user.userRightsByNetwork)
    ) {
        throw new CorruptSnapshotError(
            'A user in the wallet store snapshot has the wrong shape.'
        )
    }
    return {
        wallets: user.wallets,
        sessions: byId(user.sessions.map(withId<Session>)),
        transactions: byId(user.transactions.map(decodeTransaction)),
        messageRaws: byId(user.messageRaws.map(decodeMessageRaw)),
        apiKeys: new Map(),
        userRightsByNetwork: new Map(
            Object.entries(user.userRightsByNetwork).map(
                ([networkId, rights]) => {
                    if (!Array.isArray(rights)) {
                        throw new CorruptSnapshotError(
                            'The wallet store snapshot has invalid user rights.'
                        )
                    }
                    return [networkId, new Set<UserLevelRight>(rights)]
                }
            )
        ),
    }
}

function encodeTransaction({
    createdAt,
    signedAt,
    ...transaction
}: Transaction): TransactionJson {
    return {
        ...transaction,
        ...(createdAt && { createdAt: createdAt.toISOString() }),
        ...(signedAt && { signedAt: signedAt.toISOString() }),
    }
}

function decodeTransaction(value: unknown): Transaction {
    const { createdAt, signedAt, ...transaction } =
        withId<TransactionJson>(value)
    return {
        ...transaction,
        ...(createdAt !== undefined && { createdAt: parseDate(createdAt) }),
        ...(signedAt !== undefined && { signedAt: parseDate(signedAt) }),
    }
}

function encodeMessageRaw({
    createdAt,
    signedAt,
    ...message
}: MessageRaw): MessageRawJson {
    return {
        ...message,
        createdAt: createdAt.toISOString(),
        ...(signedAt && { signedAt: signedAt.toISOString() }),
    }
}

function decodeMessageRaw(value: unknown): MessageRaw {
    const { createdAt, signedAt, ...message } = withId<MessageRawJson>(value)
    return {
        ...message,
        createdAt: parseDate(createdAt),
        ...(signedAt !== undefined && { signedAt: parseDate(signedAt) }),
    }
}

/** Only checks `id`, which keys the Map. The other fields are trusted. */
function withId<T extends { id: string }>(value: unknown): T {
    if (!isRecord(value) || typeof value.id !== 'string') {
        throw new CorruptSnapshotError(
            'The wallet store snapshot has an entry without an id.'
        )
    }
    return value as T
}

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
    return new Map(items.map((item) => [item.id, item]))
}

function parseDate(value: unknown): Date {
    const date = typeof value === 'string' ? new Date(value) : undefined
    if (!date || Number.isNaN(date.getTime())) {
        throw new CorruptSnapshotError(
            'The wallet store snapshot has an invalid date.'
        )
    }
    return date
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
