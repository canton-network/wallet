// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Three token standard V2 roots that one wallet user submits in one transaction, clear-signed with
// the reference Amulet descriptors: a transfer and an allocation through the factory on
// ExternalPartyAmuletRules, and the withdrawal of an earlier allocation on its AmuletAllocationV2.
// The allocation template is bound only where the user exercises it: the allocate itself is a
// choice on the factory, and creates the allocation as a child.
//
// From the wallet repository:
//   pnpm exec tsx core/tx-clear-signing/examples/showcase.ts

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import showcaseTransaction from '../src/__tests__/fixtures/showcase-transaction.json'
import { clearSign } from '../src/index.ts'

const here = dirname(fileURLToPath(import.meta.url))
const externalPartyAmuletRules = readFileSync(
    resolve(here, 'descriptors/splice/amulet-external-party-amulet-rules.json'),
    'utf8'
)
const amuletAllocationV2 = readFileSync(
    resolve(here, 'descriptors/splice/amulet-allocation-v2.json'),
    'utf8'
)

/** Base64 prepared transaction. */
export const preparedTransaction = showcaseTransaction.preparedTransaction

/** The hash of `preparedTransaction`. `clearSign` describes it only when it hashes to this. */
export const preparedTransactionHash =
    showcaseTransaction.preparedTransactionHash

/** One sentence per root, in root order. */
export const intents = [
    `Request a transfer of 1.0000000000 "Amulet" from bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd to bd::12208f8e5e9c41f03d771d81daba7b0b1346557f068a1cebff620c93ed43cac11356. What the receiver does with it depends on the transfer's metadata`,
    'Allocate funds at DSO::1220d47f58e3c504e3d6eb0d726e6497eb74645b2fecf5433b629851b5090dee9b8f for settlement "alloc-factory" of 1 legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd. Not committed: can be withdrawn at any time',
    'Withdraw the allocation for settlement "alloc-live" of 1 legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd',
] as const

const descriptors = [externalPartyAmuletRules, amuletAllocationV2]

export function describeShowcase() {
    return clearSign(preparedTransaction, descriptors, preparedTransactionHash)
}

async function run(): Promise<void> {
    const result = await describeShowcase()
    const wording = result.operations.map((op) => op.intent)
    const actual = wording.join('\n')
    const expected = intents.join('\n')
    if (actual !== expected) {
        throw new Error(`wording changed:\n${actual}`)
    }
    console.log(actual)
}

const entry = process.argv[1]
if (entry !== undefined && fileURLToPath(import.meta.url) === resolve(entry)) {
    await run()
}
