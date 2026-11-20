// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Exercise,
    PreparedTransaction,
    type Value,
} from '@canton-network/core-ledger-proto'
import { describe, expect, it } from 'vitest'

import pingJson from '../examples/descriptors/ping.json'
import {
    adminWorkflowsPingCreate,
    builtinPingCreate,
} from './__tests__/fixtures/ping.ts'
import allValues from './__tests__/fixtures/v2-create-all-values.json'
import createAndExercise from './__tests__/fixtures/v2-create-and-exercise.json'
import exerciseInterface from './__tests__/fixtures/v2-exercise-interface.json'
import nestedCreates from './__tests__/fixtures/v2-exercise-nested-creates.json'
import maps from './__tests__/fixtures/v2-maps.json'
import variantEnum from './__tests__/fixtures/v2-variant-enum.json'
import {
    described,
    encode,
    hashEither,
    intentText,
    rootNodeType,
    shown,
    OTHER,
    OWNER,
    VECTOR_PACKAGE,
    vectorDescriptor,
} from './__tests__/helpers.ts'
import { HashMismatchError, MISMATCH_INTENT, clearSign } from './clear-sign.ts'
import {
    DescriptorError,
    parseDescriptor,
    type Descriptor,
} from './descriptor.ts'
import { decode } from './roots.ts'
import { signDescriptor } from './signature.ts'
import { MAX_JSON_NESTING_DEPTH } from './strict-json.ts'
import { signWithReferenceKey } from './testing/reference-key.ts'
import { REFERENCE_SIGNER } from './trusted-keys.ts'

const ping = parseDescriptor(pingJson)
const ALICE =
    'v1-01-alice::1220ee2624190834dddf28f194685acee8f00cbde9ee0d211dae277f4d799884f289'
const PING_ID = '04d887dd-15b8-4954-8b79-a853811ce7cf'
const PING_DESCRIPTOR = {
    name: 'Canton ping',
    publisher: 'Blockdaemon',
    version: '1.0.0',
    signedBy: [REFERENCE_SIGNER],
}

const NO_ARGUMENT: Value = {
    sum: { oneofKind: 'record', record: { fields: [] } },
}

// An exercise on the Ping that builtinPingCreate creates, with that Ping as input contract.
function exercisePing(
    choiceId = 'Respond',
    chosenValue = NO_ARGUMENT
): PreparedTransaction {
    const created = decode(builtinPingCreate)
    const nodeType = rootNodeType(created)
    if (nodeType.oneofKind !== 'create') {
        throw new Error('fixture is not a create')
    }
    const create = nodeType.create
    const templateId = create.templateId
    if (!templateId) {
        throw new Error('fixture has no template ID')
    }
    return PreparedTransaction.create({
        transaction: {
            version: '2.1',
            roots: ['0'],
            nodeSeeds: [{ nodeId: 0, seed: new Uint8Array(32) }],
            nodes: [
                {
                    nodeId: '0',
                    versionedNode: {
                        oneofKind: 'v1',
                        v1: {
                            nodeType: {
                                oneofKind: 'exercise',
                                exercise: Exercise.create({
                                    lfVersion: create.lfVersion,
                                    contractId: create.contractId,
                                    packageName: create.packageName,
                                    templateId,
                                    choiceId,
                                    chosenValue,
                                    consuming: true,
                                }),
                            },
                        },
                    },
                },
            ],
        },
        metadata: {
            ...created.metadata,
            inputContracts: [
                {
                    contract: { oneofKind: 'v1', v1: create },
                    createdAt: 0n,
                },
            ],
        },
    })
}

