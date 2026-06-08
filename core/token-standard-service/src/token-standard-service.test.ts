// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, MockedObject, beforeEach } from 'vitest'
import { CoreService, TokenStandardService } from './token-standard-service.js'
import { PrettyContract } from '@canton-network/core-tx-parser'
import { HoldingView } from '@canton-network/core-token-standard'
import { Decimal } from 'decimal.js'
import { Logger } from '@canton-network/core-types'

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const {
    mockAcsRead,
    mockParseTransaction,
    mockParseTransferObjects,
    mockRenderTransaction,
} = vi.hoisted(() => ({
    mockAcsRead: vi.fn().mockResolvedValue([]),
    mockParseTransaction: vi.fn().mockResolvedValue({ offset: 10, events: [] }),
    mockParseTransferObjects: vi.fn().mockResolvedValue([]),
    mockRenderTransaction: vi.fn((tx: unknown) => tx),
}))

vi.mock('@canton-network/core-acs-reader', () => ({
    ACSReader: vi.fn().mockImplementation(() => ({
        raw: { read: mockAcsRead },
    })),
}))

const makeProvider = (overrides: Record<string, unknown> = {}) => ({
    request: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
})

const accessTokenProvider = {
    getAccessToken: vi.fn().mockResolvedValue('test-token'),
    getAuthContext: vi.fn().mockResolvedValue(''),
}
const mockLogger: MockedObject<Logger> = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
} as MockedObject<Logger>

const makeTokenClient = () => ({ get: vi.fn(), post: vi.fn() })

function makeService(isMasterUser = false) {
    const provider = makeProvider()
    const service = new TokenStandardService(
        provider,
        mockLogger,
        accessTokenProvider,
        isMasterUser
    )

    const tokenClient = makeTokenClient()
    const getTokenStandardClient = vi
        .spyOn(service.core, 'getTokenStandardClient')
        .mockReturnValue(tokenClient as any)

    return { service, getTokenStandardClient, provider, tokenClient }
}

const registryUrl = 'https://fake/registry'

const makeChoiceContext = (overrides = {}) => ({
    choiceContextData: { values: { ctx: 'data' } },
    disclosedContracts: [{ contractId: 'disc1' }],
    ...overrides,
})

const makeHolding = (
    id: string,
    amount: string,
    admin: string,
    instrumentId: string,
    lock?: { expiresAt?: string | null } | null
) => ({
    contractId: id,
    interfaceViewValue: {
        owner: 'dummy',
        instrumentId: {
            admin: admin,
            id: instrumentId,
        },
        lock: lock ?? null,
        meta: {
            values: {},
        },
        amount,
    },
    activeContract: {
        createdEvent: {
            offset: 1,
            nodeId: 1,
            contractId: id,
            templateId:
                'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a:Splice.Amulet:Amulet',
            contractKey: null,
            contractKeyHash: '',
            createdEventBlob: 'blob',
            createdAt: 'time',
            packageName: 'name',
        },
        synchronizerId: 'blah',
        reassignmentCounter: 0,
    },
})

const instrumentAdmin =
    'DSO::1220c69732dd5f3b434c283f61cbc29d3bb492c50c56e306b436c3e1741cbc7be53e'
