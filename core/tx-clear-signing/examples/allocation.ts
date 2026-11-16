// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// A fixed two-leg AllocationFactory_Allocate, exercised through the V2 token-standard interface
// and clear-signed with the example ExternalPartyAmuletRules descriptor.
//
// From the wallet repository:
//   pnpm exec tsx core/tx-clear-signing/examples/allocation.ts

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import externalPartyAmuletRules from './descriptors/external-party-amulet-rules.json'
import { clearSign, type Descriptor } from '../src/index.js'
import { allocationV2Multileg } from '../src/__tests__/fixtures/allocation-v2-multileg.js'

/** Base64 prepared transaction, as `/v2/interactive-submission/prepare` returns it. */
export const preparedTransaction = allocationV2Multileg

/** The hash of `preparedTransaction`. `clearSign` describes it only when it hashes to this. */
export const preparedTransactionHash =
    'Ajytt4Ri6HMIauOQ5IuvaWR65kOPPxN2GrCfrnXPmVE='

export const intent =
    'Allocate funds at DSO::1220d8a721d292c5bd3bbfe1653ab6eeba8d8cfc88e322bc52c2702194bd2347a813 for settlement "capture-multileg-1788338015304997000" of 2 transfer legs, authorized by bd::1220fd4f42cf33a603bd45714c9b0181eb661b4570d22df79a352080aa7d121cdee7. Committed: cannot be withdrawn before the settlement deadline'

export function describeAllocation() {
    return clearSign(
        preparedTransaction,
        [externalPartyAmuletRules as Descriptor],
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
