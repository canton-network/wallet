// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Value } from '@canton-network/core-ledger-proto'

import type { Field } from './descriptor.ts'
import { describeKind } from './path.ts'

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
    const name = ref.slice(ENUM_REF_PREFIX.length)
    // A missing table is not a prototype property such as `constructor` or `__proto__`.
    const table = Object.hasOwn(enums, name) ? enums[name] : undefined
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

// Daml's Time and Date range: 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999Z.
const MIN_TIMESTAMP_MICROS = -62_135_596_800_000_000n
const MAX_TIMESTAMP_MICROS = 253_402_300_799_999_999n
const MIN_DATE_DAYS = -719_162
const MAX_DATE_DAYS = 2_932_896

function formatTimestamp(micros: string): string {
    const total = BigInt(micros)
    // `clearSign` hashes first, and the hasher refuses these values. The check keeps `formatValue` safe on
    // its own: outside the range `toISOString` throws a RangeError rather than a FormatError.
    if (total < MIN_TIMESTAMP_MICROS || total > MAX_TIMESTAMP_MICROS) {
        throw new FormatError(`timestamp '${micros}' is outside the Daml range`)
    }
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
    if (
        !Number.isInteger(days) ||
        days < MIN_DATE_DAYS ||
        days > MAX_DATE_DAYS
    ) {
        throw new FormatError(`date '${days}' is outside the Daml range`)
    }
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

/**
 * Text and composite values are JSON text. Other scalars are shown as they are. Every entry of a
 * record or map is written, in order, so a repeated label or key is shown twice, never merged.
 */
function formatRaw(v: Value): string {
    const sum = v.sum
    if (sum.oneofKind === 'optional' && sum.optional.value) {
        return formatRaw(sum.optional.value)
    }
    if (sum.oneofKind === 'record') {
        const micros = relTimeMicros(v)
        if (micros !== undefined) return formatDuration(micros)
    }
    switch (sum.oneofKind) {
        case 'unit':
        case 'bool':
        case 'int64':
        case 'numeric':
        case 'party':
        case 'contractId':
        case 'timestamp':
        case 'date':
        case 'enum':
            return scalarText(v)
        default:
            return rawJson(v)
    }
}

/** A scalar's text: what `raw` shows at the top level, and a JSON string inside a composite. */
function scalarText(v: Value): string {
    const sum = v.sum
    switch (sum.oneofKind) {
        case 'unit':
            return '()'
        case 'bool':
            return String(sum.bool)
        case 'int64':
            return sum.int64
        case 'numeric':
            return sum.numeric
        case 'party':
            return sum.party
        case 'contractId':
            return sum.contractId
        case 'timestamp':
            return formatTimestamp(sum.timestamp)
        case 'date':
            return formatDate(sum.date)
        case 'enum':
            return sum.enum.constructor
        default:
            throw new FormatError(
                `format 'raw' does not accept ${describeKind(v)}`
            )
    }
}

/**
 * JSON text for a value, written directly rather than through an object, so that no entry is dropped.
 * A bool is a JSON boolean, None is null, Text and the other scalars are JSON strings.
 */
function rawJson(v: Value | undefined): string {
    const sum = v?.sum
    switch (sum?.oneofKind) {
        case 'bool':
            return String(sum.bool)
        case 'text':
            return JSON.stringify(sum.text)
        case 'optional':
            return sum.optional.value ? rawJson(sum.optional.value) : 'null'
        case 'list':
            return `[${sum.list.elements.map(rawJson).join(',')}]`
        case 'textMap':
            return jsonObject(
                sum.textMap.entries.map((e) => [e.key, rawJson(e.value)])
            )
        case 'genMap':
            return `[${sum.genMap.entries
                .map((e) => `[${rawJson(e.key)},${rawJson(e.value)}]`)
                .join(',')}]`
        case 'record': {
            const micros = relTimeMicros({ sum })
            if (micros !== undefined) {
                return JSON.stringify(formatDuration(micros))
            }
            return jsonObject(
                sum.record.fields.map((f, i) => [
                    f.label || String(i),
                    rawJson(f.value),
                ])
            )
        }
        case 'variant':
            return jsonObject([
                [sum.variant.constructor, rawJson(sum.variant.value)],
            ])
        case undefined:
            throw new FormatError(`format 'raw' does not accept an empty value`)
        default:
            return JSON.stringify(scalarText(v as Value))
    }
}

/** `{"key":value,...}` with every member kept, in order, repeated keys included. */
function jsonObject(members: [string, string][]): string {
    return `{${members.map(([key, json]) => `${JSON.stringify(key)}:${json}`).join(',')}}`
}

// Values come from the transaction and are untrusted, so characters that could hide, reorder or smear
// text are shown escaped as `\u{...}`:
// - control, format (bidirectional overrides, zero-width), line and paragraph separators;
// - private-use characters, and default-ignorable code points such as the Hangul fillers U+115F,
//   U+1160, U+3164 and U+FFA0, which render blank;
// - U+2800, the blank Braille cell.
// Descriptor text rejects the same set.
// U+2800 is written as an escape, so the source does not hide a blank character.
const BLANK_BRAILLE_CELL = '\\u2800'
export const UNSAFE_CLASS =
    String.raw`\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Co}\p{Default_Ignorable_Code_Point}` +
    BLANK_BRAILLE_CELL

/** Nonspacing and enclosing marks: the marks that stack on the character before them. */
export const STACKING_MARK_CLASS = String.raw`\p{Mn}\p{Me}`

/**
 * The most stacking marks shown in a row. Two cover a base letter with two diacritics, as in
 * Vietnamese written decomposed. Descriptor text rejects a longer run.
 */
export const MAX_MARK_RUN = 2

// Unassigned code points are escaped for display too. Descriptor text does not reject them, because
// which code points are assigned depends on the Unicode version of the JavaScript engine.
const ESCAPED = new RegExp(`[${UNSAFE_CLASS}\\p{Cn}]`, 'u')
const STACKING_MARK = new RegExp(`[${STACKING_MARK_CLASS}]`, 'u')

function escapeCodePoint(c: string): string {
    return `\\u{${c.codePointAt(0)?.toString(16).padStart(4, '0')}}`
}

export function sanitize(s: string): string {
    let out = ''
    let marks = 0
    for (const c of s) {
        // A variation selector is both a mark and default-ignorable: it is escaped, and still
        // continues the run of marks.
        const mark = STACKING_MARK.test(c)
        marks = mark ? marks + 1 : 0
        const escaped = ESCAPED.test(c) || marks > MAX_MARK_RUN
        out += escaped ? escapeCodePoint(c) : c
    }
    return out
}
