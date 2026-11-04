// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PartyId } from '@canton-network/core-types'

type Tagged = { tag: string }

/**
 * Decode Daml Map<action, Party[][]> from interfaceView.availableActions
 * @param raw
 * @returns
 */
export function decodeAvailableActions<K extends Tagged>(
    raw: unknown
): Array<[K, PartyId[][]]> {
    if (Array.isArray(raw)) return raw as Array<[K, PartyId[][]]>
    if (
        raw &&
        typeof (raw as { entriesArray?: unknown }).entriesArray === 'function'
    ) {
        return (
            raw as { entriesArray(): Array<[K, PartyId[][]]> }
        ).entriesArray()
    }
    return []
}

export type ActionAvailability =
    | { status: 'available'; actors: PartyId[] }
    | { status: 'awaiting'; groups: PartyId[][] }

export function actionAvailability(
    groups: PartyId[][],
    party: PartyId
): ActionAvailability {
    const own = groups.find((g) => g.length > 0 && g.every((p) => p === party))
    return own
        ? { status: 'available', actors: [party] }
        : { status: 'awaiting', groups }
}
