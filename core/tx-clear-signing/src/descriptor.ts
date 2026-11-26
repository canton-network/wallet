// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

import { ENUM_REF_PREFIX } from './format.ts'
import { parseIntent } from './intent.ts'
import {
    EXERCISE_ONLY_CONTAINER_FIELDS,
    SHARED_CONTAINER_FIELDS,
} from './path.ts'
import {
    ED25519_PUBLIC_KEY_PATTERN,
    ED25519_SIGNATURE_PATTERN,
} from './signature.ts'
import { parseJsonStrict, StrictJsonError } from './strict-json.ts'

// The patterns are those of the meta-schema in core-tx-clear-signing-lib. The conformance test runs
// the schema and this parser on the same examples.
const SCHEMA_ID = 'https://example.org/canton-clear-signing/v1/schema.json'

const NAME = '[A-Za-z_][A-Za-z0-9_]*'
// A map key is a JSON string: no unescaped quote, backslash or control character, and the JSON escapes.
const MAP_KEY = String.raw`\["(?:[^"\\\x00-\x1f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"\]`
// A name, then map keys and further names. There is no step for every element of a list or map: a
// field shows a list or map of variable size as a whole, with the raw format.
const STEPS = `${NAME}(?:${MAP_KEY}|\\.${NAME})*`

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
    `^(?:(?:@\\.contract\\.)?${STEPS}|@\\.(?:${EXERCISE_CONTAINER}))$`
)
/** A path of a create field: the create argument, or a container field shared with exercises. */
export const CREATE_PATH_PATTERN = new RegExp(
    `^(?:${STEPS}|@\\.(?:${SHARED_CONTAINER}))$`
)
const enumRef = new RegExp(`^\\$\\.metadata\\.enums\\.${NAME}$`)
const semver =
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/
/** Display text: it contains a non-whitespace character. */
export const DISPLAY_TEXT = /\S/
/** Without braces, so display text cannot contain a placeholder. */
export const NO_BRACES = /^[^{}]*$/

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
            path: z.string().regex(path),
            label: z.string().regex(DISPLAY_TEXT).optional(),
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
        intent: z.string().regex(DISPLAY_TEXT).regex(NO_BRACES),
        interpolatedIntent: z.string().regex(DISPLAY_TEXT).optional(),
        fields: z.array(field).optional(),
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

// The keys are enum constructors, or `true` and `false` for a Bool; both are identifiers.
const EnumTableSchema = z
    .record(z.string().regex(identifier), z.string().regex(DISPLAY_TEXT))
    .refine((table) => Object.keys(table).length > 0, {
        message: 'an enum table needs at least one entry',
    })

const DescriptorSchema = z.strictObject({
    $schema: z.literal(SCHEMA_ID, {
        error: `unsupported schema; expected '${SCHEMA_ID}'`,
    }),
    $comment: z.string().optional(),
    context: z.strictObject({
        template: TemplateIdSchema,
    }),
    metadata: z.strictObject({
        version: z.string().regex(semver),
        publisher: z.string().regex(DISPLAY_TEXT),
        name: z.string().regex(DISPLAY_TEXT),
        url: z.url().optional(),
        enums: z
            .record(z.string().regex(identifier), EnumTableSchema)
            .optional(),
    }),
    display: z
        .strictObject({
            create: CreateSchema.optional(),
            exercises: z.array(ExerciseSchema).min(1).optional(),
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
 * Parses descriptor text. Duplicate member names, lone surrogates and trailing data are rejected
 * before the schema is applied, because `JSON.parse` would drop them.
 *
 * @throws DescriptorError listing every problem found
 */
export function parseDescriptorText(text: string): Descriptor {
    try {
        return parseDescriptor(parseJsonStrict(text))
    } catch (err) {
        if (!(err instanceof StrictJsonError)) throw err
        throw new DescriptorError([err.message])
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
