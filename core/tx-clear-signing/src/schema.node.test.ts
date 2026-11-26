// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import schema from '@canton-network/core-tx-clear-signing-lib/canton-clear-signing-v1.schema.json'
import addFormats from 'ajv-formats'
import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import ping from '../examples/descriptors/ping.json'
import {
    CREATE_PATH_PATTERN,
    DISPLAY_TEXT,
    NO_BRACES,
    parseDescriptor,
    parseDescriptorText,
    PATH_PATTERN,
} from './descriptor.ts'
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
})
addFormats(ajv)
const validate = ajv.compile(schema)

function schemaPatterns(): { path: string; createPath: string } {
    const format = (
        schema as {
            $defs?: {
                path?: { pattern?: string }
                createPath?: { pattern?: string }
            }
        }
    ).$defs
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
                $defs?: {
                    signature?: {
                        properties?: {
                            signature?: { pattern?: string }
                            publicKey?: { pattern?: string }
                        }
                    }
                }
            }
        ).$defs?.signature?.properties
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
        expect(schema).not.toHaveProperty('$defs.argumentPath')
        for (const name of SHARED_CONTAINER_FIELDS) {
            expect(path).toContain(name)
            expect(createPath).toContain(name)
        }
        for (const name of EXERCISE_ONLY_CONTAINER_FIELDS) {
            expect(path).toContain(name)
            expect(createPath).not.toContain(name)
        }
    })

    it('keeps its definitions under $defs and compiles in strict mode', () => {
        const root = schema as Record<string, unknown>
        const standard = new Set(['$schema', '$id', '$defs', '$comment'])
        const custom = Object.keys(root).filter(
            (k) => k.startsWith('$') && !standard.has(k)
        )
        expect(custom).toEqual([])

        const defs = new Set(Object.keys(root.$defs as object))
        const refs = [
            ...JSON.stringify(schema).matchAll(/"\$ref":"#\/([^"]*)"/g),
        ]
        expect(refs.length).toBeGreaterThan(0)
        for (const [, pointer] of refs) {
            const [dir, name] = (pointer ?? '').split('/')
            expect(dir, pointer).toBe('$defs')
            expect(defs.has(name ?? ''), pointer).toBe(true)
        }

        // `version` is an annotation, as in ERC-7730; every other keyword is a JSON Schema one.
        // `strictRequired` and `strictTypes` are ajv style lints, not rules of the specification.
        const strict = new Ajv2020({
            strict: true,
            strictRequired: false,
            strictTypes: false,
        })
        addFormats(strict)
        strict.addKeyword('version')
        expect(() => strict.compile(schema)).not.toThrow()
    })

    it('uses the same text and path patterns as the parser', () => {
        const s = schema as unknown as SchemaShape
        expect(s.$defs.displayText.pattern).toBe(DISPLAY_TEXT.source)
        expect(s.$defs.stableIntent.pattern).toBe(NO_BRACES.source)
        expect(s.$defs.path.pattern).toBe(PATH_PATTERN.source)
        expect(s.$defs.createPath.pattern).toBe(CREATE_PATH_PATTERN.source)
    })
})

interface Patterned {
    pattern?: string
}

interface SchemaShape {
    $defs: {
        path: Patterned
        createPath: Patterned
        displayText: Patterned
        stableIntent: Patterned
    }
}
