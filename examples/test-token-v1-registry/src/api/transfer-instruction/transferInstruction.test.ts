// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Operations } from '../../openapi-ts/transfer-instruction-v1'
import { getTransferInstructionAcceptContext } from './getTransferInstructionAcceptContext'
import { getTransferInstructionRejectContext } from './getTransferInstructionRejectContext'
import { getTransferInstructionWithdrawContext } from './getTransferInstructionWithdrawContext'
import { emptyChoiceContext } from '../common'
import { mock } from '../../__test__/mocks'

const emptyCtx = {} as Operations[
    | 'getTransferInstructionAcceptContext'
    | 'getTransferInstructionRejectContext'
    | 'getTransferInstructionWithdrawContext']['context']

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

const { getTransferFactory } = await import('./getTransferFactory')

describe('Transfer Instruction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should get accept choice context', async () => {
        const result = await getTransferInstructionAcceptContext(emptyCtx)

        expect(result).toStrictEqual({
            payload: emptyChoiceContext,
        })
    })

    it('should get reject choice context', async () => {
        const result = await getTransferInstructionRejectContext(emptyCtx)

        expect(result).toStrictEqual({
            payload: emptyChoiceContext,
        })
    })

    it('should get withdraw choice context', async () => {
        const result = await getTransferInstructionWithdrawContext(emptyCtx)

        expect(result).toStrictEqual({
            payload: emptyChoiceContext,
        })
    })

    describe('transfer factory', () => {
        const correctCtxChoiceArguments = {
            request: {
                body: {
                    choiceArguments: {
                        sender: 's',
                        receiver: 'r',
                    },
                },
            },
        } as Operations['getTransferFactory']['context']

        const incorrectCtxChoiceArguments = {
            request: {
                body: {
                    choiceArguments: {},
                },
            },
        } as Operations['getTransferFactory']['context']

        it('should fail if provided request body is invalid', async () => {
            const result = await getTransferFactory(incorrectCtxChoiceArguments)

            expect(result.status).toBe(400)
        })

        it('should successfully return factory contract from acs reader', async () => {
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

            const result = await getTransferFactory(correctCtxChoiceArguments)

            expect(
                mock.sdk.ledger.acsReader.readJsContracts
            ).toHaveBeenCalledOnce()
            expect(result).toStrictEqual({
                payload: {
                    factoryId: 'cid',
                    transferKind: 'offer',
                    choiceContext: emptyChoiceContext,
                },
            })
        })

        it('should return error in case contract creation fails', async () => {
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValue([])

            const result = await getTransferFactory(correctCtxChoiceArguments)

            expect(
                mock.sdk.ledger.acsReader.readJsContracts
            ).toHaveBeenCalledTimes(2)
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

            const result = await getTransferFactory(correctCtxChoiceArguments)

            expect(result).toStrictEqual({
                payload: {
                    factoryId: 'cid',
                    transferKind: 'offer',
                    choiceContext: emptyChoiceContext,
                },
            })
        })

        it('should change transfer kind if sender and receiver is equal', async () => {
            const ctxChoiceArguments = { ...correctCtxChoiceArguments }
            ctxChoiceArguments.request.body.choiceArguments.receiver = 's'
            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

            const acsCacheResult = await getTransferFactory(ctxChoiceArguments)

            expect(acsCacheResult).toStrictEqual({
                payload: {
                    factoryId: 'cid',
                    transferKind: 'self',
                    choiceContext: emptyChoiceContext,
                },
            })

            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            const result = await getTransferFactory(ctxChoiceArguments)

            expect(result).toStrictEqual({
                payload: {
                    factoryId: 'cid',
                    transferKind: 'self',
                    choiceContext: emptyChoiceContext,
                },
            })
        })

        it('should set transfer kind overwrite', async () => {
            const ctxChoiceArguments = { ...correctCtxChoiceArguments }
            ctxChoiceArguments.request.body.choiceArguments.transferKind =
                'direct'

            mock.sdk.ledger.acsReader.readJsContracts.mockResolvedValueOnce([
                {
                    contractId: 'cid',
                },
            ])

            const acsCacheResult = await getTransferFactory(ctxChoiceArguments)

            expect(acsCacheResult).toStrictEqual({
                payload: {
                    factoryId: 'cid',
                    transferKind: 'direct',
                    choiceContext: emptyChoiceContext,
                },
            })

            mock.sdk.ledger.acsReader.readJsContracts
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    {
                        contractId: 'cid',
                    },
                ])

            const result = await getTransferFactory(ctxChoiceArguments)

            expect(result).toStrictEqual({
                payload: {
                    factoryId: 'cid',
                    transferKind: 'direct',
                    choiceContext: emptyChoiceContext,
                },
            })
        })
    })
})
