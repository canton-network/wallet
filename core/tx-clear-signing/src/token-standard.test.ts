// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// The reference Amulet and Utility descriptors (examples/descriptors/splice/amulet-*.json and
// utility-*.json) on every root a token holder submits through the token standard, V1 (CIP-56) and
// V2 (CIP-112), and the holder choices around it. Each descriptor is bound to the template the
// prepared transaction carries at its root: a factory choice is bound to the factory, and the
// instruction or allocation it creates is a child that no descriptor words.
//
// Amulet and Utility captures were prepared on the running LocalNet, on the package IDs the
// reference descriptors are bound to. Three descriptor entries have no prepared transaction:
// accepting or rejecting an external-party setup needs the DSO as a signatory, and renewing a
// transfer preapproval needs the DSO's AmuletRules and open mining round, which this participant
// cannot read.

import { describe, expect, it } from 'vitest'
import type { Identifier } from '@canton-network/core-ledger-proto'
import type { OperationDescription } from './clear-sign.js'
import { parseDescriptor } from './descriptor.js'
import { decode } from './roots.js'
import { described } from './__tests__/helpers.js'
import { rebind, spliceDescriptors } from './__tests__/splice.js'

interface Capture {
    id: string
    source: string
    preparedTransaction: string
}

const captureFiles = import.meta.glob<Capture>(
    './__tests__/fixtures/token-standard/*.json',
    { eager: true, import: 'default' }
)
const captures = Object.values(captureFiles)

// The token descriptors: examples/descriptors/splice/amulet-*.json and utility-*.json.
const tokenDescriptorFiles = import.meta.glob(
    '../examples/descriptors/splice/{amulet,utility}-*.json',
    { eager: true, import: 'default' }
)
const tokenDescriptors = Object.values(tokenDescriptorFiles).map((json) =>
    parseDescriptor(json)
)

function rootTemplate(preparedTransaction: string): Identifier {
    const tx = decode(preparedTransaction).transaction!
    const root = tx.nodes.find((n) => n.nodeId === tx.roots[0])
    const node =
        root?.versionedNode.oneofKind === 'v1'
            ? root.versionedNode.v1.nodeType
            : undefined
    const templateId =
        node?.oneofKind === 'exercise'
            ? node.exercise.templateId
            : node?.oneofKind === 'create'
              ? node.create.templateId
              : undefined
    if (!templateId) throw new Error('root is not a create or an exercise')
    return templateId
}

/** The reference descriptors, bound to the package the capture's root was prepared on. */
function boundTo(preparedTransaction: string) {
    const { packageId, moduleName, entityName } =
        rootTemplate(preparedTransaction)
    return spliceDescriptors
        .filter(
            (d) =>
                d.context.template.moduleName === moduleName &&
                d.context.template.entityName === entityName
        )
        .map((d) => rebind(d, packageId))
}

/** Each root the tests describe, for the coverage check. */
const seen: OperationDescription[] = []

async function describeComplete(
    preparedTransaction: string,
    descriptors = spliceDescriptors
): Promise<OperationDescription> {
    const result = await described(preparedTransaction, descriptors)
    expect(result.operations).toHaveLength(1)
    const op = result.operations[0]!
    expect(op.status).toBe('described')
    expect(op.fields.filter((f) => 'error' in f)).toEqual([])
    expect(result.complete).toBe(true)
    seen.push(op)
    return op
}

