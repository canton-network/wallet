// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'
import schema from '../canton-clear-signing-v1.schema.json'
import ping from '../examples/descriptors/ping.json'
import { parseDescriptor } from './descriptor.js'
import {
    EXERCISE_ONLY_CONTAINER_FIELDS,
    SHARED_CONTAINER_FIELDS,
} from './path.js'

const valid = {
    ...import.meta.glob('../examples/descriptors/*.json', {
        eager: true,
        import: 'default',
    }),
    ...import.meta.glob('../examples/descriptors/splice/*.json', {
        eager: true,
        import: 'default',
    }),
} as Record<string, unknown>
const invalid = import.meta.glob('../examples/descriptors/invalid/*.json', {
    eager: true,
    import: 'default',
}) as Record<string, unknown>

const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    unicodeRegExp: true,
})
addFormats(ajv)
const validate = ajv.compile(schema)

function schemaPatterns(): { path: string; createPath: string } {
    const format = (
        schema as {
            $format?: {
                path?: { pattern?: string }
                createPath?: { pattern?: string }
            }
        }
    ).$format
    return {
        path: format?.path?.pattern ?? '',
        createPath: format?.createPath?.pattern ?? '',
    }
}

describe('schema conformance', () => {
    it.each(Object.entries(valid))('accepts %s', (name, json) => {
        const ok = validate(json)
        expect(ok, `${name}: ${JSON.stringify(validate.errors)}`).toBe(true)
        expect(() => parseDescriptor(json)).not.toThrow()
    })

    it.each(Object.entries(invalid))('rejects %s', (name, json) => {
        expect(validate(json), name).toBe(false)
        expect(() => parseDescriptor(json)).toThrow()
    })

    it('accepts an optional interface package ID', () => {
        const json = {
            ...ping,
            display: {
                exercises: [
                    {
                        choice: 'Respond',
                        intent: 'Respond to ping',
                        interface: {
                            packageId: ping.context.template.packageId,
                            moduleName: ping.context.template.moduleName,
                            entityName: 'Ping',
                        },
                    },
                ],
            },
        }
        expect(validate(json), JSON.stringify(validate.errors)).toBe(true)
        expect(() => parseDescriptor(json)).not.toThrow()
    })

    it('uses the same container fields as the parser', () => {
        const { path, createPath } = schemaPatterns()
        expect(schema).not.toHaveProperty('$format.argumentPath')
        for (const name of SHARED_CONTAINER_FIELDS) {
            expect(path).toContain(name)
            expect(createPath).toContain(name)
        }
        for (const name of EXERCISE_ONLY_CONTAINER_FIELDS) {
            expect(path).toContain(name)
            expect(createPath).not.toContain(name)
        }
    })
})
