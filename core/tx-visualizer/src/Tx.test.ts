// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    DamlTransaction,
    PreparedTransaction,
    UntypedVersionedMessage,
    v30_topology,
    v31_topology,
} from '@canton-network/core-ledger-proto'
import {
    computeMultiHashForTopology,
    computeSha256CantonHash,
} from '@canton-network/core-tx-hashing'
import camelcaseKeys from 'camelcase-keys'
import { expect, test, it, describe } from 'vitest'

import createPingFixture from './__tests__/fixtures/create_ping_prepared_response.json'
import generateTopology372 from './__tests__/fixtures/generate-topology-3.7.2.json'
import {
    type DecodeOptions,
    decodePreparedTransaction,
    decodeUnknownFields,
    decodeTopologyTransaction,
    type ParsedTransactionInfo,
    parsePreparedTransaction,
    validateAuthorizedPartyIds,
} from './index.ts'
import { fromBase64, toBase64 } from './utils.ts'

const parsedTxInfo: ParsedTransactionInfo = {
    jsonString:
        '{\n  "transaction": {\n    "version": "2.1",\n    "roots": [\n      "0"\n    ],\n    "nodes": [\n      {\n        "nodeId": "0",\n        "versionedNode": {\n          "oneofKind": "v1",\n          "v1": {\n            "nodeType": {\n              "oneofKind": "create",\n              "create": {\n                "lfVersion": "2.1",\n                "contractId": "00550802ddb16371f5fc6d364e6cd4b3283a9eb5c0ccb121ae368cdebbad0fbf56",\n                "packageName": "AdminWorkflows",\n                "signatories": [\n                  "operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424"\n                ],\n                "stakeholders": [\n                  "operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424",\n                  "participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424"\n                ],\n                "templateId": {\n                  "packageId": "2a38b963f6abf45b76c702f9700bfd9060555872af915ef7f8f68795e2c831bd",\n                  "moduleName": "Canton.Internal.Ping",\n                  "entityName": "Ping"\n                },\n                "argument": {\n                  "sum": {\n                    "oneofKind": "record",\n                    "record": {\n                      "fields": [\n                        {\n                          "label": "id",\n                          "value": {\n                            "sum": {\n                              "oneofKind": "text",\n                              "text": "ping_id"\n                            }\n                          }\n                        },\n                        {\n                          "label": "initiator",\n                          "value": {\n                            "sum": {\n                              "oneofKind": "party",\n                              "party": "operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424"\n                            }\n                          }\n                        },\n                        {\n                          "label": "responder",\n                          "value": {\n                            "sum": {\n                              "oneofKind": "party",\n                              "party": "participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424"\n                            }\n                          }\n                        }\n                      ],\n                      "recordId": {\n                        "packageId": "2a38b963f6abf45b76c702f9700bfd9060555872af915ef7f8f68795e2c831bd",\n                        "moduleName": "Canton.Internal.Ping",\n                        "entityName": "Ping"\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ],\n    "nodeSeeds": [\n      {\n        "nodeId": 0,\n        "seed": {\n          "0": 107,\n          "1": 218,\n          "2": 162,\n          "3": 83,\n          "4": 81,\n          "5": 20,\n          "6": 81,\n          "7": 157,\n          "8": 117,\n          "9": 169,\n          "10": 235,\n          "11": 45,\n          "12": 68,\n          "13": 201,\n          "14": 116,\n          "15": 34,\n          "16": 7,\n          "17": 175,\n          "18": 92,\n          "19": 125,\n          "20": 238,\n          "21": 116,\n          "22": 144,\n          "23": 156,\n          "24": 52,\n          "25": 121,\n          "26": 131,\n          "27": 117,\n          "28": 80,\n          "29": 93,\n          "30": 253,\n          "31": 158\n        }\n      }\n    ]\n  },\n  "metadata": {\n    "synchronizerId": "wallet::1220e7b23ea52eb5c672fb0b1cdbc916922ffed3dd7676c223a605664315e2d43edd",\n    "mediatorGroup": 0,\n    "transactionUuid": "a328162e-728e-4e05-ac78-b34f070983ba",\n    "preparationTime": "1754534109899822",\n    "inputContracts": [],\n    "globalKeyMapping": [],\n    "submitterInfo": {\n      "actAs": [\n        "operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424"\n      ],\n      "commandId": "f2ec4d8f-ccc1-402b-b278-7556fdd2b412"\n    }\n  }\n}',
    isCreate: true,
    isExercise: false,
    packageName: 'AdminWorkflows',
    signatories: [
        'operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
    ],
    stakeholders: [
        'operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
        'participant1::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424',
    ],
    moduleName: 'Canton.Internal.Ping',
    entityName: 'Ping',
    templateId: 'AdminWorkflows:Canton.Internal.Ping:Ping',
}

