// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTransferInstructionAcceptContext } from './getTransferInstructionAcceptContext'
import { getTransferInstructionRejectContext } from './getTransferInstructionRejectContext'
import { getTransferInstructionWithdrawContext } from './getTransferInstructionWithdrawContext'
import { getTransferFactory } from './getTransferFactory'
import { APIError, emptyChoiceContext } from '../common'
import { expressContext, mock, RequestType } from '../../__test__/mocks'
import { synchronizerId } from '../../common/synchronizer'

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

describe('Transfer Instruction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        synchronizerId.transferInstruction = ''
        synchronizerId.allocationInstruction = ''
    })

    it('should get accept choice context', () => {
        getTransferInstructionAcceptContext(
            {} as RequestType<typeof getTransferInstructionAcceptContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    it('should get reject choice context', () => {
        getTransferInstructionRejectContext(
            {} as RequestType<typeof getTransferInstructionRejectContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    it('should get withdraw choice context', () => {
        getTransferInstructionWithdrawContext(
            {} as RequestType<typeof getTransferInstructionWithdrawContext>,
            res,
            next
        )

        expect(res.json).toHaveBeenCalledWith(emptyChoiceContext)
    })

    describe('transfer factory', () => {
        const getTransferFactoryRequest = (choiceArguments: {
            sender?: string
            receiver?: string
            transferKind?: 'self' | 'offer' | 'direct'
        }) =>
            ({
                body: {
                    choiceArguments,
                    excludeDebugFields: false,
                },
            }) as unknown as RequestType<typeof getTransferFactory>

        it('should fail if provided request body is invalid', async () => {
            const invalidRequest = getTransferFactoryRequest({})

            await getTransferFactory(invalidRequest, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(APIError))
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ status: 400 })
            )
            expect(res.json).not.toHaveBeenCalled()
        })

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
            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid',
                transferKind: 'offer',
                choiceContext: emptyChoiceContext,
            })
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

            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid',
                transferKind: 'offer',
                choiceContext: emptyChoiceContext,
            })
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

            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid',
                transferKind: 'self',
                choiceContext: emptyChoiceContext,
            })

            vi.clearAllMocks()

            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid',
                transferKind: 'self',
                choiceContext: emptyChoiceContext,
            })
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

            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid',
                transferKind: 'direct',
                choiceContext: emptyChoiceContext,
            })

            vi.clearAllMocks()

            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            await getTransferFactory(request, res, next)

            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid',
                transferKind: 'direct',
                choiceContext: emptyChoiceContext,
            })
        })

        it('should return factory matching transfer synchronizer id', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })

            synchronizerId.transferInstruction = 'transfer-sync-id'
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

            expect(res.json).toHaveBeenCalledWith({
                factoryId: 'cid-2',
                transferKind: 'offer',
                choiceContext: emptyChoiceContext,
            })
        })

        it('should pass transfer synchronizer id when creating factory contract', async () => {
            const request = getTransferFactoryRequest({
                sender: 's',
                receiver: 'r',
            })

            synchronizerId.transferInstruction = 'transfer-sync-id'
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
