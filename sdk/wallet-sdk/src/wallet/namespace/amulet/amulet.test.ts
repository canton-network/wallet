// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, vi, beforeEach, expect, Mock } from 'vitest'
import {
    AmuletNamespace,
    AmuletNamespaceConfig,
    fetchAmulet,
} from './namespace'
import { mock } from '../../__test__/mocks'
import { Decimal } from 'decimal.js'
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('../utils/url.js', () => ({
    ParsedURL: class MockedParsedURL extends URL {
        constructor(
            public ctx: any,
            public input: any
        ) {
            super(input)
        }
    },
    parseAssets: vi.fn(),
}))

const { ctx, mockLogger } = mock

const mockTokenStandard = {
    get: vi.fn(),
    getInputHoldingsCids: vi.fn(),
    core: { toQualifiedMemberId: vi.fn() },
    transfer: { fetchTransferFactoryChoiceContext: vi.fn() },
    registriesToAssets: vi.fn(),
}

const mockAmuletService = {
    createTap: vi.fn(),
    selfGrantFeatureAppRight: vi.fn(),
    getTransferPreApprovalByParty: vi.fn(),
    getFeaturedAppsByParty: vi.fn(),
    cancelTransferPreapproval: vi.fn(),
    renewTransferPreapproval: vi.fn(),
    isDevNet: vi.fn(),
}

const config: AmuletNamespaceConfig = {
    commonCtx: {
        ...ctx,
        defaultSynchronizerId: 'mock-synchronizer-id',
        logger: mockLogger,
    } as any,
    registry: {
        id: 'Amulet',
        displayName: 'Amulet',
        symbol: 'CC',
        registryUrl: new URL('http://registry.com'),
        admin: 'adminParty:123',
    },
    amuletService: mockAmuletService as unknown as any,
    tokenStandardService: mockTokenStandard as unknown as any,
    validatorParty: 'validatorParty:123' as any,
}

describe('AmuletNamespace', () => {
    let amuletNamespace: AmuletNamespace
    let mockSubmit: Mock

    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()

        amuletNamespace = new AmuletNamespace(config)

        mockSubmit = vi.fn().mockResolvedValue({
            updateId: 'tx-123',
            completionOffset: '1000',
        })
        ;(amuletNamespace as any).ledger = { internal: { submit: mockSubmit } }
    })

    describe('Tap amulet', () => {
        const testParty =
            'v1-01-alice::1220a07b16cc2186d42c97242642a9db79eda4bea472963ecd42a3e057924576f573' as any
        const tapCommand = {
            templateId: 'Splice.AmuletRules:AmuletRules',
            contractId: '001e364e529d90ba',
            choice: 'AmuletRules_DevNet_Tap',
            choiceArgument: {
                receiver: testParty,
                amount: '10000.0000000000',
                openRound: '006b5fe2c819',
            },
        }

        it('should create tap command', async () => {
            vi.mocked(mockAmuletService.createTap).mockResolvedValue([
                tapCommand,
                [],
            ])

            const result = await amuletNamespace.tap(testParty, '10000')

            expect(mockAmuletService.createTap).toHaveBeenCalledWith(
                testParty,
                new Decimal('10000').toFixed(10),
                config.registry.admin,
                config.registry.id,
                config.registry.registryUrl.toString()
            )
            expect(result).toStrictEqual([{ ExerciseCommand: tapCommand }, []])
        })

        it('should execute tap internal', async () => {
            vi.spyOn(amuletNamespace, 'tap').mockResolvedValue([
                { ExerciseCommand: tapCommand } as any,
                ['dc-1'] as any,
            ])

            const result = await amuletNamespace.tapInternal('10000')

            expect(amuletNamespace.tap).toHaveBeenCalledWith(
                config.validatorParty,
                '10000'
            )
            expect(mockSubmit).toHaveBeenCalledWith({
                commands: [{ ExerciseCommand: tapCommand }],
                disclosedContracts: ['dc-1'],
                synchronizerId: config.commonCtx.defaultSynchronizerId,
                actAs: [config.validatorParty],
            })
            expect(result).toStrictEqual({
                updateId: 'tx-123',
                completionOffset: '1000',
            })
        })
    })

    describe('Fetch amulet', () => {
        it('fetch amulet based on configuration', async () => {
            const result = await fetchAmulet(config)
            expect(result).toStrictEqual(config.registry)
        })
    })

    describe('Featured App Namespace', () => {
        const mockRightPayload = { contractId: 'right-id-123', payload: {} }

        describe('rights lookup retry loop', () => {
            it('should not retry if the rights are found', async () => {
                vi.mocked(
                    mockAmuletService.getFeaturedAppsByParty
                ).mockResolvedValue(mockRightPayload)

                const result = await amuletNamespace.featuredApp.rights({
                    partyId: config.validatorParty,
                })

                expect(result).toStrictEqual(mockRightPayload)
                expect(
                    mockAmuletService.getFeaturedAppsByParty
                ).toHaveBeenCalledTimes(1)
            })

            it('should keep retrying featured app rights based on params', async () => {
                vi.mocked(
                    mockAmuletService.getFeaturedAppsByParty
                ).mockResolvedValue(undefined)

                const trackingPromise = amuletNamespace.featuredApp.rights({
                    partyId: config.validatorParty,
                    maxRetries: 3,
                    delayMs: 10,
                })

                await vi.runAllTimersAsync()
                const result = await trackingPromise

                expect(result).toBeUndefined()
                expect(
                    mockAmuletService.getFeaturedAppsByParty
                ).toHaveBeenCalledTimes(3)
            })
        })

        describe('grant sequence execution', () => {
            it('skip granting featured rights if rights are already found', async () => {
                vi.mocked(
                    mockAmuletService.getFeaturedAppsByParty
                ).mockResolvedValue(mockRightPayload)

                const result = await amuletNamespace.featuredApp.grant()

                expect(result).toStrictEqual(mockRightPayload)
                expect(mockSubmit).not.toHaveBeenCalled()
            })
        })
    })
})
