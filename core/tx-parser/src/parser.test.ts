// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LedgerProvider } from '@canton-network/core-provider-ledger'
import { v3_4 } from '@canton-network/core-ledger-client-types'
import { vi, describe, it, expect, beforeEach, Mocked } from 'vitest'
import { TransactionParser } from './parser.js'
import eventsByContractIdResponses from './test-data/mock/eventsByContractIdResponses.json'
import aliceTransferObjectsExpected from './test-data/expected/alice-transfer-objects.json'
import bobTransferObjectsExpected from './test-data/expected/bob-transfer-objects.json'
import txsMock from './test-data/mock/txs.json'
import txsExpected from './test-data/expected/txs.json'

type JsTransaction = v3_4.components['schemas']['JsTransaction']
type CreatedEvent = v3_4.components['schemas']['CreatedEvent']
const EVENTS_BY_CID_PATH = '/v2/events/events-by-contract-id' as const
type JsGetEventsByContractIdResponse =
    v3_4.components['schemas']['JsGetEventsByContractIdResponse']

const makeLedgerProviderMock = (
    responses: JsGetEventsByContractIdResponse[]
): Mocked<LedgerProvider> => {
    const responseByCid = new Map<string, JsGetEventsByContractIdResponse>(
        responses.map((response) => [
            (response.created!.createdEvent as CreatedEvent).contractId,
            response,
        ])
    )

    /*eslint-disable @typescript-eslint/no-explicit-any */
    const request = vi.fn(async (args: any) => {
        const { resource } = args.params
        if (resource === '/v2/events/events-by-contract-id') {
            const cid = args.params.body?.contractId

            const entry = responseByCid.get(cid)
            if (!entry) {
                throw {
                    code: 'CONTRACT_EVENTS_NOT_FOUND',
                    message: `No events found for contractId ${cid}`,
                }
            }

            return entry
        }

        if (resource === '/v2/version') {
            return { version: '3.4.12-SNAPSHOT' }
        }

        throw new Error(
            `Unexpected resource in mock LedgerProvider: ${resource} with args: ${args}`
        )
    })

    return { request } as unknown as Mocked<LedgerProvider>
}

describe('transaction parser', () => {
    let mockProvider: Mocked<LedgerProvider>

    beforeEach(() => {
        vi.clearAllMocks()
        mockProvider = makeLedgerProviderMock(eventsByContractIdResponses)
    })

    it('parses full mock input and matches JSON output', async () => {
        const partyId = 'alice::normalized'

        const actual = await Promise.all(
            txsMock.map((tx: any) => {
                const parser = new TransactionParser(
                    mockProvider,
                    tx,
                    partyId,
                    false
                )
                return parser.parseTransaction()
            })
        )
        expect(actual).toEqual(txsExpected)
        expect(mockProvider.request).toHaveBeenCalled()
    })

    it('skips an ArchivedEvent when ledger returns CONTRACT_EVENTS_NOT_FOUND', async () => {
        const partyId = 'alice::normalized'

        const missingCid = 'MISSING'
        const tx = {
            updateId: 'u-404',
            offset: 100,
            recordTime: '2025-01-01T00:00:00Z',
            synchronizerId: 'sync-404',
            events: [
                {
                    ArchivedEvent: {
                        contractId: missingCid,
                        nodeId: 1,
                        offset: 100,
                        packageName: 'pkg',
                        templateId: 'Pkg:Temp:Id',
                        witnessParties: [partyId],
                    },
                },
            ],
        } as unknown as JsTransaction

        const parser = new TransactionParser(mockProvider, tx, partyId, false)
        const parsed = await parser.parseTransaction()

        expect(parsed.events).toEqual([])

        expect(mockProvider.request).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    resource: EVENTS_BY_CID_PATH,
                    body: expect.objectContaining({ contractId: missingCid }),
                }),
            })
        )
    })

    it('parses transfer objects of the full mock input and matches the expected output from JSON fixtures as alice', async () => {
        const partyId = 'alice::normalized'

        const actual = (
            await Promise.all(
                txsMock.map((txMock) => {
                    const parser = new TransactionParser(
                        mockProvider,
                        txMock,
                        partyId,
                        false
                    )
                    return parser.parseTransferObjects()
                })
            )
        ).flat()

        expect(actual).toEqual(aliceTransferObjectsExpected)
    })

    it('skips an ArchivedEvent when ledger returns CONTRACT_EVENTS_NOT_FOUND', async () => {
        const partyId = 'alice::normalized'

        const missingCid = 'MISSING'
        const tx = {
            updateId: 'u-404',
            offset: 100,
            recordTime: '2025-01-01T00:00:00Z',
            synchronizerId: 'sync-404',
            events: [
                {
                    ArchivedEvent: {
                        contractId: missingCid,
                        nodeId: 1,
                        offset: 100,
                        packageName: 'pkg',
                        templateId: 'Pkg:Temp:Id',
                        witnessParties: [partyId],
                    },
                },
            ],
        } as unknown as JsTransaction

        const parser = new TransactionParser(mockProvider, tx, partyId, false)
        const parsed = await parser.parseTransaction()

        expect(parsed.events).toEqual([])

        expect(mockProvider.request).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    resource: EVENTS_BY_CID_PATH,
                    body: expect.objectContaining({ contractId: missingCid }),
                }),
            })
        )
    })

    it('parses transfer objects of the full mock input and matches the expected output from JSON fixtures as alice', async () => {
        const partyId = 'alice::normalized'

        const actual = (
            await Promise.all(
                txsMock.map((txMock) => {
                    const parser = new TransactionParser(
                        mockProvider,
                        txMock,
                        partyId,
                        false
                    )
                    return parser.parseTransferObjects()
                })
            )
        ).flat()

        expect(actual).toEqual(aliceTransferObjectsExpected)
    })

    it('parses transfer objects of the full mock input and matches the expected output from JSON fixtures as bob', async () => {
        const partyId = 'bob::normalized'

        const actual = (
            await Promise.all(
                txsMock.map((txMock) => {
                    const parser = new TransactionParser(
                        mockProvider,
                        txMock,
                        partyId,
                        false
                    )
                    return parser.parseTransferObjects()
                })
            )
        ).flat()

        expect(actual).toEqual(bobTransferObjectsExpected)
    })
})
