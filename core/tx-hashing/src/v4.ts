// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Exercise } from '@canton-network/core-ledger-proto'

import { concat } from './bytes.ts'
import { encodeBytes, encodeRepeated, encodeString } from './encoding.ts'
import { TxHashingError } from './errors.ts'
import type { Scheme } from './scheme.ts'
import { keyedScheme } from './v3.ts'

// Hashing scheme V4, after v4/NodeHashBuilder.scala (canton v3.6.4) and "Summary
// of differences between V3 and V4" in the docs: V3 and external call results.

// The participant's decoder refuses external call results in nodes below LF 3
const LF_WITH_EXTERNAL_CALLS = '3'

export const schemeV4: Scheme = keyedScheme({
    version: 0x04,
    lfVersions: ['2.1', '2', '3'],
    encodeExternalCallResults,
})

function encodeExternalCallResults(exercise: Exercise, at: string): Uint8Array {
    if (
        exercise.externalCallResults.length > 0 &&
        exercise.lfVersion !== LF_WITH_EXTERNAL_CALLS
    ) {
        throw new TxHashingError(
            'UNSUPPORTED_LF_VERSION',
            `external call results are not supported in nodes with LF serialization version ${exercise.lfVersion}`,
            `${at}.externalCallResults`
        )
    }
    return encodeRepeated(exercise.externalCallResults, (result) =>
        concat(
            encodeString(result.extensionId),
            encodeString(result.functionId),
            encodeBytes(result.config),
            encodeBytes(result.input),
            encodeBytes(result.output)
        )
    )
}
