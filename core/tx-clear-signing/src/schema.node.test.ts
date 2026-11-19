// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import addFormats from 'ajv-formats'
import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import schema from '../canton-clear-signing-v1.schema.json'
import ping from '../examples/descriptors/ping.json'
import { parseDescriptor, parseDescriptorText } from './descriptor.ts'
import {
    EXERCISE_ONLY_CONTAINER_FIELDS,
    SHARED_CONTAINER_FIELDS,
} from './path.ts'
import {
    ED25519_PUBLIC_KEY_PATTERN,
    ED25519_SIGNATURE_PATTERN,
} from './signature.ts'
import { parseJsonStrict } from './strict-json.ts'

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
    query: '?raw',
}) as Record<string, string>

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

    it.each(Object.entries(invalid))('rejects %s', (name, text) => {
        expect(() => parseDescriptorText(text)).toThrow()
        try {
            const json = parseJsonStrict(text)
            expect(validate(json), name).toBe(false)
        } catch {
            // The text is not I-JSON, so the schema never sees a value.
        }
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

    it('uses the same signature patterns as the parser', () => {
        const entry = (
            schema as {
                $signatures?: {
                    entry?: {
                        properties?: {
                            signature?: { pattern?: string }
                            publicKey?: { pattern?: string }
                        }
                    }
                }
            }
        ).$signatures?.entry?.properties
        expect(entry?.signature?.pattern).toBe(ED25519_SIGNATURE_PATTERN.source)
        expect(entry?.publicKey?.pattern).toBe(
            ED25519_PUBLIC_KEY_PATTERN.source
        )
        expect(entry).not.toHaveProperty('scheme.const')
        expect(entry).not.toHaveProperty('hashAlgorithm.const')
    })

    it('accepts a scheme other than ed25519', () => {
        const json = {
            ...ping,
            signatures: [
                {
                    scheme: 'rsa',
                    signature:
                        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
                    publicKey: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
                },
            ],
        }
        expect(validate(json), JSON.stringify(validate.errors)).toBe(true)
        expect(() => parseDescriptor(json)).not.toThrow()
    })

    it('accepts a descriptor with no signatures', () => {
        const { signatures: _signatures, ...unsigned } = ping
        expect(validate(unsigned), JSON.stringify(validate.errors)).toBe(true)
        expect(validate({ ...unsigned, signatures: [] })).toBe(true)
        expect(() => parseDescriptor(unsigned)).not.toThrow()
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
