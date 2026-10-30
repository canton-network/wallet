// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** A JavaScript number holds every integer up to this magnitude exactly */
const EXACT = 2n ** 53n

/**
 * The int64 values in a decoded prepared transaction, in nodes and in input
 * contracts, whose magnitude is above 2^53: a hasher that reads an int64 into
 * a JavaScript number, as `parseInt` does, rounds them.
 */
export function int64sBeyond2To53(message: unknown): string[] {
    const found: string[] = []
    const visit = (part: unknown): void => {
        if (typeof part !== 'object' || part === null) return
        if (ArrayBuffer.isView(part)) return
        if (Array.isArray(part)) {
            for (const item of part) visit(item)
            return
        }
        const fields = part as Record<string, unknown>
        if (fields.oneofKind === 'int64' && typeof fields.int64 === 'string') {
            const value = BigInt(fields.int64)
            if (value > EXACT || value < -EXACT) found.push(fields.int64)
        }
        for (const field of Object.values(fields)) visit(field)
    }
    visit(message)
    return found
}
