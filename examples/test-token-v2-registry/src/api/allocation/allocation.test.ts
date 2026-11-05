// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { expressContext, mock, type RequestType } from '../../__tests__/mocks'
import { emptyChoiceContext } from '../common'
import { getAllocationCancelContext } from './getAllocationCancelContext'
import { getAllocationWithdrawContext } from './getAllocationWithdrawContext'
import { getSettlementFactory } from './getSettlementFactory'

const { res, next } = expressContext

const mockedFactory = vi.hoisted(() => ({
    contractId: 'contractId',
    templateId: 'templateId',
    createdEventBlob: 'blob',
    synchronizerId: 'synchronizerId',
}))

vi.mock('../getTokenRulesFactory.ts', () => {
    return {
        getTokenRulesFactory: async () => mockedFactory,
    }
})

vi.mock('../../common/state', async () => {
    const { mock: importedMock } = await import('../../__tests__/mocks')
    return importedMock.state
})

const allocation = {
    contractId: 'allocation',
    templateId: 'allocation-template',
    createdEventBlob: 'allocation-blob',
    synchronizerId: 'synchronizerId',
    createArgument: {
        lockedTokens: { TestTokenV2: ['holding'] },
    },
}

const holding = {
    contractId: 'holding',
    templateId: 'holding-template',
    createdEventBlob: 'holding-blob',
    synchronizerId: 'synchronizerId',
}

const settlementRequest = (
    allocations: unknown = [{ allocationCid: 'allocation' }]
) =>
    ({
        body: {
            choiceArguments: { allocations },
        },
    }) as unknown as RequestType<typeof getSettlementFactory>

describe('Allocation', () => {
    beforeEach(() => {
        mock.state.RegistryState.instance.reset()
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([
            allocation,
            holding,
        ])
    })

    it('should return correct allocation withdraw context', () => {
        getAllocationWithdrawContext(
            {} as RequestType<typeof getAllocationWithdrawContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    it('should return correct allocation cancel context', () => {
        getAllocationCancelContext(
            {} as RequestType<typeof getAllocationCancelContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    it('should return settlement factory contract', async () => {
        const getTokenRulesFactorySpy = vi.spyOn(
            await import('../getTokenRulesFactory.ts'),
            'getTokenRulesFactory'
        )
        await getSettlementFactory(settlementRequest(), res, next)

        expect(getTokenRulesFactorySpy).toHaveBeenCalledOnce()

        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            factoryId: mockedFactory.contractId,
            choiceContext: {
                choiceContextData: {
                    values: {
                        'testTokenV2/tokenRules': {
                            tag: 'AV_ContractId',
                            value: mockedFactory.contractId,
                        },
                    },
                },
                disclosedContracts: [
                    { ...mockedFactory },
                    {
                        contractId: allocation.contractId,
                        templateId: allocation.templateId,
                        createdEventBlob: allocation.createdEventBlob,
                        synchronizerId: allocation.synchronizerId,
                    },
                    holding,
                ],
            },
        })
    })

    it('should reject malformed settlement arguments', async () => {
        await getSettlementFactory(settlementRequest('invalid'), res, next)

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({ status: 400 })
        )
        expect(res.json).not.toHaveBeenCalled()
    })

    it.each([
        { contracts: [], message: 'Allocation not found: allocation' },
        {
            contracts: [allocation],
            message: 'Settlement contract not found: holding',
        },
        {
            contracts: [allocation, { ...holding, createdEventBlob: '' }],
            message: 'Settlement contract not found: holding',
        },
    ])(
        'should report missing settlement resources: $message',
        async ({ contracts, message }) => {
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue(
                contracts
            )

            await getSettlementFactory(settlementRequest(), res, next)

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 404, message })
            )
            expect(res.json).not.toHaveBeenCalled()
        }
    )

    it('should deduplicate locked inputs and exclude unrelated contracts', async () => {
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([
            {
                ...allocation,
                createArgument: {
                    lockedTokens: { TestTokenV2: ['holding', 'holding'] },
                },
            },
            holding,
            { ...holding, contractId: 'unrelated-holding' },
        ])

        await getSettlementFactory(settlementRequest(), res, next)

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                choiceContext: expect.objectContaining({
                    disclosedContracts: [
                        { ...mockedFactory },
                        expect.objectContaining({ contractId: 'allocation' }),
                        holding,
                    ],
                }),
            })
        )
    })

    it('should forward ledger errors', async () => {
        const error = new Error('Ledger unavailable')
        mock.sdk.ledger.acsReader.readJsContracts.mockRejectedValueOnce(error)

        await getSettlementFactory(settlementRequest(), res, next)

        expect(next).toHaveBeenCalledWith(error)
        expect(res.json).not.toHaveBeenCalled()
    })
})
