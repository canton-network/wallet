// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Stands in for the participant TEA that credits purchased traffic: follows
 * the paymaster's update stream and applies every purchase's
 * `TrafficCreditReporter_PublishCredit` exercise with `topUpTraffic`.
 *
 * Resumes from the offset saved in `.scan-topup-offset.local`, so purchases
 * made while it was stopped are still credited. Long-running until Ctrl+C. For
 * a one-off manual credit instead, see `topup.ts`.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { TrafficScan } from '@canton-network/core-traffic-purchase/paymaster'

import { requireEnvVar } from './env-file.ts'
import { createAdminSdk, createPaymasterLedger } from './lib.ts'

// Not `.env.local`: the UI's dev server restarts whenever that changes.
const offsetPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../.scan-topup-offset.local'
)

/** The saved offset, unless it belongs to an earlier `initialize`'s paymaster. */
async function readSavedOffset(paymaster: string): Promise<number | undefined> {
    const contents = await fs.readFile(offsetPath, 'utf-8').catch(() => '')
    const [savedPaymaster, savedOffset] = contents.split('\n')
    const offset = Number(savedOffset)
    return savedPaymaster === paymaster && Number.isSafeInteger(offset)
        ? offset
        : undefined
}

async function saveOffset(paymaster: string, offset: number): Promise<void> {
    await fs.writeFile(offsetPath, `${paymaster}\n${offset}\n`)
}

async function main() {
    const paymaster = await requireEnvVar('VITE_PAYMASTER_PARTY_ID')
    const admin = await createAdminSdk()

    const scan = await TrafficScan.start({
        ledger: createPaymasterLedger(),
        traffic: admin.traffic,
        paymaster,
        beginExclusive: await readSavedOffset(paymaster),
        onOffset: (offset) => saveOffset(paymaster, offset),
        onCredit: ({ accountId, balanceDelta, balance, deduplicationId }) =>
            console.log(
                `Credited ${balanceDelta} to ${accountId} ` +
                    `(exercise ${deduplicationId}); balance is now ${balance}`
            ),
    })

    console.log(
        `Scanning purchases for paymaster ${paymaster} after offset ${scan.currentOffset}`
    )
    console.log('Leave this running. Ctrl+C to stop.')

    process.on('SIGINT', () => {
        void scan.stop().then(() => process.exit(0))
    })
    await scan.finished
}

main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
})