const instrumentId = 'Amulet'
function createHolding(
    cId: string,
    amount: string,
    admin: string,
    instrumentId: string,
    lock?: { expiresAt?: string | null } | null
) {
    return {
        contractId: cId,
        activeContract: {
            createdEvent: {
                offset: 49,
                nodeId: 3,
                contractId: cId,
                templateId:
                    'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a:Splice.Amulet:Amulet',
                contractKey: null,
                contractKeyHash: '',
                createArgument: {
                    dso: 'DSO::1220c69732dd5f3b434c283f61cbc29d3bb492c50c56e306b436c3e1741cbc7be53e',
                    owner: 'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
                    amount: {
                        initialAmount: amount,
                        createdAt: {
                            number: '1',
                        },
                        ratePerRound: {
                            rate: '0.0038051800',
                        },
                    },
                },
                createdEventBlob:
                    'CgMyLjES8QQKRQCU66JZw5C46HMQnw1hIk0dsgkuaPz00+MAPHn2zlBbFsoSEiDmApEy9AvI0VmgrNDLv8/GvvGuTC7G4rB+cZK+oPtoKhINc3BsaWNlLWFtdWxldBpaCkBhMzFiZTA0ODNmMzE3NTY0NzA1M2YyODk2NWE0ZTZkOTdlM2RiYzQzM2VhMjMzOGJlMzAzZmFlNjliYmNmZjZhEgZTcGxpY2USBkFtdWxldBoGQW11bGV0IukBauYBCk0KSzpJRFNPOjoxMjIwYzY5NzMyZGQ1ZjNiNDM0YzI4M2Y2MWNiYzI5ZDNiYjQ5MmM1MGM1NmUzMDZiNDM2YzNlMTc0MWNiYzdiZTUzZQpVClM6UXYxLTAxLWFsaWNlOjoxMjIwNmVlZTYwZjY0ZDkwYmUzZjgyMzAwN2QxMzIxZGM2YWNjNWY0ZjJjNTdkM2RkNmFjMWY2NjE0ODc1M2JiNjVjNQo+CjxqOgoUChIyEDEwMDAwLjAwMDAwMDAwMDAKCgoIagYKBAoCGAIKFgoUahIKEAoOMgwwLjAwMzgwNTE4MDAqSURTTzo6MTIyMGM2OTczMmRkNWYzYjQzNGMyODNmNjFjYmMyOWQzYmI0OTJjNTBjNTZlMzA2YjQzNmMzZTE3NDFjYmM3YmU1M2UqUXYxLTAxLWFsaWNlOjoxMjIwNmVlZTYwZjY0ZDkwYmUzZjgyMzAwN2QxMzIxZGM2YWNjNWY0ZjJjNTdkM2RkNmFjMWY2NjE0ODc1M2JiNjVjNTlmmBYOWlMGAEIqCiYKJAgBEiCzuweldZ8sz5U5S4gPJigbNNLmPal4Nl4KR8E7ifrx1RAe',
                interfaceViews: [
                    {
                        interfaceId:
                            '718a0f77e505a8de22f188bd4c87fe74101274e9d4cb1bfac7d09aec7158d35b:Splice.Api.Token.HoldingV1:Holding',
                        viewStatus: {
                            code: 0,
                            message: '',
                            details: [],
                        },
                        viewValue: {
                            owner: 'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
                            instrumentId: {
                                admin: admin,
                                id: instrumentId,
                            },
                            amount: '10000.0000000000',
                            lock: lock,
                            meta: {
                                values: {
                                    'amulet.splice.lfdecentralizedtrust.org/created-in-round':
                                        '1',
                                    'amulet.splice.lfdecentralizedtrust.org/rate-per-round':
                                        '0.00380518',
                                },
                            },
                        },
                        implementationPackageId:
                            'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a',
                    },
                ],
                witnessParties: [
                    'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
                ],
                signatories: [
                    'DSO::1220c69732dd5f3b434c283f61cbc29d3bb492c50c56e306b436c3e1741cbc7be53e',
                    'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
                ],
                observers: [],
                createdAt: '2026-06-03T14:15:08.787814Z',
                packageName: 'splice-amulet',
                representativePackageId:
                    'a31be0483f3175647053f28965a4e6d97e3dbc433ea2338be303fae69bbcff6a',
                acsDelta: true,
            },
            synchronizerId:
                'global-domain::1220c69732dd5f3b434c283f61cbc29d3bb492c50c56e306b436c3e1741cbc7be53e',
            reassignmentCounter: 0,
        },
        interfaceViewValue: {
            owner: 'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
            instrumentId: {
                admin: admin,
                id: instrumentId,
            },
            amount: amount,
            lock: lock,
            meta: {
                values: {
                    'amulet.splice.lfdecentralizedtrust.org/created-in-round':
                        '1',
                    'amulet.splice.lfdecentralizedtrust.org/rate-per-round':
                        '0.00380518',
                },
            },
        },
        fetchedAtOffset: 51,
    }
}

