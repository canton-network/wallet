// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Create,
    Exercise,
    Fetch,
    Metadata,
} from '@canton-network/core-ledger-proto'

import { concat } from './bytes.ts'
import {
    encodeBool,
    encodeHex,
    encodeIdentifier,
    encodeInt32,
    encodeOptional,
    encodeRepeated,
    encodeString,
    encodeTime,
    encodeValue,
} from './encoding.ts'
import { TxHashingError } from './errors.ts'
import {
    encodeInputContracts,
    encodeStrings,
    submitterInfoOf,
    type QueryByKey,
    type Scheme,
} from './scheme.ts'

// Hashing scheme V3, after daml_transaction_hashing_v3.py (canton v3.5.1,
// 08-interactive-submission). Unlike V2: no encoding version in nodes and
// metadata, a contract key in create, exercise and fetch nodes, byKey in
// exercise and fetch nodes, QueryByKey nodes, and maxRecordTime in metadata.
// V4 reuses these encoders through keyedScheme.

interface KeyedVariant {
    version: number
    /** The LF versions it hashes */
    lfVersions: readonly string[]
    /** Bytes that end an exercise node, or a refusal of its external call results */
    encodeExternalCallResults(exercise: Exercise, at: string): Uint8Array
}

const LF_WITHOUT_KEYS = '2.1'
const NO_KEYS =
    'keys are not supported in nodes with LF serialization version 2.1'

type ContractKey = NonNullable<Create['key']>

const V3: KeyedVariant = {
    version: 0x03,
    lfVersions: ['2.1', '2'],
    encodeExternalCallResults(exercise, at) {
        if (exercise.externalCallResults.length > 0) {
            throw new TxHashingError(
                'FIELD_NOT_COVERED_BY_SCHEME',
                'external call results are not covered by hashing scheme V3',
                `${at}.externalCallResults`
            )
        }
        return new Uint8Array()
    },
}

export function keyedScheme(variant: KeyedVariant): Scheme {
    return {
        version: variant.version,
        checkLfVersion: (lfVersion, path) =>
            checkLfVersion(variant, lfVersion, path),
        encodeCreate: (create, at, seed, maxValueDepth) =>
            encodeCreate(variant, create, at, seed, maxValueDepth),
        encodeExercise: (exercise, at, seed, maxValueDepth) =>
            encodeExercise(variant, exercise, at, seed, maxValueDepth),
        encodeFetch: (fetch, at, maxValueDepth) =>
            encodeFetch(variant, fetch, at, maxValueDepth),
        rollbackHead: Uint8Array.of(0x03),
        encodeQueryByKey: (queryByKey, at, maxValueDepth) =>
            encodeQueryByKey(variant, queryByKey, at, maxValueDepth),
        encodeMetadata: (metadata, maxValueDepth) =>
            encodeMetadataV3(variant, metadata, maxValueDepth),
    }
}

export const schemeV3: Scheme = keyedScheme(V3)

function encodeCreate(
    variant: KeyedVariant,
    create: Create,
    at: string,
    seed: Uint8Array | undefined,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(variant, create.lfVersion, `${at}.lfVersion`)
    checkKeyUse(create, at)
    return concat(
        encodeString(create.lfVersion),
        0x00,
        encodeOptional(seed, (bytes) => bytes),
        encodeHex(create.contractId, `${at}.contractId`),
        encodeString(create.packageName),
        encodeIdentifier(create.templateId, `${at}.templateId`),
        encodeValue(create.argument, maxValueDepth, `${at}.argument`),
        encodeStrings(create.signatories),
        encodeStrings(create.stakeholders),
        encodeOptional(create.key, (key) =>
            encodeKey(key, `${at}.key`, maxValueDepth)
        )
    )
}

function encodeExercise(
    variant: KeyedVariant,
    exercise: Exercise,
    at: string,
    seed: Uint8Array,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(variant, exercise.lfVersion, `${at}.lfVersion`)
    checkKeyUse(exercise, at)
    const externalCallResults = variant.encodeExternalCallResults(exercise, at)
    return concat(
        encodeString(exercise.lfVersion),
        0x01,
        seed,
        encodeHex(exercise.contractId, `${at}.contractId`),
        encodeString(exercise.packageName),
        encodeIdentifier(exercise.templateId, `${at}.templateId`),
        encodeStrings(exercise.signatories),
        encodeStrings(exercise.stakeholders),
        encodeStrings(exercise.actingParties),
        encodeOptional(exercise.interfaceId, (id) =>
            encodeIdentifier(id, `${at}.interfaceId`)
        ),
        encodeString(exercise.choiceId),
        encodeValue(exercise.chosenValue, maxValueDepth, `${at}.chosenValue`),
        encodeBool(exercise.consuming),
        encodeOptional(exercise.exerciseResult, (result) =>
            encodeValue(result, maxValueDepth, `${at}.exerciseResult`)
        ),
        encodeStrings(exercise.choiceObservers),
        encodeBool(exercise.byKey),
        encodeOptional(exercise.key, (key) =>
            encodeKey(key, `${at}.key`, maxValueDepth)
        ),
        externalCallResults
    )
}

