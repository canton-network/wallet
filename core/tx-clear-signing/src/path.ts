// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Value } from '@canton-network/core-ledger-proto'

/** The prefix of a path that reads the exercised contract's create argument. */
export const CONTRACT_PREFIX = '@.contract.'

/** Container fields of the prepared transaction, shared by create and exercise. */
export const SHARED_CONTAINER_FIELDS = [
    'contractId',
    'signatories',
    'stakeholders',
    'synchronizerId',
    'actAs',
] as const

/** Container fields that exist only on an exercise node. */
export const EXERCISE_ONLY_CONTAINER_FIELDS = [
    'actingParties',
    'choiceObservers',
    'consuming',
] as const

const SHARED_CONTAINER = new Set<string>(SHARED_CONTAINER_FIELDS)
const EXERCISE_CONTAINER = new Set<string>(EXERCISE_ONLY_CONTAINER_FIELDS)

interface SharedContainer {
    contractId: string
    signatories: readonly string[]
    stakeholders: readonly string[]
    synchronizerId: string
    actAs: readonly string[]
}

/** The prepared-transaction values a container path reads. */
export type ContainerFields =
    | (SharedContainer & { kind: 'create' })
    | (SharedContainer & {
          kind: 'exercise'
          actingParties: readonly string[]
          choiceObservers: readonly string[]
          consuming: boolean
      })

/**
 * The name of a container path such as `@.contractId`. `@.contract.<path>` is not one: that prefix
 * reads the exercised contract.
 */
export function containerFieldName(path: string): string | undefined {
    if (!path.startsWith('@.') || path.startsWith(CONTRACT_PREFIX)) {
        return undefined
    }
    const name = path.slice(2)
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : undefined
}

/**
 * The value a container path names. An exercise-only field on a create, or an unknown name, fails.
 *
 * @throws PathError when the path does not name a container field of this node
 */
export function containerValue(name: string, source: ContainerFields): Value {
    if (EXERCISE_CONTAINER.has(name)) {
        if (source.kind !== 'exercise') {
            throw new PathError(`'@.${name}' is only valid on an exercise`)
        }
        switch (name) {
            case 'actingParties':
                return parties(source.actingParties)
            case 'choiceObservers':
                return parties(source.choiceObservers)
            case 'consuming':
                return { sum: { oneofKind: 'bool', bool: source.consuming } }
            default:
                throw new PathError(`unknown container field '@.${name}'`)
        }
    }
    if (!SHARED_CONTAINER.has(name)) {
        throw new PathError(`unknown container field '@.${name}'`)
    }
    switch (name) {
        case 'contractId':
            return contractIdValue(source.contractId)
        case 'signatories':
            return parties(source.signatories)
        case 'stakeholders':
            return parties(source.stakeholders)
        case 'synchronizerId':
            return { sum: { oneofKind: 'text', text: source.synchronizerId } }
        case 'actAs':
            return parties(source.actAs)
        default:
            throw new PathError(`unknown container field '@.${name}'`)
    }
}

function parties(ids: readonly string[]): Value {
    return {
        sum: {
            oneofKind: 'list',
            list: {
                elements: ids.map((party) => ({
                    sum: { oneofKind: 'party' as const, party },
                })),
            },
        },
    }
}

function contractIdValue(id: string): Value {
    return { sum: { oneofKind: 'contractId', contractId: id } }
}

export type Step = { kind: 'name'; name: string } | { kind: 'key'; key: string }

export class PathError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PathError'
    }
}

const NAME = /^[A-Za-z_][A-Za-z0-9_]*/

/**
 * Parses a path into its steps. The path starts at the value it is resolved against; `@.contract.`
 * is stripped by the caller, which also picks that value.
 */
export function parsePath(path: string): Step[] {
    const steps: Step[] = []
    let pos = 0
    for (;;) {
        const name = NAME.exec(path.slice(pos))?.[0]
        if (name === undefined) {
            throw new PathError(`invalid path '${path}' at offset ${pos}`)
        }
        steps.push({ kind: 'name', name })
        pos += name.length
        while (path.startsWith('["', pos)) {
            const end = quotedKeyEnd(path, pos + 1)
            steps.push({ kind: 'key', key: mapKey(path, pos + 1, end) })
            pos = end + 2
        }
        if (pos === path.length) {
            return steps
        }
        if (path[pos] !== '.') {
            throw new PathError(`invalid path '${path}' at offset ${pos}`)
        }
        pos++
    }
}