const senderParty =
    'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5'
describe('CoreService', () => {
    it('should getInputHoldingsCids when input utxos are provided', async () => {
        const { service } = makeService()
        vi.spyOn(service.core, 'listContractsByInterface').mockResolvedValue([])
        const result = await service.core.getInputHoldingsCids({
            sender: 'blah',
            inputUtxos: ['cid1', 'cid2'],
        })

        expect(result).toEqual(['cid1', 'cid2'])
    })

    it('should throw an error when sender has no holdings', async () => {
        const { service } = makeService()
        vi.spyOn(service.core, 'listContractsByInterface').mockResolvedValue([])

        await expect(
            service.core.getInputHoldingsCids({
                sender: 'blah',
            })
        ).rejects.toThrow(
            `Sender has no holdings, so transfer can't be executed.`
        )
    })

    it('should fetch only unlocked holdings', async () => {
        const lockedHolding = createHolding('1', '20', 'admin:123', 'amulet', {
            expiresAt: null,
        })
        const unlockedHolding = createHolding('2', '20', 'admin:123', 'amulet')
        const { service } = makeService()
        vi.spyOn(service.core, 'listContractsByInterface').mockResolvedValue([
            lockedHolding,
            unlockedHolding,
        ])

        const result = await service.core.getInputHoldingsCids({
            sender: senderParty,
        })
        expect(result).toHaveLength(1)
    })
})

describe('token standard service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should get instrument byId', async () => {
        const { service, getTokenStandardClient, tokenClient } = makeService()

        tokenClient.get.mockResolvedValue({ id: 'cc', name: 'amulet' })

        const instrument = await service.getInstrumentById(registryUrl, 'cc')
        expect(instrument.id).toBe('cc')
        expect(instrument.name).toBe('amulet')
        expect(getTokenStandardClient).toHaveBeenCalledWith(registryUrl)
    })

    it('should get instrumentAdmin', async () => {
        const { service, tokenClient } = makeService()

        tokenClient.get.mockResolvedValue({
            id: 'cc',
            name: 'amulet',
            adminId: 'blah:123',
        })

        const admin = await service.getInstrumentAdmin(registryUrl)
        expect(admin).toBe('blah:123')
    })

    it('convert the instruments to an asset type', async () => {
        const { service, tokenClient } = makeService()

        tokenClient.get
            .mockResolvedValueOnce({
                instruments: [
                    {
                        id: 'TestTokenExt',
                        name: 'TestTokenExt',
                        symbol: 'TestTokenExt',
                        totalSupply: '201.0',
                        totalSupplyAsOf: null,
                        decimals: 10,
                        supportedApis: {
                            'splice-api-token-metadata-v1': 1,
                            'splice-api-token-transfer-instruction-v1': 1,
                            'splice-api-token-allocation-request-v1': 1,
                            'splice-api-token-allocation-v1': 1,
                            'splice-api-token-holding-v1': 1,
                            'splice-api-token-allocation-instruction-v1': 1,
                        },
                    },
                    {
                        id: 'TestToken',
                        name: 'TestToken',
                        symbol: 'TestToken',
                        totalSupply: '1300.0',
                        totalSupplyAsOf: null,
                        decimals: 10,
                        supportedApis: {
                            'splice-api-token-metadata-v1': 1,
                            'splice-api-token-transfer-instruction-v1': 1,
                            'splice-api-token-allocation-request-v1': 1,
                            'splice-api-token-allocation-v1': 1,
                            'splice-api-token-holding-v1': 1,
                            'splice-api-token-allocation-instruction-v1': 1,
                        },
                    },
                ],
                nextPageToken: null,
            })
            .mockResolvedValue({
                adminId:
                    'auth0_007c6643538f2eadd3e573dd05b9::12205bcc106efa0eaa7f18dc491e5c6f5fb9b0cc68dc110ae66f4ed6467475d7c78e',
                supportedApis: {
                    'splice-api-token-metadata-v1': 1,
                    'splice-api-token-transfer-instruction-v1': 1,
                    'splice-api-token-allocation-request-v1': 1,
                    'splice-api-token-allocation-v1': 1,
                    'splice-api-token-holding-v1': 1,
                    'splice-api-token-allocation-instruction-v1': 1,
                },
            })

        const response = await service.instrumentsToAsset(registryUrl)
        expect(response).toHaveLength(2)
    })

    it('toPretty transactions', async () => {
        const { service } = makeService()
        const result = await service.core.toPrettyTransactions([], senderParty)
        expect(result.transactions).toHaveLength(0)
        expect(result.nextOffset).toBe(0)

        const updates = [
            { update: { OffsetCheckpoint: { value: { offset: 50 } } } },
            { update: { OffsetCheckpoint: { value: { offset: 80 } } } },
        ]

        const updatesResult = await service.core.toPrettyTransactions(
            updates as any,
            senderParty
        )
        expect(updatesResult.nextOffset).toBeGreaterThanOrEqual(80)
    })

    it('toQualfiedMemberId()', async () => {
        const { service } = makeService()
        expect(service.core.toQualifiedMemberId('abc123')).toBe('PAR::abc123')
        expect(service.core.toQualifiedMemberId('PAR::abc123')).toBe(
            'PAR::abc123'
        )
        expect(service.core.toQualifiedMemberId('MED::abc123')).toBe(
            'MED::abc123'
        )

        expect(() => service.core.toQualifiedMemberId('')).toThrow(
            'memberId is required'
        )
    })
})

