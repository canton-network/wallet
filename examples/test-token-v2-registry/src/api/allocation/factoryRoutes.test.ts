// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import express, { type ErrorRequestHandler } from 'express'
import { createServer } from 'node:http'
import { once } from 'node:events'
import allocationRouter from './index.ts'
import allocationInstructionRouter from '../allocation-instruction/index.ts'
import { mock } from '../../__tests__/mocks.ts'

vi.mock('../../common/state.ts', async () => {
    const { mock: importedMock } = await import('../../__tests__/mocks.ts')
    return importedMock.state
})

vi.mock('../getTokenRulesFactory.ts', () => ({
    getTokenRulesFactory: vi.fn().mockResolvedValue({
        contractId: 'rules',
        templateId: 'rules-template',
        createdEventBlob: 'rules-blob',
        synchronizerId: 'sync',
    }),
}))

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    res.status(400).json({ message: error.message })
}
const app = express()
    .use(express.json())
    .use(allocationRouter)
    .use(allocationInstructionRouter)
    .use(errorHandler)
const server = createServer(app)
let baseUrl: string

beforeAll(async () => {
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    if (!address || typeof address === 'string') {
        throw new Error('Expected HTTP server address')
    }
    baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
    })
})

beforeEach(() => {
    mock.state.RegistryState.instance.reset()
    mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([])
})

it.each([
    {
        path: '/registry/allocation-instruction/v2/allocation-factory',
        choiceArguments: {
            actors: ['alice'],
            allocation: {
                authorizer: { owner: 'alice', provider: null, id: '' },
                transferLegSides: [],
            },
            settlement: { executors: ['venue'] },
            inputHoldingCids: [],
            extraArgs: { context: { values: {} }, meta: { values: {} } },
        },
    },
    {
        path: '/registry/allocation/v2/settlement-factory',
        choiceArguments: {
            actors: ['venue'],
            allocations: [],
            transferLegs: [],
            settlement: { executors: ['venue'] },
            extraArgs: { context: { values: {} }, meta: { values: {} } },
        },
    },
])(
    'accepts non-empty choice arguments at $path',
    async ({ path, choiceArguments }) => {
        const response = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choiceArguments, excludeDebugFields: true }),
        })
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toEqual({
            factoryId: 'rules',
            choiceContext: {
                choiceContextData: {
                    values: {
                        'testTokenV2/tokenRules': {
                            tag: 'AV_ContractId',
                            value: 'rules',
                        },
                    },
                },
                disclosedContracts: [
                    {
                        contractId: 'rules',
                        templateId: 'rules-template',
                        createdEventBlob: 'rules-blob',
                        synchronizerId: 'sync',
                    },
                ],
            },
        })
    }
)