test('decode a base 64 encoded prepared tx', async () => {
    const base64EncodedPreparedTx =
        'Cp8GCgMyLjESATAa8AUKATDCPukFCuYFCgMyLjESQjAwNTUwODAyZGRiMTYzNzFmNWZjNmQzNjRlNmNkNGIzMjgzYTllYjVjMGNjYjEyMWFlMzY4Y2RlYmJhZDBmYmY1NhoOQWRtaW5Xb3JrZmxvd3MiXgpAMmEzOGI5NjNmNmFiZjQ1Yjc2YzcwMmY5NzAwYmZkOTA2MDU1NTg3MmFmOTE1ZWY3ZjhmNjg3OTVlMmM4MzFiZBIUQ2FudG9uLkludGVybmFsLlBpbmcaBFBpbmcqtgJyswIKXgpAMmEzOGI5NjNmNmFiZjQ1Yjc2YzcwMmY5NzAwYmZkOTA2MDU1NTg3MmFmOTE1ZWY3ZjhmNjg3OTVlMmM4MzFiZBIUQ2FudG9uLkludGVybmFsLlBpbmcaBFBpbmcSDwoCaWQSCUIHcGluZ19pZBJdCglpbml0aWF0b3ISUDpOb3BlcmF0b3I6OjEyMjBkNDRmYzFjM2JhMGI1YmRmN2I5NTZlZTcxYmM5NGViZTJkMjMyNThkYzI2OGZkZjA4MjRmYmFlZmYyYzYxNDI0EmEKCXJlc3BvbmRlchJUOlJwYXJ0aWNpcGFudDE6OjEyMjBkNDRmYzFjM2JhMGI1YmRmN2I5NTZlZTcxYmM5NGViZTJkMjMyNThkYzI2OGZkZjA4MjRmYmFlZmYyYzYxNDI0Mk5vcGVyYXRvcjo6MTIyMGQ0NGZjMWMzYmEwYjViZGY3Yjk1NmVlNzFiYzk0ZWJlMmQyMzI1OGRjMjY4ZmRmMDgyNGZiYWVmZjJjNjE0MjQ6Tm9wZXJhdG9yOjoxMjIwZDQ0ZmMxYzNiYTBiNWJkZjdiOTU2ZWU3MWJjOTRlYmUyZDIzMjU4ZGMyNjhmZGYwODI0ZmJhZWZmMmM2MTQyNDpScGFydGljaXBhbnQxOjoxMjIwZDQ0ZmMxYzNiYTBiNWJkZjdiOTU2ZWU3MWJjOTRlYmUyZDIzMjU4ZGMyNjhmZGYwODI0ZmJhZWZmMmM2MTQyNCIiEiBr2qJTURRRnXWp6y1EyXQiB69cfe50kJw0eYN1UF39nhL1ARJ2Ck5vcGVyYXRvcjo6MTIyMGQ0NGZjMWMzYmEwYjViZGY3Yjk1NmVlNzFiYzk0ZWJlMmQyMzI1OGRjMjY4ZmRmMDgyNGZiYWVmZjJjNjE0MjQSJGYyZWM0ZDhmLWNjYzEtNDAyYi1iMjc4LTc1NTZmZGQyYjQxMhpMd2FsbGV0OjoxMjIwZTdiMjNlYTUyZWI1YzY3MmZiMGIxY2RiYzkxNjkyMmZmZWQzZGQ3Njc2YzIyM2E2MDU2NjQzMTVlMmQ0M2VkZCokYTMyODE2MmUtNzI4ZS00ZTA1LWFjNzgtYjM0ZjA3MDk4M2JhMK7Y9/LU944D'

    const preparedTx: PreparedTransaction = decodePreparedTransaction(
        base64EncodedPreparedTx
    )

    const camelCasePreparedTx = camelcaseKeys(createPingFixture, { deep: true })
    const message = PreparedTransaction.fromJson(camelCasePreparedTx)

    const authorizedPartyId =
        'operator::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424'

    const validationResult = validateAuthorizedPartyIds(preparedTx, [
        authorizedPartyId,
    ])

    expect(validationResult[authorizedPartyId].isAuthorized).toBeTruthy()
    expect(validationResult[authorizedPartyId].locations).toStrictEqual([
        'metadata.submitterInfo.actAs',
        'transaction.nodes.0.create.signatories',
        'transaction.nodes.0.create.stakeholders',
    ])
    const res = parsePreparedTransaction(base64EncodedPreparedTx)
    expect(res).toStrictEqual(parsedTxInfo)

    expect(preparedTx).toStrictEqual(message)
})

