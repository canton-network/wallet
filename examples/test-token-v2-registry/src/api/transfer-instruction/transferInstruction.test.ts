// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { expressContext, mock, type RequestType } from '../../__tests__/mocks'
import { getTransferInstructionAcceptContext } from './getTransferInstructionAcceptContext'
import { APIError } from '../common'
import { getTransferInstructionRejectContext } from './getTransferInstructionRejectContext'
import { getTransferInstructionWithdrawContext } from './getTransferInstructionWithdrawContext'
import { getTransferFactory } from './getTransferFactory'
import type { Account } from '@canton-network/core-token-standard-v2'

const { res, next } = expressContext

const transferInstructionRequest = <
    Handler extends
        | typeof getTransferInstructionAcceptContext
        | typeof getTransferInstructionRejectContext
        | typeof getTransferInstructionWithdrawContext,
>() =>
    ({
        params: { transferInstructionId: 'instruction' },
    }) as unknown as RequestType<Handler>

const tokenRulesContext = {
    values: {
        'testTokenV2/tokenRules': { tag: 'AV_ContractId', value: 'cid' },
    },
}

vi.mock('../../common/sdk', async () => {
    const { mock: importedMock } = await import('../../__tests__/mocks')

    return {
        default: importedMock.sdk,
    }
})

vi.mock('../../common/state', async () => {
    const { mock: importedMock } = await import('../../__tests__/mocks')

    return importedMock.state
})

vi.mock('@canton-network/core-splice-codegen', () => ({
    TestTokenV2: {
        DAR: {
            TestTokenV2: {
                TokenRules: {
                    templateId: 'TestTokenV2:TokenRules',
                },
                Transfer: {
                    TokenTransferOffer: {
                        templateId: 'TestTokenV2:TokenTransferOffer',
                    },
                },
                Holding: {
                    Token: { templateId: 'TestTokenV2:Token' },
                },
            },
        },
        commands: {
            create: {
                rules: (payload: { admin: string }) => ({
                    templateId: 'TestTokenV2:TokenRules',
                    payload,
                }),
            },
        },
    },
}))

