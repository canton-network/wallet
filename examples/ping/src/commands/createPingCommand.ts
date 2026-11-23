// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Corresponds to the built-in canton-builtin-admin-workflow-ping DAR every participant initializes with

const templateId =
    '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping'

function pingCreate(party: string, id: string) {
    return {
        CreateCommand: {
            templateId: templateId,
            createArguments: {
                id,
                initiator: party,
                responder: party,
            },
        },
    }
}

export const createPingCommand = (party: string) => {
    return {
        commands: [pingCreate(party, `my-test-${new Date().getTime()}`)],
    }
}

export const exercisePongCommand = (contractId: string) => {
    return {
        commands: [
            {
                ExerciseCommand: {
                    templateId: templateId,
                    choice: 'Respond',
                    contractId: `${contractId}`,
                    choiceArgument: {},
                },
            },
        ],
    }
}

const bongTemplateId = (entity: string) =>
    `#canton-builtin-admin-workflow-ping:Canton.Internal.Bong:${entity}`

const bongProposalTemplateId = bongTemplateId('BongProposal')

function exerciseBong(
    entity: string,
    contractId: string,
    choice: string,
    choiceArgument: Record<string, unknown>
) {
    return {
        commands: [
            {
                ExerciseCommand: {
                    templateId: bongTemplateId(entity),
                    contractId,
                    choice,
                    choiceArgument,
                },
            },
        ],
    }
}

export const acceptBongProposalCommand = (
    contractId: string,
    validator: string
) => exerciseBong('BongProposal', contractId, 'Accept', { validator })

export const abortBongProposalCommand = (contractId: string, anyone: string) =>
    exerciseBong('BongProposal', contractId, 'AbortBongProposal', { anyone })

export const processExplodeCommand = (contractId: string, winner: string) =>
    exerciseBong('Explode', contractId, 'ProcessExplode', { winner })

export const abortExplodeCommand = (contractId: string, anyone: string) =>
    exerciseBong('Explode', contractId, 'AbortExplode', { anyone })

export const processMergeCommand = (
    contractId: string,
    winner: string,
    leftId: string,
    rightId: string
) =>
    exerciseBong('Merge', contractId, 'ProcessMerge', {
        winner,
        leftId,
        rightId,
    })

export const abortMergeCommand = (contractId: string, anyone: string) =>
    exerciseBong('Merge', contractId, 'AbortMerge', { anyone })

export const processCollapseCommand = (contractId: string, winner: string) =>
    exerciseBong('Collapse', contractId, 'ProcessCollapse', { winner })

export const abortCollapseCommand = (contractId: string, anyone: string) =>
    exerciseBong('Collapse', contractId, 'AbortCollapse', { anyone })

export const ackBongCommand = (contractId: string) =>
    exerciseBong('Bong', contractId, 'Ack', {})

export const abortBongCommand = (contractId: string, anyone: string) =>
    exerciseBong('Bong', contractId, 'AbortBong', { anyone })

/** One party is initiator, the only candidate, and the responder. Validators stay empty. */
export const createBongProposalCommand = (party: string) => {
    const timeout = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    return {
        commands: [
            {
                CreateCommand: {
                    templateId: bongProposalTemplateId,
                    createArguments: {
                        id: `bong-${new Date().getTime()}`,
                        initiator: party,
                        candidates: [party],
                        validators: [],
                        responders: [party],
                        maxLevel: '1',
                        timeout,
                    },
                },
            },
        ],
    }
}
