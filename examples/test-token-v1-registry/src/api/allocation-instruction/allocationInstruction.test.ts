// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, vi, it, expect, beforeEach } from 'vitest'
import { mock } from '../../__test__/mocks'
import { emptyChoiceContext } from '../common'
import { Handler } from 'openapi-backend'

vi.mock('../../common/sdk', () => {
    return {
        default: mock.sdk,
    }
})

vi.mock('../../common/admin', () => ({
    admin: {
        party: 'party',
        keys: {
            privateKey: 'privateKey',
        },
    },
}))

const { getAllocationFactory } = await import('./getAllocationFactory')

const correctChoiceArguments = {
    request: {
        body: {
            choiceArguments: {
                sender: 's',
                receiver: 'r',
            },
        },
    },
} as Parameters<Handler>[0]

const incorrectChoiceArguments = {
    request: {
        body: {
            choiceArguments: {},
        },
    },
} as Parameters<Handler>[0]

describe('Allocation Instruction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fail if provided request body is invalid', async () => {
        const result = await getAllocationFactory(incorrectChoiceArguments)

        expect(result.status).toBe(400)
    })

    it('should successfully return factory contract from acs reader', async () => {
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
            {
                contractId: 'cid',
            },
        ])

        const result = await getAllocationFactory(correctChoiceArguments)

        expect(mock.sdk.ledger.acsReader.readJsContracts).toHaveBeenCalledOnce()
        expect(result).toStrictEqual({
            payload: {
                factoryId: 'cid',
                choiceContext: emptyChoiceContext,
            },
        })
    })

    it('should return error in case contract creation fails', async () => {
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([])

        const result = await getAllocationFactory(correctChoiceArguments)

        expect(mock.sdk.ledger.acsReader.readJsContracts).toHaveBeenCalledTimes(
            2
        )
        expect(mock.prepare).toHaveBeenCalledOnce()
        expect(mock.sign).toHaveBeenCalledOnce()
        expect(mock.execute).toHaveBeenCalledOnce()

        expect(result.status).toBe(500)
    })

    it('should successfully create factory contract', async () => {
        mock.sdk.ledger.acsReader.readJsContracts
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

        const result = await getAllocationFactory(correctChoiceArguments)

        expect(result).toStrictEqual({
            payload: {
                factoryId: 'cid',
                choiceContext: emptyChoiceContext,
            },
        })
    })
})
