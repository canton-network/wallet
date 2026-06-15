// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mock } from '../../__test__/mocks'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { AmuletNamespace, AmuletNamespaceConfig } from './namespace'
// import { LedgerNamespace } from '../ledger'
const { mockSubmit } = vi.hoisted(() => ({ mockSubmit: vi.fn() }))

/* eslint-disable @typescript-eslint/no-explicit-any */
const { ctx } = mock

vi.mock('../ledger/namespace.ts', () => ({
    LedgerNamespace: vi.fn().mockImplementation(() => ({
        internal: { submit: mockSubmit },
    })),
}))

const mockTokenStandard = {
    get: vi.fn(),
    getInputHoldingsCids: vi.fn(),
    core: {
        toQualifiedMemberId: vi.fn(),
    },
    transfer: {
        fetchTransferFactoryChoiceContext: vi.fn(),
    },
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
    commonCtx: ctx,
    registry: {
        id: 'Amulet',
        displayName: 'Amulet',
        symbol: 'CC',
        registryUrl: new URL('http://registry.com'),
        admin: 'adminParty:123',
    },
    amuletService: mockAmuletService as any,
    tokenStandardService: mockTokenStandard as any,
    validatorParty: 'validatorParty:123',
}

describe('amulet namespace', () => {
    let amuletNamespace: AmuletNamespace

    beforeEach(() => {
        vi.clearAllMocks()
        amuletNamespace = new AmuletNamespace(config)
    })

    it('should create tap', async () => {
        const tapCommand = {
            templateId:
                'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a:Splice.AmuletRules:AmuletRules',
            contractId:
                '001e364e529d90ba28da0c99b71bf77cf464d80fc71effa25c815e7320577d212eca1212206987ff84133b0d73585fefc687c7af9bf6a31d53419ccc575be3e994f592e0cf',
            choice: 'AmuletRules_DevNet_Tap',
            choiceArgument: {
                receiver:
                    'v1-01-alice::1220a07b16cc2186d42c97242642a9db79eda4bea472963ecd42a3e057924576f573',
                amount: '10000.0000000000',
                openRound:
                    '006b5fe2c819eaef2130811d27868a5fe2915dee6fa98cf1aba890543a808aba2aca121220749ca9763bfe2b5644ea0b74a27a4d85f27f33de0ae06eda17dfea6a32f52c2d',
            },
        }
        ;(
            config.amuletService.createTap as ReturnType<typeof vi.fn>
        ).mockResolvedValue([tapCommand, []])

        const result = await amuletNamespace.tap(
            'v1-01-alice::1220a07b16cc2186d42c97242642a9db79eda4bea472963ecd42a3e057924576f573',
            '10000'
        )
        expect(result).toStrictEqual([
            {
                ExerciseCommand: {
                    choice: 'AmuletRules_DevNet_Tap',
                    choiceArgument: {
                        amount: '10000.0000000000',
                        openRound:
                            '006b5fe2c819eaef2130811d27868a5fe2915dee6fa98cf1aba890543a808aba2aca121220749ca9763bfe2b5644ea0b74a27a4d85f27f33de0ae06eda17dfea6a32f52c2d',
                        receiver:
                            'v1-01-alice::1220a07b16cc2186d42c97242642a9db79eda4bea472963ecd42a3e057924576f573',
                    },
                    contractId:
                        '001e364e529d90ba28da0c99b71bf77cf464d80fc71effa25c815e7320577d212eca1212206987ff84133b0d73585fefc687c7af9bf6a31d53419ccc575be3e994f592e0cf',
                    templateId:
                        'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a:Splice.AmuletRules:AmuletRules',
                },
            },
            [],
        ])
    })

    it('should create tap internal', async () => {
        const tapCommand = {
            templateId:
                'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a:Splice.AmuletRules:AmuletRules',
            contractId:
                '001e364e529d90ba28da0c99b71bf77cf464d80fc71effa25c815e7320577d212eca1212206987ff84133b0d73585fefc687c7af9bf6a31d53419ccc575be3e994f592e0cf',
            choice: 'AmuletRules_DevNet_Tap',
            choiceArgument: {
                receiver: config.validatorParty,
                amount: '10000.0000000000',
                openRound:
                    '006b5fe2c819eaef2130811d27868a5fe2915dee6fa98cf1aba890543a808aba2aca121220749ca9763bfe2b5644ea0b74a27a4d85f27f33de0ae06eda17dfea6a32f52c2d',
            },
        }
        ;(
            config.amuletService.createTap as ReturnType<typeof vi.fn>
        ).mockResolvedValue([tapCommand, []])

        await amuletNamespace.tapInternal('10000')

        expect(config.amuletService.createTap).toHaveBeenCalledWith(
            config.validatorParty,
            '10000.0000000000',
            'adminParty:123',
            'Amulet',
            'http://registry.com/'
        )
        const ledgerInternal = (
            amuletNamespace as never as {
                ledger: { internal: { submit: ReturnType<typeof vi.fn> } }
            }
        ).ledger.internal.submit

        expect(ledgerInternal).toHaveBeenCalledWith({
            commands: [{ ExerciseCommand: tapCommand }],
            disclosedContracts: [],
            synchronizerId: config.commonCtx.defaultSynchronizerId,
            actAs: [config.validatorParty],
        })
    })
})
