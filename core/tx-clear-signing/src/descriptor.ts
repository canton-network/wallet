// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

import {
    ENUM_REF_PREFIX,
    MAX_MARK_RUN,
    STACKING_MARK_CLASS,
    UNSAFE_CLASS,
} from './format.ts'
import { parseIntent } from './intent.ts'
import {
    EXERCISE_ONLY_CONTAINER_FIELDS,
    SHARED_CONTAINER_FIELDS,
} from './path.ts'
import {
    ED25519_PUBLIC_KEY_PATTERN,
    ED25519_SIGNATURE_PATTERN,
} from './signature.ts'
import {
    assertDescriptorSize,
    parseJsonStrict,
    StrictJsonError,
} from './strict-json.ts'

// The patterns are those of canton-clear-signing-v1.schema.json. The conformance test runs the
// schema and this parser on the same examples.
const SCHEMA_ID = 'https://example.org/canton-clear-signing/v1/schema.json'

const NAME = '[A-Za-z_][A-Za-z0-9_]*'
// A map key is a JSON string. Escapes are the JSON ones, and the key text has none of the characters
// display text rejects.
const MAP_KEY = String.raw`\["(?:[^"\\${UNSAFE_CLASS}]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"\]`
// Every step is a name, with optional map-key steps. There is no step for every element of a list or
// map: a field shows a list or map of variable size as a whole, with the raw format.
const NAME_STEP = `${NAME}(?:${MAP_KEY})*`
const STEPS = `${NAME_STEP}(?:\\.${NAME_STEP})*`

const identifier = new RegExp(`^${NAME}$`)
const dottedName = new RegExp(`^${NAME}(?:\\.${NAME})*$`)
const packageId = /^[0-9a-f]{64}$/
const SHARED_CONTAINER = SHARED_CONTAINER_FIELDS.join('|')
const EXERCISE_CONTAINER = [
    ...SHARED_CONTAINER_FIELDS,
    ...EXERCISE_ONLY_CONTAINER_FIELDS,
].join('|')
/** A path of an exercise field: the choice argument, the exercised contract, or a container field. */
export const PATH_PATTERN = new RegExp(
    `^(?:${STEPS}|@\\.contract\\.${STEPS}|@\\.(?:${EXERCISE_CONTAINER}))$`,
    'u'
)
/** A path of a create field: the create argument, or a container field shared with exercises. */
export const CREATE_PATH_PATTERN = new RegExp(
    `^(?:${STEPS}|@\\.(?:${SHARED_CONTAINER}))$`,
    'u'
)
const enumRef = new RegExp(`^\\$\\.metadata\\.enums\\.${NAME}$`)
const semver =
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/
const safe = `[^${UNSAFE_CLASS}]`
const nonSpace = `[^\\s${UNSAFE_CLASS}]`
// No run of more stacking marks than `sanitize` shows.
const noMarkRun = `(?!.*[${STACKING_MARK_CLASS}]{${MAX_MARK_RUN + 1}})`
/** Display text: a non-whitespace character, no unsafe character, and no long run of marks. */
export const DISPLAY_TEXT = new RegExp(
    `^${noMarkRun}${safe}*${nonSpace}${safe}*$`,
    'u'
)
/** Display text with no leading or trailing whitespace. */
export const TRIMMED_LINE = new RegExp(
    `^${noMarkRun}${nonSpace}(?:${safe}*${nonSpace})?$`,
    'u'
)
/** Like `TRIMMED_LINE`, and without braces, so it cannot contain a placeholder. */
export const STABLE_INTENT = new RegExp(
    `^${noMarkRun}[^\\s{}${UNSAFE_CLASS}](?:${safe}*[^\\s{}${UNSAFE_CLASS}])?$`,
    'u'
)

const FORMATS = [
    'string',
    'number',
    'boolean',
    'party',
    'contractId',
    'dateTime',
    'duration',
    'enum',
    'raw',
] as const

/**
 * Caps that keep a descriptor small enough to parse and show. They guard against abuse; how much of a
 * long text fits on a screen is the wallet's concern. Lengths count Unicode code points, as JSON
 * Schema's maxLength does. The schema file states the same values.
 */
export const LIMITS = {
    /** A field label, the publisher, the name and an enum value. */
    text: 256,
    /** `intent` and `interpolatedIntent`. */
    intent: 512,
    comment: 4096,
    path: 1024,
    fieldsPerOperation: 256,
    exercises: 256,
    enumTables: 256,
    enumEntries: 1024,
    signatures: 16,
} as const

function codePoints(s: string): number {
    let n = 0
    for (const _ of s) n++
    return n
}

/** A string of at most `max` code points that matches `pattern`, when given. */
function text(max: number, pattern?: RegExp) {
    const capped = z.string().refine((s) => codePoints(s) <= max, {
        message: `must be at most ${max} characters`,
        abort: true,
    })
    return pattern ? capped.regex(pattern) : capped
}

