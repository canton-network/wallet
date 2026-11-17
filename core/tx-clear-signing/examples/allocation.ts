// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// A fixed two-leg AllocationFactory_Allocate, exercised through the V2 token-standard interface
// and clear-signed with the ExternalPartyAmuletRules descriptor. The capture and the descriptor
// are both splice-amulet 0.1.25.
//
// From the wallet repository:
//   pnpm exec tsx core/tx-clear-signing/examples/allocation.ts

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import externalPartyAmuletRules from './descriptors/splice/amulet-external-party-amulet-rules.json'
import { clearSign } from '../src/index.js'
import allocation from '../src/__tests__/fixtures/splice/allocation-factory-allocate-multileg.json'

/** Base64 prepared transaction, as `/v2/interactive-submission/prepare` returns it. */
export const preparedTransaction = allocation.preparedTransaction

/** The hash of `preparedTransaction`. `clearSign` describes it only when it hashes to this. */
export const preparedTransactionHash = allocation.preparedTransactionHash

export const intent =
    'Allocate funds at DSO::1220d47f58e3c504e3d6eb0d726e6497eb74645b2fecf5433b629851b5090dee9b8f for settlement "capture-multileg" of 2 legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd. Committed: cannot be withdrawn before the settlement deadline'

export function describeAllocation() {
    return clearSign(
        preparedTransaction,
        [externalPartyAmuletRules],
        preparedTransactionHash
    )
}

async function run(): Promise<void> {
    const result = await describeAllocation()
    const wording = result.operations[0]?.intent
    if (wording !== intent) {
        throw new Error(`wording changed: ${wording}`)
    }
    console.log(wording)
}

const entry = process.argv[1]
if (entry !== undefined && fileURLToPath(import.meta.url) === resolve(entry)) {
    await run()
}