describe('AllocationService', () => {
    const baseSpec = {
        transferLeg: {
            sender: senderParty,
            receiver: 'bob::def',
            amount: '10.0',
            instrumentId: { admin: instrumentAdmin, id: instrumentId },
            meta: null,
        },
        settlement: { meta: null },
    }

    it('uses prefetched context and does not make a registry call for allocation instruction', async () => {
        const { service, tokenClient } = makeService()
        vi.spyOn(service.core, 'getInputHoldingsCids').mockResolvedValue([
            'cid1',
            'cid2',
        ])
        const ctx = makeChoiceContext()
        const ts = '2026-01-01T00:00:00.000Z'
        await service.allocation.createAllocationInstruction(
            baseSpec as any,
            instrumentAdmin,
            registryUrl,
            [],
            undefined,
            { factoryId: 'factory-id', choiceContext: ctx as any }
        )

        expect(tokenClient.post).not.toHaveBeenCalled()
    })

    it('makes a registry call when no prefetched context is provided allocation instruction', async () => {
        const { service, tokenClient } = makeService()
        vi.spyOn(service.core, 'getInputHoldingsCids').mockResolvedValue([
            'cid1',
            'cid2',
        ])

        const ctx = makeChoiceContext()
        tokenClient.post.mockResolvedValue({
            factoryId: 'factory-id',
            choiceContext: ctx as any,
        })
        const ts = '2026-01-01T00:00:00.000Z'
        await service.allocation.createAllocationInstruction(
            baseSpec as any,
            instrumentAdmin,
            registryUrl
        )

        expect(tokenClient.post).toHaveBeenCalled()
    })

    it('uses prefetched context and does not make a registry call for create exectuion transfer allocation', async () => {
        const { service, tokenClient } = makeService()

        const ctx = makeChoiceContext()
        const [exercise] =
            await service.allocation.createExecuteTransferAllocation(
                'allocation-cid',
                registryUrl,
                ctx as any
            )
        expect(tokenClient.post).not.toHaveBeenCalled()
        expect(exercise.choice).toBe('Allocation_ExecuteTransfer')
        expect(exercise.contractId).toBe('allocation-cid')
    })

    it('does not use prefetched context and makes a registry call for create exectuion transfer allocation', async () => {
        const { service, tokenClient } = makeService()

        const ctx = makeChoiceContext()
        tokenClient.post.mockResolvedValue(ctx as any)
        await service.allocation.createExecuteTransferAllocation(
            'allocation-cid',
            registryUrl
        )
        expect(tokenClient.post).toHaveBeenCalled()
    })

    it('uses prefetched context and does not make a registry call for create withdraw allocation', async () => {
        const { service, tokenClient } = makeService()

        const ctx = makeChoiceContext()
        const [exercise] = await service.allocation.createWithdrawAllocation(
            'allocation-cid',
            registryUrl,
            ctx as any
        )
        expect(tokenClient.post).not.toHaveBeenCalled()
        expect(exercise.choice).toBe('Allocation_Withdraw')
    })

    it('does not use prefetched context and makes a registry call for  create withdraw allocation', async () => {
        const { service, tokenClient } = makeService()

        const ctx = makeChoiceContext()
        tokenClient.post.mockResolvedValue(ctx as any)
        await service.allocation.createWithdrawAllocation(
            'allocation-cid',
            registryUrl
        )
        expect(tokenClient.post).toHaveBeenCalled()
    })

    it('uses prefetched context and does not make a registry call for cancel allocation exercise', async () => {
        const { service, tokenClient } = makeService()

        const ctx = makeChoiceContext()
        const [exercise] = await service.allocation.createCancelAllocation(
            'allocation-cid',
            registryUrl,
            ctx as any
        )
        expect(tokenClient.post).not.toHaveBeenCalled()
        expect(exercise.choice).toBe('Allocation_Cancel')
    })

    it('does not use prefetched context and makes a registry call for  create cancel allocation', async () => {
        const { service, tokenClient } = makeService()

        const ctx = makeChoiceContext()
        tokenClient.post.mockResolvedValue(ctx as any)
        await service.allocation.createCancelAllocation(
            'allocation-cid',
            registryUrl
        )
        expect(tokenClient.post).toHaveBeenCalled()
    })

    it('command builders work', async () => {
        const { service } = makeService()
        const [exercise, dc] =
            await service.allocation.createWithdrawAllocationInstruction(
                'allocation-id'
            )
        expect(exercise.choice).toBe('AllocationInstruction_Withdraw')
        expect(exercise.contractId).toBe('allocation-id')
        expect(dc).toEqual([])

        const updateInstruction =
            await service.allocation.createUpdateAllocationInstruction(
                'allocation-id',
                ['actor::123'],
                { myCtx: 'val' },
                { meta: 'val' }
            )
        expect(updateInstruction[0].choice).toBe('AllocationInstruction_Update')
        expect(updateInstruction[0].choiceArgument).toStrictEqual({
            extraActors: ['actor::123'],
            extraArgs: {
                context: {
                    values: {
                        myCtx: 'val',
                    },
                },
                meta: {
                    values: {
                        meta: 'val',
                    },
                },
            },
        })

        const rejectReq =
            await service.allocation.createRejectAllocationRequest(
                'id1',
                senderParty
            )
        expect(rejectReq[0].choice).toBe('AllocationRequest_Reject')
        expect(rejectReq[0].choiceArgument).toStrictEqual({
            actor: 'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
            extraArgs: {
                context: {
                    values: {},
                },
                meta: {
                    values: {},
                },
            },
        })

        const withdraw =
            await service.allocation.createWithdrawAllocationRequest('id1')
        expect(withdraw[0].choice).toBe('AllocationRequest_Withdraw')
    })

    describe('buildAllocationFactoryChoiceArgs', () => {
        it('calls getInputHoldingCids and embeds resulting cids', async () => {
            const { service } = makeService()
            vi.spyOn(service.core, 'getInputHoldingsCids').mockResolvedValue([
                'cid1',
                'cid2',
            ])
            const ts = '2026-01-01T00:00:00.000Z'
            const result =
                await service.allocation.buildAllocationFactoryChoiceArgs(
                    baseSpec as any,
                    instrumentAdmin,
                    [],
                    ts
                )
            expect(result.inputHoldingCids).toEqual(['cid1', 'cid2'])
            expect(result.requestedAt).toBe(ts)
        })
    })

    describe('createAllocationInstructionFromContext', () => {
        const instrumentAdmin =
            'DSO::1220c69732dd5f3b434c283f61cbc29d3bb492c50c56e306b436c3e1741cbc7be53e'
        const instrumentId = 'Amulet'
        it('calls getInputHoldingCids and embeds resulting cids', async () => {
            const { service } = makeService()
            const choiceArgs = {
                expectedAdmin: instrumentAdmin,
                allocation: {
                    settlement: {
                        executor: 'blah:123',
                        settlementRef: {
                            id: '123',
                            cid: 'cid123',
                        },
                        requestedAt: '',
                        allocateBefore: '',
                        settleBefore: '',
                        meta: { values: {} },
                    },
                    transferLegId: '',
                    transferLeg: {
                        sender: '',
                        receiver: '',
                        amount: '20.0',
                        instrumentId: 'Amulet',
                        meta: { values: {} },
                    },
                },
                requestedAt: '',
                inputHoldingCids: [],
                extraArgs: { context: { values: {} }, meta: { values: {} } },
            }

            const ctx = makeChoiceContext()
            const [exercise, dc] =
                await service.allocation.createAllocationInstructionFromContext(
                    'factory-id',
                    choiceArgs as any,
                    ctx as any
                )

            expect(exercise.choice).toBe('AllocationFactory_Allocate')
            expect(exercise.contractId).toBe('factory-id')
        })
    })
})