const capturedIntents: Record<string, string> = {
    'amulet-preapproval-proposal-create':
        'Propose that app_user_localnet-localparty-1::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b preapproves incoming Amulet transfers to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49',
    'amulet-preapproval-send-v2':
        'Send 0.5000000000 Amulet from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220525524167d98331e8262c5b038faeb8fdb9a1528204b6659182846aea6ebedc5',
    'amulet-locked-amulet-expire':
        'Unlock an amulet of bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2, created with 1.0000000000, whose lock expired at 2026-11-17T13:16:07Z',
    'amulet-preapproval-cancel':
        'Cancel, as bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2, the preapproval of transfers to bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 managed by app_user_localnet-localparty-1::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'amulet-v1-allocation-cancel':
        'Cancel the allocation of 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49 for settlement "capture-v1-allocation-live"',
    'amulet-v1-allocation-execute-transfer':
        'Transfer 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49 for settlement "capture-v1-allocation-live", executed by bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2',
    'amulet-v1-allocation-factory-allocate':
        'Allocate 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49 for settlement "capture-v1-allocate", executed by bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2',
    'amulet-v1-allocation-withdraw':
        'Withdraw the allocation of 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49 for settlement "capture-v1-allocation-live"',
    'amulet-v1-transfer-factory-transfer':
        'Request a transfer of 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220525524167d98331e8262c5b038faeb8fdb9a1528204b6659182846aea6ebedc5. What the receiver does with it depends on the transfer\'s metadata',
    'amulet-v1-transfer-instruction-accept':
        'Accept 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2 to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49',
    'amulet-v1-transfer-instruction-reject':
        'Reject 0.5000000000 "Amulet" from bd::12204044bc8587a97c1da8a888665308e8bfad109ab90df2bc3a5c8dac66a7a4d3d2',
    'amulet-v1-transfer-instruction-withdraw':
        'Withdraw 0.5000000000 "Amulet" sent to bd::1220acd26e930ff71796387a4706db7f348faa085c3e0a58a6df050a4395b3323e49',
    'amulet-v2-allocation-cancel':
        'Cancel the allocation for settlement "alloc-live" of 1 transfer legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd',
    'amulet-v2-allocation-factory-allocate':
        'Allocate funds at DSO::1220d47f58e3c504e3d6eb0d726e6497eb74645b2fecf5433b629851b5090dee9b8f for settlement "alloc-factory" of 1 transfer legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd. Not committed: can be withdrawn at any time',
    'amulet-v2-allocation-withdraw':
        'Withdraw the allocation for settlement "alloc-live" of 1 transfer legs, authorized by bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd',
    'amulet-v2-settlement-factory-settle-batch':
        'Settle 1 transfer legs for settlement "settle-batch-1794860752700158000" at DSO::1220d47f58e3c504e3d6eb0d726e6497eb74645b2fecf5433b629851b5090dee9b8f',
    'amulet-v2-transfer-factory-transfer':
        'Request a transfer of 1.0000000000 "Amulet" from bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd to bd::12208f8e5e9c41f03d771d81daba7b0b1346557f068a1cebff620c93ed43cac11356. What the receiver does with it depends on the transfer\'s metadata',
    'amulet-v2-transfer-instruction-accept':
        'Accept 1.0000000000 "Amulet" from bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd to bd::1220d0b4448c8e15a251407c9ce2858430194eee170990d496419c4e2c790293ad08',
    'amulet-v2-transfer-instruction-reject':
        'Reject 1.0000000000 "Amulet" from bd::12208b49abc71749ee44211bcb838fc85700420f6e90e6557947ee2a3babd5d7f7fd',
    'amulet-v2-transfer-instruction-withdraw':
        'Withdraw 1.0000000000 "Amulet" sent to bd::1220d0b4448c8e15a251407c9ce2858430194eee170990d496419c4e2c790293ad08',
    'utility-request-burn':
        'Request a burn of 1.0000000000 "CLEAR-SIGN" held by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-burn"',
    'utility-settlement-factory-settle-batch':
        'Settle 1 transfer legs for settlement "capture-settle" at util-reg-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v1-allocation-factory-allocate':
        'Allocate 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-v1-alloc", executed by util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v1-dvp-leg-cancel':
        'Cancel the allocation of 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-v1-alloc"',
    'utility-v1-dvp-leg-execute-transfer':
        'Transfer 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-v1-alloc", executed by util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v1-transfer-factory-transfer':
        'Request a transfer of 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b. What the receiver does with it depends on the transfer\'s metadata',
    'utility-v1-transfer-offer-accept':
        'Accept 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v1-transfer-offer-reject':
        'Reject 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v1-transfer-offer-withdraw':
        'Withdraw 1.0000000000 "CLEAR-SIGN" sent to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v2-allocation-cancel':
        'Cancel the allocation for settlement "capture-v2-alloc" of 1 transfer legs, authorized by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v2-allocation-factory-allocate':
        'Allocate funds at util-reg-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-v2-alloc" of 1 transfer legs, authorized by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b. Not committed: can be withdrawn at any time',
    'utility-v2-allocation-withdraw':
        'Withdraw the allocation for settlement "capture-v2-alloc" of 1 transfer legs, authorized by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v2-transfer-factory-transfer':
        'Request a transfer of 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b. What the receiver does with it depends on the transfer\'s metadata',
    'utility-v2-transfer-offer-accept':
        'Accept 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v2-transfer-offer-reject':
        'Reject 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v2-transfer-offer-withdraw':
        'Withdraw 1.0000000000 "CLEAR-SIGN" sent to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-burn-offer-accept':
        'Accept a burn of 1.0000000000 "CLEAR-SIGN" held by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-burn-accept"',
    'utility-burn-offer-reject':
        'Reject a burn of 1.0000000000 "CLEAR-SIGN" held by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-burn-reject": "Holding pledged"',
    'utility-burn-request-cancel':
        'Cancel the burn request of 1.0000000000 "CLEAR-SIGN" held by util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-burn-req"',
    'utility-mint-offer-accept':
        'Accept a mint of 1.0000000000 "CLEAR-SIGN" to util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-mint-accept"',
    'utility-mint-offer-reject':
        'Reject a mint of 1.0000000000 "CLEAR-SIGN" to util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-mint-reject": "Not subscribed"',
    'utility-mint-request-cancel':
        'Cancel the mint request of 1.0000000000 "CLEAR-SIGN" to util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-mint"',
    'utility-preapproval-create':
        'Preapprove incoming transfers to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b of instruments administered by util-reg-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-preapproval-modify':
        'Change the instruments of util-reg-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b that util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b preapproves incoming transfers of',
    'utility-preapproval-withdraw':
        'Withdraw, as util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, the preapproval of util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for instruments administered by util-reg-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-request-mint':
        'Request a mint of 1.0000000000 "CLEAR-SIGN" to util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, reference "capture-mint"',
    'utility-v1-dvp-leg-withdraw':
        'Withdraw the allocation of 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-dvp-withdraw"',
    'utility-v1-preapproval-transfer':
        'Transfer 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, under the preapproval of util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
    'utility-v2-dvp-leg-cancel':
        'Cancel the allocation of 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-dvp-withdraw"',
    'utility-v2-dvp-leg-withdraw':
        'Withdraw the allocation of 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b for settlement "capture-dvp-withdraw"',
    'utility-v2-preapproval-transfer':
        'Transfer 1.0000000000 "CLEAR-SIGN" from util-hold-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b to util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b, under the preapproval of util-recv-144300::1220d38b576c69e52b351c6bc7acf79343440267c6a94b42c002ba28d42a7fa94c1b',
}

