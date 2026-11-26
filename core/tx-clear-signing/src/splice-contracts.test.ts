// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Clear signing on Splice contracts chosen for their awkward shapes: repeated field names, variants,
// optionals, tuples, maps and V1/V2 interface choices with the same name. Each test pins what the
// wallet shows, including the fields that fail.

import { HashingSchemeVersion } from '@canton-network/core-ledger-proto'
import type { OperationDescription } from '@canton-network/core-tx-clear-signing-lib'
import { computePreparedTransactionHash } from '@canton-network/core-tx-hashing'
import { describe, expect, it } from 'vitest'

import v1Allocate from './__tests__/fixtures/token-standard/amulet-v1-allocation-factory-allocate.json'
import {
    described,
    intentText,
    interfaceOf,
    isComplete,
    shown,
} from './__tests__/helpers.ts'
import {
    ALICE,
    BOB,
    PROVIDER,
    captured,
    capturedIds,
    spliceDescriptors,
} from './__tests__/splice.ts'
import { toBase64 } from './bytes.ts'

async function describeOne(
    preparedTransaction: string
): Promise<OperationDescription> {
    const { operations } = await describedSplice(preparedTransaction)
    expect(operations).toHaveLength(1)
    return operations[0]!
}

const describeCaptured = (id: string) =>
    describeOne(captured(id).preparedTransaction)

function describedSplice(preparedTransaction: string) {
    return described(preparedTransaction, spliceDescriptors)
}

/** Each field as label → value or `error: …`. */
function fields(op: OperationDescription): Record<string, string> {
    return Object.fromEntries(
        op.fields.map((f) => [
            f.label,
            'value' in f ? f.value : `error: ${shown(f)}`,
        ])
    )
}

describe('captured fixtures', () => {
    it.each(capturedIds)(
        '%s is the transaction the ledger hashed',
        async (id) => {
            const fixture = captured(id)
            const scheme =
                fixture.hashingSchemeVersion === 'HASHING_SCHEME_VERSION_V3'
                    ? HashingSchemeVersion.V3
                    : HashingSchemeVersion.V2
            const hash = toBase64(
                await computePreparedTransactionHash(
                    fixture.preparedTransaction,
                    scheme
                )
            )
            expect(hash).toBe(fixture.preparedTransactionHash)
        }
    )

    it('needs hashing scheme V3 for a template with a contract key', async () => {
        expect(captured('gl-lock-create').hashingSchemeVersion).toBe(
            'HASHING_SCHEME_VERSION_V3'
        )
    })
})

describe('governance locks', () => {
    it('keeps source.owner apart from receiver, and shows the lock being transferred', async () => {
        const op = await describeCaptured('gl-transfer-reject-v1')
        expect(fields(op)).toMatchObject({ From: BOB, To: ALICE })
        expect(Object.keys(JSON.parse(fields(op)['Lock type']!))).toEqual([
            'GLS_VestingLock',
        ])
    })

    it('describes a captured V1 reject through the interface', async () => {
        const op = await describeCaptured('gl-transfer-reject-v1')
        expect(op.status).toBe('described')
        expect(interfaceOf(op)?.entityName).toBe('TransferInstruction')
        expect(intentText(op)).toBe(
            `Reject 100.0000000000 of governance locks from ${BOB}`
        )
    })
})

describe('V1 and V2 AllocationFactory_Allocate each have their own entry', () => {
    it('describes V2', async () => {
        const tx = captured(
            'allocation-factory-allocate-multileg'
        ).preparedTransaction
        const op = await describeOne(tx)
        expect(op.status).toBe('described')
        expect(interfaceOf(op)?.moduleName).toBe(
            'Splice.Api.Token.AllocationInstructionV2'
        )
        expect(fields(op)).toMatchObject({
            'Amulet administrator':
                'DSO::1220d47f58e3c504e3d6eb0d726e6497eb74645b2fecf5433b629851b5090dee9b8f',
            'Number of legs': '2',
        })
        expect(isComplete(await describedSplice(tx))).toBe(true)
    })

    it('describes V1', async () => {
        const tx = v1Allocate.preparedTransaction
        const op = await describeOne(tx)
        expect(op.status).toBe('described')
        expect(interfaceOf(op)?.moduleName).toBe(
            'Splice.Api.Token.AllocationInstructionV1'
        )
        expect(intentText(op)).toBe(
            'Allocate 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49 for settlement "capture-v1-allocate", executed by bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2'
        )
        expect(isComplete(await describedSplice(tx))).toBe(true)
    })
})

