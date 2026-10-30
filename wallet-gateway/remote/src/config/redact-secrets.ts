// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'

export const REDACTED = '*****'

interface JsonSchemaField {
    secret?: boolean
}

/**
 * Collects the names of all fields described anywhere in a JSON schema, and
 * the names of the fields marked with `.meta({ secret: true })`.
 */
export function collectFieldNames(
    jsonSchema: unknown,
    known = new Set<string>(),
    secret = new Set<string>()
): { known: Set<string>; secret: Set<string> } {
    if (jsonSchema !== null && typeof jsonSchema === 'object') {
        const { properties } = jsonSchema as {
            properties?: Record<string, JsonSchemaField>
        }
        for (const [name, field] of Object.entries(properties ?? {})) {
            known.add(name)
            if (field.secret === true) secret.add(name)
        }
        for (const child of Object.values(jsonSchema)) {
            collectFieldNames(child, known, secret)
        }
    }
    return { known, secret }
}

/**
 * Returns a copy of `value` in which every field whose name is marked as
 * secret somewhere in `schema`, and every field whose name `schema` does not
 * describe at all (e.g. extra postgres driver options), is replaced by a
 * placeholder.
 */
export function redactSecrets(
    schema: z.ZodType,
    value: Record<string, unknown>
): Record<string, unknown> {
    const { known, secret } = collectFieldNames(
        z.toJSONSchema(schema, { io: 'input' })
    )
    return JSON.parse(
        JSON.stringify(value, function (this: unknown, key, entry) {
            // The root object and array indices are not fields
            if (key === '' || Array.isArray(this)) return entry
            return known.has(key) && !secret.has(key) ? entry : REDACTED
        })
    )
}