// UntypedVersionedMessages with proto version 30, as the Ledger API returns them
const namespaceDelegationBase64 =
    'CosBCAEQARqEAQqBAQpEMTIyMDEyMzA4N2U2YmY2NmQyMjVkMDQ3ZTZhZjhiMDk0NGJjNTBjYzQ3MGNiNDZhZmQ5NTE1YTU1OGJmNTU2MDU0NDESNxAEGiwwKjAFBgMrZXADIQD6i6Mh8nmGPt1X6XoI8ZfRh2D3eozd7HgsY/abhbRNeyoDAQUEMAEiABAe'

const partyToKeyMappingBase64 =
    'CpMBCAEQARqMAYIBiAEKS2FsaWNlOjoxMjIwNWE1MGViOWI5ZDY0YmIzMGFjNDEyNWFmYTFhZWVhN2JjYWU1MTc5MmFjMmQxNzRhNjEzMmNlZWM5MjkwZDA2MhgBIjcQBBosMCowBQYDK2VwAyEAA5ufeUjSCCrbYVs4FipJRBhJQIFYKL++qE2t8lEccgoqAwEFBDABEB4='

const partyToParticipantMappingBase64 =
    'CrABCAEQARqpAUqmAQpLYWxpY2U6OjEyMjA1YTUwZWI5YjlkNjRiYjMwYWM0MTI1YWZhMWFlZWE3YmNhZTUxNzkyYWMyZDE3NGE2MTMyY2VlYzkyOTBkMDYyEAEaVQpRcGFydGljaXBhbnQ6OjEyMjAyZTk1ZDJmNjFlZmU3YjIzMmI2ZDE2M2ZlMDA2MTg4YWYzYjZiMDU4ODViZDU5ZDQ3ZTUyZTE3NjUwMWI1NmNkEAIQHg=='

const decodeV30 = (topologyTx: string) => {
    const decoded = decodeTopologyTransaction(topologyTx)
    if (decoded.version !== 30) throw new Error(`v${decoded.version}`)
    return decoded.transaction
}