function encodeFetch(
    variant: KeyedVariant,
    fetch: Fetch,
    at: string,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(variant, fetch.lfVersion, `${at}.lfVersion`)
    checkKeyUse(fetch, at)
    return concat(
        encodeString(fetch.lfVersion),
        0x02,
        encodeHex(fetch.contractId, `${at}.contractId`),
        encodeString(fetch.packageName),
        encodeIdentifier(fetch.templateId, `${at}.templateId`),
        encodeStrings(fetch.signatories),
        encodeStrings(fetch.stakeholders),
        encodeOptional(fetch.interfaceId, (id) =>
            encodeIdentifier(id, `${at}.interfaceId`)
        ),
        encodeStrings(fetch.actingParties),
        encodeBool(fetch.byKey),
        encodeOptional(fetch.key, (key) =>
            encodeKey(key, `${at}.key`, maxValueDepth)
        )
    )
}

function encodeQueryByKey(
    variant: KeyedVariant,
    queryByKey: QueryByKey,
    at: string,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(variant, queryByKey.lfVersion, `${at}.lfVersion`)
    // Its key is required, and the participant refuses any key in this version
    if (queryByKey.lfVersion === LF_WITHOUT_KEYS) {
        throw new TxHashingError('UNSUPPORTED_LF_VERSION', NO_KEYS, at)
    }
    return concat(
        encodeString(queryByKey.lfVersion),
        0x04,
        encodeString(queryByKey.packageName),
        encodeIdentifier(queryByKey.templateId, `${at}.templateId`),
        encodeBool(queryByKey.exhaustive),
        // Required here, so without the presence byte of the other nodes' key
        encodeKey(queryByKey.key, `${at}.key`, maxValueDepth),
        encodeRepeated(queryByKey.result, (contractId, i) =>
            encodeHex(contractId, `${at}.result[${i}]`)
        )
    )
}

// The key hash is written raw, without its length, so it must be 32 bytes
function encodeKey(
    key: ContractKey | undefined,
    path: string,
    maxValueDepth: number
): Uint8Array {
    if (key === undefined) {
        throw new TxHashingError('MISSING_FIELD', 'key is missing', path)
    }
    const at = `${path}.key`
    const globalKey = key.key
    if (globalKey === undefined) {
        throw new TxHashingError('MISSING_FIELD', 'key has no global key', at)
    }
    if (globalKey.hash.length !== 32) {
        throw new TxHashingError(
            'INVALID_VALUE',
            `key hash has ${globalKey.hash.length} bytes, not 32`,
            `${at}.hash`
        )
    }
    return concat(
        encodeString(globalKey.packageName),
        encodeIdentifier(globalKey.templateId, `${at}.templateId`),
        encodeValue(globalKey.key, maxValueDepth, `${at}.key`),
        globalKey.hash,
        encodeStrings(key.maintainers)
    )
}

async function encodeMetadataV3(
    variant: KeyedVariant,
    metadata: Metadata,
    maxValueDepth: number
): Promise<Uint8Array> {
    const submitterInfo = submitterInfoOf(metadata)
    return concat(
        encodeStrings(submitterInfo.actAs),
        encodeString(submitterInfo.commandId),
        encodeString(metadata.transactionUuid),
        encodeInt32(metadata.mediatorGroup, 'metadata.mediatorGroup'),
        encodeString(metadata.synchronizerId),
        encodeOptional(metadata.minLedgerEffectiveTime, (time) =>
            encodeTime(time, 'metadata.minLedgerEffectiveTime')
        ),
        encodeOptional(metadata.maxLedgerEffectiveTime, (time) =>
            encodeTime(time, 'metadata.maxLedgerEffectiveTime')
        ),
        encodeTime(metadata.preparationTime, 'metadata.preparationTime'),
        await encodeInputContracts(metadata.inputContracts, (create, path) =>
            encodeCreate(variant, create, path, undefined, maxValueDepth)
        ),
        encodeOptional(metadata.maxRecordTime, (time) =>
            encodeTime(time, 'metadata.maxRecordTime')
        )
    )
}

function checkLfVersion(
    variant: KeyedVariant,
    lfVersion: string,
    path: string
): void {
    if (!variant.lfVersions.includes(lfVersion)) {
        const earlier = variant.lfVersions.slice(0, -1).join(', ')
        const last = variant.lfVersions[variant.lfVersions.length - 1]
        throw new TxHashingError(
            'UNSUPPORTED_LF_VERSION',
            `hashing scheme V${variant.version} hashes LF versions ${earlier} and ${last} only`,
            path
        )
    }
}

// The participant's decoder refuses a key or byKey = true in an LF 2.1 node,
// though the Python example hashes both
function checkKeyUse(
    node: { lfVersion: string; key?: ContractKey; byKey?: boolean },
    at: string
): void {
    if (node.lfVersion !== LF_WITHOUT_KEYS) return
    if (node.key !== undefined) {
        throw new TxHashingError('UNSUPPORTED_LF_VERSION', NO_KEYS, `${at}.key`)
    }
    if (node.byKey) {
        throw new TxHashingError(
            'UNSUPPORTED_LF_VERSION',
            'byKey is not supported in nodes with LF serialization version 2.1',
            `${at}.byKey`
        )
    }
}
