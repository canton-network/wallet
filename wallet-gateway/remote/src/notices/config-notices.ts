// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod'
import { type RawConfig, rawConfigSchema } from '../config/Config.js'
import type { ServerNotices } from './server-notices.js'

interface JsonSchema {
    properties?: Record<string, JsonSchema>
    items?: JsonSchema
    anyOf?: JsonSchema[]
    oneOf?: JsonSchema[]
    deprecated?: boolean
    description?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object'
}

function* findDeprecatedFields(
    schema: JsonSchema,
    value: unknown,
    path: string
): Generator<{ path: string; description?: string }> {
    // Every union branch is checked, regardless of which one the value matches.
    // This is fine as long as no field is deprecated in only some branches.
    for (const branch of [...(schema.anyOf ?? []), ...(schema.oneOf ?? [])]) {
        yield* findDeprecatedFields(branch, value, path)
    }
    if (Array.isArray(value) && schema.items) {
        for (const [index, item] of value.entries()) {
            yield* findDeprecatedFields(schema.items, item, `${path}[${index}]`)
        }
    } else if (isRecord(value) && schema.properties) {
        for (const [key, property] of Object.entries(schema.properties)) {
            if (value[key] === undefined) continue
            const propertyPath = path ? `${path}.${key}` : key
            if (property.deprecated) {
                yield { path: propertyPath, description: property.description }
            }
            yield* findDeprecatedFields(property, value[key], propertyPath)
        }
    }
}

/**
 * Reports a notice for every config field that is set but marked as
 * deprecated in the config schema.
 */
export function reportDeprecatedConfig(
    rawConfig: RawConfig,
    notices: ServerNotices
): void {
    const schema = z.toJSONSchema(rawConfigSchema, {
        io: 'input',
    }) as JsonSchema
    const seen = new Set<string>()
    for (const { path, description } of findDeprecatedFields(
        schema,
        rawConfig,
        ''
    )) {
        // A field can be found once per matching union branch
        if (seen.has(path)) continue
        seen.add(path)
        notices.report({
            id: `deprecated-config:${path}`,
            severity: 'warning',
            message:
                `Config field ${path} is deprecated. ${description ?? ''}`.trim(),
            configPath: path,
        })
    }
}
