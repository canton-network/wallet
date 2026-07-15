// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as mock from '../../__test__/mocks'
import {
    Holding,
    Transfer,
    TestTokenV1,
    AllocationSpecification,
    TransferLeg,
    Metadata,
    TransferInstruction,
    Allocation,
    AllocationFactory,
    TransferFactory,
} from '@canton-network/core-token-standard'
import { ContractId, Time } from '@daml/types'
import { PartyId } from '@canton-network/core-types'
import { TestTokenNamespace } from './namespace'

const time: Time = new Date().toISOString()
const meta: Metadata = {
    values: {},
}

const transferLeg: TransferLeg = {
    sender: 'sender',
    receiver: 'receiver',
    amount: '100.00',
    instrumentId: {
        id: 'id',
        admin: 'admin',
    },
    meta,
}

const transfer: Transfer = {
    ...transferLeg,
    requestedAt: time,
    executeBefore: time,
    inputHoldingCids: ['holdingCid' as ContractId<Holding>],
}

const allocation: AllocationSpecification = {
    settlement: {
        executor: 'executor',
        settlementRef: {
            id: 'id',
            cid: null,
        },
        requestedAt: time,
        allocateBefore: time,
        settleBefore: time,
        meta,
    },
    transferLeg,
    transferLegId: 'transferLegId',
}

const admin: PartyId = 'admin'

describe('testToken plugin', () => {
    let plugin: TestTokenNamespace

    beforeEach(() => {
        vi.clearAllMocks()
        plugin = new TestTokenNamespace(mock.ctx)
    })

    describe('CreateCommand', () => {
        it('should create a transfer offer', () => {
            expect(
                plugin.create.transferOffer({
                    transfer,
                })
            ).toStrictEqual({
                CreateCommand: {
                    templateId: TestTokenV1.TokenTransferOffer.templateId,
                    createArguments: { transfer },
                },
            })
        })

        it('should create an allocation', () => {
            expect(
                plugin.create.allocation({
                    allocation,
                })
            ).toStrictEqual({
                CreateCommand: {
                    templateId: TestTokenV1.TokenAllocation.templateId,
                    createArguments: { allocation },
                },
            })
        })

        it('should create rules', () => {
            expect(
                plugin.create.rules({
                    admin,
                })
            ).toStrictEqual({
                CreateCommand: {
                    templateId: TestTokenV1.TokenRules.templateId,
                    createArguments: { admin },
                },
            })
        })
    })

    describe('ExerciseCommand', () => {
        describe('transfer offer', () => {
            it('should exercise accept', () => {
                expect(
                    plugin.exercise.transferOffer.accept({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenTransferOffer.templateId,
                        contractId: 'cid',
                        choice: TransferInstruction.TransferInstruction_Accept
                            .choiceName,
                        choiceArgument: null,
                    },
                })
            })

            it('should exercise reject', () => {
                expect(
                    plugin.exercise.transferOffer.reject({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenTransferOffer.templateId,
                        contractId: 'cid',
                        choice: TransferInstruction.TransferInstruction_Reject
                            .choiceName,
                        choiceArgument: null,
                    },
                })
            })

            it('should exercise withdraw', () => {
                expect(
                    plugin.exercise.transferOffer.withdraw({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenTransferOffer.templateId,
                        contractId: 'cid',
                        choice: TransferInstruction.TransferInstruction_Withdraw
                            .choiceName,
                        choiceArgument: null,
                    },
                })
            })

            it('should exercise update', () => {
                expect(
                    plugin.exercise.transferOffer.update({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenTransferOffer.templateId,
                        contractId: 'cid',
                        choice: TransferInstruction.TransferInstruction_Update
                            .choiceName,
                        choiceArgument: null,
                    },
                })
            })
        })

        describe('allocation', () => {
            it('should exercise executeTransfer', () => {
                expect(
                    plugin.exercise.allocation.executeTransfer({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenAllocation.templateId,
                        contractId: 'cid',
                        choice: Allocation.Allocation_ExecuteTransfer
                            .choiceName,
                        choiceArgument: null,
                    },
                })
            })

            it('should exercise cancel', () => {
                expect(
                    plugin.exercise.allocation.cancel({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenAllocation.templateId,
                        contractId: 'cid',
                        choice: Allocation.Allocation_Cancel.choiceName,
                        choiceArgument: null,
                    },
                })
            })

            it('should exercise withdraw', () => {
                expect(
                    plugin.exercise.allocation.withdraw({
                        contractId: 'cid',
                        choiceArgument: null,
                    })
                ).toStrictEqual({
                    ExerciseCommand: {
                        templateId: TestTokenV1.TokenAllocation.templateId,
                        contractId: 'cid',
                        choice: Allocation.Allocation_Withdraw.choiceName,
                        choiceArgument: null,
                    },
                })
            })
        })

        describe('rules', () => {
            describe('transfer', () => {
                it('should exercise transfer', () => {
                    expect(
                        plugin.exercise.rules.transfer.transfer({
                            contractId: 'cid',
                            choiceArgument: null,
                        })
                    ).toStrictEqual({
                        ExerciseCommand: {
                            templateId: TestTokenV1.TokenRules.templateId,
                            contractId: 'cid',
                            choice: TransferFactory.TransferFactory_Transfer
                                .choiceName,
                            choiceArgument: null,
                        },
                    })
                })

                it('should exercise publicFetch', () => {
                    expect(
                        plugin.exercise.rules.transfer.publicFetch({
                            contractId: 'cid',
                            choiceArgument: null,
                        })
                    ).toStrictEqual({
                        ExerciseCommand: {
                            templateId: TestTokenV1.TokenRules.templateId,
                            contractId: 'cid',
                            choice: TransferFactory.TransferFactory_PublicFetch
                                .choiceName,
                            choiceArgument: null,
                        },
                    })
                })
            })

            describe('allocation', () => {
                it('should exercise allocate', () => {
                    expect(
                        plugin.exercise.rules.allocation.allocate({
                            contractId: 'cid',
                            choiceArgument: null,
                        })
                    ).toStrictEqual({
                        ExerciseCommand: {
                            templateId: TestTokenV1.TokenRules.templateId,
                            contractId: 'cid',
                            choice: AllocationFactory.AllocationFactory_Allocate
                                .choiceName,
                            choiceArgument: null,
                        },
                    })
                })

                it('should exercise publicFetch', () => {
                    expect(
                        plugin.exercise.rules.allocation.publicFetch({
                            contractId: 'cid',
                            choiceArgument: null,
                        })
                    ).toStrictEqual({
                        ExerciseCommand: {
                            templateId: TestTokenV1.TokenRules.templateId,
                            contractId: 'cid',
                            choice: AllocationFactory
                                .AllocationFactory_PublicFetch.choiceName,
                            choiceArgument: null,
                        },
                    })
                })
            })
        })
    })
})
