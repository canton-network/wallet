// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PreparedTransaction } from '@canton-network/core-ledger-proto'
import { fromBase64 } from '../../bytes.js'
import { loadVectors } from './load-vectors.js'

type Scheme = 'HASHING_SCHEME_VERSION_V2' | 'HASHING_SCHEME_VERSION_V3'

/**
 * The accepted vectors of `scheme`, which are prepare responses of a live
 * participant, in path order: the prepared transaction in the participant's
 * base64 and decoded, and its hash in hex.
 */
export function liveFixtures(scheme: Scheme): {
    scenario: string
    base64: string
    tx: PreparedTransaction
    hashHex: string
}[] {
    const vectors = loadVectors().flatMap((vector) =>
        vector.kind === 'accepted' && vector.scheme === scheme ? [vector] : []
    )
    // Without this, an empty list would leave it.each with no test to fail
    if (vectors.length === 0) throw new Error(`no live fixture for ${scheme}`)
    return vectors.map((vector) => ({
        scenario: vector.source.scenario,
        base64: vector.preparedTransaction,
        tx: PreparedTransaction.fromBinary(
            fromBase64(vector.preparedTransaction)
        ),
        hashHex: vector.expected.hash,
    }))
}