test('decode a base 64 encoded topology tx', async () => {
    const decodedNameSpaceDelegation = decodeV30(namespaceDelegationBase64)

    const decodedPartyToKeyMapping = decodeV30(partyToKeyMappingBase64)

    const decodedPartyToParticipantMapping = decodeV30(
        partyToParticipantMappingBase64
    )

    expect(decodedPartyToKeyMapping.mapping?.mapping.oneofKind).toBe(
        'partyToKeyMapping'
    )

    if (
        decodedPartyToKeyMapping.mapping?.mapping.oneofKind ===
        'partyToKeyMapping'
    ) {
        expect(
            // oxlint-disable-next-line typescript/no-deprecated -- fixtures use the deprecated Canton topology mapping
            decodedPartyToKeyMapping.mapping?.mapping.partyToKeyMapping
                .party ===
                'alice::12205a50eb9b9d64bb30ac4125afa1aeea7bcae51792ac2d174a6132ceec9290d062' &&
                // oxlint-disable-next-line typescript/no-deprecated -- fixtures use the deprecated Canton topology mapping
                decodedPartyToKeyMapping.mapping?.mapping.partyToKeyMapping
                    .threshold === 1
        ).toBe(true)
    }

    expect(decodedPartyToParticipantMapping.mapping?.mapping.oneofKind).toBe(
        'partyToParticipant'
    )

    if (
        decodedPartyToParticipantMapping.mapping?.mapping.oneofKind ===
        'partyToParticipant'
    ) {
        expect(
            decodedPartyToParticipantMapping.mapping?.mapping.partyToParticipant
                .party ===
                'alice::12205a50eb9b9d64bb30ac4125afa1aeea7bcae51792ac2d174a6132ceec9290d062' &&
                decodedPartyToParticipantMapping.mapping?.mapping.partyToParticipant.participants.find(
                    (p) =>
                        p.participantUid ===
                        'participant::12202e95d2f61efe7b232b6d163fe006188af3b6b05885bd59d47e52e176501b56cd'
                )
        ).toBeTruthy()
    }

    expect(decodedNameSpaceDelegation.mapping?.mapping.oneofKind).toBe(
        'namespaceDelegation'
    )

    const preparedTxsBase64 = [
        namespaceDelegationBase64,
        partyToKeyMappingBase64,
        partyToParticipantMappingBase64,
    ]
    const normalized: Uint8Array[] = preparedTxsBase64.map((tx) =>
        fromBase64(tx)
    )

    const rawHashes = await Promise.all(
        normalized.map((tx) => computeSha256CantonHash(11, tx))
    )
    const combinedHashes = await computeMultiHashForTopology(rawHashes)

    const computedHash = await computeSha256CantonHash(55, combinedHashes)

    const multiHashBase64Encoded = toBase64(computedHash)
    expect(multiHashBase64Encoded).toEqual(
        'EiBefjKeCdX5CEnZ/m1dFoOggc1HUca747UYUDkbKjciDA=='
    )
})

