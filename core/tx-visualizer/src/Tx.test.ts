// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest'
import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import {
    computeMultiHashForTopology,
    computeSha256CantonHash,
    decodePreparedTransaction,
    decodeTopologyTransaction,
    hashPreparedTransaction,
    ParsedTransactionInfo,
    parsePreparedTransaction,
    validateAuthorizedPartyIds,
} from '.'
import camelcaseKeys from 'camelcase-keys'
import createPingFixture from './fixtures/create_ping_prepared_response.json'
import { fromBase64, fromHex, toBase64, toHex } from './utils'
import { computePreparedTransaction } from './hashing_scheme_v2'

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

    const preparedTxHasBase64 = 'D8D0WGX3KgYcY/bkHDcm6OxHpgvTX8TQlDUeGIZtBzo='
    const calculatedPreparedTxHashBase64 =
        await computePreparedTransaction(preparedTx)
    expect(preparedTxHasBase64).toEqual(
        toBase64(calculatedPreparedTxHashBase64)
    )
})

test('hash from preparedTx ledger api call should match calculated hash', async () => {
    const preparedTxHashFromLAPI =
        'f97Cv1BO7QS7jmSY03p56JGsPf60Vx/ABXmRub7iiQI='

    const preparedTx2 =
        'CsoHCgMyLjESATAamwcKATDCPpQHCpEHCgMyLjESQjAwMTY4Nzc3ODEwNzU3MmJlZWVjYzQzODk3MmQxODQ4M2VhZDI1MGQxZDUwYmI2MzU3ZjdmYjhmNjdkY2U3ZDYzNRoNc3BsaWNlLXdhbGxldCKCAQpAZWI2ZTAxZWZhY2MzMzk3ZTIzYzZiZThiOWJlN2RiNGJmMzc2NzIyMTE5NzRkNjllMjRiNDg5ODBlMmY5OGI3ZRIhU3BsaWNlLldhbGxldC5UcmFuc2ZlclByZWFwcHJvdmFsGhtUcmFuc2ZlclByZWFwcHJvdmFsUHJvcG9zYWwqtQNysgMKggEKQGViNmUwMWVmYWNjMzM5N2UyM2M2YmU4YjliZTdkYjRiZjM3NjcyMjExOTc0ZDY5ZTI0YjQ4OTgwZTJmOThiN2USIVNwbGljZS5XYWxsZXQuVHJhbnNmZXJQcmVhcHByb3ZhbBobVHJhbnNmZXJQcmVhcHByb3ZhbFByb3Bvc2FsElcKCHJlY2VpdmVyEks6SWJvYjo6MTIyMDViZTNiOWQxNzc1NzNmZmZiNjhlYjI0NTk4NmY4OGI5ZGY1OGQ0NGNlNTc1ODE5MDc4OTcwNTgwZDg3ZDFkYzAScgoIcHJvdmlkZXISZjpkYXBwX3VzZXJfbG9jYWxuZXQtbG9jYWxwYXJ0eS0xOjoxMjIwM2E1MmZlNWFmM2I4N2UwNjk2MTgyYWM2NjhhNmNiMzE1ZGFiNGJkYzMwZGE5ZTViNmRkYTllYjcyODc4NDIxNhJeCgtleHBlY3RlZERzbxJPUk0KSzpJRFNPOjoxMjIwYmJkMDAwYjY5ODc1NzNiOGMwOWY0NDRlNGRmNTUwOWFmODk5N2I4MzkxMDlkN2UyYzIxMmQ1NDdmMGFmMDk1MDJJYm9iOjoxMjIwNWJlM2I5ZDE3NzU3M2ZmZmI2OGViMjQ1OTg2Zjg4YjlkZjU4ZDQ0Y2U1NzU4MTkwNzg5NzA1ODBkODdkMWRjMDpkYXBwX3VzZXJfbG9jYWxuZXQtbG9jYWxwYXJ0eS0xOjoxMjIwM2E1MmZlNWFmM2I4N2UwNjk2MTgyYWM2NjhhNmNiMzE1ZGFiNGJkYzMwZGE5ZTViNmRkYTllYjcyODc4NDIxNjpJYm9iOjoxMjIwNWJlM2I5ZDE3NzU3M2ZmZmI2OGViMjQ1OTg2Zjg4YjlkZjU4ZDQ0Y2U1NzU4MTkwNzg5NzA1ODBkODdkMWRjMCIiEiDBzeNcgqLvsssBxhNx7wP9pK71TsAprgz+a8jag/Lb3RL3ARJxCklib2I6OjEyMjA1YmUzYjlkMTc3NTczZmZmYjY4ZWIyNDU5ODZmODhiOWRmNThkNDRjZTU3NTgxOTA3ODk3MDU4MGQ4N2QxZGMwEiQ5NzU4ZTQ2ZS05ZmJlLTRmOTQtOTczZC04NWQ5ZTBmMTMyNzUaU2dsb2JhbC1kb21haW46OjEyMjBiYmQwMDBiNjk4NzU3M2I4YzA5ZjQ0NGU0ZGY1NTA5YWY4OTk3YjgzOTEwOWQ3ZTJjMjEyZDU0N2YwYWYwOTUwKiQ5NGJkYmFmNS0wYjJjLTQwYmMtOTZjZC1jM2M5YTlkODQ3ZDIw+eaGkdz0jwM='

    const hashResult = await hashPreparedTransaction(preparedTx2, 'base64')
    const hashResultHex = await hashPreparedTransaction(preparedTx2, 'hex')

    expect(hashResult).toBe(preparedTxHashFromLAPI)
    expect(toHex(fromHex(hashResultHex))).toEqual(hashResultHex)
})