describe('getInputHoldingsCidsForAmount', async () => {
    it('returns exact match', async () => {
        const holdings = [
            makeHolding('a', '200', 'partyId', 'amulet'),
            makeHolding('b', '20', 'partyId', 'amulet'),
            makeHolding('c', '30', 'partyId', 'amulet'),
        ]

        const result = await CoreService.getInputHoldingsCidsForAmount(
            new Decimal(20),
            holdings
        )

        expect(result).toEqual(['b'])
    })

    it('returns multiple holdings to meet target amount', async () => {
        const holdings = [
            makeHolding('b', '20', 'partyId', 'amulet'),
            makeHolding('a', '200', 'partyId', 'amulet'),
            makeHolding('c', '30', 'partyId', 'amulet'),
        ]

        const result = await CoreService.getInputHoldingsCidsForAmount(
            new Decimal(220),
            holdings
        )

        expect(result).toEqual(['a', 'b'])
    })

    it('returns all holdings to meet target amount even if it exceeds the target', async () => {
        const holdings = [
            makeHolding('a', '2', 'partyId', 'amulet'),
            makeHolding('b', '99', 'partyId', 'amulet'),
            makeHolding('c', '3', 'partyId', 'amulet'),
        ]

        const result = await CoreService.getInputHoldingsCidsForAmount(
            new Decimal(100),
            holdings
        )

        expect(result).toEqual(['b', 'a'])
    })

    it('should filter out holdings by instrument', async () => {
        const holdings = [
            makeHolding('a', '2', 'instrumentAdmin1', 'amulet'),
            makeHolding('b', '99', 'instrumentAdmin1', 'amulet'),
            makeHolding('c', '3', 'instrumentAdmin2', 'usdcx'),
        ]

        const usdcxHoldings = await CoreService.filterHoldingsByInstrument({
            holdings,
            instrumentAdmin: 'instrumentAdmin2',
            instrumentId: 'usdcx',
        })

        const amuletHoldings = await CoreService.filterHoldingsByInstrument({
            holdings,
            instrumentAdmin: 'instrumentAdmin1',
            instrumentId: 'amulet',
        })

        expect(usdcxHoldings.length).toBe(1)
        expect(amuletHoldings.length).toBe(2)
    })

    it('throws an error if no unlocked holdings exist', async () => {
        const holdings: PrettyContract<HoldingView>[] = []

        await expect(
            CoreService.getInputHoldingsCidsForAmount(
                new Decimal(220),
                holdings
            )
        ).rejects.toThrow(`Sender doesn't have any unlocked holdings`)
    })

    it('throws an error if there are insufficient funds', async () => {
        const holdings = [
            makeHolding('a', '5', 'partyId', 'amulet'),
            makeHolding('b', '10', 'partyId', 'amulet'),
        ]

        await expect(
            CoreService.getInputHoldingsCidsForAmount(new Decimal(20), holdings)
        ).rejects.toThrow(
            `Sender doesn't have sufficient funds for this transfer. Missing amount: 5`
        )
    })

    it('throws an error if it exceeds 100 utxos', async () => {
        const holdings = Array.from({ length: 101 }, (_, i) =>
            makeHolding(`id${i}`, '1', 'partyId', 'amulet')
        )

        await expect(
            CoreService.getInputHoldingsCidsForAmount(
                new Decimal(101),
                holdings
            )
        ).rejects.toThrow(`Exceeded the maximum of 100 utxos in 1 transaction`)
    })
})