describe('DSO governance', () => {
    it('shows a SetConfig vote whole, with the action constructor in the raw value', async () => {
        const op = await describeCaptured('dso-request-vote-set-config')
        expect(op.status).toBe('described')
        expect(intentText(op)).toBe(
            `Request a vote by ${ALICE}: "Raise maxTextLength"`
        )
        expect(fields(op)).toMatchObject({
            'Voting period': '3d',
            'Effective at': 'None',
        })
        const action = JSON.parse(fields(op)['Votes on']!)
        const setConfig = action.ARC_DsoRules.dsoAction.SRARC_SetConfig
        expect(setConfig.newConfig.maxTextLength).toBe('2048')
        expect(setConfig.baseConfig.maxTextLength).toBe('1024')
        expect(setConfig.newConfig.voteCooldownTime).toBe('1m')
        expect(
            setConfig.newConfig.svOperationsSwitchOverTimes['cip-0104']
        ).toBe('2026-11-19T16:29:56Z')
    })

    it('shows tuples, Sets and an enum inside an amulet config schedule shown whole', async () => {
        const op = await describeCaptured('dso-request-vote-amulet-schedule')
        expect(op.status).toBe('described')
        expect(intentText(op)).toBe(
            `Request a vote by ${ALICE}: "New traffic price"`
        )
        expect(fields(op)['Voting period']).toBe('None')
        const action = JSON.parse(fields(op)['Votes on']!)
        const schedule =
            action.ARC_AmuletRules.amuletRulesAction
                .CRARC_AddFutureAmuletConfigSchedule
        const config = schedule.newScheduleItem._2
        expect(config.decentralizedSynchronizer.fees.extraTrafficPrice).toBe(
            '16.6700000000'
        )
        expect(
            config.decentralizedSynchronizer.fees.baseRateTrafficLimits
                .burstWindow
        ).toBe('20m')
        expect(config.decentralizedSynchronizer.requiredSynchronizers).toEqual({
            map: [['global-domain::1220c0ffee', '()']],
        })
        expect(config.transferConfig.transferFee.steps).toEqual([
            { _1: '100.0000000000', _2: '0.0000000000' },
            { _1: '1000.0000000000', _2: '0.0000000000' },
        ])
        // raw shows the enum constructor, not the descriptor's enum table
        expect(config.rewardConfig.mintingVersion).toBe(
            'RewardVersion_TrafficBasedAppRewards'
        )
    })

    it('keeps sibling optional configs with the same field names apart', async () => {
        const op = await describeCaptured('dso-set-synchronizer-node-config')
        expect(op.status).toBe('described')
        expect(fields(op)).toMatchObject({
            'Sequencer URL': '"https://sequencer.example.com"',
            'Sequencer migration': '3',
            'Legacy sequencer URL': '"https://legacy-sequencer.example.com"',
            'Legacy sequencer migration': '2',
            'Sequencer identity available after': 'None',
            'Mediator ID': '"MED::current"',
            'Public URL': '"https://scan.example.com"',
            'Governance keys': '1',
            'Physical synchronizers':
                '[["1",{"sequencer":{"url":"https://psid-1.example.com"}}]]',
        })
    })
})

