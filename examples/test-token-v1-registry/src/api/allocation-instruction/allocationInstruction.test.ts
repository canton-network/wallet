// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, vi, it, expect, beforeEach } from 'vitest'
import { expressContext, mock, RequestType } from '../../__test__/mocks'
import { APIError, emptyChoiceContext } from '../common'
import { getAllocationFactory } from './getAllocationFactory'

const { res, next } = expressContext

vi.mock('../../common/sdk', async () => {
    const { mock: importedMock } = await import('../../__test__/mocks')

    return {
        default: importedMock.sdk,
    }
})

vi.mock('../../common/operator', () => ({
    operator: {
        party: 'party',
        keys: {
            privateKey: 'privateKey',
        },
    },
}))

vi.mock('@canton-network/core-splice-codegen', () => ({
    TestToken: {
        DAR: {
            TestTokenV1: {
                TokenRules: {
                    templateId: 'TestTokenV1:TokenRules',
                },
            },
        },
        commands: {
            create: {
                rules: (payload: { admin: string }) => ({
                    templateId: 'TestTokenV1:TokenRules',
                    payload,
                }),
            },
        },
    },
}))

describe('Allocation Instruction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should successfully return factory contract from acs reader', async () => {
        const request = {} as RequestType<typeof getAllocationFactory>

        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
            {
                contractId: 'cid',
            },
        ])

        await getAllocationFactory(request, res, next)

        expect(mock.sdk.ledger.acsReader.readJsContracts).toHaveBeenCalledOnce()
        expect(res.json).toHaveBeenCalledWith({
            factoryId: 'cid',
            choiceContext: emptyChoiceContext,
        })
    })

    it('should return error in case contract creation fails', async () => {
        const request = {} as RequestType<typeof getAllocationFactory>

        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([])

        await getAllocationFactory(request, res, next)

        expect(mock.sdk.ledger.acsReader.readJsContracts).toHaveBeenCalledTimes(
            2
        )
        expect(mock.prepare).toHaveBeenCalledOnce()
        expect(mock.sign).toHaveBeenCalledOnce()
        expect(mock.execute).toHaveBeenCalledOnce()
        expect(next).toHaveBeenCalledWith(expect.any(APIError))
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({ status: 500 })
        )
    })

    it('should successfully create factory contract', async () => {
        const request = {} as RequestType<typeof getAllocationFactory>

        mock.sdk.ledger.acsReader.readJsContracts
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

        await getAllocationFactory(request, res, next)

        expect(res.json).toHaveBeenCalledWith({
            factoryId: 'cid',
            choiceContext: emptyChoiceContext,
        })
    })
})
