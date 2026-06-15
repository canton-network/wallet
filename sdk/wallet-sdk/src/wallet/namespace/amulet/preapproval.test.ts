// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, vi, beforeEach, expect, Mock } from 'vitest'
import { PreapprovalNamespace } from './preapproval' // Adjust path as needed
import { AmuletNamespaceConfig, fetchAmulet } from './namespace'
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('./namespace', () => ({
    fetchAmulet: vi.fn(),
}))

describe('PreapprovalNamespace', () => {
    let mockConfig: any
    let preapprovalNamespace: PreapprovalNamespace
    let mockLogger: any
    let mockSubmit: Mock

    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()

        mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            child: vi.fn(),
        }
        mockLogger.child.mockImplementation(() => mockLogger)

        mockConfig = {
            commonCtx: {
                defaultSynchronizerId: 'mock-sync-id',
                logger: mockLogger,
                error: {
                    throw: vi.fn((err) => {
                        throw new Error(err.message)
                    }),
                },
            },
            validatorParty: 'mock-validator-party',
            amuletService: {
                cancelTransferPreapproval: vi.fn(),
                renewTransferPreapproval: vi.fn(),
                getTransferPreApprovalByParty: vi.fn(),
            },
        }

        preapprovalNamespace = new PreapprovalNamespace(
            mockConfig as AmuletNamespaceConfig
        )

        mockSubmit = vi.fn().mockResolvedValue({ updateId: 'tx-999' })
        ;(preapprovalNamespace as any).ledger = {
            internal: { submit: mockSubmit },
        }
    })

    describe('Create preapproval command', () => {
        it('should create the preapproval command', async () => {
            vi.mocked(fetchAmulet).mockResolvedValue({
                admin: 'mock-dso-party',
            } as any)

            const result = await preapprovalNamespace.command.create({
                parties: { receiver: 'receiver-party-123' as any },
            })

            expect(fetchAmulet).toHaveBeenCalledWith(mockConfig)
            expect(result).toStrictEqual({
                CreateCommand: {
                    templateId:
                        '#splice-wallet:Splice.Wallet.TransferPreapproval:TransferPreapprovalProposal',
                    createArguments: {
                        provider: 'mock-validator-party',
                        receiver: 'receiver-party-123',
                        expectedDso: 'mock-dso-party',
                    },
                },
            })
        })
    })

    describe('Cancel preapproval', () => {
        it('should cancel when the preapproval contract exists', async () => {
            const mockStatus = { contractId: 'cid-111', templateId: 'tid-222' }
            vi.spyOn(preapprovalNamespace, 'fetchStatus').mockResolvedValue(
                mockStatus as any
            )
            mockConfig.amuletService.cancelTransferPreapproval.mockResolvedValue(
                ['cancel-exercise', ['dc-1']]
            )

            const result = await preapprovalNamespace.command.cancel({
                parties: { receiver: 'receiver-party-abc' as any },
            })

            expect(
                mockConfig.amuletService.cancelTransferPreapproval
            ).toHaveBeenCalledWith('cid-111', 'tid-222', 'receiver-party-abc')
            expect(result).toStrictEqual([
                { ExerciseCommand: 'cancel-exercise' },
                ['dc-1'],
            ])
        })
    })

    describe('Renew preapproval', () => {
        const expiresAt = new Date('2026-12-31')

        it('renew preapproval if the proper contracts exist', async () => {
            const mockStatus = { contractId: 'cid-old', templateId: 'tid-old' }
            vi.spyOn(preapprovalNamespace, 'fetchStatus').mockResolvedValue(
                mockStatus as any
            )
            mockConfig.amuletService.renewTransferPreapproval.mockResolvedValue(
                ['renew-exercise', ['dc-renew']]
            )

            const result = await preapprovalNamespace.renew({
                parties: {
                    receiver: 'rec-1' as any,
                    provider: 'custom-provider' as any,
                },
                expiresAt: expiresAt,
                inputUtxos: ['utxo-1'],
                synchronizerId: 'custom-sync',
            })

            expect(
                mockConfig.amuletService.renewTransferPreapproval
            ).toHaveBeenCalledWith(
                'cid-old',
                'tid-old',
                'custom-provider',
                'custom-sync',
                expiresAt,
                ['utxo-1']
            )
            expect(mockSubmit).toHaveBeenCalledWith({
                commands: [{ ExerciseCommand: 'renew-exercise' }],
                disclosedContracts: ['dc-renew'],
                synchronizerId: 'custom-sync',
                actAs: ['custom-provider'],
            })
            expect(result).toStrictEqual({ updateId: 'tx-999' })
        })
    })

    describe('Preapproval quick fetch', () => {
        it('fetch preapproval from amulet service', async () => {
            mockConfig.amuletService.getTransferPreApprovalByParty.mockResolvedValue(
                { payload: 'data' }
            )

            const result = await preapprovalNamespace.fetchQuick(
                'party-x' as any
            )
            expect(result).toStrictEqual({ payload: 'data' })
        })

        it('should convert error into preapproval no longer visible', async () => {
            const error = {
                error: 'No TransferPreapproval found for party xyz...',
            }
            mockConfig.amuletService.getTransferPreApprovalByParty.mockRejectedValue(
                error
            )

            const result = await preapprovalNamespace.fetchQuick(
                'party-x' as any
            )
            expect(result).toBeNull()
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Preapproval is no longer visible'
            )
        })
    })

    describe('Fetch status', () => {
        it('should find a preapproval if it exists', async () => {
            const payloadObject = {
                contract: {
                    contract_id: 'cid-found',
                    template_id: 'tid-found',
                    payload: {
                        dso: 'dso',
                        expiresAt: '2026-06-15T00:00:00.000Z',
                    },
                },
            }
            mockConfig.amuletService.getTransferPreApprovalByParty.mockResolvedValue(
                payloadObject
            )

            const result = await preapprovalNamespace.fetchStatus(
                'party-target' as any
            )

            expect(result).toStrictEqual({
                expiresAt: new Date('2026-06-15T00:00:00.000Z'),
                dso: 'dso',
                contractId: 'cid-found',
                templateId: 'tid-found',
            })
        })
    })
})
