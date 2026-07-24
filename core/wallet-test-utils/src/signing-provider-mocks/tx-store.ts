// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface MockTxStore<T> {
    nextId(prefix: string): string
    save(record: T): T
    get(id: string): T | undefined
    list(): T[]
    setState(id: string, transition: (record: T) => T): T | undefined
}

export function createMockTxStore<T>(
    getId: (record: T) => string
): MockTxStore<T> {
    const byId = new Map<string, T>()
    let counter = 0

    return {
        nextId: (prefix) => `${prefix}-${(counter += 1)}`,
        save: (record) => {
            byId.set(getId(record), record)
            return record
        },
        get: (id) => byId.get(id),
        list: () => Array.from(byId.values()),
        setState: (id, transition) => {
            const existing = byId.get(id)
            if (existing === undefined) {
                return undefined
            }
            const next = transition(existing)
            byId.set(id, next)
            return next
        },
    }
}
