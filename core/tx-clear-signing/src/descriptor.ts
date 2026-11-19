// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

import { ENUM_REF_PREFIX, UNSAFE_CLASS } from './format.ts'
import { parseIntent } from './intent.ts'
import {
    EXERCISE_ONLY_CONTAINER_FIELDS,
    SHARED_CONTAINER_FIELDS,
} from './path.ts'
import {
    ED25519_PUBLIC_KEY_PATTERN,
    ED25519_SIGNATURE_PATTERN,
} from './signature.ts'

// The patterns are those of canton-clear-signing-v1.schema.json. The conformance test runs the
// schema and this parser on the same examples.
const SCHEMA_ID = 'https://example.org/canton-clear-signing/v1/schema.json'

const NAME = '[A-Za-z_][A-Za-z0-9_]*'
// A map key is a JSON string. Escapes are the JSON ones, and the key text has no control, format,
// or line-separator character, the same set display text rejects.
const MAP_KEY = String.raw`\["(?:[^"\\\p{Cc}\p{Cf}\p{Zl}\p{Zp}]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"\]`
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
const pathPattern = new RegExp(
    `^(?:${STEPS}|@\\.contract\\.${STEPS}|@\\.(?:${EXERCISE_CONTAINER}))$`,
    'u'
)
/** A path of a create field: the create argument, or a container field shared with exercises. */
const argumentPathPattern = new RegExp(
    `^(?:${STEPS}|@\\.(?:${SHARED_CONTAINER}))$`,
    'u'
)
const enumRef = new RegExp(`^\\$\\.metadata\\.enums\\.${NAME}$`)
const semver =
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/
const safe = `[^${UNSAFE_CLASS}]`
const nonSpace = `[^\\s${UNSAFE_CLASS}]`
/** Display text: a non-whitespace character, and no control or format characters. */
const displayText = new RegExp(`^${safe}*${nonSpace}${safe}*$`, 'u')
/** Display text with no leading or trailing whitespace. */
const trimmedLine = new RegExp(`^${nonSpace}(?:${safe}*${nonSpace})?$`, 'u')
/** Like `trimmedLine`, and without braces, so it cannot contain a placeholder. */
const stableIntent = new RegExp(
    `^[^\\s{}${UNSAFE_CLASS}](?:${safe}*[^\\s{}${UNSAFE_CLASS}])?$`,
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
            label: z.string().regex(displayText).optional(),
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
const ArgumentFieldSchema: z.ZodType<Field> = fieldSchema(argumentPathPattern)
/** A field of an exercise: its path may read the exercised contract. */
const ExerciseFieldSchema: z.ZodType<Field> = fieldSchema(pathPattern)

function operationSchema(field: z.ZodType<Field>) {
    return z.strictObject({
        intent: z.string().regex(stableIntent),
        interpolatedIntent: z.string().regex(displayText).optional(),
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

const EnumTableSchema = z
    .record(
        z.union([z.string().regex(identifier), z.literal(['true', 'false'])]),
        z.string().regex(displayText)
    )
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
        publisher: z.string().regex(trimmedLine),
        name: z.string().regex(trimmedLine),
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
    for (const f of fields) {
        if (seen.has(f.path)) {
            problems.push(
                `${where}: field '${f.path}' is declared more than once`
            )
        }
        seen.add(f.path)
        const enumName = f.params?.$ref.slice(ENUM_REF_PREFIX.length)
        if (enumName !== undefined && !d.metadata.enums?.[enumName]) {
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
