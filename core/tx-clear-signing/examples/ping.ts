// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// A fixed Ping create, clear-signed with the example Ping descriptor.
//
// From the wallet repository:
//   pnpm exec tsx core/tx-clear-signing/examples/ping.ts

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { builtinPingCreate } from '../src/__tests__/fixtures/ping.ts'
import { clearSign } from '../src/index.ts'

const here = dirname(fileURLToPath(import.meta.url))
const ping = readFileSync(resolve(here, 'descriptors/ping.json'), 'utf8')

/** Base64 prepared transaction, as `/v2/interactive-submission/prepare` returns it. */
export const preparedTransaction = builtinPingCreate

/** The hash of `preparedTransaction`. `clearSign` describes it only when it hashes to this. */
export const preparedTransactionHash =
    'SY+x4x4DoOTcb5VbJN/jScYltMJeDzBhFpBYdmN97PY='

export const intent =
    'Ping "04d887dd-15b8-4954-8b79-a853811ce7cf" from v1-01-alice::1220ee2624190834dddf28f194685acee8f00cbde9ee0d211dae277f4d799884f289 to v1-01-alice::1220ee2624190834dddf28f194685acee8f00cbde9ee0d211dae277f4d799884f289'

export function describePing() {
    return clearSign(preparedTransaction, [ping], preparedTransactionHash)
}

async function run(): Promise<void> {
    const result = await describePing()
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
