// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Value } from '@canton-network/core-ledger-proto'
import type { Field } from './descriptor.js'
import { describeKind } from './path.js'

export class FormatError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FormatError'
    }
}

export type EnumTables = Partial<Record<string, Record<string, string>>>

const MICROS_PER_SECOND = 1_000_000n
const MS_PER_DAY = 86_400_000
const INT64_MIN = -(2n ** 63n)
const INT64_MAX = 2n ** 63n - 1n
// Canonical decimal: 0, or no leading zero. `-0` is not canonical.
const CANONICAL_INT64 = /^(?:0|-?[1-9]\d*)$/
// Daml LF Numeric.fromString: a decimal point, no leading zeros, precision <= 38, scale <= 37.
const NUMERIC = /^-?(0|[1-9]\d*)\.(\d*)$/
const MAX_NUMERIC_PRECISION = 38
const MAX_NUMERIC_SCALE = 37
// LF party identifiers also allow a space. A space would extend the sentence, so a party shown
// here is letters, digits, colon, minus and underscore, at most 255 characters.
const PARTY = /^[A-Za-z0-9:_-]{1,255}$/

/** How a field names its enum table: `$.metadata.enums.<name>`. */
export const ENUM_REF_PREFIX = '$.metadata.enums.'

/**
 * Formats a Daml value for display. Each formatter accepts only certain value kinds and fails on any
 * other; it never coerces. Text is shown as a JSON string literal, so a value read from the
 * transaction cannot pass as the descriptor's wording.
 *
 * @throws FormatError on a kind the formatter does not accept, a number or party outside its
 * grammar, or an enum value missing from its table
 */
export function formatValue(v: Value, field: Field, enums: EnumTables): string {
    return sanitize(formatUnsanitized(v, field, enums))
}

function formatUnsanitized(v: Value, field: Field, enums: EnumTables): string {
    const sum = v.sum
    const format = field.format ?? 'raw'
    switch (format) {
        case 'string':
            if (sum.oneofKind === 'text') return JSON.stringify(sum.text)
            break
        case 'number':
            if (sum.oneofKind === 'int64') return formatInt64(sum.int64)
            if (sum.oneofKind === 'numeric') return formatNumeric(sum.numeric)
            break
        case 'boolean':
            if (sum.oneofKind === 'bool') return String(sum.bool)
            break
        case 'party':
            if (sum.oneofKind === 'party') return formatParty(sum.party)
            break
        case 'contractId':
            if (sum.oneofKind === 'contractId') return sum.contractId
            break
        case 'dateTime':
            if (sum.oneofKind === 'timestamp')
                return formatTimestamp(sum.timestamp)
            if (sum.oneofKind === 'date') return formatDate(sum.date)
            break
        case 'duration': {
            const micros = relTimeMicros(v)
            if (micros !== undefined) return formatDuration(micros)
            break
        }
        case 'enum':
            return formatEnum(v, field, enums)
        case 'raw':
            return formatRaw(v)
    }
    throw new FormatError(
        `format '${format}' does not accept ${describeKind(v)}`
    )
}

function formatInt64(raw: string): string {
    if (!CANONICAL_INT64.test(raw)) {
        throw new FormatError(`'${raw}' is not a decimal int64`)
    }
    const n = BigInt(raw)
    if (n < INT64_MIN || n > INT64_MAX) {
        throw new FormatError(`'${raw}' is not a decimal int64`)
    }
    return raw
}

function formatNumeric(raw: string): string {
    const match = NUMERIC.exec(raw)
    const intPart = match?.[1]
    const decPart = match?.[2]
    if (!match || intPart === undefined || decPart === undefined) {
        throw new FormatError(`'${raw}' is not a decimal numeric`)
    }
    const scale = decPart.length
    const precision = intPart === '0' ? scale : intPart.length + scale
    if (precision > MAX_NUMERIC_PRECISION || scale > MAX_NUMERIC_SCALE) {
        throw new FormatError(`'${raw}' is not a decimal numeric`)
    }
    return raw
}

function formatParty(party: string): string {
    if (!PARTY.test(party)) {
        throw new FormatError(`'${party}' is not a party identifier`)
    }
    return party
}

function formatEnum(v: Value, field: Field, enums: EnumTables): string {
    const ref = field.params?.$ref ?? ''
    const table = enums[ref.slice(ENUM_REF_PREFIX.length)]
    if (!table) {
        throw new FormatError(`enum table '${ref}' does not exist`)
    }
    const key = enumKey(v)
    const label = Object.hasOwn(table, key) ? table[key] : undefined
    if (label === undefined) {
        throw new FormatError(`'${key}' is not in enum table '${ref}'`)
    }
    return label
}