describe('decodeTopologyTransaction', () => {
    const alice =
        'alice::12205a50eb9b9d64bb30ac4125afa1aeea7bcae51792ac2d174a6132ceec9290d062'
    const wrap = (version: number, data: Uint8Array) =>
        toBase64(
            UntypedVersionedMessage.toBinary({
                wrapper: { oneofKind: 'data', data },
                version,
            })
        )
    const signingKey = () => {
        const { mapping } = decodeV30(partyToKeyMappingBase64)
        if (mapping?.mapping.oneofKind !== 'partyToKeyMapping') {
            throw new Error('not a PartyToKeyMapping')
        }
        // oxlint-disable-next-line typescript/no-deprecated -- fixtures use the deprecated Canton topology mapping
        return mapping.mapping.partyToKeyMapping.signingKeys[0]
    }

    // No Canton 3.7 participant in the tests: built with the v31 bindings, as
    // GenerateExternalPartyTopology returns it on protocol version 37
    const v31PartyToParticipant = v31_topology.TopologyTransaction.toBinary({
        operation: v30_topology.Enums_TopologyChangeOp.ADD_REPLACE,
        serial: 1,
        mapping: {
            mapping: {
                oneofKind: 'partyToParticipant',
                partyToParticipant: {
                    party: alice,
                    threshold: 1,
                    participants: [
                        {
                            participantUid: 'participant1::1220aa',
                            permission:
                                v30_topology.Enums_ParticipantPermission
                                    .CONFIRMATION,
                            state: v31_topology
                                .PartyToParticipant_HostingParticipant_HostingState
                                .ACTIVE,
                        },
                        {
                            participantUid: 'participant2::1220bb',
                            permission:
                                v30_topology.Enums_ParticipantPermission
                                    .OBSERVATION,
                            state: v31_topology
                                .PartyToParticipant_HostingParticipant_HostingState
                                .ONBOARDING,
                        },
                    ],
                    partySigningKeys: { keys: [signingKey()], threshold: 1 },
                },
            },
        },
    })

    it('decodes the wrapped v30 transaction', () => {
        const decoded = decodeTopologyTransaction(
            partyToParticipantMappingBase64
        )

        expect(decoded.version).toBe(30)
        expect(decoded.transaction.operation).toBe(
            v30_topology.Enums_TopologyChangeOp.ADD_REPLACE
        )
        expect(decoded.transaction.serial).toBe(1)
    })

    it('decodes a v31 PartyToParticipant with its hosting states and signing keys', () => {
        const decoded = decodeTopologyTransaction(
            wrap(31, v31PartyToParticipant)
        )

        if (decoded.version !== 31) throw new Error(`v${decoded.version}`)
        expect(decoded.transaction.serial).toBe(1)
        const { mapping } = decoded.transaction.mapping!
        if (mapping.oneofKind !== 'partyToParticipant') {
            throw new Error(mapping.oneofKind)
        }
        expect(mapping.partyToParticipant.party).toBe(alice)
        expect(
            mapping.partyToParticipant.participants.map((p) => p.state)
        ).toEqual([
            v31_topology.PartyToParticipant_HostingParticipant_HostingState
                .ACTIVE,
            v31_topology.PartyToParticipant_HostingParticipant_HostingState
                .ONBOARDING,
        ])
        expect(mapping.partyToParticipant.partySigningKeys).toEqual({
            keys: [signingKey()],
            threshold: 1,
        })
    })

    it('would lose the signing keys if v31 were decoded as v30', () => {
        const { mapping } = v30_topology.TopologyTransaction.fromBinary(
            v31PartyToParticipant
        ).mapping!

        if (mapping.oneofKind !== 'partyToParticipant') {
            throw new Error(mapping.oneofKind)
        }
        expect(mapping.partyToParticipant.partySigningKeys).toBeUndefined()
    })

    it.each([29, 32])('rejects proto version %i', (version) => {
        expect(() =>
            decodeTopologyTransaction(wrap(version, v31PartyToParticipant))
        ).toThrow(
            `Unsupported topology transaction proto version ${version}, expected 30 or 31`
        )
    })

    describe('of a Canton 3.7.2 participant', () => {
        const { partyId, v30: fromPv36, v31: fromPv37 } = generateTopology372
        const multiHash = async (transactions: string[]) =>
            toBase64(
                await computeSha256CantonHash(
                    55,
                    await computeMultiHashForTopology(
                        await Promise.all(
                            transactions.map((tx) =>
                                computeSha256CantonHash(11, fromBase64(tx))
                            )
                        )
                    )
                )
            )
        const partyToParticipantOf = (topologyTx: string) => {
            const decoded = decodeTopologyTransaction(topologyTx)
            const { mapping } = decoded.transaction.mapping!
            if (mapping.oneofKind !== 'partyToParticipant') {
                throw new Error(mapping.oneofKind)
            }
            return { version: decoded.version, ...mapping }
        }

        it('decodes the v31 PartyToParticipant it generates on protocol version 37', () => {
            const decoded = decodeTopologyTransaction(
                fromPv37.topologyTransactions[0]
            )
            if (decoded.version !== 31) throw new Error(`v${decoded.version}`)
            const { mapping } = decoded.transaction.mapping!
            if (mapping.oneofKind !== 'partyToParticipant') {
                throw new Error(mapping.oneofKind)
            }

            expect(decoded.transaction.serial).toBe(1)
            expect(mapping.partyToParticipant.party).toBe(partyId)
            expect(
                mapping.partyToParticipant.participants.map((p) => p.state)
            ).toEqual([
                v31_topology.PartyToParticipant_HostingParticipant_HostingState
                    .ACTIVE,
            ])
            expect(mapping.partyToParticipant.partySigningKeys?.keys).toEqual([
                signingKey(),
            ])
        })

        it('decodes the v30 PartyToParticipant it generates for protocol version 36', () => {
            const { version, partyToParticipant } = partyToParticipantOf(
                fromPv36.topologyTransactions[0]
            )

            expect(version).toBe(30)
            expect(partyToParticipant.party).toBe(partyId)
            expect(partyToParticipant.partySigningKeys?.keys).toEqual([
                signingKey(),
            ])
        })

        it.each([
            ['v31', fromPv37],
            ['v30', fromPv36],
        ])(
            'computes the multi-hash of the %s transactions',
            async (_, response) =>
                expect(await multiHash(response.topologyTransactions)).toBe(
                    response.multiHash
                )
        )
    })

    it('rejects an unwrapped transaction', () => {
        const unwrapped = toBase64(
            v30_topology.TopologyTransaction.toBinary(
                decodeV30(partyToParticipantMappingBase64)
            )
        )

        expect(() => decodeTopologyTransaction(unwrapped)).toThrow()
    })
})