// Returns the offset of the closing quote of the JSON string starting at `start`, which must be
// followed by `]`.
function quotedKeyEnd(s: string, start: number): number {
    for (let i = start + 1; i < s.length; i++) {
        if (s[i] === '\\') {
            i++
        } else if (s[i] === '"') {
            if (s[i + 1] !== ']') break
            return i
        }
    }
    throw new PathError(`unterminated map key in '${s}'`)
}

// `start` is the opening quote. `end` is the closing quote. The slice is a JSON string.
// JSON.parse throws SyntaxError on a bad escape; a field failure is a PathError.
function mapKey(path: string, start: number, end: number): string {
    const raw = path.slice(start, end + 1)
    try {
        const key: unknown = JSON.parse(raw)
        if (typeof key === 'string') return key
    } catch (err) {
        if (!(err instanceof SyntaxError)) throw err
    }
    throw new PathError(`invalid map key in '${path}'`)
}

export interface Resolved {
    value: Value
    /**
     * Set when a record has no field labelled as the path names. The ledger leaves trailing `None`
     * fields out of a record, and upgrades only append optional fields, so such a field is taken to
     * be `None`. A mistyped path looks the same.
     */
    absentField?: string
}

const NONE: Value = { sum: { oneofKind: 'optional', optional: {} } }

/**
 * Resolves the steps of a path against a Daml value. A name step selects a record field by label, or
 * the payload of a variant with that constructor. `Some` is unwrapped at every step. A `None` at any
 * step, or a record field that is not in the record, resolves the whole path to `None`; for a
 * missing field, `absentField` is set. A final `length` step on a list or text map yields its number
 * of elements as an int64.
 *
 * @throws PathError when a step does not resolve
 */
export function resolvePath(root: Value, steps: Step[]): Resolved {
    let current = root
    for (const [i, step] of steps.entries()) {
        const v = unwrapSome(current)
        if (isNone(v)) {
            return { value: NONE }
        }
        if (step.kind === 'name' && lacksField(v, step.name)) {
            return { value: NONE, absentField: step.name }
        }
        current = applyStep(v, step, i === steps.length - 1)
    }
    return { value: unwrapSome(current) }
}

function lacksField(v: Value, name: string): boolean {
    return (
        v.sum.oneofKind === 'record' &&
        !v.sum.record.fields.some((f) => f.label === name)
    )
}

export function isNone(v: Value): boolean {
    return v.sum.oneofKind === 'optional' && !v.sum.optional.value
}

function applyStep(v: Value, step: Step, isLast: boolean): Value {
    const sum = v.sum
    switch (step.kind) {
        case 'key': {
            if (sum.oneofKind !== 'textMap') {
                throw new PathError(
                    `map key '${step.key}' applied to ${describeKind(v)}`
                )
            }
            const entry = sum.textMap.entries.find((e) => e.key === step.key)
            if (!entry) {
                throw new PathError(`no map entry '${step.key}'`)
            }
            return present(entry.value)
        }
        case 'name':
            return selectName(v, step.name, isLast)
    }
}

function selectName(v: Value, name: string, isLast: boolean): Value {
    const sum = v.sum
    switch (sum.oneofKind) {
        case 'record': {
            // resolvePath handles a missing field before it gets here
            const field = sum.record.fields.find((f) => f.label === name)
            return present(field?.value)
        }
        case 'variant':
            if (sum.variant.constructor !== name) {
                throw new PathError(
                    `variant is constructor '${sum.variant.constructor}', not '${name}'`
                )
            }
            return present(sum.variant.value)
        case 'list':
            if (name === 'length' && isLast) {
                return int64(sum.list.elements.length)
            }
            break
        case 'textMap':
            if (name === 'length' && isLast) {
                return int64(sum.textMap.entries.length)
            }
            break
    }
    throw new PathError(`'${name}' applied to ${describeKind(v)}`)
}

// Unwraps Some, however nested. A None has nothing to unwrap and is returned as is.
function unwrapSome(v: Value): Value {
    let current = v
    while (current.sum.oneofKind === 'optional' && current.sum.optional.value) {
        current = current.sum.optional.value
    }
    return current
}

function present(v: Value | undefined): Value {
    if (!v) {
        throw new PathError('value is missing')
    }
    return v
}

function int64(n: number): Value {
    return { sum: { oneofKind: 'int64', int64: String(n) } }
}

export function describeKind(v: Value): string {
    return v.sum.oneofKind ?? 'an empty value'
}
