// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { prepareExecuteAndWait } from '@canton-network/dapp-sdk'
import type { AmuletNamespace } from '@canton-network/wallet-sdk'

import { tapAmuletWithWallet } from '../src/lib/tapAmulet.ts'

const partyId = 'test-party'
const prepared: Awaited<ReturnType<AmuletNamespace['tap']>> = [
    {
        ExerciseCommand: {
            templateId: 'Splice.AmuletRules:AmuletRules',
            contractId: 'amulet-rules',
            choice: 'AmuletRules_DevNet_Tap',
            choiceArgument: { receiver: partyId, amount: '10' },
        },
    },
    [{ contractId: 'amulet-rules', createdEventBlob: 'blob' }],
]

test('submits the tap and disclosures through the connected wallet', async () => {
    const requests: Parameters<typeof prepareExecuteAndWait>[0][] = []
    const amulet: Pick<AmuletNamespace, 'tap'> = {
        async tap(party, amount) {
            assert.equal(party, partyId)
            assert.equal(amount, '10')
            return prepared
        },
    }

    await tapAmuletWithWallet(amulet, partyId, async (request) => {
        requests.push(request)
    })

    assert.equal(requests.length, 1)
    assert.match(
        requests[0].commandId ?? '',
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
    assert.deepEqual(requests[0].actAs, [partyId])
    assert.deepEqual(requests[0].commands, [prepared[0]])
    assert.deepEqual(requests[0].disclosedContracts, prepared[1])
})

test('propagates a wallet rejection', async () => {
    const rejection = new Error('Rejected by the user')
    await assert.rejects(
        tapAmuletWithWallet({ tap: async () => prepared }, partyId, () =>
            Promise.reject(rejection)
        ),
        rejection
    )
})

test('does not submit when creating the tap fails', async () => {
    const failure = new Error('Could not create tap')
    let submitted = false
    await assert.rejects(
        tapAmuletWithWallet(
            {
                tap: () => Promise.reject(failure),
            },
            partyId,
            async () => {
                submitted = true
            }
        ),
        failure
    )
    assert.equal(submitted, false)
})
