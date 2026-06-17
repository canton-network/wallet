// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, vi, beforeEach, expect } from 'vitest'
import { mock } from '../../../__test__/mocks'
import { TokenNamespace, TokenNamespaceConfig } from '../index'
import { ParsedURL } from '../../utils/url'
import { UtxoNamespace } from './service'
import { HOLDING_INTERFACE_ID } from '@canton-network/core-token-standard'
import { v4 } from 'uuid'
import { MergeDelegationNamespace } from './mergeDelegation'
/* eslint-disable @typescript-eslint/no-explicit-any */
const { ctx, mockLogger } = mock

const mockTokenStandard = {
    listContractsByInterface: vi.fn(),
    registriesToAssets: vi.fn(),
    transfer: {
        createAcceptTransferInstruction: vi.fn(),
        createWithdrawTransferInstruction: vi.fn(),
        createRejectTransferInstruction: vi.fn(),
        createTransfer: vi.fn(),
        exerciseDelegateProxyTransferInstructionAccept: vi.fn(),
        exerciseDelegateProxyTransferInstructionReject: vi.fn(),
        exerciseDelegateProxyTransferInstructioWithdraw: vi.fn(),
    },
    isHoldingLocked: vi.fn(),
}

const config: TokenNamespaceConfig = {
    commonCtx: {
        ...ctx,
        defaultSynchronizerId: 'mock-synchronizer-id',
        logger: mockLogger,
    } as any,
    registryUrls: [new ParsedURL(ctx, 'http://registry.com')],
    tokenStandardService: mockTokenStandard as unknown as any,
    validatorParty: 'validatorParty::123',
}

function makeUtxos(batchSize: number) {
    const utxos = []
    for (let i = 0; i < batchSize; i++) {
        const utxo = {
            contractId: v4(),
            interfaceViewValue: {
                amount: '100',
                lock: null,
                instrumentId: {
                    id: 'Amulet',
                    admin: 'admin-a',
                },
            },
            activeContract: 'contract',
            fetchedAtOffset: 10,
        }
        utxos.push(utxo)
    }

    return utxos
}

describe('utxos namespace', () => {
    let utxos: UtxoNamespace
    let delegatedMerge: MergeDelegationNamespace

    beforeEach(() => {
        vi.resetAllMocks()
        utxos = new TokenNamespace(config).utxos
        delegatedMerge = utxos.delegatedMerge
    })
    it('should list utxos for a current party', async () => {
        const spy = mockTokenStandard.listContractsByInterface
        spy.mockResolvedValue([
            {
                contractId: 'cid',
                interfaceViewValue: {
                    lock: null,
                },
                activeContract: 'contract',
                fetchedAtOffset: 10,
            },
        ])

        await utxos.list({
            partyId: 'alice::abc',
        })
        expect(spy).toHaveBeenCalledExactlyOnceWith(
            HOLDING_INTERFACE_ID,
            'alice::abc',
            undefined,
            undefined,
            undefined
        )
    })

    it('merge utxos', async () => {
        const inputUtxos = makeUtxos(100)

        const spy = mockTokenStandard.listContractsByInterface
        spy.mockResolvedValue(inputUtxos)
        const spy1 = mockTokenStandard.registriesToAssets

        const spy2 = mockTokenStandard.transfer.createTransfer
        const mockCreateCommandResponse = [
            { ExerciseCommand: { choice: 'MockedChoice', contractId: 'cid1' } },
            ['mock-contract'],
        ]

        spy1.mockResolvedValue([
            {
                admin: 'admin-a',
                displayName: 'Amulet',
                id: 'Amulet',
                registryUrl: 'http://registry.com',
                symbol: 'CC',
            },
        ])
        spy2.mockResolvedValue(mockCreateCommandResponse)

        await utxos.merge({
            partyId: 'alice::abc',
            inputUtxos: inputUtxos as any,
        })
    })

    describe('delegated merge utxos', async () => {
        it('should create command', async () => {
            const res = delegatedMerge.command.propose({
                owner: 'alice::abc',
            })
            expect(res).toStrictEqual({
                CreateCommand: {
                    createArguments: {
                        delegation: {
                            meta: {
                                values: {},
                            },
                            operator: 'validatorParty::123',
                            owner: 'alice::abc',
                        },
                    },
                    templateId:
                        '#splice-util-token-standard-wallet:Splice.Util.Token.Wallet.MergeDelegation:MergeDelegationProposal',
                },
            })
        })

        it('should set up the delegated merge', async () => {
            const mockSubmit = vi.fn().mockResolvedValue({ updateId: 'tx-999' })

            ;(delegatedMerge as any).ledger = {
                internal: { submit: mockSubmit },
            }

            const result = await delegatedMerge.setup('syncId::123')
            expect(result).toStrictEqual({
                updateId: 'tx-999',
            })
        })
    })
})