describe('unknown fields', () => {
    // A message consisting only of field 999 (varint, value 1)
    const txWithUnknownField = toBase64(Uint8Array.from([0xb8, 0x3e, 0x01]))
    const strict = { readUnknownField: 'throw' } as const

    it('keeps them by default and drops them with false', () => {
        expect(
            decodeUnknownFields(decodePreparedTransaction(txWithUnknownField))
        ).toEqual({ 999: 1 })
        expect(
            decodeUnknownFields(
                decodePreparedTransaction(txWithUnknownField, {
                    readUnknownField: false,
                })
            )
        ).toBeUndefined()
    })

    it('includes them best-effort decoded in the parsed JSON string', () => {
        const message = decodePreparedTransaction(txWithUnknownField)
        const transaction = DamlTransaction.toBinary(
            DamlTransaction.create({ version: '2.1' })
        )
        message.transaction = DamlTransaction.fromBinary(
            Uint8Array.from([...transaction, ...fromBase64(txWithUnknownField)])
        )
        const tx = toBase64(PreparedTransaction.toBinary(message))
        const parse = (options?: DecodeOptions) =>
            JSON.parse(parsePreparedTransaction(tx, options).jsonString!)

        expect(parse()).toEqual({
            transaction: {
                version: '2.1',
                roots: [],
                nodes: [],
                nodeSeeds: [],
                unknownFields: { 999: 1 },
            },
            unknownFields: { 999: 1 },
        })
        expect(parse({ readUnknownField: false })).toEqual({
            transaction: {
                version: '2.1',
                roots: [],
                nodes: [],
                nodeSeeds: [],
            },
        })
    })

    it('rejects them with readUnknownField: throw', () => {
        const error = /Unknown field 999/
        expect(() =>
            decodePreparedTransaction(txWithUnknownField, strict)
        ).toThrow(error)
        expect(() =>
            decodeTopologyTransaction(txWithUnknownField, strict)
        ).toThrow(error)
        expect(() =>
            validateAuthorizedPartyIds(txWithUnknownField, [], strict)
        ).toThrow(error)
        expect(() =>
            parsePreparedTransaction(txWithUnknownField, strict)
        ).toThrow(error)
    })
})