test('decode a base 64 encoded topology tx', async () => {
    const namespaceDelegationBase64 =
        'CosBCAEQARqEAQqBAQpEMTIyMDEyMzA4N2U2YmY2NmQyMjVkMDQ3ZTZhZjhiMDk0NGJjNTBjYzQ3MGNiNDZhZmQ5NTE1YTU1OGJmNTU2MDU0NDESNxAEGiwwKjAFBgMrZXADIQD6i6Mh8nmGPt1X6XoI8ZfRh2D3eozd7HgsY/abhbRNeyoDAQUEMAEiABAe'

    const partyToKeyMappingBase64 =
        'CpMBCAEQARqMAYIBiAEKS2FsaWNlOjoxMjIwNWE1MGViOWI5ZDY0YmIzMGFjNDEyNWFmYTFhZWVhN2JjYWU1MTc5MmFjMmQxNzRhNjEzMmNlZWM5MjkwZDA2MhgBIjcQBBosMCowBQYDK2VwAyEAA5ufeUjSCCrbYVs4FipJRBhJQIFYKL++qE2t8lEccgoqAwEFBDABEB4='

    const partyToParticipantMappingBase64 =
        'CrABCAEQARqpAUqmAQpLYWxpY2U6OjEyMjA1YTUwZWI5YjlkNjRiYjMwYWM0MTI1YWZhMWFlZWE3YmNhZTUxNzkyYWMyZDE3NGE2MTMyY2VlYzkyOTBkMDYyEAEaVQpRcGFydGljaXBhbnQ6OjEyMjAyZTk1ZDJmNjFlZmU3YjIzMmI2ZDE2M2ZlMDA2MTg4YWYzYjZiMDU4ODViZDU5ZDQ3ZTUyZTE3NjUwMWI1NmNkEAIQHg=='
    const decodedNameSpaceDelegation = decodeTopologyTransaction(
        namespaceDelegationBase64
    )

    const decodedPartyToKeyMapping = decodeTopologyTransaction(
        partyToKeyMappingBase64
    )

    const decodedPartyToParticipantMapping = decodeTopologyTransaction(
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
            decodedPartyToKeyMapping.mapping?.mapping.partyToKeyMapping
                .party ===
                'alice::12205a50eb9b9d64bb30ac4125afa1aeea7bcae51792ac2d174a6132ceec9290d062' &&
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
    const normalized: Uint8Array<ArrayBufferLike>[] = preparedTxsBase64.map(
        (tx) => fromBase64(tx)
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

test(`should throw an error if when converting to hex if there's an invalid string length`, async () => {
    await expect(hashPreparedTransaction('badtx')).rejects.toThrow(
        'The string to be decoded is not correctly encoded'
    )
})
