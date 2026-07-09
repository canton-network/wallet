// Copyright (c) 2025-2026 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SDKContext } from '../../../sdk.js'
import { v4 } from 'uuid'
import { Ops } from '@canton-network/core-provider-ledger'
import { InternalOperationParams, ReassignParams } from './types.js'

export class InternalLedgerNamespace {
    constructor(private readonly ctx: SDKContext) {}

    /**
     * Reassigns a contract from one synchronizer to another.
     * Performs the two-phase Canton reassignment (Unassign → Assign) via
     * `/v2/commands/submit-and-wait-for-reassignment`.
     *
     * TODO #2097
     */
    async reassign(params: ReassignParams): Promise<void> {
        const { submitter, contractId, source, target, skipIfAlreadyOn } =
            params

        if (skipIfAlreadyOn && source === target) {
            return
        }

        // Phase 1: Unassign
        let unassignResponse: Awaited<
            ReturnType<
                typeof this.ctx.ledgerProvider.request<Ops.PostV2CommandsSubmitAndWaitForReassignment>
            >
        >
        try {
            unassignResponse =
                await this.ctx.ledgerProvider.request<Ops.PostV2CommandsSubmitAndWaitForReassignment>(
                    {
                        method: 'ledgerApi',
                        params: {
                            resource:
                                '/v2/commands/submit-and-wait-for-reassignment',
                            requestMethod: 'post',
                            body: {
                                reassignmentCommands: {
                                    commandId: v4(),
                                    submitter,
                                    commands: [
                                        {
                                            command: {
                                                UnassignCommand: {
                                                    value: {
                                                        contractId,
                                                        source,
                                                        target,
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                                eventFormat: {
                                    filtersByParty: { [submitter]: {} },
                                    verbose: false,
                                },
                            },
                        },
                    }
                )
        } catch (e: unknown) {
            if (
                typeof e === 'object' &&
                e !== null &&
                'code' in e &&
                (e as { code: string }).code === 'SUBMITTER_ALWAYS_STAKEHOLDER'
            ) {
                this.ctx.error.throw({
                    message:
                        `Cannot reassign contract ${contractId} from ${source} to ${target}: ` +
                        `submitter "${submitter}" is not a stakeholder. ` +
                        `Only a stakeholder of the contract may initiate a reassignment.`,
                    type: 'CantonError',
                    originalError: e,
                })
            }
            throw e
        }

        const events = unassignResponse.reassignment?.events ?? []
        const unassignedEvent = events.find((e) => 'JsUnassignedEvent' in e)
        if (!unassignedEvent || !('JsUnassignedEvent' in unassignedEvent)) {
            this.ctx.error.throw({
                message: `No unassigned event returned for contract ${contractId} reassignment`,
                type: 'Unexpected',
            })
        }
        const reassignmentId =
            unassignedEvent.JsUnassignedEvent.value.reassignmentId

        // Phase 2: Assign
        try {
            await this.ctx.ledgerProvider.request<Ops.PostV2CommandsSubmitAndWaitForReassignment>(
                {
                    method: 'ledgerApi',
                    params: {
                        resource:
                            '/v2/commands/submit-and-wait-for-reassignment',
                        requestMethod: 'post',
                        body: {
                            reassignmentCommands: {
                                commandId: v4(),
                                submitter,
                                commands: [
                                    {
                                        command: {
                                            AssignCommand: {
                                                value: {
                                                    reassignmentId,
                                                    source,
                                                    target,
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                }
            )
        } catch (e) {
            throw Object.assign(
                new Error(
                    `Phase 2 (Assign) failed for contract ${contractId} ` +
                        `(reassignmentId: ${reassignmentId}). ` +
                        `The contract is in-flight on source synchronizer "${source}" and must be ` +
                        `assigned to "${target}" using the reassignmentId above.`,
                    { cause: e }
                ),
                { reassignmentId, source, target, contractId }
            )
        }
    }

    public async submit(
        args: InternalOperationParams<Ops.PostV2CommandsSubmitAndWait>
    ) {
        const {
            commands,
            synchronizerId = this.ctx.defaultSynchronizerId,
            disclosedContracts = [],
            readAs = [],
            actAs,
            commandId = v4(),
            packageIdSelectionPreference = [],
        } = args
        const request = {
            commands,
            commandId,
            userId: this.ctx.userId,
            actAs,
            readAs,
            disclosedContracts,
            synchronizerId,
            packageIdSelectionPreference,
        }

        return await this.ctx.ledgerProvider.request<Ops.PostV2CommandsSubmitAndWait>(
            {
                method: 'ledgerApi',
                params: {
                    resource: '/v2/commands/submit-and-wait',
                    requestMethod: 'post',
                    body: request,
                },
            }
        )
    }

    public async prepare(
        args: InternalOperationParams<Ops.PostV2InteractiveSubmissionPrepare>
    ) {
        const {
            commands,
            synchronizerId = this.ctx.defaultSynchronizerId,
            disclosedContracts = [],
            readAs = [],
            actAs,
            commandId = v4(),
            packageIdSelectionPreference = [],
            verboseHashing = false,
        } = args
        const request = {
            commands,
            commandId,
            userId: this.ctx.userId,
            actAs,
            readAs,
            disclosedContracts,
            synchronizerId,
            packageIdSelectionPreference,
            verboseHashing,
        }

        return await this.ctx.ledgerProvider.request<Ops.PostV2InteractiveSubmissionPrepare>(
            {
                method: 'ledgerApi',
                params: {
                    resource: '/v2/interactive-submission/prepare',
                    requestMethod: 'post',
                    body: request,
                },
            }
        )
    }
}