/** A value to display. `optional` allows the value to be None. */
export interface Field {
    path: string
    label?: string | undefined
    format?: Format | undefined
    params?: { $ref: string } | undefined
    /** True when the path may pass through an Optional. None is shown as None. */
    optional?: boolean | undefined
}

function fieldSchema(path: RegExp) {
    return z
        .strictObject({
            path: text(LIMITS.path, path),
            label: text(LIMITS.text, DISPLAY_TEXT).optional(),
            format: z.enum(FORMATS).optional(),
            params: z
                .strictObject({ $ref: z.string().regex(enumRef) })
                .optional(),
            optional: z.boolean().optional(),
        })
        .refine((f) => (f.format === 'enum') === (f.params !== undefined), {
            message:
                "params are required with format 'enum' and forbidden otherwise",
        })
}

/** A field of a create: an argument path, or a container field shared with exercises. */
const ArgumentFieldSchema: z.ZodType<Field> = fieldSchema(CREATE_PATH_PATTERN)
/** A field of an exercise: its path may read the exercised contract. */
const ExerciseFieldSchema: z.ZodType<Field> = fieldSchema(PATH_PATTERN)

function operationSchema(field: z.ZodType<Field>) {
    return z.strictObject({
        intent: text(LIMITS.intent, STABLE_INTENT),
        interpolatedIntent: text(LIMITS.intent, DISPLAY_TEXT).optional(),
        fields: z.array(field).max(LIMITS.fieldsPerOperation).optional(),
    })
}

const CreateSchema = operationSchema(ArgumentFieldSchema)

const TemplateIdSchema = z.strictObject({
    packageId: z.string().regex(packageId),
    moduleName: z.string().regex(dottedName),
    entityName: z.string().regex(identifier),
})

/**
 * An interface the template implements. `packageId` is optional. Omit it when the template's
 * package ID already selects the interface package the template was compiled against. Set it to
 * match only that package.
 */
const InterfaceSchema = z.strictObject({
    packageId: z.string().regex(packageId).optional(),
    moduleName: z.string().regex(dottedName),
    entityName: z.string().regex(identifier),
})

/** One choice of the template. `interface`, when set, names the interface the entry is for. */
const ExerciseSchema = operationSchema(ExerciseFieldSchema).extend({
    choice: z.string().regex(identifier),
    interface: InterfaceSchema.optional(),
})

const enumTableKey = z.union([
    z.string().regex(identifier),
    z.literal(['true', 'false']),
])

const EnumTableSchema = recordWithoutProto(
    enumTableKey,
    text(LIMITS.text, DISPLAY_TEXT),
    LIMITS.enumEntries
).refine((table) => Object.keys(table).length > 0, {
    message: 'an enum table needs at least one entry',
})

const DescriptorSchema = z.strictObject({
    $schema: z.literal(SCHEMA_ID, {
        error: `unsupported schema; expected '${SCHEMA_ID}'`,
    }),
    $comment: text(LIMITS.comment).optional(),
    context: z.strictObject({
        template: TemplateIdSchema,
    }),
    metadata: z.strictObject({
        version: z.string().regex(semver),
        publisher: text(LIMITS.text, TRIMMED_LINE),
        name: text(LIMITS.text, TRIMMED_LINE),
        url: z.url().optional(),
        enums: recordWithoutProto(
            z.string().regex(identifier),
            EnumTableSchema,
            LIMITS.enumTables
        ).optional(),
    }),
    display: z
        .strictObject({
            create: CreateSchema.optional(),
            exercises: z
                .array(ExerciseSchema)
                .min(1)
                .max(LIMITS.exercises)
                .optional(),
        })
        .refine((d) => d.create !== undefined || d.exercises !== undefined, {
            message: 'display needs create or exercises',
        }),
    signatures: z
        .array(
            z.strictObject({
                scheme: z.string(),
                hashAlgorithm: z.string().optional(),
                signature: z.string().regex(ED25519_SIGNATURE_PATTERN),
                publicKey: z.string().regex(ED25519_PUBLIC_KEY_PATTERN),
            })
        )
        .max(LIMITS.signatures)
        .optional(),
})

export type Descriptor = z.infer<typeof DescriptorSchema>
export type Operation = z.infer<typeof CreateSchema>
/** An exercise entry: an operation for one choice, and the interface it is exercised through. */
export type Exercise = z.infer<typeof ExerciseSchema>
export type Format = (typeof FORMATS)[number]

export class DescriptorError extends Error {
    constructor(readonly problems: string[]) {
        super(`invalid clear-signing descriptor: ${problems.join('; ')}`)
        this.name = 'DescriptorError'
    }
}