describe('Transfer Instruction', () => {
    beforeEach(() => {
        mock.state.RegistryState.instance.reset()
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([
            {
                contractId: 'instruction',
                createArgument: {
                    transfer: { inputHoldingCids: ['input'] },
                },
            },
            {
                contractId: 'input',
                templateId: 'TestTokenV2:Token',
                createdEventBlob: 'input-blob',
                synchronizerId: 'sync',
            },
        ])
    })

    it('should get accept choice context', async () => {
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
            { contractId: 'cid' },
        ])
        await getTransferInstructionAcceptContext(
            transferInstructionRequest<
                typeof getTransferInstructionAcceptContext
            >(),
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                choiceContextData: tokenRulesContext,
                disclosedContracts: [
                    {
                        contractId: 'input',
                        templateId: 'TestTokenV2:Token',
                        createdEventBlob: 'input-blob',
                        synchronizerId: 'sync',
                    },
                    expect.objectContaining({ contractId: 'cid' }),
                ],
            })
        )
    })

    it('should get reject choice context', async () => {
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
            { contractId: 'cid' },
        ])
        await getTransferInstructionRejectContext(
            transferInstructionRequest<
                typeof getTransferInstructionRejectContext
            >(),
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                choiceContextData: tokenRulesContext,
                disclosedContracts: [
                    {
                        contractId: 'input',
                        templateId: 'TestTokenV2:Token',
                        createdEventBlob: 'input-blob',
                        synchronizerId: 'sync',
                    },
                    expect.objectContaining({ contractId: 'cid' }),
                ],
            })
        )
    })

    it('should get withdraw choice context', async () => {
        mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
            { contractId: 'cid' },
        ])
        await getTransferInstructionWithdrawContext(
            transferInstructionRequest<
                typeof getTransferInstructionWithdrawContext
            >(),
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                choiceContextData: tokenRulesContext,
                disclosedContracts: [
                    {
                        contractId: 'input',
                        templateId: 'TestTokenV2:Token',
                        createdEventBlob: 'input-blob',
                        synchronizerId: 'sync',
                    },
                    expect.objectContaining({ contractId: 'cid' }),
                ],
            })
        )
    })

    it.each([
        getTransferInstructionAcceptContext,
        getTransferInstructionRejectContext,
        getTransferInstructionWithdrawContext,
    ])('should forward context lookup failures', async (handler) => {
        const error = new Error('Ledger unavailable')
        mock.sdk.ledger.acsReader.readJsContracts.mockRejectedValueOnce(error)

        await handler(transferInstructionRequest<typeof handler>(), res, next)

        expect(next).toHaveBeenCalledWith(error)
        expect(res.json).not.toHaveBeenCalled()
    })

    it.each([
        { contracts: [] },
        {
            contracts: [
                {
                    contractId: 'instruction',
                    createArgument: {
                        transfer: { inputHoldingCids: ['missing-input'] },
                    },
                },
            ],
        },
    ])(
        'should reject unavailable instructions or inputs: %j',
        async ({ contracts }) => {
            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([{ contractId: 'cid' }])
                .mockResolvedValueOnce(contracts)

            await getTransferInstructionAcceptContext(
                transferInstructionRequest<
                    typeof getTransferInstructionAcceptContext
                >(),
                res,
                next
            )

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 404 })
            )
            expect(res.json).not.toHaveBeenCalled()
        }
    )

    describe('transfer factory', () => {
        const basicAccount = (owner: string): Account => ({
            owner,
            provider: null,
            id: '',
        })

        const makeTransferFactoryRequest = (transfer: unknown) =>
            ({
                body: {
                    choiceArguments: { transfer },
                    excludeDebugFields: false,
                },
            }) as unknown as RequestType<typeof getTransferFactory>

        const getTransferFactoryRequest = (choiceArguments: {
            sender?: string | Account
            receiver?: string | Account
            transferKind?: 'self' | 'offer' | 'direct'
        }) =>
            makeTransferFactoryRequest({
                ...choiceArguments,
                sender:
                    typeof choiceArguments.sender === 'string'
                        ? basicAccount(choiceArguments.sender)
                        : choiceArguments.sender,
                receiver:
                    typeof choiceArguments.receiver === 'string'
                        ? basicAccount(choiceArguments.receiver)
                        : choiceArguments.receiver,
            })

        it('should fail if provided request body is invalid', async () => {
            const invalidRequest = getTransferFactoryRequest({})

            await getTransferFactory(invalidRequest, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(APIError))
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 400 })
            )
            expect(res.json).not.toHaveBeenCalled()
        })

        it('should reject V1 party strings instead of V2 accounts', async () => {
            const request = makeTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })

            await getTransferFactory(request, res, next)

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 400 })
            )
            expect(res.json).not.toHaveBeenCalled()
        })

        it.each([
            { owner: 's', provider: null, id: 'another-account' },
            { owner: 's', provider: 'provider', id: '' },
        ])(
            'should distinguish accounts with the same owner: %j',
            async (receiver) => {
                const request = getTransferFactoryRequest({
                    sender: basicAccount('s'),
                    receiver,
                })
                mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce(
                    [{ contractId: 'cid' }]
                )

                await getTransferFactory(request, res, next)

                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({ transferKind: 'offer' })
                )
            }
        )

        it('should successfully return factory contract from acs reader', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

            await getTransferFactory(request, res, next)

            expect(
                mock.sdk.ledger.acsReader.readJsContracts
            ).toHaveBeenCalledOnce()
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid',
                    transferKind: 'offer',
                    choiceContext: expect.objectContaining({
                        choiceContextData: tokenRulesContext,
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid' }),
                        ]),
                    }),
                })
            )
        })

        it('should return error in case contract creation fails', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([])

            await getTransferFactory(request, res, next)

            expect(
                mock.sdk.ledger.acsReader.readJsContracts
            ).toHaveBeenCalledTimes(2)
            expect(mock.prepare).toHaveBeenCalledOnce()
            expect(mock.sign).toHaveBeenCalledOnce()
            expect(mock.execute).toHaveBeenCalledOnce()
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 500 })
            )
        })

        it('should successfully create factory contract', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })
            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid',
                    transferKind: 'offer',
                    choiceContext: expect.objectContaining({
                        choiceContextData: tokenRulesContext,
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid' }),
                        ]),
                    }),
                })
            )
        })

        it('should change transfer kind if sender and receiver is equal', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 's',
            })
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid',
                    transferKind: 'self',
                    choiceContext: expect.objectContaining({
                        choiceContextData: tokenRulesContext,
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid' }),
                        ]),
                    }),
                })
            )

            vi.clearAllMocks()

            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid',
                    transferKind: 'self',
                    choiceContext: expect.objectContaining({
                        choiceContextData: tokenRulesContext,
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid' }),
                        ]),
                    }),
                })
            )
        })

        it('should set transfer kind overwrite', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
                transferKind: 'direct',
            })

            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid',
                    transferKind: 'direct',
                    choiceContext: expect.objectContaining({
                        choiceContextData: tokenRulesContext,
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid' }),
                        ]),
                    }),
                })
            )

            vi.clearAllMocks()

            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid',
                    transferKind: 'direct',
                    choiceContext: expect.objectContaining({
                        choiceContextData: tokenRulesContext,
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid' }),
                        ]),
                    }),
                })
            )
        })

        it('should return factory matching transfer synchronizer id', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })

            mock.state.RegistryState.instance.synchronizerId =
                'transfer-sync-id'
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid-1',
                    synchronizerId: 'some-other-sync-id',
                },
                {
                    contractId: 'cid-2',
                    synchronizerId: 'transfer-sync-id',
                },
            ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    factoryId: 'cid-2',
                    transferKind: 'offer',
                    choiceContext: expect.objectContaining({
                        choiceContextData: {
                            values: {
                                'testTokenV2/tokenRules': {
                                    tag: 'AV_ContractId',
                                    value: 'cid-2',
                                },
                            },
                        },
                        disclosedContracts: expect.arrayContaining([
                            expect.objectContaining({ contractId: 'cid-2' }),
                        ]),
                    }),
                })
            )
        })

        it('should pass transfer synchronizer id when creating factory contract', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })

            mock.state.RegistryState.instance.synchronizerId =
                'transfer-sync-id'
            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            await getTransferFactory(request, res, next)

            expect(mock.prepare).toHaveBeenCalledWith(
                expect.objectContaining({
                    synchronizerId: 'transfer-sync-id',
                })
            )
        })
    })
})