/** The table key of an enum, a bool, or a variant with no payload. */
function enumKey(v: Value): string {
    const sum = v.sum
    switch (sum.oneofKind) {
        case 'enum':
            return sum.enum.constructor
        case 'bool':
            return String(sum.bool)
        case 'variant': {
            const payload = sum.variant.value?.sum.oneofKind
            if (payload === undefined || payload === 'unit') {
                return sum.variant.constructor
            }
            break
        }
    }
    throw new FormatError(`format 'enum' does not accept ${describeKind(v)}`)
}

function formatTimestamp(micros: string): string {
    const total = BigInt(micros)
    let seconds = total / MICROS_PER_SECOND
    let fraction = total % MICROS_PER_SECOND
    if (fraction < 0n) {
        seconds -= 1n
        fraction += MICROS_PER_SECOND
    }
    const iso = new Date(Number(seconds) * 1000).toISOString()
    const suffix =
        fraction === 0n ? 'Z' : `.${fraction.toString().padStart(6, '0')}Z`
    return iso.replace(/\.\d{3}Z$/, suffix)
}

function formatDate(days: number): string {
    return new Date(days * MS_PER_DAY).toISOString().slice(0, 10)
}

// DA.Time's RelTime, identified by the type the prepared transaction carries.
function relTimeMicros(v: Value): bigint | undefined {
    if (v.sum.oneofKind !== 'record') return undefined
    const { recordId, fields } = v.sum.record
    if (
        recordId?.moduleName !== 'DA.Time.Types' ||
        recordId.entityName !== 'RelTime'
    ) {
        return undefined
    }
    const only = fields.length === 1 ? fields[0] : undefined
    const value = only?.label === 'microseconds' ? only.value?.sum : undefined
    return value?.oneofKind === 'int64' ? BigInt(value.int64) : undefined
}

function formatDuration(micros: bigint): string {
    const sign = micros < 0n ? '-' : ''
    let rest = micros < 0n ? -micros : micros
    const parts: string[] = []
    for (const [unit, size] of [
        ['d', 86_400n * MICROS_PER_SECOND],
        ['h', 3_600n * MICROS_PER_SECOND],
        ['m', 60n * MICROS_PER_SECOND],
    ] as const) {
        if (rest >= size) {
            parts.push(`${rest / size}${unit}`)
            rest %= size
        }
    }
    if (rest > 0n || parts.length === 0) {
        const whole = rest / MICROS_PER_SECOND
        const fraction = (rest % MICROS_PER_SECOND)
            .toString()
            .padStart(6, '0')
            .replace(/0+$/, '')
        parts.push(fraction === '' ? `${whole}s` : `${whole}.${fraction}s`)
    }
    return sign + parts.join(' ')
}

function formatRaw(v: Value): string {
    const plain = toPlain(v)
    const quoted = v.sum.oneofKind === 'text' || typeof plain !== 'string'
    return quoted ? JSON.stringify(plain) : plain
}

type Plain = string | boolean | null | Plain[] | { [key: string]: Plain }

function toPlain(v: Value | undefined): Plain {
    const sum = v?.sum
    switch (sum?.oneofKind) {
        case 'unit':
            return '()'
        case 'bool':
            return sum.bool
        case 'int64':
            return sum.int64
        case 'numeric':
            return sum.numeric
        case 'party':
            return sum.party
        case 'text':
            return sum.text
        case 'contractId':
            return sum.contractId
        case 'timestamp':
            return formatTimestamp(sum.timestamp)
        case 'date':
            return formatDate(sum.date)
        case 'optional':
            return sum.optional.value ? toPlain(sum.optional.value) : null
        case 'list':
            return sum.list.elements.map(toPlain)
        case 'textMap':
            return Object.fromEntries(
                sum.textMap.entries.map((e) => [e.key, toPlain(e.value)])
            )
        case 'genMap':
            return sum.genMap.entries.map((e) => [
                toPlain(e.key),
                toPlain(e.value),
            ])
        case 'record': {
            const micros = relTimeMicros({ sum })
            if (micros !== undefined) return formatDuration(micros)
            return Object.fromEntries(
                sum.record.fields.map((f, i) => [
                    f.label || String(i),
                    toPlain(f.value),
                ])
            )
        }
        case 'variant':
            return { [sum.variant.constructor]: toPlain(sum.variant.value) }
        case 'enum':
            return sum.enum.constructor
        default:
            throw new FormatError(
                `format 'raw' does not accept ${sum?.oneofKind ?? 'an empty value'}`
            )
    }
}

// Values come from the transaction and are untrusted. Control, format (bidirectional overrides,
// zero-width characters) and line or paragraph separator characters could break lines, hide text or
// reorder the text around them, so they are shown escaped. Descriptor text rejects the same set.
export const UNSAFE_CLASS = String.raw`\p{Cc}\p{Cf}\p{Zl}\p{Zp}`
const UNSAFE = new RegExp(`[${UNSAFE_CLASS}]`, 'gu')

export function sanitize(s: string): string {
    return s.replace(
        UNSAFE,
        (c) => `\\u{${c.codePointAt(0)?.toString(16).padStart(4, '0')}}`
    )
}
