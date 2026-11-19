// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * RFC 8785 JSON Canonicalization Scheme.
 *
 * Object keys are sorted by UTF-16 code unit. Strings and numbers use the ECMAScript
 * `JSON.stringify` rules that the RFC adopts, and an object property whose value is `undefined`
 * is omitted, as `JSON.stringify` omits it. Lone surrogates and non-finite numbers are rejected,
 * because a signature over them would not be portable.
 */
export class CanonicalizeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CanonicalizeError'
    }
}

/** The RFC 8785 canonical JSON text of `value`. */
export function canonicalize(value: unknown): string {
    return serialize(value, new WeakSet())
}

function serialize(value: unknown, stack: WeakSet<object>): string {
    switch (typeof value) {
        case 'boolean':
            return value ? 'true' : 'false'
        case 'number':
            return serializeNumber(value)
        case 'string':
            return serializeString(value)
        case 'object':
            return serializeObject(value, stack)
        default:
            throw new CanonicalizeError('value must be JSON')
    }
}

function serializeNumber(value: number): string {
    if (!Number.isFinite(value)) {
        throw new CanonicalizeError('number must be finite')
    }
    // JSON.stringify serializes -0 as 0, which is what RFC 8785 requires.
    return JSON.stringify(value)
}

function serializeString(value: string): string {
    assertNoLoneSurrogate(value)
    return JSON.stringify(value)
}

function serializeObject(value: object | null, stack: WeakSet<object>): string {
    if (value === null) return 'null'
    if (stack.has(value)) throw new CanonicalizeError('circular structure')
    if (Array.isArray(value)) return serializeArray(value, stack)
    if (!isPlainObject(value)) throw new CanonicalizeError('value must be JSON')
    if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new CanonicalizeError('value must be JSON')
    }

    stack.add(value)
    try {
        const record = value as Record<string, unknown>
        const parts: string[] = []
        for (const key of Object.keys(record).sort(compareCodeUnits)) {
            const child = record[key]
            if (child === undefined) continue
            parts.push(`${serializeString(key)}:${serialize(child, stack)}`)
        }
        return `{${parts.join(',')}}`
    } finally {
        stack.delete(value)
    }
}

function serializeArray(value: unknown[], stack: WeakSet<object>): string {
    stack.add(value)
    try {
        const parts: string[] = []
        for (const item of value) {
            if (item === undefined) {
                throw new CanonicalizeError('undefined is not JSON')
            }
            parts.push(serialize(item, stack))
        }
        return `[${parts.join(',')}]`
    } finally {
        stack.delete(value)
    }
}

function isPlainObject(value: object): boolean {
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

/** RFC 8785 section 3.2.3: compare raw property names as unsigned UTF-16 code units. */
function compareCodeUnits(a: string, b: string): number {
    const length = Math.min(a.length, b.length)
    for (let i = 0; i < length; i++) {
        const diff = a.charCodeAt(i) - b.charCodeAt(i)
        if (diff !== 0) return diff
    }
    return a.length - b.length
}

function assertNoLoneSurrogate(value: string): void {
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i)
        if (code >= 0xd800 && code <= 0xdbff) {
            const next = value.charCodeAt(i + 1)
            if (next >= 0xdc00 && next <= 0xdfff) {
                i++
                continue
            }
            throw new CanonicalizeError('lone surrogate')
        }
        if (code >= 0xdc00 && code <= 0xdfff) {
            throw new CanonicalizeError('lone surrogate')
        }
    }
}