describe('wallet and apps', () => {
    it('words a choice without arguments from the contract alone', async () => {
        const op = await describeCaptured('transfer-offer-accept')
        expect(op.status).toBe('described')
        expect(intentText(op)).toBe(`Accept 12.5000000000 USD from ${ALICE}`)
        expect(fields(op)).toEqual({
            Amount: '12.5000000000',
            Unit: 'USD',
            From: ALICE,
            To: BOB,
            Description: '"Lunch"',
            Expires: '2026-11-16T16:29:56Z',
            'Tracking ID': '"offer-1"',
        })
    })

    it('words V1 and V2 activity markers the same; weight is V2 only', async () => {
        const v1 = await describeCaptured('activity-marker-v1')
        const v2 = await describeCaptured('activity-marker-v2')
        expect(intentText(v1)).toBe(
            `Record activity of ${PROVIDER} for 2 beneficiaries`
        )
        expect(fields(v1)).not.toHaveProperty('Weight')
        expect(fields(v2).Weight).toBe('3.0000000000')
    })

    it('indexes a TextMap of records with a quoted key', async () => {
        const op = await describeCaptured('otc-trade-proposal-create')
        expect(intentText(op)).toBe(
            `Trade 100.0000000000 "Amulet" from ${ALICE} to ${BOB}, one of 2 legs`
        )
        expect(fields(op)['Leg 0 note']).toBe('"csalice pays"')
    })

    it('counts the legs of the contract an accept acts on', async () => {
        const op = await describeCaptured('otc-trade-proposal-accept')
        expect(intentText(op)).toBe(
            `Approve, as ${BOB}, a trade of 2 legs at ${PROVIDER}`
        )
    })

    it('counts a list of variants, and shows it only as a whole', async () => {
        const op = await describeCaptured('batching-utility-execute')
        expect(intentText(op)).toBe(
            `Execute 2 token standard actions as ${ALICE}`
        )
        const actions = JSON.parse(fields(op).Actions!) as object[]
        expect(actions.map((a) => Object.keys(a)[0])).toEqual([
            'TSA_TransferInstruction_RejectV1',
            'TSA_TransferInstruction_RejectV2',
        ])
    })

    it('describes every fixture that is not marked indescribable', async () => {
        const intents: Record<string, string> = {}
        const marked: string[] = []
        for (const id of capturedIds) {
            const fixture = captured(id)
            const result = await describedSplice(fixture.preparedTransaction)
            const { operations } = result
            expect(operations, id).toHaveLength(1)
            const op = operations[0]!
            if (fixture.indescribable !== undefined) {
                expect(fixture.indescribable, id).not.toBe('')
                expect(op.status, id).toBe('undescribed')
                marked.push(id)
                continue
            }
            expect(op.status, `${id}: ${op.reason ?? op.intent}`).toBe(
                'described'
            )
            expect(isComplete(result), id).toBe(true)
            intents[id] = op.intent
        }
        expect(marked).toEqual([])
        const dso = `csdso::1220d44fc1c3ba0b5bdf7b956ee71bc94ebe2d23258dc268fdf0824fbaeff2c61424`
        expect(intents).toEqual({
            'activity-marker-v1': `Record activity of ${PROVIDER} for 2 beneficiaries`,
            'activity-marker-v2': `Record activity of ${PROVIDER} for 1 beneficiaries`,
            'allocation-factory-allocate-multileg':
                'Allocate funds at DSO::1220d47f58e3c504e3d6eb0d726e6497eb74645b2fecf5433b629851b5090dee9b8f for settlement "capture-multileg" of 2 legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd. Committed: cannot be withdrawn before the settlement deadline',
            'balance-update-create-netting': `Record a balance update in the group of ${ALICE}, managed by ${PROVIDER}`,
            'balance-update-create-transfer': `Record a balance update in the group of ${ALICE}, managed by ${PROVIDER}`,
            'batching-utility-execute': `Execute 2 token standard actions as ${ALICE}`,
            'dso-request-vote-amulet-schedule': `Request a vote by ${ALICE}: "New traffic price"`,
            'dso-request-vote-set-config': `Request a vote by ${ALICE}: "Raise maxTextLength"`,
            'dso-set-synchronizer-node-config': `Set the node configuration of ${ALICE} on "global-domain::1220c0ffee"`,
            'external-party-amulet-rules-create': `Create the external-party amulet rules of ${dso}`,
            'featured-app-right-create': `Grant ${PROVIDER} a featured app right from ${dso}`,
            'gl-lock-create': `Lock 10000.0000000000 for ${ALICE} under ${dso}`,
            'gl-substitution-create-fa-vesting': `Propose substituting 250.0000000000 of the governance lock of ${ALICE}, as ${BOB}`,
            'gl-substitution-create-sv-full': `Propose substituting 250.0000000000 of the governance lock of ${ALICE}, as ${ALICE}`,
            'gl-transfer-create': `Propose transferring 100.0000000000 of the governance lock of ${ALICE} to ${BOB}`,
            'gl-transfer-reject-v1': `Reject 100.0000000000 of governance locks from ${BOB}`,
            'otc-trade-proposal-accept': `Approve, as ${BOB}, a trade of 2 legs at ${PROVIDER}`,
            'otc-trade-proposal-create': `Trade 100.0000000000 "Amulet" from ${ALICE} to ${BOB}, one of 2 legs`,
            'transfer-offer-accept': `Accept 12.5000000000 USD from ${ALICE}`,
            'transfer-offer-create': `Offer 12.5000000000 USD from ${ALICE} to ${BOB}: "Lunch"`,
            'transfer-preapproval-create': `Preapprove transfers to ${BOB} managed by ${PROVIDER} until 2027-02-07T16:29:58Z, under ${dso}`,
            'vote-request-create': `Open a vote requested by "sv-1", under ${dso}: "Raise maxTextLength"`,
            'wallet-user-proxy-create': `Wallet user proxy of ${PROVIDER}`,
        })
    })

    it('words the creates a party submits itself', async () => {
        expect(
            intentText(await describeCaptured('wallet-user-proxy-create'))
        ).toBe(`Wallet user proxy of ${PROVIDER}`)
        expect(
            (await describeCaptured('otc-trade-proposal-create')).status
        ).toBe('described')
    })
})
