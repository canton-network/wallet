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
    encodeString,
    encodeTime,
    encodeValue,
} from './encoding.js'
import { TxHashingError } from './errors.js'
import {
    encodeInputContracts,
    encodeStrings,
    submitterInfoOf,
    type Scheme,
} from './scheme.js'

// Hashing scheme V2, after daml_transaction_hashing_v2.py (canton v3.5.1,
// 08-interactive-submission). Contract keys, byKey, QueryByKey nodes and
// maxRecordTime, which V2 does not hash, are rejected: a signature over the
// hash would not cover them. scheme.ts names the fields neither scheme hashes.

const SCHEME_VERSION = 0x02
/** Version of the protobuf encoding, written first in every node and in the metadata */
const ENCODING_VERSION = 0x01
/** The only LF version V2 hashes; nodes with contract keys have a later one */
const LF_VERSION = '2.1'

export const schemeV2: Scheme = {
    version: SCHEME_VERSION,
    checkLfVersion,
    encodeCreate,
    encodeExercise,
    encodeFetch,
    rollbackHead: Uint8Array.of(ENCODING_VERSION, 0x03),
    encodeQueryByKey: (_queryByKey, path) => {
        throw notCovered('a QueryByKey node', path)
    },
    encodeMetadata: encodeMetadataV2,
}

/** Also encodes input contracts, which have no seed. */
function encodeCreate(
    create: Create,
    at: string,
    seed: Uint8Array | undefined,
    maxValueDepth: number
): Uint8Array {
    checkLfVersion(create.lfVersion, `${at}.lfVersion`)
    if (create.key !== undefined) {
        throw notCovered('a contract key', `${at}.key`)
    }
    return concat(
        ENCODING_VERSION,
        encodeString(create.lfVersion, `${at}.lfVersion`),
        0x00,
        encodeOptional(seed, (bytes) => bytes),
        encodeHex(create.contractId, `${at}.contractId`),
        encodeString(create.packageName, `${at}.packageName`),
        encodeIdentifier(create.templateId, `${at}.templateId`),
        encodeValue(create.argument, maxValueDepth, `${at}.argument`),
        encodeStrings(create.signatories, `${at}.signatories`),
        encodeStrings(create.stakeholders, `${at}.stakeholders`)
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
    checkNoKey(exercise, at)
    return concat(
        ENCODING_VERSION,
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
        encodeStrings(exercise.choiceObservers, `${at}.choiceObservers`)
    )
}

function encodeFetch(fetch: Fetch, at: string): Uint8Array {
    checkLfVersion(fetch.lfVersion, `${at}.lfVersion`)
    checkNoKey(fetch, at)
    return concat(
        ENCODING_VERSION,
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
        encodeStrings(fetch.actingParties, `${at}.actingParties`)
    )
}

async function encodeMetadataV2(
    metadata: Metadata,
    maxValueDepth: number
): Promise<Uint8Array> {
    if (metadata.maxRecordTime !== undefined) {
        throw notCovered('maxRecordTime', 'metadata.maxRecordTime')
    }
    const submitterInfo = submitterInfoOf(metadata)
    return concat(
        ENCODING_VERSION,
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
        )
    )
}

function checkLfVersion(lfVersion: string, path: string): void {
    if (lfVersion !== LF_VERSION) {
        throw new TxHashingError(
            'UNSUPPORTED_LF_VERSION',
            `hashing scheme V2 hashes LF version ${LF_VERSION} only`,
            path
        )
    }
}

function checkNoKey(node: Exercise | Fetch, at: string): void {
    if (node.key !== undefined) throw notCovered('a contract key', `${at}.key`)
    if (node.byKey) throw notCovered('byKey = true', `${at}.byKey`)
}

const notCovered = (what: string, path: string) =>
    new TxHashingError(
        'FIELD_NOT_COVERED_BY_SCHEME',
        `${what} is not covered by hashing scheme V2`,
        path
    )
