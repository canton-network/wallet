// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    expectRejection,
    INVALID_PARAMS_CODES,
    requireCondition,
    txChangedEventSchema,
} from './helpers.ts'
import type { Case, RequestArgs, TestRuntime } from './types.ts'
import type {
    PrepareExecuteParams,
    TxChangedEvent,
} from '@canton-network/dapp-sdk'

const category = 'Prepare & execute'

export const cases: Case[] = [
    {
        id: 'prepareExecute.missingParams',
        name: 'Transaction without parameters returns InvalidParams',
        category,
        run: async (runtime) => {
            await runtime.ensureConnected()
            await expectRejection(
                runtime.request({
                    method: 'prepareExecute',
                } as unknown as RequestArgs),
                INVALID_PARAMS_CODES
            )
        },
    },
    {
        id: 'prepareExecute.invalidParams',
        name: 'Transaction with non-array commands returns InvalidParams',
        category,
        run: async (runtime) => {
            await runtime.ensureConnected()
            await expectRejection(
                runtime.request({
                    method: 'prepareExecute',
                    params: {
                        commandId: 'conformance-invalid-params',
                        commands: 'invalid',
                    } as unknown as PrepareExecuteParams,
                }),
                INVALID_PARAMS_CODES
            )
        },
    },
    {
        id: 'prepareExecute.reject',
        name: 'Reject Ping transaction',
        category,
        run: async (runtime) => {
            await runtime.ensureConnected()
            const params = await pingParams(runtime)
            const tx = watchTransaction(runtime, params.commandId)
            await expectRejection(
                runtime.runInteraction('reject', {
                    method: 'prepareExecute',
                    params,
                })
            )
            // A wallet need not emit anything after a rejection; the race only surfaces a malformed event.
            const statuses = await Promise.race([tx.final, tx.statuses])
            requireCondition(
                !statuses.includes('executed'),
                'A rejected transaction was executed anyway'
            )
            requireCondition(
                !statuses.includes('signed'),
                'A rejected transaction was signed anyway'
            )
        },
    },
    {
        id: 'prepareExecute.approve',
        name: 'Approve Ping transaction',
        category,
        run: async (runtime) => {
            await runtime.ensureConnected()
            const params = await pingParams(runtime)
            const tx = watchTransaction(runtime, params.commandId)
            const result = await runtime.runInteraction('approve', {
                method: 'prepareExecute',
                params,
            })
            requireCondition(result === null, 'prepareExecute must return null')
            const statuses = await tx.final
            const status = statuses.at(-1)
            requireCondition(
                !statuses.includes('failed'),
                'An approved transaction was rejected anyway'
            )
            requireCondition(
                status === 'executed',
                `Expected an executed transaction, received ${status}`
            )
        },
    },
]

async function pingParams(runtime: TestRuntime) {
    const account = await runtime.request({ method: 'getPrimaryAccount' })
    const commandId = crypto.randomUUID()
    return {
        commandId,
        commands: [
            {
                CreateCommand: {
                    templateId:
                        '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping',
                    createArguments: {
                        id: commandId,
                        initiator: account.partyId,
                        responder: account.partyId,
                    },
                },
            },
        ],
    }
}

function watchTransaction(runtime: TestRuntime, commandId: string) {
    const statuses: TxChangedEvent['status'][] = []
    const final = new Promise<typeof statuses>((resolve, reject) => {
        runtime.onEvent('txChanged', (value) => {
            const event = txChangedEventSchema.safeParse(value)
            if (!event.success) return reject(event.error)
            if (event.data.commandId !== commandId) return
            runtime.observe({
                method: 'prepareExecute',
                event: 'txChanged',
                result: value,
            })
            statuses.push(event.data.status)
            if (
                event.data.status === 'executed' ||
                event.data.status === 'failed'
            )
                resolve(statuses)
        })
    })
    return { final, statuses }
}