/**
 * Validates descriptor JSON against the v1 schema, and then against the rules a JSON Schema cannot
 * express: an operation declares each path once, every placeholder equals the path of a field of the
 * same operation, every enum reference names a table, and no two exercise entries name the same
 * choice and interface.
 *
 * A descriptor that fails and still names a root template leaves that root `invalid`; the other
 * roots are still described.
 *
 * @throws DescriptorError listing every problem found
 */
/**
 * Parses descriptor text. Duplicate member names, lone surrogates and trailing data are rejected
 * before the schema is applied, because `JSON.parse` would drop them.
 *
 * @throws DescriptorError listing every problem found
 */
export function parseDescriptorText(text: string): Descriptor {
    try {
        assertDescriptorSize(text)
        return parseDescriptor(parseJsonStrict(text))
    } catch (err) {
        if (!(err instanceof StrictJsonError)) throw err
        throw new DescriptorError([err.message])
    }
}

export function parseDescriptor(json: unknown): Descriptor {
    const result = DescriptorSchema.safeParse(json)
    if (!result.success) {
        throw new DescriptorError(
            result.error.issues.map(
                (issue) =>
                    `${issue.path.join('.') || '<root>'}: ${issue.message}`
            )
        )
    }
    const problems = crossReferenceProblems(result.data)
    if (problems.length > 0) {
        throw new DescriptorError(problems)
    }
    return result.data
}

function crossReferenceProblems(d: Descriptor): string[] {
    const create = d.display.create
    const problems = create ? operationProblems(d, 'create', create) : []
    const seen = new Set<string>()
    for (const [i, exercise] of (d.display.exercises ?? []).entries()) {
        const key = exerciseKey(exercise)
        if (seen.has(key)) {
            problems.push(
                `exercises[${i}] (${exercise.choice}): the same choice and interface is already described`
            )
        }
        seen.add(key)
        problems.push(
            ...operationProblems(
                d,
                `exercises[${i}] (${exercise.choice})`,
                exercise
            )
        )
    }
    return problems
}

// An entry without an interface is keyed by its choice alone, so it cannot be repeated either.
// A package ID, when set, is part of the key, so one entry can name the package and another can omit it.
function exerciseKey(exercise: Exercise): string {
    const iface = exercise.interface
    if (!iface) return exercise.choice
    const name = `${iface.moduleName}:${iface.entityName}`
    return iface.packageId
        ? `${exercise.choice} via ${iface.packageId}:${name}`
        : `${exercise.choice} via ${name}`
}

function operationProblems(
    d: Descriptor,
    where: string,
    op: Operation
): string[] {
    const problems = fieldProblems(d, where, op.fields ?? [])
    let segments
    try {
        segments = parseIntent(op.interpolatedIntent ?? '')
    } catch (err) {
        return [...problems, `${where}: ${(err as Error).message}`]
    }
    const paths = fieldPaths(op)
    for (const segment of segments) {
        if (segment.kind === 'placeholder' && !paths.includes(segment.path)) {
            problems.push(
                `${where}: placeholder '${segment.path}' has no field with that path`
            )
        }
    }
    return problems
}

// Checks that a list of fields declares each path once, and that every enum reference names a table.
function fieldProblems(
    d: Descriptor,
    where: string,
    fields: Field[]
): string[] {
    const problems: string[] = []
    const seen = new Set<string>()
    const tables = d.metadata.enums
    for (const f of fields) {
        if (seen.has(f.path)) {
            problems.push(
                `${where}: field '${f.path}' is declared more than once`
            )
        }
        seen.add(f.path)
        const enumName = f.params?.$ref.slice(ENUM_REF_PREFIX.length)
        const defined =
            enumName !== undefined &&
            tables !== undefined &&
            Object.hasOwn(tables, enumName)
        if (enumName !== undefined && !defined) {
            problems.push(
                `${where}: field '${f.path}' references missing enum '${f.params?.$ref}'`
            )
        }
    }
    return problems
}

// The paths an interpolatedIntent may name: the operation's fields.
function fieldPaths(op: Operation): string[] {
    return (op.fields ?? []).map((f) => f.path)
}

/**
 * A record schema that rejects an own `__proto__` key.
 *
 * `z.record` drops that key before the key schema runs. Checking the input keeps the parsed
 * descriptor equal to the bytes that were signed.
 */
function recordWithoutProto<V extends z.ZodType>(
    key: z.ZodType<string>,
    value: V,
    maxEntries: number
): z.ZodType<Record<string, z.infer<V>>> {
    const record = z.record(key, value)
    return z
        .unknown()
        .superRefine((input, ctx) => {
            if (hasOwnProto(input)) {
                ctx.addIssue({
                    code: 'custom',
                    message: "'__proto__' is not allowed",
                })
            }
            if (isObject(input) && Object.keys(input).length > maxEntries) {
                ctx.addIssue({
                    code: 'custom',
                    message: `must have at most ${maxEntries} entries`,
                })
            }
        })
        .pipe(record)
}

function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOwnProto(value: unknown): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.hasOwn(value, '__proto__')
    )
}
