// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
    Create,
    Exercise,
    Fetch,
    Metadata,
} from '@canton-network/core-ledger-proto'
import { concat } from './bytes.js'
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
} from './encoding.js'
import { TxHashingError } from './errors.js'
import {
    encodeInputContracts,
    encodeStrings,
    submitterInfoOf,
    type QueryByKey,
    type Scheme,
} from './scheme.js'

// Hashing scheme V3, after daml_transaction_hashing_v3.py (canton v3.5.1,
// 08-interactive-submission). It differs from V2 in that nodes and the
// metadata start without an encoding version; create, exercise and fetch
// nodes hash their contract key; exercise and fetch nodes hash byKey;
// QueryByKey nodes are hashed; and the metadata ends with maxRecordTime.
// scheme.ts names the fields neither scheme hashes.

const SCHEME_VERSION = 0x03
/** The LF versions V3 hashes: "2.1", and the later "2" that contract keys need */
const LF_VERSIONS: ReadonlySet<string> = new Set(['2.1', '2'])
/** The LF version before contract keys */
const LF_WITHOUT_KEYS = '2.1'
const NO_KEYS =
    'keys are not supported in nodes with LF serialization version 2.1'

type ContractKey = NonNullable<Create['key']>

export const schemeV3: Scheme = {
    version: SCHEME_VERSION,
    checkLfVersion,
    encodeCreate,
    encodeExercise,
    encodeFetch,
    rollbackHead: Uint8Array.of(0x03),
    encodeQueryByKey,
    encodeMetadata: encodeMetadataV3,
}

/** Also encodes input contracts, which have no seed. */
function encodeCreate(
    create: Create,
    at: string,
    seed: Uint8Array | undefined,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(create.lfVersion, `${at}.lfVersion`)
    checkKeyUse(create, at)
    return concat(
        encodeString(create.lfVersion, `${at}.lfVersion`),
        0x00,
        encodeOptional(seed, (bytes) => bytes),
        encodeHex(create.contractId, `${at}.contractId`),
        encodeString(create.packageName, `${at}.packageName`),
        encodeIdentifier(create.templateId, `${at}.templateId`),
        encodeValue(create.argument, maxValueDepth, `${at}.argument`),
        encodeStrings(create.signatories, `${at}.signatories`),
        encodeStrings(create.stakeholders, `${at}.stakeholders`),
        encodeOptional(create.key, (key) =>
            encodeKey(key, `${at}.key`, maxValueDepth)
        )
    )
}

/** Without the children's hashes, which the walk appends. */
function encodeExercise(
    exercise: Exercise,
    at: string,
    seed: Uint8Array,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(exercise.lfVersion, `${at}.lfVersion`)
    checkKeyUse(exercise, at)
    return concat(
        encodeString(exercise.lfVersion, `${at}.lfVersion`),
        0x01,
        seed,
        encodeHex(exercise.contractId, `${at}.contractId`),
        encodeString(exercise.packageName, `${at}.packageName`),
        encodeIdentifier(exercise.templateId, `${at}.templateId`),
        encodeStrings(exercise.signatories, `${at}.signatories`),
        encodeStrings(exercise.stakeholders, `${at}.stakeholders`),
        encodeStrings(exercise.actingParties, `${at}.actingParties`),
        encodeOptional(exercise.interfaceId, (id) =>
            encodeIdentifier(id, `${at}.interfaceId`)
        ),
        encodeString(exercise.choiceId, `${at}.choiceId`),
        encodeValue(exercise.chosenValue, maxValueDepth, `${at}.chosenValue`),
        encodeBool(exercise.consuming),
        encodeOptional(exercise.exerciseResult, (result) =>
            encodeValue(result, maxValueDepth, `${at}.exerciseResult`)
        ),
        encodeStrings(exercise.choiceObservers, `${at}.choiceObservers`),
        encodeBool(exercise.byKey),
        encodeOptional(exercise.key, (key) =>
            encodeKey(key, `${at}.key`, maxValueDepth)
        )
    )
}