describe('captured token standard roots', () => {
    it('has an intent for every capture', () => {
        expect(captures.map((c) => c.id).sort()).toEqual(
            Object.keys(capturedIntents).sort()
        )
    })

    it.each(captures.map((c) => [c.id, c] as const))(
        '%s',
        async (id, capture) => {
            const op = await describeComplete(
                capture.preparedTransaction,
                boundTo(capture.preparedTransaction)
            )
            expect(op.intent).toBe(capturedIntents[id])
        }
    )
})

describe('reference descriptors', () => {
    it('words every entry of the Amulet and Utility descriptors on some root', () => {
        const key = (
            template: { moduleName: string; entityName: string },
            choice: string,
            iface?: { moduleName: string }
        ) =>
            `${template.moduleName}:${template.entityName} ${choice} ${iface?.moduleName ?? ''}`
        const expected = tokenDescriptors.flatMap((d) => [
            ...(d.display.create ? [key(d.context.template, 'create')] : []),
            ...(d.display.exercises ?? []).map((e) =>
                key(d.context.template, e.choice, e.interface)
            ),
        ])
        const covered = new Set(
            seen.map((op) =>
                key(op.template!, op.choiceId ?? 'create', op.interface)
            )
        )
        // No prepared transaction exists for these. Accepting or rejecting an external-party
        // setup needs the DSO as a signatory, and renewing a transfer preapproval needs the
        // DSO's AmuletRules and open mining round, which this participant cannot read.
        const withoutAPreparedTransaction = [
            'Splice.AmuletRules:ExternalPartySetupProposal ExternalPartySetupProposal_Accept ',
            'Splice.AmuletRules:ExternalPartySetupProposal ExternalPartySetupProposal_Reject ',
            'Splice.AmuletRules:TransferPreapproval TransferPreapproval_Renew ',
        ]
        expect(expected.filter((k) => !covered.has(k)).sort()).toEqual(
            [...withoutAPreparedTransaction].sort()
        )
    })

    it('binds no descriptor to a template that is only created inside a choice', () => {
        const childOnly = [
            'Splice.AmuletTransferInstruction:AmuletTransferInstruction',
            'Splice.AmuletAllocation:AmuletAllocation',
            'Splice.AmuletAllocationV2:AmuletAllocationV2',
            'Splice.ExternalPartyAmuletRules:ExternalPartyAmuletRules',
            'Splice.AmuletRules:TransferPreapproval',
            'Splice.Amulet:LockedAmulet',
            'Utility.Registry.App.V0.Model.Transfer:TransferOffer',
            'Utility.Registry.V0.Holding.Allocation:DvpLegAllocation',
            'Utility.Registry.V0.Holding.AllocationV2:AllocationV2',
        ]
        const withCreate = spliceDescriptors
            .filter((d) => d.display.create !== undefined)
            .map(
                (d) =>
                    `${d.context.template.moduleName}:${d.context.template.entityName}`
            )
        expect(withCreate.filter((t) => childOnly.includes(t))).toEqual([])
    })
})