describe('clearSign', () => {
    it('rejects a transaction without a transaction tree', async () => {
        // Hashing rejects it before it is described. An empty message is not canonical base64,
        // so the fixture carries a field and omits the transaction.
        const tx = encode(
            PreparedTransaction.create({
                metadata: { synchronizerId: 'sync::participant' },
            })
        )
        await expect(described(tx, [])).rejects.toThrow(
            'prepared transaction has no transaction'
        )
    })

    it('describes a Ping create', async () => {
        const result = await described(builtinPingCreate, [ping])
        expect(result).toEqual({
            complete: true,
            operations: [
                {
                    kind: 'create',
                    template: ping.context.template,
                    descriptor: PING_DESCRIPTOR,
                    status: 'described',
                    // Text read from the transaction is quoted, so it cannot pass as wording.
                    intent: `Ping "${PING_ID}" from ${ALICE} to ${ALICE}`,
                    fields: [
                        { label: 'Ping ID', value: `"${PING_ID}"` },
                        { label: 'Initiator', value: ALICE },
                        { label: 'Responder', value: ALICE },
                    ],
                },
            ],
        })
    })

    it('binds a descriptor to the exact package', async () => {
        // Same module and entity, different package: the descriptor does not bind.
        const [op] = (await described(adminWorkflowsPingCreate, [ping]))
            .operations
        expect(op).toMatchObject({
            status: 'undescribed',
            intent: 'Create Canton.Internal.Ping:Ping',
            fields: [],
        })
        expect(op).not.toHaveProperty('descriptor')
    })

    it('identifies a create without a descriptor', async () => {
        const [op] = (await described(builtinPingCreate, [])).operations
        expect(op).toMatchObject({ kind: 'create', status: 'undescribed' })
        expect(op).not.toHaveProperty('descriptor')
        expect(op).not.toHaveProperty('choiceId')
        expect(op).not.toHaveProperty('interface')
    })

    it('reads the exercised contract through @.contract', async () => {
        const [op] = (await described(encode(exercisePing()), [ping]))
            .operations
        expect(op).toMatchObject({
            kind: 'exercise',
            choiceId: 'Respond',
            descriptor: PING_DESCRIPTOR,
            status: 'described',
        })
        expect(intentText(op)).toBe(
            `Respond to ping "${PING_ID}" from ${ALICE}`
        )
        expect(op).not.toHaveProperty('interface')
    })

    it('identifies an exercise without a descriptor', async () => {
        const [op] = (await described(encode(exercisePing()), [])).operations
        expect(op).toMatchObject({
            kind: 'exercise',
            choiceId: 'Respond',
            status: 'undescribed',
        })
        expect(op).not.toHaveProperty('descriptor')
    })

    it('reports an exercise without an operation as undescribed', async () => {
        const createsOnly = parseDescriptor({
            ...pingJson,
            display: { create: pingJson.display.create },
        })
        const [op] = (await described(encode(exercisePing()), [createsOnly]))
            .operations
        expect(op).toMatchObject({
            status: 'undescribed',
            descriptor: PING_DESCRIPTOR,
        })
        expect(intentText(op)).toBe(
            'Exercise Respond on Canton.Internal.Ping:Ping'
        )
    })

    describe('a choice exercised through an interface', () => {
        const asset = {
            packageId: VECTOR_PACKAGE,
            moduleName: 'HashVectors',
            entityName: 'Asset',
        }
        const named = { moduleName: 'HashVectors', entityName: 'Asset' }
        const poke = (
            wording: string,
            iface?: {
                moduleName: string
                entityName: string
                packageId?: string
            }
        ) => ({
            choice: 'Poke',
            ...(iface && { interface: iface }),
            intent: 'Poke',
            interpolatedIntent: `${wording} {@.contract.owner}`,
            fields: [{ path: '@.contract.owner', format: 'party' }],
        })
        const throughAsset = vectorDescriptor('Plain', {
            exercises: [poke('Poke, through Asset, the asset of', named)],
        })

        it('uses the entry for that interface', async () => {
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [
                    throughAsset,
                ])
            ).operations
            expect(op).toMatchObject({
                choiceId: 'Poke',
                interface: asset,
                status: 'described',
            })
            expect(intentText(op)).toBe(
                `Poke, through Asset, the asset of ${OWNER}`
            )
        })

        it('uses an entry that names no interface when none names this one', async () => {
            const plain = vectorDescriptor('Plain', {
                exercises: [poke('Poke, by the template, the asset of')],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [plain])
            ).operations
            expect(op).toMatchObject({
                choiceId: 'Poke',
                interface: asset,
                status: 'described',
            })
            expect(intentText(op)).toBe(
                `Poke, by the template, the asset of ${OWNER}`
            )
        })

        it('prefers the entry for that interface over one that names none', async () => {
            const both = vectorDescriptor('Plain', {
                exercises: [
                    poke('Poke, by the template, the asset of'),
                    poke('Poke, through Asset, the asset of', named),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [both])
            ).operations
            expect(op).toMatchObject({
                choiceId: 'Poke',
                interface: asset,
                status: 'described',
            })
            expect(intentText(op)).toBe(
                `Poke, through Asset, the asset of ${OWNER}`
            )
        })

        it('uses a no-interface entry when another choice names this interface', async () => {
            const mixed = vectorDescriptor('Plain', {
                exercises: [
                    {
                        choice: 'Nudge',
                        interface: named,
                        intent: 'Nudge',
                        interpolatedIntent:
                            'Nudge, through Asset, the asset of {@.contract.owner}',
                        fields: [{ path: '@.contract.owner', format: 'party' }],
                    },
                    poke('Poke, by the template, the asset of'),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [mixed])
            ).operations
            expect(op).toMatchObject({
                choiceId: 'Poke',
                interface: asset,
                status: 'described',
            })
            expect(intentText(op)).toBe(
                `Poke, by the template, the asset of ${OWNER}`
            )
        })

        it('uses an entry that names the interface package', async () => {
            const pinned = vectorDescriptor('Plain', {
                exercises: [
                    poke('Poke, through this package, the asset of', {
                        ...named,
                        packageId: VECTOR_PACKAGE,
                    }),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [pinned])
            ).operations
            expect(op).toMatchObject({
                choiceId: 'Poke',
                interface: asset,
                status: 'described',
            })
            expect(intentText(op)).toBe(
                `Poke, through this package, the asset of ${OWNER}`
            )
        })

        it('does not use an entry for another interface package', async () => {
            const otherPackage = vectorDescriptor('Plain', {
                exercises: [
                    poke('Poke, through another package, the asset of', {
                        ...named,
                        packageId: '0'.repeat(64),
                    }),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [
                    otherPackage,
                ])
            ).operations
            expect(op).toMatchObject({ status: 'undescribed' })
        })

        it('prefers the entry that names the interface package', async () => {
            const both = vectorDescriptor('Plain', {
                exercises: [
                    poke('Poke, by module and entity, the asset of', named),
                    poke('Poke, through this package, the asset of', {
                        ...named,
                        packageId: VECTOR_PACKAGE,
                    }),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [both])
            ).operations
            expect(intentText(op)).toBe(
                `Poke, through this package, the asset of ${OWNER}`
            )
        })

        it('uses the unpinned entry when the package does not match', async () => {
            const both = vectorDescriptor('Plain', {
                exercises: [
                    poke('Poke, through another package, the asset of', {
                        ...named,
                        packageId: '0'.repeat(64),
                    }),
                    poke('Poke, by module and entity, the asset of', named),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [both])
            ).operations
            expect(intentText(op)).toBe(
                `Poke, by module and entity, the asset of ${OWNER}`
            )
        })

        it('does not match an entry for another interface', async () => {
            const other = vectorDescriptor('Plain', {
                exercises: [
                    poke('Poke, through Other, the asset of', {
                        moduleName: 'HashVectors',
                        entityName: 'Other',
                    }),
                ],
            })
            const [op] = (
                await described(exerciseInterface.preparedTransaction, [other])
            ).operations
            expect(op).toMatchObject({ status: 'undescribed' })
        })

        it('never applies an interface entry to a choice of the template itself', async () => {
            const viaAsset = parseDescriptor({
                ...pingJson,
                display: {
                    exercises: pingJson.display.exercises.map((entry) =>
                        entry.choice === 'Respond'
                            ? {
                                  ...entry,
                                  interface: {
                                      moduleName: 'Canton.Internal.Ping',
                                      entityName: 'Asset',
                                  },
                              }
                            : entry
                    ),
                },
            })
            const [op] = (await described(encode(exercisePing()), [viaAsset]))
                .operations
            expect(op).toMatchObject({
                status: 'undescribed',
                descriptor: PING_DESCRIPTOR,
            })
        })
    })

    it('rejects a contract id that occurs twice', async () => {
        const tx = exercisePing()
        const input = tx.metadata?.inputContracts[0]
        if (input?.contract.oneofKind !== 'v1') {
            throw new Error('fixture has no input contract')
        }
        tx.metadata?.inputContracts.push(input)
        const [op] = (await described(encode(tx), [ping])).operations
        expect(op).toMatchObject({
            status: 'undescribable',
            reason: expect.stringMatching(/occurs more than once/),
        })
    })

    it('rejects a contract whose template name differs from the exercise', async () => {
        const tx = exercisePing()
        const input = tx.metadata?.inputContracts[0]?.contract
        if (input?.oneofKind !== 'v1' || !input.v1.templateId) {
            throw new Error('fixture has no input contract')
        }
        input.v1.templateId.entityName = 'Other'
        const [op] = (await described(encode(tx), [ping])).operations
        expect(op).toMatchObject({
            status: 'undescribable',
            reason: expect.stringMatching(
                /is '.*:Canton\.Internal\.Ping:Other', not '.*:Canton\.Internal\.Ping:Ping'/
            ),
        })
    })

    it('rejects a contract whose package name differs from the exercise', async () => {
        const tx = exercisePing()
        const input = tx.metadata?.inputContracts[0]?.contract
        if (input?.oneofKind !== 'v1') {
            throw new Error('fixture has no input contract')
        }
        input.v1.packageName = 'another-package'
        const [op] = (await described(encode(tx), [ping])).operations
        expect(op).toMatchObject({
            status: 'undescribable',
            reason: expect.stringMatching(
                /is 'another-package:Canton\.Internal\.Ping:Ping'/
            ),
        })
    })

    it('fails a None field that is not optional, and falls back when its placeholder fails', async () => {
        const none: Value = { sum: { oneofKind: 'optional', optional: {} } }
        const argument: Value = {
            sum: {
                oneofKind: 'record',
                record: { fields: [{ label: 'anyone', value: none }] },
            },
        }
        const result = await described(
            encode(exercisePing('AbortPing', argument)),
            [ping]
        )
        expect(result.complete).toBe(false)
        expect(result.operations[0]).toMatchObject({
            status: 'fallback',
            intent: MISMATCH_INTENT,
            reason: "placeholder '{anyone}' failed: 'anyone' is None",
            fields: [
                { value: `"${PING_ID}"` },
                { value: ALICE },
                { error: "'anyone' is None" },
            ],
        })
    })

    it('fails a field that is not optional and not in the record', async () => {
        const [op] = (
            await described(encode(exercisePing('AbortPing')), [ping])
        ).operations
        expect(op?.fields[2]).toMatchObject({
            error: "'anyone' is not in the transaction",
        })
    })

    it('allows a contract whose package ID differs from the exercise', async () => {
        const tx = exercisePing()
        const input = tx.metadata?.inputContracts[0]?.contract
        if (input?.oneofKind !== 'v1' || !input.v1.templateId) {
            throw new Error('fixture has no input contract')
        }
        input.v1.templateId.packageId = '0'.repeat(64)
        expect((await described(encode(tx), [ping])).complete).toBe(true)
    })

    it('rejects an exercise on a contract that is not an input contract', async () => {
        const tx = exercisePing()
        if (!tx.metadata) {
            throw new Error('fixture has no metadata')
        }
        tx.metadata.inputContracts = []
        const [op] = (await described(encode(tx), [ping])).operations
        expect(op).toMatchObject({
            status: 'undescribable',
            reason: expect.stringMatching(
                /is neither an input contract nor created by the transaction/
            ),
        })
    })

    it('reads a contract that an earlier root creates', async () => {
        const plain = vectorDescriptor('Plain', {
            create: {
                intent: 'Create a plain contract',
                interpolatedIntent: 'Create a plain contract for {owner}',
                fields: [{ path: 'owner', format: 'party' }],
            },
            exercises: [
                {
                    choice: 'Check',
                    intent: 'Check',
                    interpolatedIntent:
                        'Check the contract of {@.contract.owner}',
                    fields: [{ path: '@.contract.owner', format: 'party' }],
                },
            ],
        })
        const result = await described(createAndExercise.preparedTransaction, [
            plain,
        ])
        expect(result.complete).toBe(true)
        expect(result.operations.map(intentText)).toEqual([
            `Create a plain contract for ${OWNER}`,
            `Check the contract of ${OWNER}`,
        ])
    })

    it('describes a create and an exercise of an undescribed template without reading the contract', async () => {
        const plain = vectorDescriptor('Plain', {
            create: {
                intent: 'Create a plain contract',
                interpolatedIntent: 'Create a plain contract for {owner}',
                fields: [{ path: 'owner', format: 'party' }],
            },
        })
        const result = await described(createAndExercise.preparedTransaction, [
            plain,
        ])
        expect(result.operations.map((o) => o.status)).toEqual([
            'described',
            'undescribed',
        ])
        expect(intentText(result.operations[0]!)).toBe(
            `Create a plain contract for ${OWNER}`
        )
    })

    it('describes only the root of a nested transaction', async () => {
        const driver = vectorDescriptor('Driver', {
            exercises: [
                {
                    choice: 'NestedCreates',
                    intent: 'Create nested contracts',
                    interpolatedIntent: 'Create contracts {depth} levels deep',
                    fields: [
                        { path: 'depth', label: 'Depth', format: 'number' },
                    ],
                },
            ],
        })
        const result = await described(nestedCreates.preparedTransaction, [
            driver,
        ])
        expect(result.operations).toHaveLength(1)
        expect(intentText(result.operations[0])).toBe(
            'Create contracts 3 levels deep'
        )
    })

    it('formats every kind of value', async () => {
        const allKinds = vectorDescriptor(
            'AllKinds',
            {
                create: {
                    intent: 'All kinds',
                    fields: [
                        { path: 'values.boolValue', format: 'boolean' },
                        { path: 'values.int64Value', format: 'number' },
                        { path: 'values.numericValue', format: 'number' },
                        { path: 'values.textValue', format: 'string' },
                        { path: 'values.timestampValue', format: 'dateTime' },
                        { path: 'values.dateValue', format: 'dateTime' },
                        { path: 'values.partyValue', format: 'party' },
                        {
                            path: 'values.contractIdValue',
                            format: 'contractId',
                        },
                        { path: 'values.optionalValue', format: 'number' },
                        { path: 'values.listValue', format: 'raw' },
                        { path: 'values.textMapValue', format: 'raw' },
                        { path: 'values.genMapValue', format: 'raw' },
                        { path: 'values.recordValue.name', format: 'string' },
                        {
                            path: 'values.variantValue.Circle',
                            format: 'number',
                        },
                        { path: 'values.variantValue', format: 'raw' },
                        {
                            path: 'values.enumValue',
                            format: 'enum',
                            params: { $ref: '$.metadata.enums.color' },
                        },
                        { path: 'values.recordValue' },
                        { path: 'values.unitValue', format: 'raw' },
                    ],
                },
            },
            { color: { Red: 'red', Green: 'green', Blue: 'blue' } }
        )

        const [op] = (
            await described(allValues.preparedTransaction, [allKinds])
        ).operations
        expect(op?.fields.map(shown)).toEqual([
            'true',
            '-42',
            '3.1415926535',
            '"héllo, мир"',
            '2026-10-24T12:34:56.789012Z',
            '2026-10-24',
            OTHER,
            '003cbb94a4b2470b97999dd6ecbef7cebd5045a57cf6fc1d24e9e1cee1adbcd090ca1212207aa8738571d5ee56e9760a18077666bc7f97e559e8c80722ecf9af3c4977899e',
            '7',
            '["first","second"]',
            '{"alpha":"2","zeta":"1"}',
            '[["1","one"],["3","three"]]',
            '"pair"',
            '1.5000000000',
            '{"Circle":"1.5000000000"}',
            'green',
            '{"name":"pair","count":"2"}',
            '()',
        ])
    })

    it('reads maps by key and counts their elements', async () => {
        const mapsDescriptor = vectorDescriptor('Maps', {
            create: {
                intent: 'Maps',
                interpolatedIntent:
                    'alpha is {textMap["alpha"]} of {textMap.length} entries; inner is {nestedMap["outer"]["inner"]}',
                fields: [
                    { path: 'textMap["alpha"]', format: 'number' },
                    { path: 'textMap.length', format: 'number' },
                    { path: 'nestedMap["outer"]["inner"]', format: 'string' },
                    { path: 'genMap.length', format: 'number' },
                    { path: 'textMap["missing"]', format: 'number' },
                ],
            },
        })
        const [op] = (
            await described(maps.preparedTransaction, [mapsDescriptor])
        ).operations
        expect(intentText(op)).toBe('alpha is 2 of 3 entries; inner is "x"')
        expect(op?.fields.map(shown)).toEqual([
            '2',
            '3',
            '"x"',
            "'length' applied to genMap",
            "no map entry 'missing'",
        ])
    })

    it('says the descriptor does not match when a placeholder fails', async () => {
        const variants = vectorDescriptor('Variants', {
            create: {
                intent: 'Variants',
                interpolatedIntent:
                    '{colors.length} colors, the first is {colors.Red}',
                fields: [
                    { path: 'colors.length', format: 'number' },
                    { path: 'colors.Red', format: 'string' },
                    { path: 'colors', format: 'raw' },
                ],
            },
        })

        const result = await described(variantEnum.preparedTransaction, [
            variants,
        ])
        expect(result.complete).toBe(false)
        expect(result.operations[0]).toMatchObject({
            status: 'fallback',
            intent: MISMATCH_INTENT,
            reason: "placeholder '{colors.Red}' failed: 'Red' applied to list",
            fields: [
                { value: '2' },
                { error: "'Red' applied to list" },
                // A list of variable size is shown whole, with raw.
                { value: '["Red","Blue"]' },
            ],
        })
    })

    it('fails a field whose format does not match the value', async () => {
        const wrongFormat = vectorDescriptor('Plain', {
            create: {
                intent: 'Plain',
                fields: [{ path: 'owner', format: 'string' }],
            },
        })
        const [op] = (
            await described(createAndExercise.preparedTransaction, [
                wrongFormat,
            ])
        ).operations
        expect(shown(op?.fields[0])).toBe(
            "format 'string' does not accept party"
        )
    })

    it('reports two descriptors for one template as invalid', async () => {
        const [op] = (await described(builtinPingCreate, [ping, ping]))
            .operations
        expect(op).toMatchObject({
            status: 'invalid',
            intent: 'Create Canton.Internal.Ping:Ping',
            reason: expect.stringMatching(/more than one descriptor/),
        })
        expect(op).not.toHaveProperty('descriptor')
    })

    it('ignores descriptors that bind to no root', async () => {
        const other = vectorDescriptor('Other', {
            create: { intent: 'Other' },
        })
        const broken = {} as Descriptor
        const result = await described(builtinPingCreate, [other, broken, ping])
        expect(result.complete).toBe(true)
        expect(result.operations).toHaveLength(1)
    })

    it('quotes text values, escaping quotes inside them', async () => {
        const create = decode(builtinPingCreate)
        const nodeType = rootNodeType(create)
        if (nodeType.oneofKind !== 'create') {
            throw new Error('fixture is not a create')
        }
        const id = nodeType.create.argument?.sum
        if (id?.oneofKind !== 'record') {
            throw new Error('fixture has no record argument')
        }
        id.record.fields[0]!.value = {
            sum: { oneofKind: 'text', text: 'x" and send 1000 to "Mallory' },
        }
        const [op] = (await described(encode(create), [ping])).operations
        expect(op?.intent).toBe(
            `Ping "x\\" and send 1000 to \\"Mallory" from ${ALICE} to ${ALICE}`
        )
    })

    it('escapes a bidirectional character in a field error', async () => {
        const RLO = String.fromCodePoint(0x202e)
        const create = decode(builtinPingCreate)
        const nodeType = rootNodeType(create)
        if (nodeType.oneofKind !== 'create') {
            throw new Error('fixture is not a create')
        }
        const argument = nodeType.create.argument?.sum
        if (argument?.oneofKind !== 'record') {
            throw new Error('fixture has no record argument')
        }
        const initiator = argument.record.fields.find(
            (f) => f.label === 'initiator'
        )
        if (!initiator) throw new Error('fixture has no initiator')
        initiator.value = {
            sum: { oneofKind: 'party', party: `alice${RLO}::1` },
        }
        const descriptor = parseDescriptor({
            ...pingJson,
            display: {
                create: {
                    intent: 'Ping',
                    fields: [{ path: 'initiator', format: 'party' }],
                },
            },
        })
        const [op] = (await described(encode(create), [descriptor])).operations
        const error = shown(op?.fields[0])
        expect(error).toContain('\\u{202e}')
        expect(error).not.toContain(RLO)
    })

    it('reports a descriptor with no trusted signature as unverified', async () => {
        const { signatures: _removed, ...unsigned } = pingJson
        const hash = await hashEither(builtinPingCreate)
        const [op] = (
            await clearSign(builtinPingCreate, [JSON.stringify(unsigned)], hash)
        ).operations
        expect(op).toMatchObject({
            status: 'unverified',
            intent: 'Create Canton.Internal.Ping:Ping',
            fields: [],
            reason: 'descriptor has no signatures',
        })
        expect(op).not.toHaveProperty('descriptor')

        const pair = await crypto.subtle.generateKey(
            { name: 'Ed25519' },
            true,
            ['sign', 'verify']
        )
        const foreign = await signDescriptor(
            unsigned,
            await crypto.subtle.exportKey('jwk', pair.privateKey)
        )
        const [untrusted] = (
            await clearSign(builtinPingCreate, [JSON.stringify(foreign)], hash)
        ).operations
        expect(untrusted).toMatchObject({
            status: 'unverified',
            reason: 'signatures[0]: public key is not trusted',
        })
        expect(untrusted).not.toHaveProperty('descriptor')
    })

    it('reports a descriptor nested too deeply as invalid', async () => {
        let deep = 'null'
        for (let i = 0; i < MAX_JSON_NESTING_DEPTH; i++) {
            deep = `{"k":${deep}}`
        }
        const text = `{"context":{"template":${JSON.stringify(ping.context.template)}},"deep":${deep}}`
        const [op] = (
            await clearSign(
                builtinPingCreate,
                [text],
                await hashEither(builtinPingCreate)
            )
        ).operations
        expect(op).toMatchObject({
            status: 'invalid',
            fields: [],
            reason: expect.stringContaining(
                `nesting is deeper than ${MAX_JSON_NESTING_DEPTH}`
            ),
        })
        expect(op).not.toHaveProperty('descriptor')
    })

    it('escapes a bidirectional character in an invalid reason', async () => {
        const rlo = String.fromCodePoint(0x202e)
        const key = JSON.stringify(`bad${rlo}name`)
        const text = `{"context":{"template":${JSON.stringify(ping.context.template)}},${key}:1,${key}:2}`
        const [op] = (
            await clearSign(
                builtinPingCreate,
                [text],
                await hashEither(builtinPingCreate)
            )
        ).operations
        expect(op?.status).toBe('invalid')
        expect(op?.reason).toContain('\\u{202e}')
        expect(op?.reason).not.toContain(rlo)
    })

    it('escapes a bidirectional character in an unverified reason', async () => {
        const rlo = String.fromCodePoint(0x202e)
        const signed = await signWithReferenceKey(ping)
        const signatures = signed.signatures
        if (!Array.isArray(signatures) || signatures.length === 0) {
            throw new Error('signed descriptor has no signatures')
        }
        const entry = signatures[0]
        if (typeof entry !== 'object' || entry === null) {
            throw new Error('signed descriptor has no signature entry')
        }
        // A copy: `signatures[0]` is the entry already stored on `ping`.
        signatures[0] = { ...entry, [`note${rlo}`]: 'x' }
        const [op] = (
            await clearSign(
                builtinPingCreate,
                [JSON.stringify(signed)],
                await hashEither(builtinPingCreate)
            )
        ).operations
        expect(op?.status).toBe('unverified')
        expect(op?.reason).toContain('\\u{202e}')
        expect(op?.reason).not.toContain(rlo)
    })

    it('reports a duplicate key on the root it binds to', async () => {
        const template = JSON.stringify(ping.context.template)
        const text = `{"context":{"template":${template}},"context":{"template":${template}},"metadata":{"version":"1.0.0","publisher":"t","name":"n"},"display":{"create":{"intent":"Ping"}}}`
        const [op] = (
            await clearSign(
                builtinPingCreate,
                [text],
                await hashEither(builtinPingCreate)
            )
        ).operations
        expect(op).toMatchObject({
            status: 'invalid',
            intent: 'Create Canton.Internal.Ping:Ping',
            fields: [],
            reason: "duplicate key 'context' at $",
        })
        expect(op).not.toHaveProperty('descriptor')
    })

    it('ignores a duplicate-key descriptor that binds to no root', async () => {
        const other =
            '{"context":{"template":{"packageId":"aa","moduleName":"M","entityName":"Other"}},"context":{"template":{"packageId":"aa","moduleName":"M","entityName":"Other"}}}'
        const result = await clearSign(
            builtinPingCreate,
            [other, JSON.stringify(await signWithReferenceKey(ping))],
            await hashEither(builtinPingCreate)
        )
        expect(result.complete).toBe(true)
    })

    it('reports an unsigned malformed descriptor as unverified', async () => {
        const { signatures: _removed, ...unsigned } = pingJson
        const hash = await hashEither(builtinPingCreate)
        const [op] = (
            await clearSign(
                builtinPingCreate,
                [JSON.stringify({ ...unsigned, display: {} })],
                hash
            )
        ).operations
        expect(op).toMatchObject({
            status: 'unverified',
            reason: 'descriptor has no signatures',
        })
    })

    it('does not require a signature on a descriptor that binds to no root', async () => {
        const other = {
            ...pingJson,
            context: {
                template: {
                    ...pingJson.context.template,
                    entityName: 'Other',
                },
            },
            signatures: [],
        }
        const result = await clearSign(
            builtinPingCreate,
            [
                JSON.stringify(other),
                JSON.stringify(await signWithReferenceKey(ping)),
            ],
            await hashEither(builtinPingCreate)
        )
        expect(result.complete).toBe(true)
    })

    it('checks the prepared-transaction hash before the signatures', async () => {
        const { signatures: _removed, ...unsigned } = pingJson
        await expect(
            clearSign(
                builtinPingCreate,
                [JSON.stringify(unsigned)],
                'bm90LWEgaGFzaA=='
            )
        ).rejects.toThrow(HashMismatchError)
    })

    it('reports an invalid descriptor on the root it binds to', async () => {
        const invalid = { ...pingJson, display: {} } as unknown as Descriptor
        const result = await described(builtinPingCreate, [invalid])
        expect(result.complete).toBe(false)
        expect(result.operations[0]).toMatchObject({
            status: 'invalid',
            fields: [],
            intent: 'Create Canton.Internal.Ping:Ping',
        })
        // An invalid descriptor's metadata is not shown as a claim of authorship.
        expect(result.operations[0]).not.toHaveProperty('descriptor')
        expect(result.operations[0]?.reason).toContain(
            'display needs create or exercises'
        )
    })

    it('rejects two entries for one choice and interface', async () => {
        expect(() =>
            vectorDescriptor('Plain', {
                exercises: [
                    { choice: 'Poke', intent: 'Poke' },
                    { choice: 'Poke', intent: 'Poke again' },
                ],
            })
        ).toThrow('the same choice and interface is already described')
    })

    it('rejects a transaction that does not have the expected hash', async () => {
        await expect(
            clearSign(
                builtinPingCreate,
                [JSON.stringify(ping)],
                'bm90LWEgaGFzaA=='
            )
        ).rejects.toThrow(HashMismatchError)
    })

    it('reads container fields of an exercise', async () => {
        const tx = exercisePing()
        const nodeType = rootNodeType(tx)
        if (nodeType.oneofKind !== 'exercise') {
            throw new Error('fixture is not an exercise')
        }
        const exercise = nodeType.exercise
        exercise.actingParties = [ALICE]
        exercise.choiceObservers = []
        exercise.consuming = false
        if (!tx.metadata) {
            throw new Error('fixture has no metadata')
        }
        tx.metadata.synchronizerId = 'sync::1'
        tx.metadata.submitterInfo = { actAs: [ALICE], commandId: 'cmd' }
        const descriptor = parseDescriptor({
            $schema: pingJson.$schema,
            context: pingJson.context,
            metadata: pingJson.metadata,
            display: {
                exercises: [
                    {
                        choice: 'Respond',
                        intent: 'Respond to ping',
                        interpolatedIntent:
                            'Contract {@.contractId} on {@.synchronizerId}, consuming {@.consuming}',
                        fields: [
                            { path: '@.contractId', format: 'contractId' },
                            { path: '@.actingParties', format: 'raw' },
                            { path: '@.consuming', format: 'boolean' },
                            { path: '@.synchronizerId', format: 'string' },
                            { path: '@.choiceObservers', format: 'raw' },
                            { path: '@.actAs', format: 'raw' },
                        ],
                    },
                ],
            },
        })
        const [op] = (await described(encode(tx), [descriptor])).operations
        expect(op).toMatchObject({
            status: 'described',
            intent: `Contract ${exercise.contractId} on "sync::1", consuming false`,
            fields: [
                { value: exercise.contractId },
                { value: `["${ALICE}"]` },
                { value: 'false' },
                { value: '"sync::1"' },
                { value: '[]' },
                { value: `["${ALICE}"]` },
            ],
        })
    })

    it('reads container fields of a create', async () => {
        const created = decode(builtinPingCreate)
        const nodeType = rootNodeType(created)
        if (nodeType.oneofKind !== 'create') {
            throw new Error('fixture is not a create')
        }
        const { signatories, contractId } = nodeType.create
        const descriptor = parseDescriptor({
            $schema: pingJson.$schema,
            context: pingJson.context,
            metadata: pingJson.metadata,
            display: {
                create: {
                    intent: 'Create',
                    fields: [
                        { path: '@.signatories', format: 'raw' },
                        { path: '@.contractId', format: 'contractId' },
                    ],
                },
            },
        })
        const [op] = (await described(builtinPingCreate, [descriptor]))
            .operations
        expect(op).toMatchObject({
            status: 'described',
            intent: 'Create',
            fields: [
                { value: JSON.stringify(signatories) },
                { value: contractId },
            ],
        })
    })

    it('rejects an exercise container field on a create', () => {
        expect(() =>
            parseDescriptor({
                $schema: pingJson.$schema,
                context: pingJson.context,
                metadata: pingJson.metadata,
                display: {
                    create: {
                        intent: 'Create',
                        fields: [{ path: '@.consuming', format: 'boolean' }],
                    },
                },
            })
        ).toThrow(DescriptorError)
    })

    it('rejects a transaction that cannot be hashed', async () => {
        const tx = exercisePing()
        tx.transaction!.nodeSeeds = []
        const unseeded = encode(tx)
        await expect(
            clearSign(unseeded, [JSON.stringify(ping)], 'bm90LWEgaGFzaA==')
        ).rejects.toThrow(/has no seed/)
    })
})

describe('optional fields', () => {
    const describeAllKinds = async (
        fields: unknown[],
        interpolatedIntent?: string
    ) => {
        const descriptor = vectorDescriptor('AllKinds', {
            create: { intent: 'All kinds', interpolatedIntent, fields },
        })
        return described(allValues.preparedTransaction, [descriptor])
    }

    it('formats a Some and shows a missing field as None', async () => {
        const result = await describeAllKinds(
            [
                {
                    path: 'values.optionalValue',
                    label: 'Optional',
                    format: 'number',
                    optional: true,
                },
                {
                    path: 'values.missingValue',
                    label: 'Missing',
                    format: 'number',
                    optional: true,
                },
            ],
            'It is {values.optionalValue}; missing is {values.missingValue}'
        )
        const [op] = result.operations
        expect(op?.fields).toEqual([
            { label: 'Optional', value: '7' },
            { label: 'Missing', value: 'None' },
        ])
        expect(intentText(op)).toBe('It is 7; missing is None')
        expect(result.complete).toBe(true)
    })

    it('fails an optional whose format does not accept the value', async () => {
        const result = await describeAllKinds([
            {
                path: 'values.optionalValue',
                format: 'string',
                optional: true,
            },
        ])
        expect(shown(result.operations[0]?.fields[0])).toBe(
            "format 'string' does not accept int64"
        )
        expect(result.complete).toBe(false)
    })

    it('fails a missing field that is not marked optional, and falls back', async () => {
        const result = await describeAllKinds(
            [{ path: 'values.missingValue', format: 'number' }],
            'It is {values.missingValue}'
        )
        const [op] = result.operations
        expect(op?.status).toBe('fallback')
        expect(op?.intent).toBe(MISMATCH_INTENT)
        expect(op?.reason).toBe(
            "placeholder '{values.missingValue}' failed: 'missingValue' is not in the transaction"
        )
        expect(shown(op?.fields[0])).toBe(
            "'missingValue' is not in the transaction"
        )
        expect(result.complete).toBe(false)
    })

    it('shows an enum by its table entry', async () => {
        const descriptor = vectorDescriptor(
            'AllKinds',
            {
                create: {
                    intent: 'All kinds',
                    fields: [
                        {
                            path: 'values.enumValue',
                            format: 'enum',
                            params: { $ref: '$.metadata.enums.color' },
                        },
                    ],
                },
            },
            { color: { Red: 'red', Green: 'green' } }
        )
        const [op] = (
            await described(allValues.preparedTransaction, [descriptor])
        ).operations
        expect(op?.fields[0]).toEqual({
            label: 'values.enumValue',
            value: 'green',
        })
    })
})