function encodeFetch(
    fetch: Fetch,
    at: string,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(fetch.lfVersion, `${at}.lfVersion`)
    checkKeyUse(fetch, at)
    return concat(
        encodeString(fetch.lfVersion, `${at}.lfVersion`),
        0x02,
        encodeHex(fetch.contractId, `${at}.contractId`),
        encodeString(fetch.packageName, `${at}.packageName`),
        encodeIdentifier(fetch.templateId, `${at}.templateId`),
        encodeStrings(fetch.signatories, `${at}.signatories`),
        encodeStrings(fetch.stakeholders, `${at}.stakeholders`),
        encodeOptional(fetch.interfaceId, (id) =>
            encodeIdentifier(id, `${at}.interfaceId`)
        ),
        encodeStrings(fetch.actingParties, `${at}.actingParties`),
        encodeBool(fetch.byKey),
        encodeOptional(fetch.key, (key) =>
            encodeKey(key, `${at}.key`, maxValueDepth)
        )
    )
}

function encodeQueryByKey(
    queryByKey: QueryByKey,
    at: string,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(queryByKey.lfVersion, `${at}.lfVersion`)
    // Its key is required, and the participant refuses any key in this version
    if (queryByKey.lfVersion === LF_WITHOUT_KEYS) {
        throw new TxHashingError('UNSUPPORTED_LF_VERSION', NO_KEYS, at)
    }
    return concat(
        encodeString(queryByKey.lfVersion, `${at}.lfVersion`),
        0x04,
        encodeString(queryByKey.packageName, `${at}.packageName`),
        encodeIdentifier(queryByKey.templateId, `${at}.templateId`),
        encodeBool(queryByKey.exhaustive),
        // Required here, so without the presence byte of the other nodes' key
        encodeKey(queryByKey.key, `${at}.key`, maxValueDepth),
        encodeRepeated(queryByKey.result, (contractId, i) =>
            encodeHex(contractId, `${at}.result[${i}]`)
        )
    )
}

/**
 * encode_key_with_maintainers. The key hash goes in raw, without its length,
 * so it must have the 32 bytes the participant requires.
 */
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
        encodeString(globalKey.packageName, `${at}.packageName`),
        encodeIdentifier(globalKey.templateId, `${at}.templateId`),
        encodeValue(globalKey.key, maxValueDepth, `${at}.key`),
        globalKey.hash,
        encodeStrings(key.maintainers, `${path}.maintainers`)
    )
}

async function encodeMetadataV3(
    metadata: Metadata,
    maxValueDepth: number
): Promise<Uint8Array> {
    const submitterInfo = submitterInfoOf(metadata)
    return concat(
        encodeStrings(submitterInfo.actAs, 'metadata.submitterInfo.actAs'),
        encodeString(
            submitterInfo.commandId,
            'metadata.submitterInfo.commandId'
        ),
        encodeString(metadata.transactionUuid, 'metadata.transactionUuid'),
        encodeInt32(metadata.mediatorGroup, 'metadata.mediatorGroup'),
        encodeString(metadata.synchronizerId, 'metadata.synchronizerId'),
        encodeOptional(metadata.minLedgerEffectiveTime, (time) =>
            encodeTime(time, 'metadata.minLedgerEffectiveTime')
        ),
        encodeOptional(metadata.maxLedgerEffectiveTime, (time) =>
            encodeTime(time, 'metadata.maxLedgerEffectiveTime')
        ),
        encodeTime(metadata.preparationTime, 'metadata.preparationTime'),
        await encodeInputContracts(metadata.inputContracts, (create, path) =>
            encodeCreate(create, path, undefined, maxValueDepth)
        ),
        encodeOptional(metadata.maxRecordTime, (time) =>
            encodeTime(time, 'metadata.maxRecordTime')
        )
    )
}

function checkLfVersion(lfVersion: string, path: string): void {
    if (!LF_VERSIONS.has(lfVersion)) {
        throw new TxHashingError(
            'UNSUPPORTED_LF_VERSION',
            'hashing scheme V3 hashes LF versions 2.1 and 2 only',
            path
        )
    }
}

/**
 * The participant's decoder refuses a key, or byKey = true, in a node of LF
 * version 2.1; the Python example would hash both.
 */
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