describe('TransferService', () => {
    it('builds transfer choice args', async () => {
        const { service } = makeService()
        vi.spyOn(service.core, 'getInputHoldingsCids').mockResolvedValue([
            'cid1',
        ])

        const res = await service.transfer.buildTransferChoiceArgs(
            senderParty,
            'bob::def',
            '50.0',
            instrumentAdmin,
            instrumentId
        )

        expect(res.transfer.sender).toBe(senderParty)
        expect(res.transfer.receiver).toBe('bob::def')
        expect(res.transfer.amount).toBe('50.0')
        expect(res.transfer.instrumentId).toEqual({
            admin: instrumentAdmin,
            id: instrumentId,
        })

        const expiry = new Date('2030-01-01T00:00:00Z')

        const resWithExpiry = await service.transfer.buildTransferChoiceArgs(
            senderParty,
            'bob::def',
            '50.0',
            instrumentAdmin,
            instrumentId,
            undefined,
            undefined,
            expiry
        )

        expect(resWithExpiry.transfer.executeBefore).toBe(expiry.toISOString())

        const resWithMemo = await service.transfer.buildTransferChoiceArgs(
            senderParty,
            'bob::def',
            '50.0',
            instrumentAdmin,
            instrumentId,
            undefined,
            'payment',
            expiry
        )
        expect(
            resWithMemo.transfer.meta.values[TokenStandardService.MEMO_KEY]
        ).toBe('payment')
    })

    it('creates transfer from context', async () => {
        const { service } = makeService()
        const choiceArgs = {
            expectedAdmin: instrumentAdmin,
            transfer: {
                sender: senderParty,
                receiver: 'bob',
                amount: '10.0',
                instrumentId: instrumentId,
            },
            extraArgs: { context: { values: {} }, meta: { values: {} } },
        }
        const ctx = makeChoiceContext()
        const [exercise, dc] = await service.transfer.createTransferFromContext(
            'id1',
            choiceArgs as any,
            ctx as any
        )
        expect(exercise.choice).toBe('TransferFactory_Transfer')
        expect(dc).toBe(ctx.disclosedContracts)
        expect(exercise.choiceArgument).toStrictEqual({
            expectedAdmin:
                'DSO::1220c69732dd5f3b434c283f61cbc29d3bb492c50c56e306b436c3e1741cbc7be53e',
            extraArgs: {
                context: {
                    values: {
                        ctx: 'data',
                    },
                },
                meta: {
                    values: {},
                },
            },
            transfer: {
                amount: '10.0',
                instrumentId: 'Amulet',
                receiver: 'bob',
                sender: 'v1-01-alice::12206eee60f64d90be3f823007d1321dc6acc5f4f2c57d3dd6ac1f66148753bb65c5',
            },
        })
    })

    it('creates transfer instruction', async () => {
        const { service } = makeService()
        const ctx = makeChoiceContext()

        const [exercise] =
            await service.transfer.createAcceptTransferInstruction(
                'cid',
                registryUrl,
                ctx as any
            )

        expect(exercise.choice).toBe('TransferInstruction_Accept')
        expect(exercise.contractId).toBe('cid')

        const [exerciseReject] =
            await service.transfer.createRejectTransferInstruction(
                'cid',
                registryUrl,
                ctx as any
            )
        expect(exerciseReject.choice).toBe('TransferInstruction_Reject')

        //TODO: do all of these where it fetches from registry when no ctx is provided
        const [exerciseWithdraw] =
            await service.transfer.createWithdrawTransferInstruction(
                'cid',
                registryUrl,
                ctx as any
            )
        expect(exerciseWithdraw.choice).toBe('TransferInstruction_Withdraw')
    })

    it.each([
        ['Accept', 'TransferInstruction_Accept'],
        ['Reject', 'TransferInstruction_Reject'],
        ['Withdraw', 'TransferInstruction_Withdraw'],
    ] as const)(
        '%s routes to correct choice',
        async (instructionChoice, expectedChoice) => {
            const { service, tokenClient } = makeService()
            tokenClient.post.mockResolvedValue(makeChoiceContext())
            const [exercise] = await service.transfer.createTransferInstruction(
                'cid',
                registryUrl,
                instructionChoice
            )

            expect(exercise.choice).toBe(expectedChoice)
        }
    )

    it('exercise delegate proxy accept', async () => {
        const { service, tokenClient } = makeService()
        tokenClient.post.mockResolvedValue(makeChoiceContext())
        const [exercise] =
            await service.transfer.exerciseDelegateProxyTransferInstructionAccept(
                'proxy-cid',
                'ti-cid',
                new URL(registryUrl),
                'app-right-cid',
                [{ beneficiary: senderParty, weight: 1.0 }]
            )

        expect(exercise.choice).toBe('DelegateProxy_TransferInstruction_Accept')
        expect(exercise.contractId).toBe('proxy-cid')
    })

    it('exercise delegate proxy withdraw', async () => {
        const { service, tokenClient } = makeService()
        tokenClient.post.mockResolvedValue(makeChoiceContext())
        const [exercise] =
            await service.transfer.exerciseDelegateProxyTransferInstructioWithdraw(
                'proxy-cid',
                'ti-cid',
                new URL(registryUrl),
                'app-right-cid',
                [{ beneficiary: senderParty, weight: 1.0 }]
            )

        expect(exercise.choice).toBe(
            'DelegateProxy_TransferInstruction_Withdraw'
        )
        expect(exercise.contractId).toBe('proxy-cid')
    })
    it('exercise delegate proxy reject', async () => {
        const { service, tokenClient } = makeService()
        tokenClient.post.mockResolvedValue(makeChoiceContext())
        const [exercise] =
            await service.transfer.exerciseDelegateProxyTransferInstructionReject(
                'proxy-cid',
                'ti-cid',
                new URL(registryUrl),
                'app-right-cid',
                [{ beneficiary: senderParty, weight: 1.0 }]
            )

        expect(exercise.choice).toBe('DelegateProxy_TransferInstruction_Reject')
        expect(exercise.contractId).toBe('proxy-cid')
    })

    it('exercise delegate proxy throws an error when sum of beneficiary weights exceed 1.0', async () => {
        const { service, tokenClient } = makeService()
        tokenClient.post.mockResolvedValue(makeChoiceContext())
        await expect(
            service.transfer.exerciseDelegateProxyTransferInstructioWithdraw(
                'proxy-cid',
                'ti-cid',
                new URL(registryUrl),
                'app-right-cid',
                [
                    { beneficiary: senderParty, weight: 1.0 },
                    { beneficiary: 'bob:def', weight: 1.0 },
                ]
            )
        ).rejects.toThrow('Sum of beneficiary weights is larger than 1.')
    })
})
