// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

export const REDACTED = '*****'

interface JsonSchema {
    properties?: Record<string, JsonSchema>
    items?: JsonSchema
    anyOf?: JsonSchema[]
    oneOf?: JsonSchema[]
    allOf?: JsonSchema[]
    secret?: boolean
}

// A schema and all union branches it can take
function branches(schema: JsonSchema): JsonSchema[] {
    return [
        schema,
        ...[
            ...(schema.anyOf ?? []),
            ...(schema.oneOf ?? []),
            ...(schema.allOf ?? []),
        ].flatMap(branches),
    ]
}

function redact(schemas: JsonSchema[], value: unknown): unknown {
    if (Array.isArray(value)) {
        const items = schemas.flatMap((schema) =>
            schema.items ? branches(schema.items) : []
        )
        return value.map((item) => redact(items, item))
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => {
                const properties = schemas.flatMap((schema) =>
                    schema.properties?.[key] ? [schema.properties[key]] : []
                )
                // Values the schema does not describe, e.g. extra driver
                // options of the postgres connection, are redacted as well
                const isSecret =
                    properties.length === 0 ||
                    properties.flatMap(branches).some((p) => p.secret === true)
                return [
                    key,
                    isSecret
                        ? REDACTED
                        : redact(properties.flatMap(branches), entry),
                ]
            })
        )
    }
    return value
}

/**
 * Returns a copy of `value` in which every field marked with
 * `.meta({ secret: true })` in `schema`, and every field that `schema` does
 * not describe, is replaced by a placeholder. A field marked as secret in any
 * union branch is redacted.
 */
export function redactSecrets(schema: z.ZodType, value: unknown): unknown {
    const jsonSchema = z.toJSONSchema(schema, {
        io: 'input',
        unrepresentable: 'any',
    }) as JsonSchema
    return redact(branches(jsonSchema), value)
}
